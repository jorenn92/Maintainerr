import { Module } from '@nestjs/common';
import { PlexApiService } from './plex-api.service';
import { PlexApiController } from './plex-api.controller';
import { SettingsModule } from 'src/settings/settings.module';
import { LoggerModule } from 'src/logger/logger.module';
import { BaseApiModule } from '../base-api/base-api.module';

@Module({
  imports: [SettingsModule, LoggerModule, BaseApiModule],
  controllers: [PlexApiController],
  providers: [PlexApiService],
  exports: [],
})
export class PlexApiModule {}
