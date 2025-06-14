import { MaintainerrLogger } from '../../../logging/logs.service';
import { ServarrApi } from '../common/servarr-api.service';
import {
  RadarrInfo,
  RadarrMovie,
  RadarrMovieFile,
} from '../interfaces/radarr.interface';

export class RadarrApi extends ServarrApi {
  constructor(
    {
      url,
      apiKey,
      cacheName,
    }: {
      url: string;
      apiKey: string;
      cacheName?: string;
    },
    protected readonly logger: MaintainerrLogger,
  ) {
    super({ url, apiKey, cacheName }, logger);
    this.logger.setContext(ServarrApi.name);
  }

  public async getMovieByTmdbId(id: number): Promise<RadarrMovie> {
    const response = await this.get<RadarrMovie[]>(`/movie?tmdbId=${id}`);

    if (!response[0]) {
      this.logger.warn(`Could not find Movie with TMDb id ${id} in Radarr`);
      return;
    }

    return response[0];
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
        await this.axios.get<RadarrInfo>(`system/status`, {
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
