import { Module } from '@nestjs/common';
import { LoggerModule } from 'src/logger/logger.module';
import { SettingsModule } from 'src/settings/settings.module';
import { ExternalApiModule } from '../external-api/external-api.module';
import { ServarrApiService } from './common/servarr-api.service';
import { RadarrApiController } from './radarr.controller';
import { RadarrApiService } from './radarr.service';
import { SonarrApiController } from './sonarr.controller';
import { SonarrApiService } from './sonarr.service';

@Module({
  imports: [SettingsModule, LoggerModule, ExternalApiModule],
  controllers: [RadarrApiController, SonarrApiController],
  providers: [],
  exports: [],
})
export class ServarrApiModule {}
