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
import { CollectionLog } from '../collections/entities/collection_log.entities';
import { CollectionLogCleanerService } from '../collections/tasks/collection-log-cleaner.service';
import { TautulliApiModule } from '../api/tautulli-api/tautulli-api.module';
import { Notification } from '../notifications/entities/notification.entities';
import { NotificationService } from '../notifications/notifications.service';

@Module({
  imports: [
    PlexApiModule,
    TypeOrmModule.forFeature([
      Collection,
      CollectionMedia,
      CollectionLog,
      RuleGroup,
      Exclusion,
      Notification,
    ]),
    OverseerrApiModule,
    TautulliApiModule,
    TmdbApiModule,
    ServarrApiModule,
    TasksModule,
  ],
  providers: [
    CollectionsService,
    CollectionWorkerService,
    CollectionLogCleanerService,
    NotificationService,
  ],
  controllers: [CollectionsController],
  exports: [CollectionsService],
})
export class CollectionsModule {}
