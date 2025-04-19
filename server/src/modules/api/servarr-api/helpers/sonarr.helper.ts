import { Logger } from '@nestjs/common';
import { ServarrApi } from '../common/servarr-api.service';
import {
  SonarrEpisode,
  SonarrEpisodeFile,
  SonarrInfo,
  SonarrSeason,
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

  public async getSeries(): Promise<SonarrSeries[]> {
    try {
      const response = await this.get<SonarrSeries[]>('/series');

      return response;
    } catch (e) {
      this.logger.warn(`[Sonarr] Failed to retrieve series: ${e.message}`);
      this.logger.debug(e);
    }
  }

  public async getEpisodes(
    seriesID: number,
    seasonNumber?: number,
    episodeNumbers?: number[],
  ): Promise<SonarrEpisode[]> {
    try {
      const response = await this.get<SonarrEpisode[]>(
        `/episode?seriesId=${seriesID}${
          seasonNumber ? `&seasonNumber=${seasonNumber}` : ''
        }`,
      );

      return episodeNumbers
        ? response.filter((el) => episodeNumbers.includes(el.episodeNumber))
        : response;
    } catch (e) {
      this.logger.warn(
        `[Sonarr] Failed to retrieve show ${seriesID}'s episodes ${episodeNumbers}: ${e.message}`,
      );
      this.logger.debug(e);
    }
  }
  public async getEpisodeFile(
    episodeFileId: number,
  ): Promise<SonarrEpisodeFile> {
    try {
      const response = await this.get<SonarrEpisodeFile>(
        `/episodefile/${episodeFileId}`,
      );

      return response;
    } catch (e) {
      this.logger.warn(
        `[Sonarr] Failed to retrieve episode file id ${episodeFileId}`,
        e.message,
      );
      this.logger.debug(e);
    }
  }

  public async getSeriesByTitle(title: string): Promise<SonarrSeries[]> {
    try {
      const response = await this.get<SonarrSeries[]>('/series/lookup', {
        params: {
          term: title,
        },
      });

      if (!response[0]) {
        this.logger.warn(`Series not found`);
      }

      return response;
    } catch (e) {
      this.logger.warn('Error retrieving series by series title', {
        label: 'Sonarr API',
        errorMessage: e.message,
        title,
      });
      this.logger.debug(e);
    }
  }

  public async getSeriesByTvdbId(id: number): Promise<SonarrSeries> {
    try {
      const response = await this.get<SonarrSeries[]>(`/series?tvdbId=${id}`);

      if (!response?.[0]) {
        this.logger.warn(`Could not retrieve show by tvdb ID ${id}`);
        return undefined;
      }

      return response[0];
    } catch (e) {
      this.logger.warn(`Error retrieving show by tvdb ID ${id}. ${e.message}`);
      this.logger.debug(e);
    }
  }

  public async updateSeries(series: SonarrSeries) {
    await this.axios.put<SonarrSeries>('/series', series);
  }

  public async searchSeries(seriesId: number): Promise<void> {
    this.logger.log('Executing series search command.', {
      label: 'Sonarr API',
      seriesId,
    });

    try {
      await this.runCommand('SeriesSearch', { seriesId });
    } catch (e) {
      this.logger.log(
        'Something went wrong while executing Sonarr series search.',
        {
          label: 'Sonarr API',
          errorMessage: e.message,
          seriesId,
        },
      );
      this.logger.debug(e);
    }
  }

  public async deleteShow(
    seriesId: number | string,
    deleteFiles = true,
    importListExclusion = false,
  ) {
    this.logger.log(`Deleting show with ID ${seriesId} from Sonarr.`);
    try {
      await this.runDelete(
        `series/${seriesId}?deleteFiles=${deleteFiles}&addImportListExclusion=${importListExclusion}`,
      );
    } catch (e) {
      this.logger.log("Couldn't delete show. Does it exist in sonarr?", {
        label: 'Sonarr API',
        errorMessage: e.message,
        seriesId,
      });
      this.logger.debug(e);
    }
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
  ): Promise<SonarrSeries> {
    try {
      const data: SonarrSeries = (await this.axios.get(`series/${seriesId}`))
        .data;

      const episodes: SonarrEpisode[] = await this.get(
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

  private buildSeasonList(
    seasons: number[],
    existingSeasons?: SonarrSeason[],
  ): SonarrSeason[] {
    if (existingSeasons) {
      const newSeasons = existingSeasons.map((season) => {
        if (seasons.includes(season.seasonNumber)) {
          season.monitored = true;
        }
        return season;
      });

      return newSeasons;
    }

    const newSeasons = seasons.map(
      (seasonNumber): SonarrSeason => ({
        seasonNumber,
        monitored: true,
      }),
    );

    return newSeasons;
  }

  public async info(): Promise<SonarrInfo> {
    try {
      const info: SonarrInfo = (
        await this.axios.get(`system/status`, {
          signal: AbortSignal.timeout(10000), // aborts request after 10 seconds
        })
      ).data;
      return info ? info : null;
    } catch (e) {
      this.logger.warn("Couldn't fetch Sonarr info.. Is Sonarr up?");
      this.logger.debug(e);
      return null;
    }
  }
}
