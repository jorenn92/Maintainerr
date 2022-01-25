import { Module } from '@nestjs/common';
import { OverseerrApiService } from './overseerr-api.service';
import { OverseerrApiController } from './overseerr-api.controller';
import { ExternalApiModule } from '../external-api/external-api.module';
import { LoggerModule } from 'src/logger/logger.module';

@Module({
  imports: [ExternalApiModule, LoggerModule],
  providers: [OverseerrApiService],
  controllers: [OverseerrApiController],
  exports: [OverseerrApiService],
})
export class OverseerrApiModule {}
