import { Module } from '@nestjs/common';
import { ExternalApiModule } from '../external-api/external-api.module';
import { JellyfinApiController } from './jellyfin-api.controller';
import { JellyfinApiService } from './jellyfin-api.service';

@Module({
  imports: [ExternalApiModule],
  controllers: [JellyfinApiController],
  providers: [JellyfinApiService],
  exports: [JellyfinApiService],
})
export class JellyfinApiModule {}
