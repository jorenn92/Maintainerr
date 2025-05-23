import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import {
  createSonarrEpisode,
  createSonarrEpisodeFile,
  createSonarrSeries,
} from '../../../../../test/utils/data';
import { MaintainerrLogger } from '../../../logging/logs.service';
import { SonarrEpisode, SonarrSeries } from '../interfaces/sonarr.interface';
import { SonarrApi } from './sonarr.helper';

jest.mock('axios-retry');
jest.mock('axios', () => {
  return {
    ...jest.requireActual('axios'),
    create: jest.fn().mockReturnValue(jest.requireActual('axios')),
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() },
    },
  };
});

//const axiosMock = new MockAdapter(axios);

//const axiosInstance = axios.create();
//const axiosMock = new MockAdapter(axiosInstance);

describe('SonarrApi', () => {
  let axiosMock: MockAdapter;
  let sonarrApi: SonarrApi;

  beforeEach(async () => {
    axiosMock = new MockAdapter(axios, {
      onNoMatch: 'throwException',
    });

    // Create a mocked MaintainerrLogger
    const mockedLogger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      fatal: jest.fn(),
      debug: jest.fn(),
      setContext: jest.fn(),
      logger: {} as any,
    } as unknown as MaintainerrLogger;

    sonarrApi = new SonarrApi(
      {
        apiKey: 'test',
        url: 'http://localhost',
      },
      mockedLogger,
    );
  });

  afterEach(() => {
    axiosMock.reset();
    //jest.resetAllMocks();
  });

  describe('unmonitorSeasons', () => {
    test.skip('should unmonitor all existing episodes when type is existing', async () => {
      axiosMock.onGet(`/series/1`).reply(
        200,
        createSonarrSeries({
          seasons: [
            {
              seasonNumber: 1,
              monitored: false,
            },
            {
              seasonNumber: 2,
              monitored: true,
            },
            {
              seasonNumber: 3,
              monitored: true,
            },
          ],
        }),
      );

      const episodes = [
        createSonarrEpisode({
          id: 50,
          seriesId: 1,
          seasonNumber: 1,
          episodeNumber: 1,
          monitored: false,
          hasFile: true,
        }),
        createSonarrEpisode({
          id: 51,
          seriesId: 1,
          seasonNumber: 1,
          episodeNumber: 2,
          monitored: false,
          hasFile: true,
        }),
        createSonarrEpisode({
          id: 52,
          seriesId: 1,
          seasonNumber: 2,
          episodeNumber: 1,
          monitored: true,
          hasFile: true,
        }),
        createSonarrEpisode({
          id: 53,
          seriesId: 1,
          seasonNumber: 3,
          episodeNumber: 1,
          monitored: true,
          hasFile: true,
        }),
      ];

      axiosMock
        .onGet(/\/episode\?seriesId=\d+&seasonNumber=\d+/)
        .reply(200, episodes);

      let episodePutCount = 0;

      for (const e of episodes) {
        axiosMock
          .onPut(`episode/${e.id}`, { ...e, monitored: false })
          .reply(() => {
            episodePutCount++;
            return [202, {}];
          });
      }

      axiosMock.onGet(`episodefile?seriesId=1`).reply(200, [
        createSonarrEpisodeFile({
          id: 100,
          seasonNumber: 1,
          seriesId: 1,
        }),
        createSonarrEpisodeFile({
          id: 101,
          seasonNumber: 1,
          seriesId: 1,
        }),
        createSonarrEpisodeFile({
          id: 102,
          seasonNumber: 2,
          seriesId: 1,
        }),
        createSonarrEpisodeFile({
          id: 103,
          seasonNumber: 3,
          seriesId: 1,
        }),
      ]);

      await sonarrApi.unmonitorSeasons(1, 'existing', false, false);

      expect(episodePutCount).toBe(3);
    });

    it('should unmonitor all seasons when type is all', async () => {
      const series = createSonarrSeries({
        seasons: [
          {
            seasonNumber: 1,
            monitored: false,
          },
          {
            seasonNumber: 2,
            monitored: true,
          },
          {
            seasonNumber: 3,
            monitored: true,
          },
        ],
      });

      axiosMock.onGet(`series/1`).reply(200, series);
      axiosMock.onGet(`episodefile?seriesId=1`).reply(200, []);
      let seriesPutCount = 0;

      axiosMock
        .onPut('/series/', {
          ...series,
          seasons: [
            {
              seasonNumber: 1,
              monitored: false,
            },
            {
              seasonNumber: 2,
              monitored: false,
            },
            {
              seasonNumber: 3,
              monitored: false,
            },
          ],
        } satisfies SonarrSeries)
        .reply(() => {
          seriesPutCount++;
          return [202, {}];
        });

      await sonarrApi.unmonitorSeasons(1, 'all', false, false);

      expect(seriesPutCount).toBe(1);
    });

    it('should unmonitor single season when type is number', async () => {
      const series = createSonarrSeries({
        seasons: [
          {
            seasonNumber: 1,
            monitored: false,
          },
          {
            seasonNumber: 2,
            monitored: true,
          },
          {
            seasonNumber: 3,
            monitored: true,
          },
        ],
      });

      axiosMock.onGet(`series/1`).reply(200, series);
      axiosMock.onGet(`episodefile?seriesId=1`).reply(200, []);
      let seriesPutCount = 0;

      axiosMock
        .onPut('/series/', {
          ...series,
          seasons: [
            {
              seasonNumber: 1,
              monitored: false,
            },
            {
              seasonNumber: 2,
              monitored: true,
            },
            {
              seasonNumber: 3,
              monitored: false,
            },
          ],
        } satisfies SonarrSeries)
        .reply(() => {
          seriesPutCount++;
          return [202, {}];
        });

      await sonarrApi.unmonitorSeasons(1, 3, false, false);

      expect(seriesPutCount).toBe(1);
    });

    test.skip('should unmonitor a single seasons episodes when forceExisting and type is a season number', async () => {
      const series = createSonarrSeries({
        seasons: [
          {
            seasonNumber: 1,
            monitored: false,
          },
          {
            seasonNumber: 2,
            monitored: true,
          },
          {
            seasonNumber: 3,
            monitored: true,
          },
        ],
      });

      axiosMock.onGet(`series/1`).reply(200, series);

      const seasonThreeEpisode: SonarrEpisode = createSonarrEpisode({
        id: 53,
        seriesId: 1,
        seasonNumber: 3,
        episodeNumber: 1,
        monitored: true,
        hasFile: true,
      });

      const episodes = [
        createSonarrEpisode({
          id: 50,
          seriesId: 1,
          seasonNumber: 1,
          episodeNumber: 1,
          monitored: false,
          hasFile: true,
        }),
        createSonarrEpisode({
          id: 51,
          seriesId: 1,
          seasonNumber: 1,
          episodeNumber: 2,
          monitored: false,
          hasFile: true,
        }),
        createSonarrEpisode({
          id: 52,
          seriesId: 1,
          seasonNumber: 2,
          episodeNumber: 1,
          monitored: true,
          hasFile: true,
        }),
        seasonThreeEpisode,
      ];

      axiosMock
        .onGet(/\/episode\?seriesId=\d+&seasonNumber=\d+/)
        .reply(200, episodes);

      axiosMock.onGet(`episodefile?seriesId=1`).reply(200, [
        createSonarrEpisodeFile({
          id: 100,
          seasonNumber: 1,
          seriesId: 1,
        }),
        createSonarrEpisodeFile({
          id: 101,
          seasonNumber: 1,
          seriesId: 1,
        }),
        createSonarrEpisodeFile({
          id: 102,
          seasonNumber: 2,
          seriesId: 1,
        }),
        createSonarrEpisodeFile({
          id: 103,
          seasonNumber: 3,
          seriesId: 1,
        }),
      ]);

      let episodePutCount = 0;

      axiosMock
        .onPut(`episode/53`, { ...seasonThreeEpisode, monitored: false })
        .reply(() => {
          episodePutCount++;
          return [202, {}];
        });

      await sonarrApi.unmonitorSeasons(1, 3, false, true);

      expect(episodePutCount).toBe(1);
    });
  });
});
