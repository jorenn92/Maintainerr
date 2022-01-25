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
import { LoggerModule } from 'src/logger/logger.module';

@Module({
  imports: [
    PlexApiModule,
    TypeOrmModule.forFeature([Collection, CollectionMedia, RuleGroup]),
    OverseerrApiModule,
    TmdbApiModule,
    ServarrApiModule,
    LoggerModule,
  ],
  providers: [CollectionsService, CollectionWorkerService],
  controllers: [CollectionsController],
  exports: [CollectionsService],
})
export class CollectionsModule {}
