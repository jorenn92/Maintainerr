import { Logger } from '@nestjs/common';
import { ServarrApi } from '../common/servarr-api.service';
import {
  RadarrInfo,
  RadarrMovie,
  RadarrMovieFile,
  RadarrMovieOptions,
} from '../interfaces/radarr.interface';

export class RadarrApi extends ServarrApi<{ movieId: number }> {
  logger: Logger;
  constructor({ url, apiKey }: { url: string; apiKey: string }) {
    super({ url, apiKey, cacheName: 'radarr', apiName: 'Radarr' });
    this.logger = new Logger(RadarrApi.name);
  }

  public getMovies = async (): Promise<RadarrMovie[]> => {
    try {
      const response = await this.get<RadarrMovie[]>('/movie');

      return response;
    } catch (e) {
      this.logger.warn(`Failed to retrieve movies`);
      this.logger.debug(`Failed to retrieve movies: ${e.message}`);
    }
  };

  public getMovie = async ({ id }: { id: number }): Promise<RadarrMovie> => {
    try {
      const response = await this.get<RadarrMovie>(`/movie/${id}`);
      return response;
    } catch (e) {
      this.logger.warn(`[Radarr] Failed to retrieve movie with id ${id}`);
      this.logger.debug(`[Radarr] Failed to retrieve movie: ${e.message}`);
    }
  };

  public async getMovieByTmdbId(id: number): Promise<RadarrMovie> {
    try {
      const response = await this.get<RadarrMovie[]>('/movie/lookup', {
        params: {
          term: `tmdb:${id}`,
        },
      });

      if (!response[0]) {
        this.logger.warn(`Could not find Movie with TMDb id ${id} in Radarr`);
      }

      return response[0];
    } catch (e) {
      this.logger.warn(`Error retrieving movie by TMDb ID ${id}`);
      this.logger.debug(e);
    }
  }

  public addMovie = async (
    options: RadarrMovieOptions,
  ): Promise<RadarrMovie> => {
    try {
      const movie = await this.getMovieByTmdbId(options.tmdbId);

      if (movie.downloaded) {
        this.logger.log(
          'Title already exists and is available. Skipping add and returning success',
        );
        return movie;
      }

      // movie exists in Radarr but is neither downloaded nor monitored
      if (movie.id && !movie.monitored) {
        const response = await this.axios.put<RadarrMovie>(`/movie`, {
          ...movie,
          title: options.title,
          qualityProfileId: options.qualityProfileId,
          profileId: options.profileId,
          titleSlug: options.tmdbId.toString(),
          minimumAvailability: options.minimumAvailability,
          tmdbId: options.tmdbId,
          year: options.year,
          tags: options.tags,
          rootFolderPath: options.rootFolderPath,
          monitored: options.monitored,
          addOptions: {
            searchForMovie: options.searchNow,
          },
        });

        if (response.data.monitored) {
          this.logger.log(
            'Found existing title in Radarr and set it to monitored.',
          );

          if (options.searchNow) {
            this.searchMovie(response.data.id);
          }

          return response.data;
        } else {
          this.logger.warn('Failed to update existing movie in Radarr.');
        }
      }

      if (movie.id) {
        this.logger.log(
          'Movie is already monitored in Radarr. Skipping add and returning success',
        );
        return movie;
      }

      const response = await this.axios.post<RadarrMovie>(`/movie`, {
        title: options.title,
        qualityProfileId: options.qualityProfileId,
        profileId: options.profileId,
        titleSlug: options.tmdbId.toString(),
        minimumAvailability: options.minimumAvailability,
        tmdbId: options.tmdbId,
        year: options.year,
        rootFolderPath: options.rootFolderPath,
        monitored: options.monitored,
        tags: options.tags,
        addOptions: {
          searchForMovie: options.searchNow,
        },
      });

      if (response.data.id) {
        this.logger.log('Radarr accepted request');
      } else {
        this.logger.warn('Failed to add movie to Radarr');
      }
      return response.data;
    } catch (e) {
      this.logger.warn(
        'Failed to add movie to Radarr. This might happen if the movie already exists, in which case you can safely ignore this error.',
      );
      this.logger.debug(e);
    }
  };

  public async searchMovie(movieId: number): Promise<void> {
    this.logger.log('Executing movie search command');

    try {
      await this.runCommand('MoviesSearch', { movieIds: [movieId] });
    } catch (e) {
      this.logger.warn(
        'Something went wrong while executing Radarr movie search.',
      );
      this.logger.debug(e);
    }
  }

  public async deleteMovie(
    movieId: number,
    deleteFiles = true,
    importExclusion = false,
  ) {
    try {
      await this.runDelete(
        `movie/${movieId}?deleteFiles=${deleteFiles}&addImportExclusion=${importExclusion}`,
      );
    } catch (e) {
      this.logger.log("Couldn't delete movie. Does it exist in radarr?");
      this.logger.debug(e);
    }
  }

  public async unmonitorMovie(movieId: number, deleteFiles = true) {
    try {
      const movieData: RadarrMovie = await this.get(`movie/${movieId}`);
      movieData.monitored = false;
      await this.runPut(`movie/${movieId}`, JSON.stringify(movieData));

      if (deleteFiles) {
        const movieFiles: RadarrMovieFile[] = await this.get(
          `moviefile?movieId=${movieId}`,
        );
        movieFiles.forEach(
          async (e) => await this.runDelete(`moviefile/${e.id}`),
        );
      }
    } catch (e) {
      this.logger.warn("Couldn't unmonitor movie. Does it exist in radarr?");
      this.logger.debug(e);
    }
  }

  public async info(): Promise<RadarrInfo> {
    try {
      const info: RadarrInfo = (
        await this.axios.get(`system/status`, {
          signal: AbortSignal.timeout(10000), // aborts request after 10 seconds
        })
      ).data;
      return info ? info : null;
    } catch (e) {
      this.logger.warn("Couldn't fetch Radarr info.. Is Radarr up?");
      this.logger.debug(e);
      return null;
    }
  }
}
