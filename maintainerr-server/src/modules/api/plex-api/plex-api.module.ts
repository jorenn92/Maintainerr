import { Module } from '@nestjs/common';
import { PlexApiService } from './plex-api.service';
import { PlexApiController } from './plex-api.controller';
import { SettingsModule } from 'src/settings/settings.module';
import { LoggerModule } from 'src/logger/logger.module';

@Module({
  imports: [SettingsModule, LoggerModule],
  controllers: [PlexApiController],
  providers: [PlexApiService],
  exports: [PlexApiService],
})
export class PlexApiModule {}
