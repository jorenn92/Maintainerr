import { Logger } from '@nestjs/common';
import { ServarrApi } from '../common/servarr-api.service';
import {
  RadarrInfo,
  RadarrMovie,
  RadarrMovieFile,
} from '../interfaces/radarr.interface';

export class RadarrApi extends ServarrApi<{ movieId: number }> {
  constructor({
    url,
    apiKey,
    cacheName,
  }: {
    url: string;
    apiKey: string;
    cacheName?: string;
  }) {
    super({ url, apiKey, cacheName, apiName: 'Radarr' });
    this.logger = new Logger(RadarrApi.name);
  }

  public async getMovieByTmdbId(id: number): Promise<RadarrMovie | undefined> {
    try {
      const response = await this.get<RadarrMovie[]>(`/movie?tmdbId=${id}`);

      if (!response?.[0]) {
        this.logger.warn(`Could not find Movie with TMDb id ${id} in Radarr`);
        return;
      }

      return response[0];
    } catch (e) {
      this.logger.warn(`Error retrieving movie by TMDb ID ${id}`);
      this.logger.debug(e);
    }
  }

  public async deleteMovie(
    movieId: number,
    deleteFiles = true,
    importExclusion = false,
  ) {
    await this.runDelete(
      `movie/${movieId}?deleteFiles=${deleteFiles}&addImportExclusion=${importExclusion}`,
    );
  }

  public async unmonitorMovie(movieId: number, deleteFiles = true) {
    try {
      const movieData = await this.get<RadarrMovie>(`movie/${movieId}`);

      if (!movieData) {
        this.logger.warn(
          `Could not find movie with id ${movieId} in Radarr. Cannot unmonitor.`,
        );
        return;
      }

      movieData.monitored = false;
      await this.runPut(`movie/${movieId}`, JSON.stringify(movieData));

      if (deleteFiles) {
        const movieFiles = await this.get<RadarrMovieFile[]>(
          `moviefile?movieId=${movieId}`,
        );

        if (movieFiles == null) {
          this.logger.warn(
            `Could not find movie files for movie with id ${movieId} in Radarr. Cannot delete files.`,
          );
          return;
        }

        for (const movieFile of movieFiles) {
          await this.runDelete(`moviefile/${movieFile.id}`);
        }
      }
    } catch (e) {
      this.logger.warn("Couldn't unmonitor movie. Does it exist in radarr?");
      this.logger.debug(e);
    }
  }

  public async info(): Promise<RadarrInfo | undefined> {
    try {
      const info = (
        await this.axios.get<RadarrInfo>(`system/status`, {
          signal: AbortSignal.timeout(10000), // aborts request after 10 seconds
        })
      )?.data;

      return info;
    } catch (e) {
      this.logger.warn("Couldn't fetch Radarr info.. Is Radarr up?");
      this.logger.debug(e);
    }
  }
}
