import { Logger } from '@nestjs/common';
import { warn } from 'console';
import { ExternalApiService } from '../../../../modules/api/external-api/external-api.service';
import { DVRSettings } from '../../../../modules/settings/interfaces/dvr-settings.interface';
import cacheManager from '../../lib/cache';
import {
  QualityProfile,
  QueueItem,
  QueueResponse,
  RootFolder,
  SystemStatus,
  Tag,
} from '../interfaces/servarr.interface';

export class ServarrApi<QueueItemAppendT> extends ExternalApiService {
  static buildUrl(settings: DVRSettings, path?: string): string {
    return `${settings.useSsl ? 'https' : 'http'}://${settings.hostname}:${settings.port}${settings.baseUrl ?? ''}${path}`;
  }

  protected apiName: string;

  constructor({
    url,
    apiKey,
    cacheName,
    apiName,
  }: {
    url: string;
    apiKey: string;
    cacheName?: string;
    apiName: string;
  }) {
    super(
      url,
      {
        apikey: apiKey,
      },
      cacheName
        ? { nodeCache: cacheManager.getAnonymousCache(cacheName)?.data }
        : undefined,
    );

    this.apiName = apiName;
    this.logger = new Logger(ServarrApi.name);
  }

  public getSystemStatus = async (): Promise<SystemStatus | undefined> => {
    try {
      const response = await this.axios.get<SystemStatus>('/system/status');

      return response.data;
    } catch (e) {
      warn(`[${this.apiName}] Failed to retrieve system status: ${e.message}`);
    }
  };

  public getProfiles = async (): Promise<QualityProfile[] | undefined> => {
    const data = await this.getRolling<QualityProfile[]>(
      `/qualityProfile`,
      undefined,
      3600,
    );

    if (data == null) {
      warn(`[${this.apiName}] Failed to retrieve profiles`);
      return;
    }

    return data;
  };

  public getRootFolders = async (): Promise<RootFolder[] | undefined> => {
    const data = await this.getRolling<RootFolder[]>(
      `/rootfolder`,
      undefined,
      3600,
    );

    if (data == null) {
      warn(`[${this.apiName}] Failed to retrieve root folders`);
      return;
    }

    return data;
  };

  public getQueue = async (): Promise<
    (QueueItem & QueueItemAppendT)[] | undefined
  > => {
    try {
      const response =
        await this.axios.get<QueueResponse<QueueItemAppendT>>(`/queue`);

      return response.data.records;
    } catch (e) {
      warn(`[${this.apiName}] Failed to retrieve queue: ${e.message}`);
    }
  };

  public getTags = async (): Promise<Tag[] | undefined> => {
    try {
      const response = await this.axios.get<Tag[]>(`/tag`);

      return response.data;
    } catch (e) {
      warn(`[${this.apiName}] Failed to retrieve tags: ${e.message}`);
    }
  };

  public createTag = async ({
    label,
  }: {
    label: string;
  }): Promise<Tag | undefined> => {
    try {
      const response = await this.axios.post<Tag>(`/tag`, {
        label,
      });

      return response.data;
    } catch (e) {
      warn(`[${this.apiName}] Failed to create tag: ${e.message}`);
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
      warn(`[${this.apiName}] Failed to run command: ${e.message}`);
    }
  }

  protected async runDelete(command: string): Promise<void> {
    await this.delete(`/${command}`);
  }

  protected async runPut(command: string, body: string): Promise<void> {
    await this.put(`/${command}`, body);
  }
}
