import { Module } from '@nestjs/common';
import { PlexApiModule } from '../api/plex-api/plex-api.module';
import { CollectionsService } from './collections.service';
import { CollectionsController } from './collections.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Collection } from './entities/collection.entities';
import { CollectionMedia } from './entities/collection_media.entities';
import { TmdbApiModule } from '../api/tmdb-api/tmdb.module';
import { CollectionWorkerService } from './collection-worker.service';
import { OverseerrApiModule } from '../api/overseerr-api/overseerr-api.module';
import { ServarrApiModule } from '../api/servarr-api/servarr-api.module';
import { RuleGroup } from '../rules/entities/rule-group.entities';
import { TasksModule } from '../tasks/tasks.module';
import { Exclusion } from '../rules/entities/exclusion.entities';
import { CollectionLog } from 'src/modules/collections/entities/collection_log.entities';

@Module({
  imports: [
    PlexApiModule,
    TypeOrmModule.forFeature([
      Collection,
      CollectionMedia,
      CollectionLog,
      RuleGroup,
      Exclusion,
    ]),
    OverseerrApiModule,
    TmdbApiModule,
    ServarrApiModule,
    TasksModule,
  ],
  providers: [CollectionsService, CollectionWorkerService],
  controllers: [CollectionsController],
  exports: [CollectionsService],
})
export class CollectionsModule {}
