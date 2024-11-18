import { Module, OnModuleInit } from '@nestjs/common';
import { ExternalApiModule } from '../modules/api/external-api/external-api.module';
import { TmdbApiModule } from '../modules/api/tmdb-api/tmdb.module';
import { PlexApiModule } from '../modules/api/plex-api/plex-api.module';
import { ServarrApiModule } from '../modules/api/servarr-api/servarr-api.module';
import { RulesModule } from '../modules/rules/rules.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OverseerrApiModule } from '../modules/api/overseerr-api/overseerr-api.module';
import { CollectionsModule } from '../modules/collections/collections.module';
import { SettingsModule } from '../modules/settings/settings.module';
import { SettingsService } from '../modules/settings/settings.service';
import { PlexApiService } from '../modules/api/plex-api/plex-api.service';
import { OverseerrApiService } from '../modules/api/overseerr-api/overseerr-api.service';
import ormConfig from './config/typeOrmConfig';
import { TautulliApiModule } from '../modules/api/tautulli-api/tautulli-api.module';
import { TautulliApiService } from '../modules/api/tautulli-api/tautulli-api.service';
import { NotificationsModule } from '../modules/notifications/notifications.module';
import { NotificationService } from '../modules/notifications/notifications.service';

@Module({
  imports: [
    TypeOrmModule.forRoot(ormConfig),
    SettingsModule,
    PlexApiModule,
    ExternalApiModule,
    TmdbApiModule,
    ServarrApiModule,
    OverseerrApiModule,
    TautulliApiModule,
    RulesModule,
    CollectionsModule,
    NotificationsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  constructor(
    private readonly settings: SettingsService,
    private readonly plexApi: PlexApiService,
    private readonly overseerApi: OverseerrApiService,
    private readonly tautulliApi: TautulliApiService,
    private readonly notificationService: NotificationService
  ) {}
  async onModuleInit() {
    // Initialize modules requiring settings
    await this.settings.init();
    await this.plexApi.initialize({});
    await this.overseerApi.init();
    await this.tautulliApi.init();
    
    // intialize notification agents 
    await this.notificationService.registerConfiguredAgents();
  }
}
