import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';

import { BasicResponseDto } from '../api/plex-api/dto/basic-response.dto';
import {
  CreateUpdateCollection,
  PlexCollection,
} from '../api/plex-api/interfaces/collection.interface';
import { PlexApiService } from '../api/plex-api/plex-api.service';
import {
  TmdbMovieDetails,
  TmdbTvDetails,
} from '../api/tmdb-api/interfaces/tmdb.interface';
import { TmdbIdService } from '../api/tmdb-api/tmdb-id.service';
import { TmdbApiService } from '../api/tmdb-api/tmdb.service';
import { RuleGroup } from '../rules/entities/rule-group.entities';
import { Collection } from './entities/collection.entities';
import { CollectionMedia } from './entities/collection_media.entities';
import {
  AddCollectionMedia,
  IAlterableMediaDto,
} from './interfaces/collection-media.interface';
import { ICollection } from './interfaces/collection.interface';
import { EPlexDataType } from '../api/plex-api/enums/plex-data-type-enum';

interface addCollectionDbResponse {
  id: number;
  isActive: boolean;
  visibleOnHome: boolean;
  deleteAfterDays: number;
  manualCollection: boolean;
}
@Injectable()
export class CollectionsService {
  private readonly logger = new Logger(CollectionsService.name);
  constructor(
    @InjectRepository(Collection)
    private readonly collectionRepo: Repository<Collection>,
    @InjectRepository(CollectionMedia)
    private readonly CollectionMediaRepo: Repository<CollectionMedia>,
    @InjectRepository(RuleGroup)
    private readonly ruleGroupRepo: Repository<RuleGroup>,
    private readonly connection: Connection,
    private readonly plexApi: PlexApiService,
    private readonly tmdbApi: TmdbApiService,
    private readonly tmdbIdHelper: TmdbIdService,
  ) {}

  async getCollection(id?: number, title?: string) {
    try {
      if (title) {
        return await this.collectionRepo.findOne({ where: { title: title } });
      } else {
        return await this.collectionRepo.findOne({ where: { id: id } });
      }
    } catch (err) {
      this.logger.warn(
        'An error occurred while performing collection actions.',
      );
      return undefined;
    }
  }

  async getCollectionMedia(id: number) {
    try {
      return await this.CollectionMediaRepo.find({
        where: { collectionId: id },
      });
    } catch (err) {
      this.logger.warn(
        'An error occurred while performing collection actions: ' + err,
      );
      return undefined;
    }
  }

  public async getCollectionMediaWitPlexDataAndhPaging(
    id: number,
    { offset = 0, size = 25 }: { offset?: number; size?: number } = {},
  ): Promise<{ totalSize: number; items: CollectionMedia[] }> {
    try {
      const queryBuilder =
        this.CollectionMediaRepo.createQueryBuilder('collection_media');

      queryBuilder
        .where('collection_media.collectionId = :id', { id })
        .orderBy('collection_media.addDate', 'DESC')
        .skip(offset)
        .take(size);

      const itemCount = await queryBuilder.getCount();
      let { entities } = await queryBuilder.getRawAndEntities();

      entities = await Promise.all(
        entities.map(async (el) => {
          el.plexData = await this.plexApi.getMetadata(el.plexId.toString());
          if (el.plexData?.grandparentRatingKey) {
            el.plexData.parentData = await this.plexApi.getMetadata(
              el.plexData.grandparentRatingKey.toString(),
            );
          } else if (el.plexData?.parentRatingKey) {
            el.plexData.parentData = await this.plexApi.getMetadata(
              el.plexData.parentRatingKey.toString(),
            );
          }
          return el;
        }),
      );

      return {
        totalSize: itemCount,
        items: entities ?? [],
      };
    } catch (err) {
      this.logger.warn(
        'An error occurred while performing collection actions: ' + err,
      );
      return undefined;
    }
  }

  async getCollections(libraryId?: number, typeId?: 1 | 2 | 3 | 4) {
    try {
      const collections = await this.collectionRepo.find(
        libraryId
          ? { where: { libraryId: libraryId } }
          : typeId
          ? { where: { type: typeId } }
          : undefined,
      );

      return await Promise.all(
        collections.map(async (col) => {
          const colls = await this.CollectionMediaRepo.find({
            where: {
              collectionId: +col.id,
            },
          });
          return {
            ...col,
            media: colls,
          };
        }),
      );
    } catch (err) {
      this.logger.warn(
        'An error occurred while performing collection actions.',
      );
      return undefined;
    }
  }

  async createCollection(
    collection: ICollection,
    empty = true,
  ): Promise<{
    plexCollection?: PlexCollection;
    dbCollection: addCollectionDbResponse;
  }> {
    try {
      let plexCollection: PlexCollection;
      if (
        !empty &&
        (collection.manualCollection == undefined ||
          !collection.manualCollection)
      ) {
        const collectionObj: CreateUpdateCollection = {
          libraryId: collection.libraryId.toString(),
          type: collection.type,
          title: collection.title,
          summary: collection?.description,
        };
        plexCollection = await this.createPlexCollection(collectionObj);
        await this.plexApi.UpdateCollectionSettings({
          libraryId: collectionObj.libraryId,
          collectionId: plexCollection.ratingKey,
          recommended: false,
          ownHome: collection.visibleOnHome,
          sharedHome: collection.visibleOnHome,
        });
      }
      // in case of manual, just fetch the collection plex ID
      if (collection.manualCollection) {
        plexCollection = await this.findPlexCollection(
          collection.manualCollectionName,
          collection.libraryId,
        );
        if (plexCollection && plexCollection.ratingKey) {
          await this.plexApi.UpdateCollectionSettings({
            libraryId: collection.libraryId,
            collectionId: plexCollection.ratingKey,
            recommended: false,
            ownHome: collection.visibleOnHome,
            sharedHome: collection.visibleOnHome,
          });

          collection.plexId = +plexCollection.ratingKey;
        } else {
          this.logger.error(
            `Manual Plex collection not found.. Is the spelling correct? `,
          );
          return undefined;
        }
      }
      // create collection in db
      const collectionDb: addCollectionDbResponse =
        await this.addCollectionToDB(
          collection,
          collection.plexId ? collection.plexId : undefined,
        );
      if (empty && !collection.manualCollection)
        return { dbCollection: collectionDb };
      else
        return { plexCollection: plexCollection, dbCollection: collectionDb };
    } catch (err) {
      this.logger.error(
        `An error occurred while creating or fetching a collection: ${err}`,
      );
      return undefined;
    }
  }

  async createCollectionWithChildren(
    collection: ICollection,
    media?: AddCollectionMedia[],
  ): Promise<{
    plexCollection: PlexCollection;
    dbCollection: addCollectionDbResponse;
  }> {
    try {
      const createdCollection = await this.createCollection(collection, false);

      for (const childMedia of media) {
        this.addChildToCollection(
          {
            plexId: +createdCollection.plexCollection.ratingKey,
            dbId: createdCollection.dbCollection.id,
          },
          childMedia.plexId,
        );
      }
      return createdCollection as {
        plexCollection: PlexCollection;
        dbCollection: addCollectionDbResponse;
      };
    } catch (err) {
      this.logger.warn(
        'An error occurred while performing collection actions.',
      );
      return undefined;
    }
  }

  async updateCollection(collection: ICollection): Promise<{
    plexCollection?: PlexCollection;
    dbCollection?: ICollection;
  }> {
    try {
      const dbCollection = await this.collectionRepo.findOne({
        where: { id: +collection.id },
      });
      let plexColl: PlexCollection;
      if (dbCollection?.plexId) {
        const collectionObj: CreateUpdateCollection = {
          libraryId: collection.libraryId.toString(),
          title: collection.title,
          type: collection.type,
          collectionId: +dbCollection.plexId,
          summary: collection?.description,
        };
        plexColl = await this.plexApi.updateCollection(collectionObj);
        await this.plexApi.UpdateCollectionSettings({
          libraryId: dbCollection.libraryId,
          collectionId: dbCollection.plexId,
          recommended: false,
          ownHome: collection.visibleOnHome,
          sharedHome: collection.visibleOnHome,
        });
      }
      const dbResp: ICollection = await this.collectionRepo.save({
        ...dbCollection,
        ...collection,
      });

      return { plexCollection: plexColl, dbCollection: dbResp };
    } catch (err) {
      this.logger.warn(
        'An error occurred while performing collection actions.',
      );
      return undefined;
    }
  }

  public async saveCollection(collection: Collection): Promise<Collection> {
    return await this.collectionRepo.save({
      ...collection,
    });
  }

  public async relinkManualCollection(
    collection: Collection,
  ): Promise<Collection> {
    // refetch manual collection, in case it's ID changed
    if (collection.manualCollection) {
      const plexColl = await this.findPlexCollection(
        collection.manualCollectionName,
        +collection.libraryId,
      );
      if (plexColl) {
        collection.plexId = +plexColl.ratingKey;
        collection = await this.saveCollection(collection);
      } else {
        this.logger.error(
          'Manual Plex collection not found.. Is it still available in Plex?',
        );
      }
    }
    return collection;
  }

  public async checkAutomaticPlexLink(
    collection: Collection,
  ): Promise<Collection> {
    // checks and fixes automatic collection link
    if (!collection.manualCollection) {
      let plexColl: PlexCollection = undefined;

      if (collection.plexId) {
        plexColl = await this.findPlexCollectionByID(collection.plexId);
      }

      if (!plexColl) {
        plexColl = await this.findPlexCollection(
          collection.title,
          +collection.libraryId,
        );

        if (plexColl) {
          collection.plexId = +plexColl.ratingKey;
          collection = await this.saveCollection(collection);
        }
      }

      // If the collection is empty in Plex, remove it. Otherwise issues when adding media
      if (plexColl && collection.plexId !== null && +plexColl.childCount <= 0) {
        await this.plexApi.deleteCollection(plexColl.ratingKey);
        plexColl = undefined;
      }

      if (!plexColl) {
        collection.plexId = null;
        collection = await this.saveCollection(collection);
      }
    }
    return collection;
  }

  async MediaCollectionActionWithContext(
    collectionDbId: number,
    context: IAlterableMediaDto,
    media: AddCollectionMedia,
    action: 'add' | 'remove',
  ): Promise<Collection> {
    const collection =
      collectionDbId !== -1 && collectionDbId !== undefined
        ? await this.collectionRepo.findOne({
            where: { id: collectionDbId },
          })
        : undefined;

    // get media
    const handleMedia: AddCollectionMedia[] =
      (await this.plexApi.getAllIdsForContextAction(
        collection ? collection.type : undefined,
        context,
        media,
      )) as unknown as AddCollectionMedia[];

    if (handleMedia) {
      if (action === 'add') {
        return this.addToCollection(collectionDbId, handleMedia, true);
      } else if (action === 'remove') {
        if (collectionDbId) {
          return this.removeFromCollection(collectionDbId, handleMedia);
        } else {
          this.removeFromAllCollections(handleMedia);
        }
      }
    }
  }

  async addToCollection(
    collectionDbId: number,
    media: AddCollectionMedia[],
    manual = false,
  ): Promise<Collection> {
    try {
      let collection = await this.collectionRepo.findOne({
        where: { id: collectionDbId },
      });
      const collectionMedia = await this.CollectionMediaRepo.find({
        where: { collectionId: collectionDbId },
      });

      // filter already existing out
      media = media.filter(
        (m) => !collectionMedia.find((el) => el.plexId === m.plexId),
      );

      if (collection) {
        collection = await this.checkAutomaticPlexLink(collection);
        if (media.length > 0) {
          if (!collection.plexId) {
            let newColl: PlexCollection = undefined;
            if (collection.manualCollection) {
              newColl = await this.findPlexCollection(
                collection.manualCollectionName,
                +collection.libraryId,
              );
            } else {
              newColl = await this.createPlexCollection({
                libraryId: collection.libraryId.toString(),
                type: collection.type,
                title: collection.title,
                summary: collection.description,
              });
            }
            if (newColl) {
              collection = await this.collectionRepo.save({
                ...collection,
                plexId: +newColl.ratingKey,
              });
              await this.plexApi.UpdateCollectionSettings({
                libraryId: collection.libraryId,
                collectionId: collection.plexId,
                recommended: false,
                ownHome: collection.visibleOnHome,
                sharedHome: collection.visibleOnHome,
              });
            } else {
              collection.manualCollection
                ? this.logger.warn(
                    `Manual Collection '${collection.manualCollectionName}' doesn't exist in Plex..`,
                  )
                : undefined;
            }
          }
          // add children to collection
          for (const childMedia of media) {
            await this.addChildToCollection(
              { plexId: +collection.plexId, dbId: collection.id },
              childMedia.plexId,
              manual,
            );
          }
        }
        return collection;
      } else {
        this.logger.warn("Collection doesn't exist.");
      }
    } catch (err) {
      this.logger.warn(
        'An error occurred while performing collection actions.',
      );
      return undefined;
    }
  }

  async removeFromCollection(
    collectionDbId: number,
    media: AddCollectionMedia[],
  ) {
    try {
      let collection = await this.collectionRepo.findOne({
        where: { id: collectionDbId },
      });
      collection = await this.checkAutomaticPlexLink(collection);
      let collectionMedia = await this.CollectionMediaRepo.find({
        where: {
          collectionId: collectionDbId,
        },
      });
      if (collectionMedia.length > 0) {
        for (const childMedia of media) {
          if (
            collectionMedia.find((el) => +el.plexId === +childMedia.plexId) !==
            undefined
          ) {
            await this.removeChildFromCollection(
              { plexId: +collection.plexId, dbId: collection.id },
              childMedia.plexId,
            );

            collectionMedia = collectionMedia.filter(
              (el) => +el.plexId !== +childMedia.plexId,
            );
          }
        }

        if (
          collectionMedia.length <= 0 &&
          !collection.manualCollection &&
          collection.plexId
        ) {
          const resp = await this.plexApi.deleteCollection(
            collection.plexId.toString(),
          );

          if (resp.code === 1) {
            await this.collectionRepo.save({
              ...collection,
              plexId: null,
            });
          } else {
            this.logger.warn(resp.message);
          }
        }
      }
      return collection;
    } catch (err) {
      this.logger.warn(
        `An error occurred while removing media from collection with internal id ${collectionDbId}`,
        err,
      );
      return undefined;
    }
  }

  async removeFromAllCollections(media: AddCollectionMedia[]) {
    try {
      const collection = await this.collectionRepo.find();
      collection.forEach((c) => this.removeFromCollection(c.id, media));
      return { status: 'OK', code: 1, message: 'Success' };
    } catch (e) {
      this.logger.warn(
        `An error occurred while removing media from all collections : ${e}`,
      );
      return { status: 'NOK', code: 0, message: 'Failed' };
    }
  }

  async deleteCollection(collectionDbId: number) {
    try {
      let collection = await this.collectionRepo.findOne({
        where: { id: collectionDbId },
      });
      collection = await this.checkAutomaticPlexLink(collection);

      let status = { code: 1, status: 'OK' };
      if (collection.plexId && !collection.manualCollection) {
        status = await this.plexApi.deleteCollection(
          collection.plexId.toString(),
        );
      }
      if (status.status === 'OK') {
        return await this.RemoveCollectionFromDB(collection);
      } else {
        this.logger.warn('An error occurred while deleting the collection.');
      }
    } catch (err) {
      this.logger.warn(
        'An error occurred while performing collection actions.',
      );
      return undefined;
    }
  }

  public async deactivateCollection(collectionDbId: number) {
    try {
      const collection = await this.collectionRepo.findOne({
        where: { id: collectionDbId },
      });

      if (!collection.manualCollection) {
        const status = await this.plexApi.deleteCollection(
          collection.plexId.toString(),
        );
      }

      await this.CollectionMediaRepo.delete({ collectionId: collection.id });
      await this.collectionRepo.save({
        ...collection,
        isActive: false,
        plexId: null,
      });

      const rulegroup = await this.ruleGroupRepo.findOne({
        where: {
          collectionId: collection.id,
        },
      });
      if (rulegroup) {
        await this.ruleGroupRepo.save({
          ...rulegroup,
          isActive: false,
        });
      }
    } catch (err) {
      this.logger.warn(
        'An error occurred while performing collection actions.',
      );
      return undefined;
    }
  }

  public async activateCollection(collectionDbId: number) {
    try {
      const collection = await this.collectionRepo.findOne({
        where: { id: collectionDbId },
      });

      await this.collectionRepo.save({
        ...collection,
        isActive: true,
      });

      const rulegroup = await this.ruleGroupRepo.findOne({
        where: {
          collectionId: collection.id,
        },
      });
      if (rulegroup) {
        await this.ruleGroupRepo.save({
          ...rulegroup,
          isActive: true,
        });
      }
    } catch (err) {
      this.logger.warn(
        'An error occurred while performing collection actions.',
      );
      return undefined;
    }
  }

  private async addChildToCollection(
    collectionIds: { plexId: number; dbId: number },
    childId: number,
    manual = false,
  ) {
    try {
      this.infoLogger(`Adding media with id ${childId} to collection..`);

      const tmdb = await this.tmdbIdHelper.getTmdbIdFromPlexRatingKey(
        childId.toString(),
      );

      let tmdbMedia: TmdbTvDetails | TmdbMovieDetails;
      switch (tmdb.type) {
        case 'movie':
          tmdbMedia = await this.tmdbApi.getMovie({ movieId: tmdb.id });
          break;
        case 'tv':
          tmdbMedia = await this.tmdbApi.getTvShow({ tvId: tmdb.id });
          break;
      }

      const responseColl: PlexCollection | BasicResponseDto =
        await this.plexApi.addChildToCollection(
          collectionIds.plexId.toString(),
          childId.toString(),
        );
      if ('ratingKey' in responseColl) {
        await this.connection
          .createQueryBuilder()
          .insert()
          .into(CollectionMedia)
          .values([
            {
              collectionId: collectionIds.dbId,
              plexId: childId,
              addDate: new Date().toDateString(),
              tmdbId: tmdbMedia?.id,
              image_path: tmdbMedia?.poster_path,
              isManual: manual,
            },
          ])
          .execute();
      } else {
        this.logger.warn(
          `Couldn't add media to collection: `,
          responseColl.message,
        );
      }
    } catch (err) {
      this.logger.warn(
        `An error occurred while performing collection actions: ${err}`,
      );
      return undefined;
    }
  }

  private async removeChildFromCollection(
    collectionIds: { plexId: number; dbId: number },
    childPlexId: number,
  ) {
    try {
      this.infoLogger(
        `Removing media with id ${childPlexId} from collection..`,
      );

      const responseColl: BasicResponseDto =
        await this.plexApi.deleteChildFromCollection(
          collectionIds.plexId.toString(),
          childPlexId.toString(),
        );
      if (
        responseColl.status === 'OK' ||
        responseColl.message.includes('404') // if media is not in collection
      ) {
        await this.connection
          .createQueryBuilder()
          .delete()
          .from(CollectionMedia)
          .where([
            {
              collectionId: collectionIds.dbId,
              plexId: childPlexId,
            },
          ])
          .execute();
      } else {
        this.infoLogger(
          `Couldn't remove media from collection: ` + responseColl.message,
        );
      }
    } catch (err) {
      this.logger.warn(
        'An error occurred while performing collection actions.',
      );
      return undefined;
    }
  }

  private async addCollectionToDB(
    collection: ICollection,
    plexId?: number,
  ): Promise<addCollectionDbResponse> {
    try {
      this.infoLogger(`Adding collection to the Database..`);
      try {
        return (
          await this.connection
            .createQueryBuilder()
            .insert()
            .into(Collection)
            .values([
              {
                title: collection.title,
                description: collection?.description,
                plexId: plexId,
                type: collection.type,
                libraryId: collection.libraryId,
                arrAction: collection.arrAction ? collection.arrAction : 0,
                isActive: collection.isActive,
                visibleOnHome: collection?.visibleOnHome,
                deleteAfterDays: collection?.deleteAfterDays,
                listExclusions: collection?.listExclusions,
                forceOverseerr: collection?.forceOverseerr,
                manualCollection:
                  collection?.manualCollection !== undefined
                    ? collection?.manualCollection
                    : false,
                manualCollectionName:
                  collection?.manualCollectionName !== undefined
                    ? collection?.manualCollectionName
                    : '',
              },
            ])
            .execute()
        ).generatedMaps[0] as addCollectionDbResponse;
      } catch (_err) {
        // Log error
        this.infoLogger(
          `Something went wrong creating the collection in the Database..`,
        );
      }
    } catch (err) {
      this.logger.warn(
        'An error occurred while performing collection actions.',
      );
      return undefined;
    }
  }

  private async RemoveCollectionFromDB(
    collection: ICollection,
  ): Promise<BasicResponseDto> {
    try {
      this.infoLogger(`Removing collection from Database..`);
      try {
        await this.CollectionMediaRepo.delete({ collectionId: collection.id });
        await this.collectionRepo.delete(collection.id);

        return { status: 'OK', code: 1, message: 'Success' };
      } catch (_err) {
        this.infoLogger(
          `Something went wrong deleting the collection from the Database..`,
        );
        this.logger.warn(_err);
        return { status: 'NOK', code: 0, message: 'Removing from DB failed' };
      }
    } catch (err) {
      return { status: 'NOK', code: 0, message: 'Removing from DB failed' };
    }
  }

  private async createPlexCollection(
    collectionData: CreateUpdateCollection,
  ): Promise<PlexCollection> {
    try {
      this.infoLogger(`Creating collection in Plex..`);
      const resp = await this.plexApi.createCollection(collectionData);
      if (resp?.ratingKey) {
        return resp;
      } else {
        return resp[0];
      }
    } catch (err) {
      this.logger.warn(
        'An error occurred while performing collection actions.',
      );
      return undefined;
    }
  }

  public async findPlexCollection(
    name: string,
    libraryId: number,
  ): Promise<PlexCollection> {
    try {
      const resp = await this.plexApi.getCollections(libraryId.toString());
      if (resp) {
        const found = resp.find((coll) => {
          return coll.title.trim() === name.trim();
        });

        return found?.ratingKey !== undefined ? found : undefined;
      }
    } catch (err) {
      this.logger.warn(
        'An error occurred while searching for a specific Plex collection.',
      );
      return undefined;
    }
  }

  public async findPlexCollectionByID(id: number): Promise<PlexCollection> {
    try {
      return await this.plexApi.getCollection(id);
    } catch (err) {
      this.logger.warn(
        'An error occurred while searching for a specific Plex collection.',
      );
      return undefined;
    }
  }

  // TODO: verwijderen als effectief niet nodig
  // async syncCollectionMediaChildren(
  //   collectionDbId: number,
  //   collectionMediaChildren: [{ parent: number; child: number }],
  // ): Promise<Collection> {
  //   const collection = await this.collectionRepo.findOne({
  //   where: { id: collectionDbId },
  // });
  //   if (collectionMediaChildren) {
  //     if (collection) {
  //       // add missing children
  //       collectionMediaChildren.forEach((el) => {
  //         const media = collection.collectionMedia.find(
  //           (media) => media.plexId === el.parent,
  //         );
  //         if (media) {
  //           if (
  //             !media.collectionMediaChild.find(
  //               (child) => child.plexId === el.child,
  //             )
  //           ) {
  //             this.collectionMediaChildRepo.save({
  //               plexId: el.child,
  //               collectionMediaId: media.id,
  //             });
  //           }
  //         } else {
  //           this.infoLogger(
  //             `Couldn't find media with plexId ${el.parent}, this means the child with plexId ${el.child} could not be synced`,
  //           );
  //         }
  //       });

  //       // remove deleted children
  //       collection.collectionMedia.forEach((media) => {
  //         media.collectionMediaChild.forEach((child) => {
  //           if (
  //             !collectionMediaChildren.find(
  //               (el) => el.parent === media.plexId && el.child === child.plexId,
  //             )
  //           ) {
  //             this.collectionMediaChildRepo.delete(child.id);
  //           }
  //         });
  //       });

  //       // update & return collection
  //       return await this.collectionRepo.findOne({
  //   where: { id: collectionDbId },
  // });
  //     } else {
  //       this.infoLogger(`Couldn't find collection with id ${collectionDbId}`);
  //     }
  //   }
  //   return collection;
  // }

  private infoLogger(message: string) {
    this.logger.log(message);
  }
}
