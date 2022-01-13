import { Module } from '@nestjs/common';
import { LoggerModule } from 'src/logger/logger.module';
import { SettingsModule } from 'src/settings/settings.module';
import { ExternalApiModule } from '../external-api/external-api.module';
import { MovieDbApiController } from './moviedb.controller';
import { MovieDbApiService } from './moviedb.service';

@Module({
  imports: [SettingsModule, LoggerModule, ExternalApiModule],
  controllers: [MovieDbApiController],
  providers: [MovieDbApiService],
  exports: [],
})
export class MovieDbApiModule {}
