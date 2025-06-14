import { ExternalApiService } from '../../../../modules/api/external-api/external-api.service';
import { DVRSettings } from '../../../../modules/settings/interfaces/dvr-settings.interface';
import { MaintainerrLogger } from '../../../logging/logs.service';
import cacheManager from '../../lib/cache';
import { QualityProfile, Tag } from '../interfaces/servarr.interface';

export abstract class ServarrApi extends ExternalApiService {
  static buildUrl(settings: DVRSettings, path?: string): string {
    return `${settings.useSsl ? 'https' : 'http'}://${settings.hostname}:${settings.port}${settings.baseUrl ?? ''}${path}`;
  }

  protected apiName: string;

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
    super(
      url,
      {
        apikey: apiKey,
      },
      logger,
      cacheName
        ? { nodeCache: cacheManager.getCache(cacheName).data }
        : undefined,
    );
  }

  public getProfiles = async (): Promise<QualityProfile[]> => {
    const data = await this.getRolling<QualityProfile[]>(
      `/qualityProfile`,
      undefined,
      3600,
    );

    return data;
  };

  public getTags = async (): Promise<Tag[]> => {
    try {
      const response = await this.axios.get<Tag[]>(`/tag`);

      return response.data;
    } catch (e) {
      this.logger.error(`Failed to retrieve tags`, e);
    }
  };

  public async runCommand(
    commandName: string,
    options: Record<string, unknown>,
    wait = false,
  ): Promise<any> {
    try {
      const resp = await this.axios.post(`/command`, {
        name: commandName,
        ...options,
      });
      if (wait && resp.data) {
        while (resp.data.status !== 'failed' && resp.data.status !== 'finished')
          resp.data = await this.get('/command/' + resp.data.id);
      }
      return resp ? resp.data : undefined;
    } catch (e) {
      this.logger.error(`Failed to run command`, e);
    }
  }

  protected async runDelete(command: string): Promise<void> {
    await this.delete(`/${command}`);
  }

  protected async runPut(command: string, body: string): Promise<void> {
    await this.put(`/${command}`, body);
  }
}
