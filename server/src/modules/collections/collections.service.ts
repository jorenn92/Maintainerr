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
import { AddCollectionMedia } from './interfaces/collection-media.interface';
import { ICollection } from './interfaces/collection.interface';

interface addCollectionDbResponse {
  id: number;
  isActive: boolean;
  visibleOnHome: boolean;
  deleteAfterDays: number;
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
    if (title) {
      return await this.collectionRepo.findOne({ title: title });
    } else {
      return await this.collectionRepo.findOne(id);
    }
  }

  async getCollectionMedia(id: number) {
    return await this.CollectionMediaRepo.find({ collectionId: id });
  }

  async getCollections(libraryId?: number) {
    const collections = await this.collectionRepo.find(
      libraryId ? { libraryId: libraryId } : null,
    );

    return await Promise.all(
      collections.map(async (col) => {
        const colls = await this.CollectionMediaRepo.find({
          collectionId: +col.id,
        });
        return {
          ...col,
          media: colls,
        };
      }),
    );
  }

  async createCollection(
    collection: ICollection,
    empty = true,
  ): Promise<{
    plexCollection?: PlexCollection;
    dbCollection: addCollectionDbResponse;
  }> {
    let plexCollection: PlexCollection;
    if (!empty) {
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
    // create collection in db
    const collectionDb: addCollectionDbResponse = await this.addCollectionToDB(
      collection,
    );
    if (empty) return { dbCollection: collectionDb };
    else return { plexCollection: plexCollection, dbCollection: collectionDb };
  }
  async createCollectionWithChildren(
    collection: ICollection,
    media?: AddCollectionMedia[],
  ): Promise<{
    plexCollection: PlexCollection;
    dbCollection: addCollectionDbResponse;
  }> {
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
  }

  async updateCollection(collection: ICollection): Promise<{
    plexCollection?: PlexCollection;
    dbCollection?: ICollection;
  }> {
    const dbCollection = await this.collectionRepo.findOne(+collection.id);
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
  }

  async addToCollection(
    collectionDbId: number,
    media: AddCollectionMedia[],
    manual = false,
  ): Promise<Collection> {
    let collection = await this.collectionRepo.findOne(collectionDbId);
    if (collection) {
      if (media.length > 0) {
        if (!collection.plexId) {
          const newColl = await this.createPlexCollection({
            libraryId: collection.libraryId.toString(),
            type: collection.type,
            title: collection.title,
            summary: collection.description,
          });
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
  }

  async removeFromCollection(
    collectionDbId: number,
    media: AddCollectionMedia[],
  ) {
    const collection = await this.collectionRepo.findOne(collectionDbId);

    if (media.length > 0) {
      for (const childMedia of media) {
        await this.removeChildFromCollection(
          { plexId: +collection.plexId, dbId: collection.id },
          childMedia.plexId,
        );
      }
      const collectionMedia = await this.CollectionMediaRepo.find({
        collectionId: collectionDbId,
      });

      if (collectionMedia.length <= 0) {
        await this.plexApi.deleteCollection(collection.plexId.toString());
        await this.collectionRepo.save({
          ...collection,
          plexId: null,
        });
      }
    }
    return collection;
  }

  async deleteCollection(collectionDbId: number) {
    const collection = await this.collectionRepo.findOne(collectionDbId);

    let status = { code: 1, status: 'OK' };
    if (collection.plexId) {
      status = await this.plexApi.deleteCollection(
        collection.plexId.toString(),
      );
    }
    if (status.status === 'OK') {
      return await this.RemoveCollectionFromDB(collection);
    } else {
      this.logger.warn('An error occurred while deleting the collection.');
    }
  }

  public async deactivateCollection(collectionDbId: number) {
    const collection = await this.collectionRepo.findOne(collectionDbId);

    const status = await this.plexApi.deleteCollection(
      collection.plexId.toString(),
    );

    await this.CollectionMediaRepo.delete({ collectionId: collection.id });
    await this.collectionRepo.save({
      ...collection,
      isActive: false,
      plexId: null,
    });

    const rulegroup = await this.ruleGroupRepo.findOne({
      collectionId: collection.id,
    });
    if (rulegroup) {
      await this.ruleGroupRepo.save({
        ...rulegroup,
        isActive: false,
      });
    }
  }

  public async activateCollection(collectionDbId: number) {
    const collection = await this.collectionRepo.findOne(collectionDbId);

    await this.collectionRepo.save({
      ...collection,
      isActive: true,
    });

    const rulegroup = await this.ruleGroupRepo.findOne({
      collectionId: collection.id,
    });
    if (rulegroup) {
      await this.ruleGroupRepo.save({
        ...rulegroup,
        isActive: true,
      });
    }
  }

  private async addChildToCollection(
    collectionIds: { plexId: number; dbId: number },
    childId: number,
    manual = false,
  ) {
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
      this.infoLogger(`Couldn't add media to collection..`);
    }
  }

  private async removeChildFromCollection(
    collectionIds: { plexId: number; dbId: number },
    childPlexId: number,
  ) {
    this.infoLogger(`Removing media from collection..`);

    const responseColl: BasicResponseDto =
      await this.plexApi.deleteChildFromCollection(
        collectionIds.plexId.toString(),
        childPlexId.toString(),
      );
    if (responseColl.status === 'OK') {
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
      this.infoLogger(`Couldn't remove media from collection..`);
    }
  }

  private async addCollectionToDB(
    collection: ICollection,
    plexId?: number,
  ): Promise<addCollectionDbResponse> {
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
  }

  private async RemoveCollectionFromDB(
    collection: ICollection,
  ): Promise<BasicResponseDto> {
    this.infoLogger(`Removing collection from Database..`);
    try {
      await this.CollectionMediaRepo.delete({ collectionId: collection.id });
      await this.collectionRepo.delete(collection.id);
      // await this.connection
      //   .createQueryBuilder()
      //   .delete()
      //   .from(Collection)
      //   .where([
      //     {
      //       id: collection.id,
      //     },
      //   ])
      //   .execute();
      return { status: 'OK', code: 1, message: 'Success' };
    } catch (_err) {
      this.infoLogger(
        `Something went wrong deleting the collection from the Database..`,
      );
      this.logger.warn(_err);
      return { status: 'NOK', code: 0, message: 'Removing from DB failed' };
    }
  }

  private async createPlexCollection(
    collectionData: CreateUpdateCollection,
  ): Promise<PlexCollection> {
    this.infoLogger(`Creating collection in Plex..`);
    const resp = await this.plexApi.createCollection(collectionData);
    if (resp?.ratingKey) {
      return resp;
    } else {
      return resp[0];
    }
  }

  private infoLogger(message: string) {
    // this.loggerService.logger.info(message, {
    //   label: 'Collection Manager',
    // });
    this.logger.log(message);
  }
}
