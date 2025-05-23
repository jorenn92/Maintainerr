import { Mocked, TestBed } from '@suites/unit';
import {
  createCollectionMedia,
  createPlexLibraryItem,
  createPlexMetadata,
  createRulesDto,
  createSonarrEpisode,
  createSonarrSeries,
} from '../../../../test/utils/data';
import { EPlexDataType } from '../../api/plex-api/enums/plex-data-type-enum';
import { PlexApiService } from '../../api/plex-api/plex-api.service';
import { SonarrApi } from '../../api/servarr-api/helpers/sonarr.helper';
import { SonarrSeries } from '../../api/servarr-api/interfaces/sonarr.interface';
import { ServarrService } from '../../api/servarr-api/servarr.service';
import { MaintainerrLogger } from '../../logging/logs.service';
import { SonarrGetterService } from './sonarr-getter.service';

describe('SonarrGetterService', () => {
  let sonarrGetterService: SonarrGetterService;
  let servarrService: Mocked<ServarrService>;
  let plexApi: Mocked<PlexApiService>;
  let logger: Mocked<MaintainerrLogger>;

  beforeEach(async () => {
    const { unit, unitRef } =
      await TestBed.solitary(SonarrGetterService).compile();

    sonarrGetterService = unit;

    servarrService = unitRef.get(ServarrService);
    plexApi = unitRef.get(PlexApiService);
    logger = unitRef.get(MaintainerrLogger);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('part_of_latest_season', () => {
    it.each([
      { type: EPlexDataType.SEASONS, title: 'SEASONS' },
      {
        type: EPlexDataType.EPISODES,
        title: 'EPISODES',
      },
    ])(
      'should return true when next season has not started airing yet for $title',
      async ({ type }: { type: EPlexDataType }) => {
        jest.useFakeTimers().setSystemTime(new Date('2025-01-01'));

        const collectionMedia = createCollectionMedia(type);
        collectionMedia.collection.sonarrSettingsId = 1;

        plexApi.getMetadata.mockResolvedValue(
          createPlexMetadata({
            type: 'show',
          }),
        );
        const series = createSonarrSeries({
          seasons: [
            {
              seasonNumber: 0,
              monitored: false,
            },
            {
              seasonNumber: 1,
              monitored: true,
            },
            {
              seasonNumber: 2,
              monitored: true,
            },
          ],
        });

        const mockedSonarrApi = mockSonarrApi(series);
        jest
          .spyOn(mockedSonarrApi, 'getEpisodes')
          .mockImplementation((seriesId, seasonNumber) => {
            if (seasonNumber === 0) {
              return Promise.resolve([
                createSonarrEpisode({
                  seriesId,
                  seasonNumber,
                  episodeNumber: 1,
                  airDateUtc: '2024-06-26T00:00:00Z',
                }),
              ]);
            } else if (seasonNumber === 1) {
              return Promise.resolve([
                createSonarrEpisode({
                  seriesId,
                  seasonNumber,
                  episodeNumber: 1,
                  airDateUtc: '2024-06-25T00:00:00Z',
                }),
              ]);
            } else if (seasonNumber === 2) {
              return Promise.resolve([
                createSonarrEpisode({
                  seriesId,
                  seasonNumber,
                  episodeNumber: 1,
                  airDateUtc: '2025-04-01T00:00:00Z',
                }),
              ]);
            }

            return Promise.resolve([]);
          });

        const plexLibraryItem = createPlexLibraryItem(
          type == EPlexDataType.EPISODES ? 'episode' : 'season',
          {
            index: 1,
            parentIndex: type == EPlexDataType.EPISODES ? 1 : undefined, // For episode, target parent (season)
          },
        );

        const response = await sonarrGetterService.get(
          13,
          plexLibraryItem,
          type,
          createRulesDto({
            collection: collectionMedia.collection,
            dataType: type,
          }),
        );

        expect(response).toBe(true);
      },
    );

    describe('part_of_latest_season', () => {
      it.each([
        { type: EPlexDataType.SEASONS, title: 'SEASONS' },
        {
          type: EPlexDataType.EPISODES,
          title: 'EPISODES',
        },
      ])(
        'should return false when a later season has aired for $title',
        async ({ type }: { type: EPlexDataType }) => {
          jest.useFakeTimers().setSystemTime(new Date('2025-06-01'));

          const collectionMedia = createCollectionMedia(type);
          collectionMedia.collection.sonarrSettingsId = 1;

          plexApi.getMetadata.mockResolvedValue(
            createPlexMetadata({
              type: 'show',
            }),
          );
          const series = createSonarrSeries({
            seasons: [
              {
                seasonNumber: 0,
                monitored: false,
              },
              {
                seasonNumber: 1,
                monitored: true,
              },
              {
                seasonNumber: 2,
                monitored: true,
              },
            ],
          });

          const mockedSonarrApi = mockSonarrApi(series);
          jest
            .spyOn(mockedSonarrApi, 'getEpisodes')
            .mockImplementation((seriesId, seasonNumber) => {
              if (seasonNumber === 0) {
                return Promise.resolve([
                  createSonarrEpisode({
                    seriesId,
                    seasonNumber,
                    episodeNumber: 1,
                    airDateUtc: '2024-06-26T00:00:00Z',
                  }),
                ]);
              } else if (seasonNumber === 1) {
                return Promise.resolve([
                  createSonarrEpisode({
                    seriesId,
                    seasonNumber,
                    episodeNumber: 1,
                    airDateUtc: '2024-06-25T00:00:00Z',
                  }),
                ]);
              } else if (seasonNumber === 2) {
                return Promise.resolve([
                  createSonarrEpisode({
                    seriesId,
                    seasonNumber,
                    episodeNumber: 1,
                    airDateUtc: '2025-04-01T00:00:00Z',
                  }),
                ]);
              }

              return Promise.resolve([]);
            });

          const plexLibraryItem = createPlexLibraryItem(
            type == EPlexDataType.EPISODES ? 'episode' : 'season',
            {
              index: 1,
              parentIndex: type == EPlexDataType.EPISODES ? 1 : undefined, // For episode, target parent (season)
            },
          );

          const response = await sonarrGetterService.get(
            13,
            plexLibraryItem,
            type,
            createRulesDto({
              collection: collectionMedia.collection,
              dataType: type,
            }),
          );

          expect(response).toBe(false);
        },
      );
    });
  });

  const mockSonarrApi = (series?: SonarrSeries) => {
    const mockedSonarrApi = new SonarrApi({} as any, logger as any);
    const mockedServarrService = new ServarrService({} as any, logger as any);
    jest
      .spyOn(mockedServarrService, 'getSonarrApiClient')
      .mockResolvedValue(mockedSonarrApi);

    if (series) {
      jest
        .spyOn(mockedSonarrApi, 'getSeriesByTvdbId')
        .mockResolvedValue(series);
    } else {
      jest
        .spyOn(mockedSonarrApi, 'getSeriesByTvdbId')
        .mockImplementation(jest.fn());
    }

    servarrService.getSonarrApiClient.mockResolvedValue(mockedSonarrApi);

    return mockedSonarrApi;
  };
});
