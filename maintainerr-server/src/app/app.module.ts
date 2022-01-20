import { Module } from '@nestjs/common';
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

@Module({
  imports: [
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
