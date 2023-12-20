import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { PlexSettings } from '../../../modules/settings/interfaces/plex-settings.interface';
import { SettingsService } from '../../..//modules/settings/settings.service';
import { BasicResponseDto } from './dto/basic-response.dto';
import { CollectionHubSettingsDto } from './dto/collection-hub-settings.dto';
import {
  PlexCollection,
  CreateUpdateCollection,
  PlexPlaylist,
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
import {
  PlexAccountsResponse,
  PlexStatusResponse,
} from './interfaces/server.interface';
import { EPlexDataType } from './enums/plex-data-type-enum';
import axios from 'axios';
import PlexApi from '../lib/plexApi';

@Injectable()
export class PlexApiService {
  private plexClient: PlexApi;
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
      auth_token: this.settings.plex_auth_token,
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
    try {
      const settingsPlex = await this.getDbSettings();
      plexToken = plexToken || settingsPlex.auth_token;
      if (settingsPlex.ip && plexToken) {
        this.plexClient = new PlexApi({
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
            identifier: '695b47f5-3c61-4cbd-8eb3-bcc3d6d06ac5', // this.settings.clientId
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
    } catch (_err) {
      this.logger.error(
        `Couldn't connect to Plex.. Please check your settings`,
      );
    }
  }

  public async getStatus() {
    try {
      const response: PlexStatusResponse = await this.plexClient.queryWithCache(
        '/',
        false,
      );
      return response.MediaContainer;
    } catch (err) {
      this.logger.warn(
        'Plex api communication failure.. Is the application running?',
      );
      return undefined;
    }
  }

  public async searchContent(input: string) {
    try {
      const response: PlexMetadataResponse = await this.plexClient.query(
        `/search?query=${encodeURIComponent(input)}&includeGuids=1`,
      );
      const results = response.MediaContainer.Metadata
        ? Promise.all(
          response.MediaContainer.Metadata.map(async (el: PlexMetadata) => {
            return el.grandparentRatingKey
              ? await this.getMetadata(el.grandparentRatingKey.toString())
              : el;
          }),
        )
        : [];
      const fileteredResults: PlexMetadata[] = [];
      (await results).forEach((el: PlexMetadata) => {
        fileteredResults.find(
          (e: PlexMetadata) => e.ratingKey === el.ratingKey,
        ) === undefined
          ? fileteredResults.push(el)
          : undefined;
      });
      return fileteredResults;
    } catch (err) {
      this.logger.warn(
        'Plex api communication failure.. Is the application running?',
      );
      return undefined;
    }
  }

  public async getUsers(): Promise<PlexUserAccount[]> {
    try {
      const response: PlexAccountsResponse =
        await this.plexClient.query({
          uri: '/accounts',
          extraHeaders: {
            'X-Plex-Container-Start': `0`,
            'X-Plex-Container-Size': `1000`,
          },
        });
      return response.MediaContainer.Account;
    } catch (err) {
      this.logger.warn(
        'Plex api communication failure.. Is the application running?',
      );
      return undefined;
    }
  }

  public async getLibraries(): Promise<PlexLibrary[]> {
    try {
      const response =
        await this.plexClient.query<PlexLibrariesResponse>({
          uri: '/library/sections',
          extraHeaders: {
            'X-Plex-Container-Start': `0`,
            'X-Plex-Container-Size': `1000`,
          },
        });

      return response.MediaContainer.Directory;
    } catch (err) {
      this.logger.warn(
        'Plex api communication failure.. Is the application running?',
      );
      return undefined;
    }
  }

  public async getLibraryContents(
    id: string,
    { offset = 0, size = 50 }: { offset?: number; size?: number } = {},
    datatype?: EPlexDataType,
  ): Promise<{ totalSize: number; items: PlexLibraryItem[] }> {
    try {
      const type = datatype ? '&type=' + datatype : '';
      const response = await this.plexClient.query<PlexLibraryResponse>({
        uri: `/library/sections/${id}/all?includeGuids=1${type}`,
        extraHeaders: {
          'X-Plex-Container-Start': `${offset}`,
          'X-Plex-Container-Size': `${size}`,
        },
      });

      return {
        totalSize: response.MediaContainer.totalSize,
        items: (response.MediaContainer.Metadata as PlexLibraryItem[]) ?? [],
      };
    } catch (err) {
      this.logger.warn(
        'Plex api communication failure.. Is the application running?',
      );
      return undefined;
    }
  }

  public async getMetadata(
    key: string,
    options: { includeChildren?: boolean } = {},
  ): Promise<PlexMetadata> {
    try {
      const response = await this.plexClient.query<PlexMetadataResponse>(
        `/library/metadata/${key}${options.includeChildren
          ? '?includeChildren=1&includeExternalMedia=1&asyncAugmentMetadata=1&asyncCheckFiles=1&asyncRefreshAnalysis=1'
          : ''
        }`,
      );

      return response.MediaContainer.Metadata[0];
    } catch (err) {
      this.logger.warn(
        'Plex api communication failure.. Is the application running?',
      );
      return undefined;
    }
  }

  public async getDiscoverDataUserState(
    metaDataRatingKey: string,
  ): Promise<any> {
    try {
      const response = await axios.get(
        `https://discover.provider.plex.tv/library/metadata/${metaDataRatingKey}/userState`,
        {
          headers: {
            'content-type': 'application/json',
            'X-Plex-Token': this.plexClient.authToken,
          },
        },
      );

      return response.data.MediaContainer.UserState;
    } catch (err) {
      this.logger.warn(
        "Outbound call to discover.provider.plex.tv failed. Couldn't fetch userState",
      );
      return undefined;
    }
  }

  public async getChildrenMetadata(key: string): Promise<PlexMetadata[]> {
    try {
      const response = await this.plexClient.query<PlexMetadataResponse>({
        uri: `/library/metadata/${key}/children`,
        extraHeaders: {
          'X-Plex-Container-Start': `0`,
          'X-Plex-Container-Size': `1000`,
        },
      });

      return response.MediaContainer.Metadata;
    } catch (err) {
      this.logger.warn(
        'Plex api communication failure.. Is the application running?',
      );
      return undefined;
    }
  }

  public async getRecentlyAdded(
    id: string,
    options: { addedAt: number } = {
      addedAt: Date.now() - 1000 * 60 * 60,
    },
  ): Promise<PlexLibraryItem[]> {
    try {
      const response = await this.plexClient.query<PlexLibraryResponse>({
        uri: `/library/sections/${id}/all?sort=addedAt%3Adesc&addedAt>>=${Math.floor(
          options.addedAt / 1000,
        )}`,
        extraHeaders: {
          'X-Plex-Container-Start': `0`,
          'X-Plex-Container-Size': `500`,
        },
      });
      return response.MediaContainer.Metadata as PlexLibraryItem[];
    } catch (err) {
      this.logger.warn(
        'Plex api communication failure.. Is the application running?',
      );
      return undefined;
    }
  }

  public async getWatchHistory(itemId: string): Promise<PlexSeenBy[]> {
    try {
      const response: PlexLibraryResponse =
        await this.plexClient.query<PlexLibraryResponse>({
          uri: `/status/sessions/history/all?sort=viewedAt:desc&metadataItemID=${itemId}`,
          extraHeaders: {
            'X-Plex-Container-Start': `0`,
            'X-Plex-Container-Size': `1000`,
          },
        });
      return response.MediaContainer.Metadata as PlexSeenBy[];
    } catch (err) {
      this.logger.warn(
        'Plex api communication failure.. Is the application running?',
      );
      return undefined;
    }
  }

  public async getCollections(libraryId: string): Promise<PlexCollection[]> {
    try {
      const response = await this.plexClient.query<PlexLibraryResponse>({
        uri: `/library/sections/${libraryId}/collections?`,
        extraHeaders: {
          'X-Plex-Container-Start': `0`,
          'X-Plex-Container-Size': `1000`,
        },
      });
      const collection: PlexCollection[] = response.MediaContainer
        .Metadata as PlexCollection[];

      return collection;
    } catch (err) {
      this.logger.warn(
        'Plex api communication failure.. Is the application running?',
      );
      return undefined;
    }
  }

  /**
   * Retrieves all playlists from the Plex API the given ratingKey is part of.
   *
   * @return {Promise<PlexPlaylist[]>} A promise that resolves to an array of Plex playlists.
   */
  public async getPlaylists(libraryId: string): Promise<PlexPlaylist[]> {
    try {
      const filteredItems: PlexPlaylist[] = [];

      const response = await this.plexClient.query<PlexLibraryResponse>({
        uri: `/playlists?playlistType=video&includeCollections=1&includeExternalMedia=1&includeAdvanced=1&includeMeta=1`,
        extraHeaders: {
          'X-Plex-Container-Start': `0`,
          'X-Plex-Container-Size': `1000`,
        },
      });

      const items = response.MediaContainer.Metadata
        ? (response.MediaContainer.Metadata as PlexPlaylist[])
        : [];

      for (const item of items) {
        const itemResp = await this.plexClient.query<PlexLibraryResponse>({
          uri: item.key,
        });

        const filteredForRatingKey = (
          itemResp.MediaContainer.Metadata as PlexLibraryItem[]
        ).filter((i) => i.ratingKey === libraryId);

        if (filteredForRatingKey.length > 0) {
          filteredItems.push(item);
        }
      }

      return filteredItems;
    } catch (err) {
      this.logger.warn(
        'Plex api communication failure.. Is the application running?',
      );
      return undefined;
    }
  }

  public async deleteMediaFromDisk(plexId: number | string): Promise<void> {
    this.logger.log(
      `[Plex] Removed media with ID ${plexId} from Plex library.`,
    );
    try {
      await this.plexClient.deleteQuery<void>({
        uri: `/library/metadata/${plexId}`,
      });
    } catch (e) {
      this.logger.log('Something went wrong while removing media from Plex.', {
        label: 'Plex API',
        errorMessage: e.message,
        plexId,
      });
    }
  }

  public async getCollection(
    collectionId: string | number,
  ): Promise<PlexCollection> {
    try {
      const response = await this.plexClient.query<PlexLibraryResponse>({
        uri: `/library/collections/${+collectionId}?`,
      });
      const collection: PlexCollection = response.MediaContainer
        .Metadata as PlexCollection;

      return collection;
    } catch (err) {
      this.logger.warn(`Couldn't find collection with id ${+collectionId}`);
      return undefined;
    }
  }

  public async createCollection(params: CreateUpdateCollection) {
    try {
      const response = await this.plexClient.postQuery<PlexLibraryResponse>({
        uri: `/library/collections?type=${params.type
          }&title=${encodeURIComponent(params.title)}&sectionId=${params.libraryId
          }`,
      });
      const collection: PlexCollection = response.MediaContainer
        .Metadata[0] as PlexCollection;
      if (params.summary) {
        params.collectionId = collection.ratingKey;
        return this.updateCollection(params);
      }
      return collection;
    } catch (err) {
      this.logger.warn(
        'Plex api communication failure.. Is the application running?',
      );
      return undefined;
    }
  }

  public async updateCollection(body: CreateUpdateCollection) {
    try {
      await this.plexClient.putQuery<PlexLibraryResponse>({
        uri: `/library/sections/${body.libraryId}/all?type=18&id=${body.collectionId
          }&title.value=${encodeURIComponent(
            body.title,
          )}&summary.value=${encodeURIComponent(body.summary)}`,
        // &titleSort.value=&summary.value=&contentRating.value=&title.locked=1&titleSort.locked=1&contentRating.locked=1`,
      });
      return await this.getCollection(+body.collectionId);
    } catch (err) {
      this.logger.warn(
        'Plex api communication failure.. Is the application running?',
      );
      return undefined;
    }
  }

  public async deleteCollection(
    collectionId: string,
  ): Promise<BasicResponseDto> {
    try {
      await this.plexClient.deleteQuery<PlexLibraryResponse>({
        uri: `/library/collections/${collectionId}`,
      });
    } catch (err) {
      return {
        status: 'NOK',
        code: 0,
        message: `Something went wrong while deleting the collection from Plex: ${err}`,
      };
    }
    this.logger.log('Removed collection from Plex');
    return {
      status: 'OK',
      code: 1,
      message: 'Success',
    };
  }

  public async getCollectionChildren(
    collectionId: string,
  ): Promise<PlexLibraryItem[]> {
    try {
      const response: PlexLibraryResponse =
        await this.plexClient.query<PlexLibraryResponse>({
          uri: `/library/collections/${collectionId}/children`,
          extraHeaders: {
            'X-Plex-Container-Start': `0`,
            'X-Plex-Container-Size': `1000`,
          },
        });
      return response.MediaContainer.Metadata as PlexLibraryItem[];
    } catch (err) {
      this.logger.warn(
        'Plex api communication failure.. Is the application running?',
      );
      return undefined;
    }
  }

  public async addChildToCollection(
    collectionId: string,
    childId: string,
  ): Promise<PlexCollection | BasicResponseDto> {
    try {
      this.forceMachineId();
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
        message: `successfully deleted child with id ${childId}`,
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
    try {
      const response: PlexHubResponse = await this.plexClient.postQuery({
        uri: `/hubs/sections/${params.libraryId}/manage?metadataItemId=${params.collectionId
          }&promotedToRecommended=${+params.recommended}&promotedToOwnHome=${+params.ownHome}&promotedToSharedHome=${+params.sharedHome}`,
      });
      return response.MediaContainer.Hub[0] as PlexHub;
    } catch (err) {
      this.logger.warn(
        'Plex api communication failure.. Is the application running?',
      );
      return undefined;
    }
  }

  private async setMachineId() {
    try {
      const response = await this.getStatus();
      if (response.machineIdentifier) {
        this.machineId = response.machineIdentifier;
        return response.machineIdentifier;
      } else {
        this.logger.error("Couldn't reach Plex");
        return null;
      }
    } catch (err) {
      this.logger.warn(
        'Plex api communication failure.. Is the application running?',
      );
      return undefined;
    }
  }

  private async forceMachineId() {
    if (!this.machineId) {
      this.setMachineId();
    }
  }
}
