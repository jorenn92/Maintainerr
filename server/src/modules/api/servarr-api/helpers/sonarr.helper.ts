import { Logger } from '@nestjs/common';
import { ServarrApi } from '../common/servarr-api.service';
import {
  AddSeriesOptions,
  LanguageProfile,
  SonarrEpisode,
  SonarrInfo,
  SonarrSeason,
  SonarrSeries,
} from '../interfaces/sonarr.interface';

export class SonarrApi extends ServarrApi<{
  seriesId: number;
  episodeId: number;
}> {
  logger: Logger;
  constructor({ url, apiKey }: { url: string; apiKey: string }) {
    super({ url, apiKey, apiName: 'Sonarr' });
    this.logger = new Logger(SonarrApi.name);
  }

  public async getSeries(): Promise<SonarrSeries[]> {
    try {
      const response = await this.axios.get<SonarrSeries[]>('/series');

      return response.data;
    } catch (e) {
      throw new Error(`[Sonarr] Failed to retrieve series: ${e.message}`);
    }
  }

  public async getSeriesByTitle(title: string): Promise<SonarrSeries[]> {
    try {
      const response = await this.axios.get<SonarrSeries[]>('/series/lookup', {
        params: {
          term: title,
        },
      });

      if (!response.data[0]) {
        throw new Error('No series found');
      }

      return response.data;
    } catch (e) {
      this.logger.error('Error retrieving series by series title', {
        label: 'Sonarr API',
        errorMessage: e.message,
        title,
      });
      throw new Error('No series found');
    }
  }

  public async getSeriesByTvdbId(id: number): Promise<SonarrSeries> {
    try {
      const response = await this.axios.get<SonarrSeries[]>(
        `/series/lookup?term=tvdb:${id}`,
      );

      if (!response.data[0]) {
        this.logger.warn('Error retrieving series by tvdb ID', {
          label: 'Sonarr API',
          errorMessage: '',
          tvdbId: id,
        });
      }
      return response.data[0];
    } catch (e) {
      this.logger.warn('Error retrieving series by tvdb ID', {
        label: 'Sonarr API',
        errorMessage: e.message,
        tvdbId: id,
      });
    }
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
          this.logger.log('Updated existing series in Sonarr.', {
            label: 'Sonarr',
            seriesId: newSeriesResponse.data.id,
            seriesTitle: newSeriesResponse.data.title,
          });
          this.logger.debug('Sonarr update details', {
            label: 'Sonarr',
            movie: newSeriesResponse.data,
          });

          if (options.searchNow) {
            this.searchSeries(newSeriesResponse.data.id);
          }

          return newSeriesResponse.data;
        } else {
          this.logger.error('Failed to update series in Sonarr', {
            label: 'Sonarr',
            options,
          });
          throw new Error('Failed to update series in Sonarr');
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
        this.logger.log('Sonarr accepted request', { label: 'Sonarr' });
        this.logger.debug('Sonarr add details', {
          label: 'Sonarr',
          movie: createdSeriesResponse.data,
        });
      } else {
        this.logger.error('Failed to add movie to Sonarr', {
          label: 'Sonarr',
          options,
        });
        throw new Error('Failed to add series to Sonarr');
      }

      return createdSeriesResponse.data;
    } catch (e) {
      this.logger.error(
        'Something went wrong while adding a series to Sonarr.',
        {
          label: 'Sonarr API',
          errorMessage: e.message,
          options,
          response: e?.response?.data,
        },
      );
      throw new Error('Failed to add series');
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
      this.logger.error(
        'Something went wrong while retrieving Sonarr language profiles.',
        {
          label: 'Sonarr API',
          errorMessage: e.message,
        },
      );

      throw new Error('Failed to get language profiles');
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
    }
  }

  public async deleteShow(seriesId: number | string, deleteFiles = true) {
    this.logger.log('Deleting series from Sonarr.', {
      label: 'Sonarr API',
      seriesId,
    });
    try {
      await this.runDelete(`series/${seriesId}?deleteFiles=${deleteFiles}`);
    } catch (e) {
      this.logger.log("Couldn't delete show. Does it exist in sonarr?", {
        label: 'Sonarr API',
        errorMessage: e.message,
        seriesId,
      });
    }
  }

  public async unmonitorSeasons(
    seriesId: number | string,
    type: 'all' | 'existing' = 'all',
    deleteFiles = true,
  ): Promise<void> {
    try {
      const data: SonarrSeries = (await this.axios.get(`series/${seriesId}`))
        .data;

      data.seasons = data.seasons.map((s) => {
        if (type === 'all' || s.statistics?.episodeFileCount > 0) {
          s.monitored = false;
        }
        return s;
      });
      await this.runPut(`series/`, JSON.stringify(data));

      // delete files
      if (deleteFiles) {
        const episodes: SonarrEpisode[] = (
          await this.axios.get(`episodefile?seriesId=${seriesId}`)
        ).data;
        episodes.forEach(async (e) => {
          await this.runDelete(`episodefile/${e.id}`);
        });
      }
    } catch (e) {
      this.logger.log(
        "Couldn't unmonitor/delete show. Does it exist in sonarr?",
        {
          errorMessage: e.message,
          seriesId,
        },
      );
    }
    this.logger.log(`Unmonitored seasons from Sonarr show with ID ${seriesId}`);
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
      const info: SonarrInfo = await this.get(`system/status`);
      return info ? info : null;
    } catch (e) {
      this.logger.warn("Couldn't fetch Sonarr info.. Is Sonarr up?");
      return null;
    }
  }
}
