import { Logger } from '@nestjs/common';
import { ServarrApi } from '../common/servarr-api.service';
import {
  RadarrMovie,
  RadarrMovieFile,
  RadarrMovieOptions,
} from '../interfaces/radarr.interface';

export class RadarrApi extends ServarrApi<{ movieId: number }> {
  logger: Logger;
  constructor({ url, apiKey }: { url: string; apiKey: string }) {
    super({ url, apiKey, apiName: 'Radarr' });
    this.logger = new Logger(RadarrApi.name);
  }

  public getMovies = async (): Promise<RadarrMovie[]> => {
    try {
      const response = await this.axios.get<RadarrMovie[]>('/movie');

      return response.data;
    } catch (e) {
      this.logger.error(`Failed to retrieve movies`);
      this.logger.debug(`Failed to retrieve movies: ${e.message}`);
    }
  };

  public getMovie = async ({ id }: { id: number }): Promise<RadarrMovie> => {
    try {
      const response = await this.axios.get<RadarrMovie>(`/movie/${id}`);
      return response.data;
    } catch (e) {
      this.logger.error(`[Radarr] Failed to retrieve movie with id ${id}`);
      this.logger.debug(`[Radarr] Failed to retrieve movie: ${e.message}`);
    }
  };

  public async getMovieByTmdbId(id: number): Promise<RadarrMovie> {
    try {
      const response = await this.axios.get<RadarrMovie[]>('/movie/lookup', {
        params: {
          term: `tmdb:${id}`,
        },
      });

      if (!response.data[0]) {
        throw new Error('Movie not found');
      }

      return response.data[0];
    } catch (e) {
      this.logger.error(`Error retrieving movie by TMDb ID ${id}`);
      this.logger.debug(e);
      throw new Error('Movie not found');
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
          this.logger.error('Failed to update existing movie in Radarr.');
          throw new Error('Failed to update existing movie in Radarr');
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
        this.logger.error('Failed to add movie to Radarr');
      }
      return response.data;
    } catch (e) {
      this.logger.error(
        'Failed to add movie to Radarr. This might happen if the movie already exists, in which case you can safely ignore this error.',
      );
    }
  };

  public async searchMovie(movieId: number): Promise<void> {
    this.logger.log('Executing movie search command');

    try {
      await this.runCommand('MoviesSearch', { movieIds: [movieId] });
    } catch (e) {
      this.logger.error(
        'Something went wrong while executing Radarr movie search.',
      );
    }
  }

  public async deleteMovie(movieId: number, deleteFiles = true) {
    try {
      await this.runDelete(
        `movie/${movieId}?addImportExclusion=false&deleteFiles=${deleteFiles}`,
      );
    } catch (e) {
      this.logger.log("Couldn't delete movie. Does it exist in radarr?");
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
    }
  }
}
