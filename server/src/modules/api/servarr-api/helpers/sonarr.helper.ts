import { Logger } from '@nestjs/common';
import { ServarrApi } from '../common/servarr-api.service';
import {
  AddSeriesOptions,
  LanguageProfile,
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
    episodeIds?: number[],
  ): Promise<SonarrEpisode[]> {
    try {
      const response = await this.get<SonarrEpisode[]>(
        `/episode?seriesId=${seriesID}${
          seasonNumber ? `&seasonNumber=${seasonNumber}` : ''
        }${episodeIds ? `&episodeIds=${episodeIds}` : ''}`,
      );

      return episodeIds
        ? response.filter((el) => episodeIds.includes(el.episodeNumber))
        : response;
    } catch (e) {
      this.logger.warn(
        `[Sonarr] Failed to retrieve show ${seriesID}'s episodes ${episodeIds}: ${e.message}`,
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

  public async addSeries(options: AddSeriesOptions): Promise<SonarrSeries> {
    try {
      const series = await this.getSeriesByTvdbId(options.tvdbid);

      // If the series already exists, we will simply just update it
      if (series.id) {
        series.tags = options.tags ?? series.tags;
        series.seasons = this.buildSeasonList(options.seasons, series.seasons);

        const newSeriesResponse = await this.axios.put<SonarrSeries>(
          '/series',
          series,
        );

        if (newSeriesResponse.data.id) {
          this.logger.log(
            `Updated existing series in Sonarr with seriesId: ${newSeriesResponse.data.id} an title of ${newSeriesResponse.data.title}`,
          );
          this.logger.debug('Sonarr update details', {
            label: 'Sonarr',
            movie: newSeriesResponse.data,
          });

          if (options.searchNow) {
            this.searchSeries(newSeriesResponse.data.id);
          }

          return newSeriesResponse.data;
        } else {
          this.logger.warn('Failed to update series in Sonarr', {
            label: 'Sonarr',
            options,
          });
          this.logger.warn(`Failed to update series in Sonarr`);
        }
      }

      const createdSeriesResponse = await this.axios.post<SonarrSeries>(
        '/series',
        {
          tvdbId: options.tvdbid,
          title: options.title,
          qualityProfileId: options.profileId,
          languageProfileId: options.languageProfileId,
          seasons: this.buildSeasonList(
            options.seasons,
            series.seasons.map((season) => ({
              seasonNumber: season.seasonNumber,
              // We force all seasons to false if its the first request
              monitored: false,
            })),
          ),
          tags: options.tags,
          seasonFolder: options.seasonFolder,
          monitored: options.monitored,
          rootFolderPath: options.rootFolderPath,
          seriesType: options.seriesType,
          addOptions: {
            ignoreEpisodesWithFiles: true,
            searchForMissingEpisodes: options.searchNow,
          },
        } as Partial<SonarrSeries>,
      );

      if (createdSeriesResponse.data.id) {
        this.logger.log('Sonarr accepted request');
        this.logger.debug('Sonarr add details', {
          label: 'Sonarr',
          movie: createdSeriesResponse.data,
        });
      } else {
        this.logger.warn('Failed to add movie to Sonarr', {
          label: 'Sonarr',
          options,
        });
        this.logger.warn(`Failed to add series to Sonarr`);
      }

      return createdSeriesResponse.data;
    } catch (e) {
      this.logger.warn(
        'Something went wrong while adding a series to Sonarr.',
        {
          label: 'Sonarr API',
          errorMessage: e.message,
          options,
          response: e?.response?.data,
        },
      );
      this.logger.debug(e);
    }
  }

  public async getLanguageProfiles(): Promise<LanguageProfile[]> {
    try {
      const data = await this.getRolling<LanguageProfile[]>(
        '/languageprofile',
        undefined,
        3600,
      );

      return data;
    } catch (e) {
      this.logger.warn(
        'Something went wrong while retrieving Sonarr language profiles.',
        {
          label: 'Sonarr API',
          errorMessage: e.message,
        },
      );
      this.logger.debug(e);
    }
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
