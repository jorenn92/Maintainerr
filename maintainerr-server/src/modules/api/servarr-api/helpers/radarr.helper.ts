import { LoggerService } from 'src/logger/logger.service';
import { SettingsService } from 'src/settings/settings.service';
import { ServarrApi } from '../common/servarr-api.service';
import {
  RadarrMovie,
  RadarrMovieOptions,
} from '../interfaces/radarr.interface';

const { getSettings } = new SettingsService();
const RADARR_API_PATH = '/api/v3/';
export class RadarrApi extends ServarrApi<{ movieId: number }> {
  logger: LoggerService;
  constructor({ url, apiKey }: { url: string; apiKey: string }) {
    super({ url, apiKey, apiName: 'Radarr' });
    this.logger = new LoggerService();
  }

  public getMovies = async (): Promise<RadarrMovie[]> => {
    try {
      const response = await this.axios.get<RadarrMovie[]>('/movie');

      return response.data;
    } catch (e) {
      throw new Error(`[Radarr] Failed to retrieve movies: ${e.message}`);
    }
  };

  public getMovie = async ({ id }: { id: number }): Promise<RadarrMovie> => {
    try {
      const response = await this.axios.get<RadarrMovie>(`/movie/${id}`);
      return response.data;
    } catch (e) {
      throw new Error(`[Radarr] Failed to retrieve movie: ${e.message}`);
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
      this.logger.logger.error('Error retrieving movie by TMDb ID', {
        label: 'Radarr API',
        errorMessage: e.message,
        tmdbId: id,
      });
      throw new Error('Movie not found');
    }
  }

  public addMovie = async (
    options: RadarrMovieOptions,
  ): Promise<RadarrMovie> => {
    try {
      const movie = await this.getMovieByTmdbId(options.tmdbId);

      if (movie.downloaded) {
        this.logger.logger.info(
          'Title already exists and is available. Skipping add and returning success',
          {
            label: 'Radarr',
            movie,
          },
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
          this.logger.logger.info(
            'Found existing title in Radarr and set it to monitored.',
            {
              label: 'Radarr',
              movieId: response.data.id,
              movieTitle: response.data.title,
            },
          );
          this.logger.logger.debug('Radarr update details', {
            label: 'Radarr',
            movie: response.data,
          });

          if (options.searchNow) {
            this.searchMovie(response.data.id);
          }

          return response.data;
        } else {
          this.logger.logger.error(
            'Failed to update existing movie in Radarr.',
            {
              label: 'Radarr',
              options,
            },
          );
          throw new Error('Failed to update existing movie in Radarr');
        }
      }

      if (movie.id) {
        this.logger.logger.info(
          'Movie is already monitored in Radarr. Skipping add and returning success',
          { label: 'Radarr' },
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
        this.logger.logger.info('Radarr accepted request', { label: 'Radarr' });
        this.logger.logger.debug('Radarr add details', {
          label: 'Radarr',
          movie: response.data,
        });
      } else {
        this.logger.logger.error('Failed to add movie to Radarr', {
          label: 'Radarr',
          options,
        });
        throw new Error('Failed to add movie to Radarr');
      }
      return response.data;
    } catch (e) {
      this.logger.logger.error(
        'Failed to add movie to Radarr. This might happen if the movie already exists, in which case you can safely ignore this error.',
        {
          label: 'Radarr',
          errorMessage: e.message,
          options,
          response: e?.response?.data,
        },
      );
      throw new Error('Failed to add movie to Radarr');
    }
  };

  public async searchMovie(movieId: number): Promise<void> {
    this.logger.logger.info('Executing movie search command', {
      label: 'Radarr API',
      movieId,
    });

    try {
      await this.runCommand('MoviesSearch', { movieIds: [movieId] });
    } catch (e) {
      this.logger.logger.error(
        'Something went wrong while executing Radarr movie search.',
        {
          label: 'Radarr API',
          errorMessage: e.message,
          movieId,
        },
      );
    }
  }
}
