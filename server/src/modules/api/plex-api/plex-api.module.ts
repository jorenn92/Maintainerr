import { Module } from '@nestjs/common';
import { PlexApiService } from './plex-api.service';
import { PlexApiController } from './plex-api.controller';
import { SettingsModule } from '../../../modules/settings/settings.module';

@Module({
  imports: [SettingsModule],
  controllers: [PlexApiController],
  providers: [PlexApiService],
  exports: [PlexApiService],
})
export class PlexApiModule {}
