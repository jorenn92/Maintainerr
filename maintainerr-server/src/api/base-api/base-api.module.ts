import { Module } from '@nestjs/common';
import { LoggerModule } from 'src/logger/logger.module';
import { SettingsModule } from 'src/settings/settings.module';
import { BaseApiService } from './base-api.service';

@Module({
  imports: [LoggerModule, SettingsModule],
  controllers: [],
  providers: [BaseApiService],
  exports: [BaseApiService],
})
export class BaseApiModule {}
