import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import NodePlexAPI from 'plex-api';
import { PlexSettings } from 'src/modules/settings/interfaces/plex-settings.interface';
import { SettingsService } from 'src/modules/settings/settings.service';
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
  PlexUserAccount,
} from './interfaces/library.interfaces';
import {
  PlexMetadata,
  PlexMetadataResponse,
} from './interfaces/media.interface';
import { PlexStatusResponse } from './interfaces/server.interface';

@Injectable()
export class PlexApiService {
  private plexClient: NodePlexAPI;
  private machineId: string;
  private readonly logger = new Logger(PlexApiService.name);
  constructor(
    @Inject(forwardRef(() => SettingsService))
    private readonly settings: SettingsService,
  ) {
    this.initialize({});
  }

  private async getDbSettings(): Promise<PlexSettings> {
    return {
      name: this.settings.plex_name,
      machineId: this.machineId,
      ip: this.settings.plex_hostname,
      port: this.settings.plex_port,
      useSsl: this.settings.plex_ssl === 1 ? true : false,
      libraries: [],
      webAppUrl: this.settings.plex_hostname,
    };
  }
  public async initialize({
    plexToken,
    timeout,
  }: {
    plexToken?: string;
    // plexSettings?: PlexSettings;
    timeout?: number;
  }) {
    plexToken = plexToken || 'zFYx-sGQ4Xrnzpxsv_GW';
    const settingsPlex = await this.getDbSettings();
    if (settingsPlex.ip) {
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
          identifier: 'ca2dd7de-35d4-4216-8f27-ac57f80056fe', // this.settings.clientId
          product: 'Maintainerr', // this.settings.applicationTitle
          deviceName: 'Maintainerr', // this.settings.applicationTitle
          platform: 'Maintainerr', // this.settings.applicationTitle
        },
      });
      this.setMachineId();
    } else {
      this.logger.log(
        "Plex API isn't fully initialized, required settings aren't set",
      );
    }
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

  // public async syncLibraries(): Promise<void> {
  //   const settings = this.getDbSettings();

  //   try {
  //     const libraries = await this.getLibraries();

  //     const newLibraries = libraries
  //       // Remove libraries that are not movie or show
  //       .filter(
  //         (library) => library.type === 'movie' || library.type === 'show',
  //       )
  //       // Remove libraries that do not have a metadata agent set (usually personal video libraries)
  //       .filter((library) => library.agent !== 'com.plexapp.agents.none')
  //       .map(async (library) => {
  //         const existing = (await settings).libraries.find(
  //           (l) => l.id === library.key && l.name === library.title,
  //         );

  //         return {
  //           id: library.key,
  //           name: library.title,
  //           enabled: existing?.enabled ?? false,
  //           type: library.type,
  //           lastScan: existing?.lastScan,
  //         };
  //       });

  //     settings.libraries = newLibraries;
  //   } catch (e) {
  //     this.logger.error('Failed to fetch Plex libraries', {
  //       label: 'Plex API',
  //       message: e.message,
  //     });

  //     (await settings).libraries = [];
  //   }

  //   // settings.save();
  // }

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

  public async deleteMediaFromDisk(plexId: number | string): Promise<void> {
    this.logger.log('Deleting media from Plex library.', {
      label: 'Plex API',
      plexId,
    });
    try {
      await this.plexClient.deleteQuery<void>({
        uri: `/library/metadata/${plexId}`,
      });
    } catch (e) {
      this.logger.log('Something went wrong while deleting media from Plex.', {
        label: 'Plex API',
        errorMessage: e.message,
        plexId,
      });
    }
  }

  public async getCollection(
    collectionId: string | number,
  ): Promise<PlexCollection> {
    const response = await this.plexClient.query<PlexLibraryResponse>({
      uri: `/library/collections/${+collectionId}?`,
    });
    const collection: PlexCollection = response.MediaContainer
      .Metadata as PlexCollection;

    return collection;
  }

  public async createCollection(params: CreateUpdateCollection) {
    const response = await this.plexClient.postQuery<PlexLibraryResponse>({
      uri: `/library/collections?type=1&title=${params.title}&sectionId=${params.libraryId}`,
    });
    const collection: PlexCollection = response.MediaContainer
      .Metadata[0] as PlexCollection;
    if (params.summary) {
      params.collectionId = collection.ratingKey;
      return this.updateCollection(params);
    }
    return collection;
  }

  public async updateCollection(body: CreateUpdateCollection) {
    await this.plexClient.putQuery<PlexLibraryResponse>({
      uri: `/library/sections/${body.libraryId}/all?type=18&id=${body.collectionId}&title.value=${body.title}&summary.value=${body.summary}`,
      // &titleSort.value=&summary.value=&contentRating.value=&title.locked=1&titleSort.locked=1&contentRating.locked=1`,
    });
    return await this.getCollection(+body.collectionId);
  }

  public async deleteCollection(
    collectionId: string,
  ): Promise<BasicResponseDto> {
    try {
      await this.plexClient.deleteQuery<PlexLibraryResponse>({
        uri: `/library/collections/${collectionId}`,
      });
    } catch (_err) {
      return {
        status: 'NOK',
        code: 0,
        message: 'Something went wrong while deleting the collection from Plex',
      };
    }
    return {
      status: 'OK',
      code: 1,
      message: 'Success',
    };
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

  public async UpdateCollectionSettings(
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
      return response.machineIdentifier;
    } else {
      this.logger.error("Couldn't reach Plex");
      return null;
    }
  }
}
