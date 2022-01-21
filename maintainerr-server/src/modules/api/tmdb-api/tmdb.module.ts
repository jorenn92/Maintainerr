import { Module } from '@nestjs/common';
import { LoggerModule } from 'src/logger/logger.module';
import { SettingsModule } from 'src/settings/settings.module';
import { ExternalApiModule } from '../external-api/external-api.module';
import { PlexApiModule } from '../plex-api/plex-api.module';
import { TmdbIdService } from './tmdb-id.service';
import { TmdbApiController } from './tmdb.controller';
import { TmdbApiService } from './tmdb.service';

@Module({
  imports: [SettingsModule, LoggerModule, ExternalApiModule, PlexApiModule],
  controllers: [TmdbApiController],
  providers: [TmdbApiService, TmdbIdService],
  exports: [TmdbApiService, TmdbIdService],
})
export class TmdbApiModule {}
