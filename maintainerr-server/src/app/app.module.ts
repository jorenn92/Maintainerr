import { Module } from '@nestjs/common';
import { ExternalApiModule } from 'src/api/external-api/external-api.module';
import { MovieDbApiModule } from 'src/api/moviedb-api/moviedb.module';
import { PlexApiModule } from 'src/api/plex-api/plex-api.module';
import { ServarrApiModule } from 'src/api/servarr-api/servarr-api.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    PlexApiModule,
    ExternalApiModule,
    MovieDbApiModule,
    ServarrApiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
