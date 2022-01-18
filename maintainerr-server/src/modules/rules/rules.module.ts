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

@Module({
  imports: [PlexApiModule, TypeOrmModule.forFeature([Rules, RuleGroup])],
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
