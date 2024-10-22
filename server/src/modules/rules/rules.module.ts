import { Module } from '@nestjs/common';
import { RulesService } from './rules.service';
import { RulesController } from './rules.controller';
import { PlexApiModule } from '../api/plex-api/plex-api.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rules } from './entities/rules.entities';
import { RuleExecutorService } from './tasks/rule-executor.service';
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
import { TasksModule } from '../tasks/tasks.module';
import { Collection } from '../collections/entities/collection.entities';
import { CollectionMedia } from '../collections/entities/collection_media.entities';
import { Exclusion } from './entities/exclusion.entities';
import { CommunityRuleKarma } from './entities/community-rule-karma.entities';
import { Settings } from '../settings/entities/settings.entities';
import { RuleMaintenanceService } from './tasks/rule-maintenance.service';
import { RuleYamlService } from './helpers/yaml.service';
import { RuleComparatorService } from './helpers/rule.comparator.service';
import { RuleConstanstService } from './constants/constants.service';
import { ExclusionTypeCorrectorService } from './tasks/exclusion-corrector.service';
import { TautulliApiModule } from '../api/tautulli-api/tautulli-api.module';
import { TautulliGetterService } from './getter/tautulli-getter.service';
import { OmbiGetterService } from './getter/ombi-getter.service';
import { OmbiApiModule } from '../api/ombi-api/ombi-api.module';

@Module({
  imports: [
    PlexApiModule,
    ServarrApiModule,
    TypeOrmModule.forFeature([
      Rules,
      RuleGroup,
      Collection,
      CollectionMedia,
      Exclusion,
      CommunityRuleKarma,
      Settings,
    ]),
    OverseerrApiModule,
    TautulliApiModule,
    OmbiApiModule,
    TmdbApiModule,
    CollectionsModule,
    TasksModule,
  ],
  providers: [
    RulesService,
    RuleExecutorService,
    RuleMaintenanceService,
    ExclusionTypeCorrectorService,
    PlexGetterService,
    RadarrGetterService,
    SonarrGetterService,
    OverseerrGetterService,
    TautulliGetterService,
    OmbiGetterService,
    ValueGetterService,
    RuleYamlService,
    RuleComparatorService,
    RuleConstanstService,
  ],
  controllers: [RulesController],
})
export class RulesModule {}
