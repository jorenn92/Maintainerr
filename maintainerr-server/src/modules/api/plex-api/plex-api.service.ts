import { Injectable } from '@nestjs/common';
import NodePlexAPI from 'plex-api';
import { LoggerService } from 'src/logger/logger.service';
import {
  PlexSettings,
  SettingsService,
  Library,
} from 'src/settings/settings.service';
import { BasicResponseDto } from './dto/basic-response.dto';
import { CollectionHubSettingsDto } from './dto/collection-hub-settings.dto';
import {
  PlexCollection,
  CreateUpdateCollection,
} from './interfaces/collection.interface';
import {
  PlexHub,
  PlexHubResponse,
  PlexLibrariesResponse,
  PlexLibrary,
  PlexLibraryItem,
  PlexLibraryResponse,
  PlexSeenBy,
  PlexUser,
  PlexUserAccount,
} from './interfaces/library.interfaces';
import {
  PlexMetadata,
  PlexMetadataResponse,
} from './interfaces/media.interface';
import { PlexStatusResponse } from './interfaces/server.interface';
const { getSettings } = new SettingsService();

@Injectable()
export class PlexApiService {
  private plexClient: NodePlexAPI;
  private machineId: string;
  constructor(private loggerService: LoggerService) {
    this.initialize({});
    this.setMachineId();
  }

  initialize({
    plexToken,
    plexSettings,
    timeout,
  }: {
    plexToken?: string;
    plexSettings?: PlexSettings;
    timeout?: number;
  }) {
    const settings = getSettings();
    plexToken = plexToken || 'zFYx-sGQ4Xrnzpxsv_GW';
    let settingsPlex: PlexSettings | undefined;
    plexSettings
      ? (settingsPlex = plexSettings)
      : (settingsPlex = getSettings().plex);

    this.plexClient = new NodePlexAPI({
      hostname: settingsPlex.ip,
      port: settingsPlex.port,
      https: settingsPlex.useSsl,
      timeout: timeout,
      token: plexToken,
      authenticator: {
        authenticate: (
          _plexApi,
          cb: (err?: string, token?: string) => void,
        ) => {
          if (!plexToken) {
            return cb('Plex Token not found!');
          }
          cb(undefined, plexToken);
        },
      },
      // requestOptions: {
      //   includeChildren: 1,
      // },
      options: {
        identifier: 'ca2dd7de-35d4-4216-8f27-ac57f80056fe', //settings.clientId
        product: 'Maintainerr',
        deviceName: 'Maintainerr',
        platform: 'Maintainerr',
      },
    });
  }

  public async getStatus() {
    const response: PlexStatusResponse = await this.plexClient.query('/');
    return response.MediaContainer;
  }

  public async getUsers(): Promise<PlexUserAccount[]> {
    const response = await this.plexClient.query('/accounts');
    return response.MediaContainer.Account as PlexUserAccount[];
  }

  public async getLibraries(): Promise<PlexLibrary[]> {
    const response = await this.plexClient.query<PlexLibrariesResponse>(
      '/library/sections',
    );

    return response.MediaContainer.Directory;
  }

  public async syncLibraries(): Promise<void> {
    const settings = getSettings();

    try {
      const libraries = await this.getLibraries();

      const newLibraries: Library[] = libraries
        // Remove libraries that are not movie or show
        .filter(
          (library) => library.type === 'movie' || library.type === 'show',
        )
        // Remove libraries that do not have a metadata agent set (usually personal video libraries)
        .filter((library) => library.agent !== 'com.plexapp.agents.none')
        .map((library) => {
          const existing = settings.plex.libraries.find(
            (l) => l.id === library.key && l.name === library.title,
          );

          return {
            id: library.key,
            name: library.title,
            enabled: existing?.enabled ?? false,
            type: library.type,
            lastScan: existing?.lastScan,
          };
        });

      settings.plex.libraries = newLibraries;
    } catch (e) {
      this.loggerService.logger.error('Failed to fetch Plex libraries', {
        label: 'Plex API',
        message: e.message,
      });

      settings.plex.libraries = [];
    }

    settings.save();
  }

  public async getLibraryContents(
    id: string,
    { offset = 0, size = 50 }: { offset?: number; size?: number } = {},
  ): Promise<{ totalSize: number; items: PlexLibraryItem[] }> {
    const response = await this.plexClient.query<PlexLibraryResponse>({
      uri: `/library/sections/${id}/all?includeGuids=1`,
      extraHeaders: {
        'X-Plex-Container-Start': `${offset}`,
        'X-Plex-Container-Size': `${size}`,
      },
    });

    return {
      totalSize: response.MediaContainer.totalSize,
      items: response.MediaContainer.Metadata ?? [],
    };
  }

  public async getMetadata(
    key: string,
    options: { includeChildren?: boolean } = {},
  ): Promise<PlexMetadata> {
    const response = await this.plexClient.query<PlexMetadataResponse>(
      `/library/metadata/${key}${
        options.includeChildren ? '?includeChildren=1' : ''
      }`,
    );

    return response.MediaContainer.Metadata[0];
  }

  public async getChildrenMetadata(key: string): Promise<PlexMetadata[]> {
    const response = await this.plexClient.query<PlexMetadataResponse>(
      `/library/metadata/${key}/children`,
    );

    return response.MediaContainer.Metadata;
  }

  public async getRecentlyAdded(
    id: string,
    options: { addedAt: number } = {
      addedAt: Date.now() - 1000 * 60 * 60,
    },
  ): Promise<PlexLibraryItem[]> {
    const response = await this.plexClient.query<PlexLibraryResponse>({
      uri: `/library/sections/${id}/all?sort=addedAt%3Adesc&addedAt>>=${Math.floor(
        options.addedAt / 1000,
      )}`,
    });
    return response.MediaContainer.Metadata;
  }

  public async getSeenBy(itemId: string): Promise<PlexSeenBy[]> {
    const response: PlexLibraryResponse =
      await this.plexClient.query<PlexLibraryResponse>({
        uri: `/status/sessions/history/all?sort=viewedAt:desc&metadataItemID=${itemId}`,
      });
    return response.MediaContainer.Metadata as PlexSeenBy[];
  }

  public async getCollections(libraryId: string): Promise<PlexCollection[]> {
    const response = await this.plexClient.query<PlexLibraryResponse>({
      uri: `/library/sections/${libraryId}/collections?`,
    });
    const collection: PlexCollection[] = response.MediaContainer
      .Metadata as PlexCollection[];

    return collection;
  }

  public async getCollection(collectionId: string): Promise<PlexCollection> {
    const response = await this.plexClient.query<PlexLibraryResponse>({
      uri: `/library/collections/${collectionId}?`,
    });
    const collection: PlexCollection = response.MediaContainer
      .Metadata as PlexCollection;

    return collection;
  }

  public async createCollection(body: CreateUpdateCollection) {
    const response = await this.plexClient.postQuery<PlexLibraryResponse>({
      uri: `/library/collections?type=1&title=${body.title}&sectionId=${body.libraryId}`,
    });
    const collection: PlexCollection = response.MediaContainer
      .Metadata[0] as PlexCollection;
    if (body.summary) {
      body.collectionId = collection.ratingKey;
      return this.updateCollection(body);
    }
    return collection;
  }

  public async updateCollection(body: CreateUpdateCollection) {
    await this.plexClient.putQuery<PlexLibraryResponse>({
      uri: `/library/sections/${body.libraryId}/all?type=18&id=${body.collectionId}&title.value=${body.title}&summary.value=${body.summary}`,
      // &titleSort.value=&summary.value=&contentRating.value=&title.locked=1&titleSort.locked=1&contentRating.locked=1`,
    });
    return await this.getCollection(body.collectionId);
  }

  public async deleteCollection(collectionId: string) {
    const response = await this.plexClient.deleteQuery<PlexLibraryResponse>({
      uri: `/library/collections/${collectionId}`,
    });
    return response;
  }

  public async getCollectionChildren(
    collectionId: string,
  ): Promise<PlexLibraryItem[]> {
    const response: PlexLibraryResponse =
      await this.plexClient.query<PlexLibrariesResponse>({
        uri: `/library/collections/${collectionId}/children`,
      });
    return response.MediaContainer.Metadata as PlexLibraryItem[];
  }

  public async addChildToCollection(
    collectionId: string,
    childId: string,
  ): Promise<PlexCollection | BasicResponseDto> {
    try {
      const response: PlexLibraryResponse = await this.plexClient.putQuery({
        // uri: `/library/collections/${collectionId}/items?uri=\/library\/metadata\/${childId}`,
        uri: `/library/collections/${collectionId}/items?uri=server:\/\/${this.machineId}\/com.plexapp.plugins.library\/library\/metadata\/${childId}`,
      });
      return response.MediaContainer.Metadata[0] as PlexCollection;
    } catch (e) {
      return {
        status: 'NOK',
        code: 0,
        message: e,
      } as BasicResponseDto;
    }
  }

  public async deleteChildFromCollection(
    collectionId: string,
    childId: string,
  ): Promise<BasicResponseDto> {
    try {
      await this.plexClient.deleteQuery({
        uri: `/library/collections/${collectionId}/children/${childId}`,
      });
      return {
        status: 'OK',
        code: 1,
        message: `Succesfully deleted child with id ${childId}`,
      } as BasicResponseDto;
    } catch (e) {
      return {
        status: 'NOK',
        code: 0,
        message: e,
      } as BasicResponseDto;
    }
  }

  async UpdateCollectionSettings(
    params: CollectionHubSettingsDto,
  ): Promise<PlexHub> {
    const response: PlexHubResponse = await this.plexClient.postQuery({
      uri: `/hubs/sections/${params.libraryId}/manage?metadataItemId=${
        params.collectionId
      }&promotedToRecommended=${+params.recommended}&promotedToOwnHome=${+params.ownHome}&promotedToSharedHome=${+params.sharedHome}`,
    });
    return response.MediaContainer.Hub[0] as PlexHub;
  }

  private async setMachineId() {
    const response = await this.getStatus();
    if (response.machineIdentifier) {
      this.machineId = response.machineIdentifier;
    } else {
      this.loggerService.logger.error("Couldn't reach Plex");
    }
  }
}
