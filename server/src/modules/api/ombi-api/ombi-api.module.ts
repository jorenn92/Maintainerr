import { Module } from '@nestjs/common';
import { OmbiApiService } from './ombi-api.service';
import { OmbiApiController } from './ombi-api.controller';
import { ExternalApiModule } from '../external-api/external-api.module';

@Module({
  imports: [ExternalApiModule],
  providers: [OmbiApiService],
  controllers: [OmbiApiController],
  exports: [OmbiApiService],
})
export class OmbiApiModule {}