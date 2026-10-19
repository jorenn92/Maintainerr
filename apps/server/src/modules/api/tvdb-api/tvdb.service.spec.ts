import { Mocked, TestBed } from '@suites/unit';
import { AxiosError, AxiosHeaders } from 'axios';
import { SettingsDataService } from '../../settings/settings-data.service';
import { retryingHttp } from '../lib/httpRetry';
import { TvdbApiService } from './tvdb.service';

describe('TVDB connection test', () => {
  let service: TvdbApiService;
  let settings: Mocked<SettingsDataService>;

  beforeEach(async () => {
    const { unit, unitRef } = await TestBed.solitary(TvdbApiService).compile();
    service = unit;
    settings = unitRef.get(SettingsDataService);
    jest.spyOn(retryingHttp, 'post').mockResolvedValue({
      data: { status: 'success', data: { token: 'test-token' } },
    });
    jest.spyOn(retryingHttp, 'get').mockResolvedValue({
      data: { status: 'success', data: { id: 121361 } },
    });
  });

  afterEach(() => jest.restoreAllMocks());

  it('reads metadata with the submitted key without changing runtime authentication', async () => {
    settings.tvdb_api_key = 'saved-key';

    await expect(
      service.testConnection('submitted-key'),
    ).resolves.toMatchObject({
      code: 1,
    });
    expect(retryingHttp.post).toHaveBeenCalledWith(
      expect.stringContaining('/login'),
      { apikey: 'submitted-key' },
      expect.any(Object),
    );
    expect(retryingHttp.get).toHaveBeenCalledWith(
      expect.stringContaining('/series/121361/extended'),
      expect.objectContaining({
        headers: { Authorization: 'Bearer test-token' },
      }),
    );
    expect(service.isAvailable()).toBe(false);
  });

  it('rejects a login token that cannot read protected metadata', async () => {
    const error = new AxiosError('Unauthorized');
    error.response = {
      status: 401,
      statusText: 'Unauthorized',
      data: {},
      headers: {},
      config: { headers: new AxiosHeaders() },
    };
    jest.mocked(retryingHttp.get).mockRejectedValue(error);

    await expect(service.testConnection('inactive-key')).resolves.toMatchObject(
      {
        code: 0,
        message: 'Invalid API key',
      },
    );
  });

  it.each([
    { status: 'success', data: {} },
    { status: 'failure', data: { id: 121361 } },
  ])('rejects an unexpected metadata response: %j', async (data) => {
    jest.mocked(retryingHttp.get).mockResolvedValue({ data });
    await expect(service.testConnection('test-key')).resolves.toMatchObject({
      code: 0,
    });
  });

  it('rejects a blank key without using the saved key', async () => {
    settings.tvdb_api_key = 'saved-key';
    await expect(service.testConnection('   ')).resolves.toMatchObject({
      code: 0,
    });
    expect(retryingHttp.post).not.toHaveBeenCalled();
  });
});

describe('TVDB startup login', () => {
  let service: TvdbApiService;
  let settings: Mocked<SettingsDataService>;
  let answerLogin: (token: string) => void;
  const flush = () => new Promise((resolve) => setImmediate(resolve));

  beforeEach(async () => {
    const { unit, unitRef } = await TestBed.solitary(TvdbApiService).compile();
    service = unit;
    settings = unitRef.get(SettingsDataService);
    settings.tvdb_api_key = 'saved-key';
    jest.spyOn(retryingHttp, 'post').mockReturnValue(
      new Promise((resolve) => {
        answerLogin = (token) => resolve({ data: { data: { token } } });
      }),
    );
  });

  afterEach(() => jest.restoreAllMocks());

  // #3936: Nest awaits this hook before it opens the port.
  it('lets the app start before TVDB answers, then authenticates', async () => {
    await service.onApplicationBootstrap();

    answerLogin('token');
    await flush();
    expect(service.isAvailable()).toBe(true);
  });

  it('keeps a key removed during the startup login removed', async () => {
    service.onApplicationBootstrap();
    settings.tvdb_api_key = undefined;
    await service.handleSettingsUpdate({
      oldSettings: { tvdb_api_key: 'saved-key' },
      settings: { tvdb_api_key: undefined },
    });

    answerLogin('stale-token');
    await flush();
    expect(service.isAvailable()).toBe(false);
  });

  it.each([
    { cause: 'TVDB unreachable', status: undefined, available: true },
    { cause: 'key rejected', status: 401, available: false },
  ])(
    'logs in again later after a failed login only when TVDB did not reject the key: $cause',
    async ({ status, available }) => {
      const error = new AxiosError('Login failed');
      if (status) {
        error.response = {
          status,
          statusText: '',
          data: {},
          headers: {},
          config: { headers: new AxiosHeaders() },
        };
      }
      jest
        .mocked(retryingHttp.post)
        .mockRejectedValueOnce(error)
        .mockResolvedValue({ data: { data: { token: 'token' } } });
      const now = jest.spyOn(Date, 'now').mockReturnValue(0);

      await service.onApplicationBootstrap();
      await flush();
      expect(service.isAvailable()).toBe(false);

      now.mockReturnValue(15 * 60 * 1000);
      service.isAvailable();
      await flush();
      expect(service.isAvailable()).toBe(available);
    },
  );
});
