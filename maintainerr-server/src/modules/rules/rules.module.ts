import { Module } from '@nestjs/common';
import { RulesService } from './rules.service';
import { RulesController } from './rules.controller';
import { PlexApiModule } from '../api/plex-api/plex-api.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rules } from './entities/rules.entities';
import { RuleExecutorService } from './rule-executor.service';
import { RuleGroup } from './entities/rule-group.entities';
import { PlexGetterService } from './getter/plex-getter.service';
import { ValueGetterService } from './getter/getter.service';
import { RadarrGetterService } from './getter/radarr-getter.service';
import { SonarrGetterService } from './getter/sonarr-getter.service';
import { OverseerrGetterService } from './getter/overseerr-getter.service';
import { ServarrApiModule } from '../api/servarr-api/servarr-api.module';
import { OverseerrApiModule } from '../api/overseerr-api/overseerr-api.module';
import { TmdbApiModule } from '../api/tmdb-api/tmdb.module';
import { CollectionsModule } from '../collections/collections.module';
import { LoggerModule } from 'src/logger/logger.module';

@Module({
  imports: [
    PlexApiModule,
    ServarrApiModule,
    TypeOrmModule.forFeature([Rules, RuleGroup]),
    OverseerrApiModule,
    TmdbApiModule,
    CollectionsModule,
    LoggerModule,
  ],
  providers: [
    RulesService,
    RuleExecutorService,
    PlexGetterService,
    RadarrGetterService,
    SonarrGetterService,
    OverseerrGetterService,
    ValueGetterService,
  ],
  controllers: [RulesController],
})
export class RulesModule {}
