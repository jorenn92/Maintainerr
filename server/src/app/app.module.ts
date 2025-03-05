import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ZodValidationPipe } from 'nestjs-zod';
import { ExternalApiModule } from '../modules/api/external-api/external-api.module';
import { JellyseerrApiModule } from '../modules/api/jellyseerr-api/jellyseerr-api.module';
import { JellyseerrApiService } from '../modules/api/jellyseerr-api/jellyseerr-api.service';
import { OverseerrApiModule } from '../modules/api/overseerr-api/overseerr-api.module';
import { OverseerrApiService } from '../modules/api/overseerr-api/overseerr-api.service';
import { PlexApiModule } from '../modules/api/plex-api/plex-api.module';
import { PlexApiService } from '../modules/api/plex-api/plex-api.service';
import { ServarrApiModule } from '../modules/api/servarr-api/servarr-api.module';
import { TautulliApiModule } from '../modules/api/tautulli-api/tautulli-api.module';
import { TautulliApiService } from '../modules/api/tautulli-api/tautulli-api.service';
import { TmdbApiModule } from '../modules/api/tmdb-api/tmdb.module';
import { CollectionsModule } from '../modules/collections/collections.module';
import { LogsModule } from '../modules/logging/logs.module';
import { RulesModule } from '../modules/rules/rules.module';
import { SettingsModule } from '../modules/settings/settings.module';
import { SettingsService } from '../modules/settings/settings.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import ormConfig from './config/typeOrmConfig';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env', '.env.production'],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: ormConfig,
      inject: [ConfigService],
    }),
    EventEmitterModule.forRoot(),
    LogsModule,
    SettingsModule,
    PlexApiModule,
    ExternalApiModule,
    TmdbApiModule,
    ServarrApiModule,
    OverseerrApiModule,
    TautulliApiModule,
    JellyseerrApiModule,
    RulesModule,
    CollectionsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
  ],
})
export class AppModule implements OnModuleInit {
  constructor(
    private readonly settings: SettingsService,
    private readonly plexApi: PlexApiService,
    private readonly overseerApi: OverseerrApiService,
    private readonly tautulliApi: TautulliApiService,
    private readonly jellyseerrApi: JellyseerrApiService,
  ) {}
  async onModuleInit() {
    // Initialize stuff needing settings here.. Otherwise problems
    await this.settings.init();
    await this.plexApi.initialize({});
    await this.overseerApi.init();
    await this.tautulliApi.init();
    await this.jellyseerrApi.init();
  }
}
