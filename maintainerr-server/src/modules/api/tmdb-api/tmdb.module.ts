import { Module } from '@nestjs/common';
import { LoggerModule } from 'src/logger/logger.module';
import { SettingsModule } from 'src/settings/settings.module';
import { ExternalApiModule } from '../external-api/external-api.module';
import { TmdbApiController } from './tmdb.controller';
import { TmdbApiService } from './tmdb.service';

@Module({
  imports: [SettingsModule, LoggerModule, ExternalApiModule],
  controllers: [TmdbApiController],
  providers: [TmdbApiService],
  exports: [TmdbApiService],
})
export class TmdbApiModule {}
