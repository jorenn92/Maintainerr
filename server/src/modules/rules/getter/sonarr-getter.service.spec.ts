import { Mocked, TestBed } from '@suites/unit';
import {
  createCollectionMedia,
  createPlexLibraryItem,
  createPlexMetadata,
  createRulesDto,
  createSonarrEpisode,
  createSonarrEpisodeFile,
  createSonarrSeries,
  EPlexDataTypeToPlexTypeMap,
} from '../../../../test/utils/data';
import { EPlexDataType } from '../../api/plex-api/enums/plex-data-type-enum';
import { PlexLibraryItem } from '../../api/plex-api/interfaces/library.interfaces';
import { PlexApiService } from '../../api/plex-api/plex-api.service';
import { SonarrApi } from '../../api/servarr-api/helpers/sonarr.helper';
import { SonarrSeries } from '../../api/servarr-api/interfaces/sonarr.interface';
import { ServarrService } from '../../api/servarr-api/servarr.service';
import { CollectionMedia } from '../../collections/entities/collection_media.entities';
import { SonarrGetterService } from './sonarr-getter.service';

describe('SonarrGetterService', () => {
  let sonarrGetterService: SonarrGetterService;
  let servarrService: Mocked<ServarrService>;
  let plexApi: Mocked<PlexApiService>;

  beforeEach(async () => {
    const { unit, unitRef } =
      await TestBed.solitary(SonarrGetterService).compile();

    sonarrGetterService = unit;
    servarrService = unitRef.get(ServarrService);
    plexApi = unitRef.get(PlexApiService);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('fileQualityCutoffMet', () => {
    let collectionMedia: CollectionMedia;
    let mockedSonarrApi: SonarrApi;
    let series: SonarrSeries;
    let plexLibraryItem: PlexLibraryItem;

    beforeEach(() => {
      collectionMedia = createCollectionMedia(EPlexDataType.EPISODES);
      collectionMedia.collection.sonarrSettingsId = 1;
      plexApi.getMetadata.mockResolvedValue(
        createPlexMetadata({
          type: 'show',
        }),
      );
      series = createSonarrSeries();
      mockedSonarrApi = mockSonarrApi(series);
      plexLibraryItem = createPlexLibraryItem('episode');
    });

    it('should return true when the cut off is met', async () => {
      const episodeFile = createSonarrEpisodeFile({
        qualityCutoffNotMet: false,
      });
      const episode = createSonarrEpisode({
        episodeFileId: episodeFile.id,
      });
      jest.spyOn(mockedSonarrApi, 'getEpisodes').mockResolvedValue([episode]);
      jest
        .spyOn(mockedSonarrApi, 'getEpisodeFile')
        .mockResolvedValue(episodeFile);

      const response = await sonarrGetterService.get(
        23,
        plexLibraryItem,
        EPlexDataType.EPISODES,
        createRulesDto({
          collection: collectionMedia.collection,
          dataType: EPlexDataType.EPISODES,
        }),
      );

      expect(response).toBe(true);
    });

    it('should return false when the cut off is not met', async () => {
      const episodeFile = createSonarrEpisodeFile({
        qualityCutoffNotMet: true,
      });
      const episode = createSonarrEpisode({
        episodeFileId: episodeFile.id,
      });
      jest.spyOn(mockedSonarrApi, 'getEpisodes').mockResolvedValue([episode]);
      jest
        .spyOn(mockedSonarrApi, 'getEpisodeFile')
        .mockResolvedValue(episodeFile);

      const response = await sonarrGetterService.get(
        23,
        plexLibraryItem,
        EPlexDataType.EPISODES,
        createRulesDto({
          collection: collectionMedia.collection,
          dataType: EPlexDataType.EPISODES,
        }),
      );

      expect(response).toBe(false);
    });

    it('should return false when no episode file exists', async () => {
      jest.spyOn(mockedSonarrApi, 'getEpisodes').mockResolvedValue([]);

      const response = await sonarrGetterService.get(
        23,
        plexLibraryItem,
        EPlexDataType.EPISODES,
        createRulesDto({
          collection: collectionMedia.collection,
          dataType: EPlexDataType.EPISODES,
        }),
      );

      expect(response).toBe(false);
    });
  });

  describe('fileQualityName', () => {
    let collectionMedia: CollectionMedia;
    let mockedSonarrApi: SonarrApi;
    let series: SonarrSeries;
    let plexLibraryItem: PlexLibraryItem;

    beforeEach(() => {
      collectionMedia = createCollectionMedia(EPlexDataType.EPISODES);
      collectionMedia.collection.sonarrSettingsId = 1;
      plexApi.getMetadata.mockResolvedValue(
        createPlexMetadata({
          type: 'show',
        }),
      );
      series = createSonarrSeries();
      mockedSonarrApi = mockSonarrApi(series);
      plexLibraryItem = createPlexLibraryItem('episode');
    });

    it('should return quality name', async () => {
      const episodeFile = createSonarrEpisodeFile({
        quality: {
          quality: {
            id: 1,
            name: 'WEBDL-1080p',
            source: 'web',
            resolution: 1080,
          },
        },
      });
      const episode = createSonarrEpisode({
        episodeFileId: episodeFile.id,
      });
      jest.spyOn(mockedSonarrApi, 'getEpisodes').mockResolvedValue([episode]);
      jest
        .spyOn(mockedSonarrApi, 'getEpisodeFile')
        .mockResolvedValue(episodeFile);

      const response = await sonarrGetterService.get(
        24,
        plexLibraryItem,
        EPlexDataType.EPISODES,
        createRulesDto({
          collection: collectionMedia.collection,
          dataType: EPlexDataType.EPISODES,
        }),
      );

      expect(response).toBe('WEBDL-1080p');
    });

    it('should return null when no episode file exists', async () => {
      jest.spyOn(mockedSonarrApi, 'getEpisodes').mockResolvedValue([]);

      const response = await sonarrGetterService.get(
        24,
        plexLibraryItem,
        EPlexDataType.EPISODES,
        createRulesDto({
          collection: collectionMedia.collection,
          dataType: EPlexDataType.EPISODES,
        }),
      );

      expect(response).toBe(null);
    });
  });

  describe('qualityProfileName', () => {
    it.each([
      { type: EPlexDataType.SEASONS, title: 'SEASONS' },
      {
        type: EPlexDataType.SHOWS,
        title: 'SHOWS',
      },
      {
        type: EPlexDataType.EPISODES,
        title: 'EPISODES',
      },
    ])(
      'should return show quality name for $title',
      async ({ type }: { type: EPlexDataType }) => {
        const collectionMedia = createCollectionMedia(EPlexDataType.EPISODES);
        collectionMedia.collection.sonarrSettingsId = 1;
        plexApi.getMetadata.mockResolvedValue(
          createPlexMetadata({
            type: 'show',
          }),
        );
        const plexLibraryItem = createPlexLibraryItem(
          EPlexDataTypeToPlexTypeMap[type],
        );
        const series = createSonarrSeries({
          qualityProfileId: 2,
        });
        const mockedSonarrApi = mockSonarrApi(series);
        jest.spyOn(mockedSonarrApi, 'getProfiles').mockResolvedValue([
          {
            id: 1,
            name: 'WEBDL-1080p',
          },
          {
            id: 2,
            name: 'WEBDL-720p',
          },
        ]);
        const episode = createSonarrEpisode();
        jest.spyOn(mockedSonarrApi, 'getEpisodes').mockResolvedValue([episode]);

        const response = await sonarrGetterService.get(
          25,
          plexLibraryItem,
          type,
          createRulesDto({
            collection: collectionMedia.collection,
            dataType: type,
          }),
        );

        expect(response).toBe('WEBDL-720p');
      },
    );
  });

  const mockSonarrApi = (series?: SonarrSeries) => {
    const mockedSonarrApi = new SonarrApi({} as any);
    const mockedServarrService = new ServarrService({} as any);
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
