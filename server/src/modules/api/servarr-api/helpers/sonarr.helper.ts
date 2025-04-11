import { Logger } from '@nestjs/common';
import { ServarrApi } from '../common/servarr-api.service';
import {
  SonarrEpisode,
  SonarrEpisodeFile,
  SonarrInfo,
  SonarrSeries,
} from '../interfaces/sonarr.interface';

export class SonarrApi extends ServarrApi<{
  seriesId: number;
  episodeId: number;
}> {
  constructor({
    url,
    apiKey,
    cacheName,
  }: {
    url: string;
    apiKey: string;
    cacheName?: string;
  }) {
    super({ url, apiKey, cacheName, apiName: 'Sonarr' });
    this.logger = new Logger(SonarrApi.name);
  }

  public async getEpisodes(
    seriesID: number,
    seasonNumber?: number,
    episodeIds?: number[],
  ): Promise<SonarrEpisode[]> {
    const response = await this.get<SonarrEpisode[]>(
      `/episode?seriesId=${seriesID}${
        seasonNumber ? `&seasonNumber=${seasonNumber}` : ''
      }${episodeIds ? `&episodeIds=${episodeIds}` : ''}`,
    );

    if (response == null) {
      this.logger.warn(
        `[Sonarr] Failed to retrieve show ${seriesID}'s episodes ${episodeIds}`,
      );
      return [];
    }

    return episodeIds
      ? response.filter((el) => episodeIds.includes(el.episodeNumber))
      : response;
  }

  public async getEpisodeFile(
    episodeFileId: number,
  ): Promise<SonarrEpisodeFile | undefined> {
    const response = await this.get<SonarrEpisodeFile>(
      `/episodefile/${episodeFileId}`,
    );

    if (!response) {
      this.logger.warn(
        `[Sonarr] Failed to retrieve episode file id ${episodeFileId}`,
      );
      return;
    }

    return response;
  }

  public async getSeriesByTvdbId(
    id: number,
  ): Promise<SonarrSeries | undefined> {
    const response = await this.get<SonarrSeries[]>(`/series?tvdbId=${id}`);

    if (!response?.[0]) {
      this.logger.warn(`Could not retrieve show by tvdb ID ${id}`);
      return;
    }

    return response[0];
  }

  public async updateSeries(series: SonarrSeries) {
    await this.axios.put<SonarrSeries>('/series', series);
  }

  public async deleteShow(
    seriesId: number | string,
    deleteFiles = true,
    importListExclusion = false,
  ) {
    this.logger.log(`Deleting show with ID ${seriesId} from Sonarr.`);

    await this.runDelete(
      `series/${seriesId}?deleteFiles=${deleteFiles}&addImportListExclusion=${importListExclusion}`,
    );
  }

  public async UnmonitorDeleteEpisodes(
    seriesId: number,
    seasonNumber: number,
    episodeIds: number[],
    deleteFiles = true,
  ) {
    this.logger.log(
      `${!deleteFiles ? 'Unmonitoring' : 'Deleting'} ${
        episodeIds.length
      } episode(s) from show with ID ${seriesId} from Sonarr.`,
    );

    try {
      const episodes = await this.getEpisodes(
        seriesId,
        seasonNumber,
        episodeIds,
      );

      for (const e of episodes) {
        // unmonitor
        await this.runPut(
          `episode/${e.id}`,
          JSON.stringify({ ...e, monitored: false }),
        );
        // also delete if required
        if (deleteFiles) {
          await this.runDelete(`episodefile/${e.episodeFileId}`);
        }
      }
    } catch (e) {
      this.logger.warn(`Couldn\'t remove/unmonitor episodes: ${episodeIds}`, {
        label: 'Sonarr API',
        errorMessage: e.message,
        seriesId,
      });
      this.logger.debug(e);
    }
  }

  public async unmonitorSeasons(
    seriesId: number | string,
    type: 'all' | number | 'existing' = 'all',
    deleteFiles = true,
    forceExisting = false,
  ): Promise<SonarrSeries | undefined> {
    try {
      const data = (await this.axios.get<SonarrSeries>(`series/${seriesId}`))
        .data;

      const episodes = await this.get<SonarrEpisode[]>(
        `episodefile?seriesId=${seriesId}`,
      );

      // loop seasons
      data.seasons = data.seasons.map((s) => {
        if (type === 'all') {
          s.monitored = false;
        } else if (
          type === 'existing' ||
          (forceExisting && type === s.seasonNumber)
        ) {
          if (episodes == null) {
            throw new Error(
              `Could not find episodes for show with ID ${seriesId}. Cannot unmonitor episodes.`,
            );
          }

          // existing episodes only, so don't unmonitor season
          episodes.forEach((e) => {
            if (e.seasonNumber === s.seasonNumber) {
              this.UnmonitorDeleteEpisodes(
                +seriesId,
                e.seasonNumber,
                [e.id],
                false,
              );
            }
          });
        } else if (typeof type === 'number') {
          // specific season
          if (s.seasonNumber === type) {
            s.monitored = false;
          }
        }
        return s;
      });
      await this.runPut(`series/`, JSON.stringify(data));

      // delete files
      if (deleteFiles) {
        if (episodes == null) {
          throw new Error(
            `Could not find episodes for show with ID ${seriesId}. Cannot delete episodes.`,
          );
        }

        for (const e of episodes) {
          if (typeof type === 'number') {
            if (e.seasonNumber === type) {
              await this.runDelete(`episodefile/${e.id}`);
            }
          } else {
            await this.runDelete(`episodefile/${e.id}`);
          }
        }
      }

      this.logger.log(
        `Unmonitored ${
          typeof type === 'number' ? `season ${type}` : 'seasons'
        } from Sonarr show with ID ${seriesId}`,
      );

      return data;
    } catch (e) {
      this.logger.log("Couldn't unmonitor/delete. Does it exist in sonarr?", {
        errorMessage: e.message,
        seriesId,
        type,
      });
      this.logger.debug(e);
    }
  }

  public async info(): Promise<SonarrInfo | undefined> {
    try {
      const info = (
        await this.axios.get<SonarrInfo>(`system/status`, {
          signal: AbortSignal.timeout(10000), // aborts request after 10 seconds
        })
      )?.data;

      return info;
    } catch (e) {
      this.logger.warn("Couldn't fetch Sonarr info.. Is Sonarr up?");
      this.logger.debug(e);
    }
  }
}
