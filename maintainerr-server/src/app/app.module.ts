import { Module } from '@nestjs/common';
import { ExternalApiModule } from 'src/modules/api/external-api/external-api.module';
import { MovieDbApiModule } from 'src/modules/api/moviedb-api/moviedb.module';
import { PlexApiModule } from 'src/modules/api/plex-api/plex-api.module';
import { ServarrApiModule } from 'src/modules/api/servarr-api/servarr-api.module';
import { RulesModule } from 'src/modules/rules/rules.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getConnectionOptions } from 'typeorm';

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
    MovieDbApiModule,
    ServarrApiModule,
    RulesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
