import { Module, OnModuleInit } from '@nestjs/common';
import { ExternalApiModule } from 'src/modules/api/external-api/external-api.module';
import { TmdbApiModule } from 'src/modules/api/tmdb-api/tmdb.module';
import { PlexApiModule } from 'src/modules/api/plex-api/plex-api.module';
import { ServarrApiModule } from 'src/modules/api/servarr-api/servarr-api.module';
import { RulesModule } from 'src/modules/rules/rules.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getConnectionOptions } from 'typeorm';
import { OverseerrApiModule } from 'src/modules/api/overseerr-api/overseerr-api.module';
import { CollectionsModule } from 'src/modules/collections/collections.module';
import { SettingsModule } from 'src/modules/settings/settings.module';
import { SettingsService } from '../modules/settings/settings.service';

@Module({
  imports: [
    SettingsModule,
    TypeOrmModule.forRootAsync({
      useFactory: async () =>
        Object.assign(await getConnectionOptions(), {
          autoLoadEntities: true,
        }),
    }),
    PlexApiModule,
    ExternalApiModule,
    TmdbApiModule,
    ServarrApiModule,
    OverseerrApiModule,
    RulesModule,
    CollectionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly settings: SettingsService) {}
  async onModuleInit() {
    await this.settings.init();
  }
}
