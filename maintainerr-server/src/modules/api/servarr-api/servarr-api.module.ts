import { Module } from '@nestjs/common';
import { LoggerModule } from 'src/logger/logger.module';
import { SettingsModule } from 'src/settings/settings.module';
import { ExternalApiModule } from '../external-api/external-api.module';
import { RadarrController } from './radarr.controller';
import { ServarrService } from './servarr.service';

@Module({
  imports: [SettingsModule, LoggerModule, ExternalApiModule],
  controllers: [RadarrController],
  providers: [ServarrService],
  exports: [ServarrService],
})
export class ServarrApiModule {}
