import { Module } from '@nestjs/common';
import { ExternalApiModule } from '../external-api/external-api.module';
import { QbittorrentApiController } from './qbittorrent-api.controller';
import { QbittorrentApiService } from './qbittorrent-api.service';

@Module({
  imports: [ExternalApiModule],
  controllers: [QbittorrentApiController],
  providers: [QbittorrentApiService],
  exports: [QbittorrentApiService],
})
export class QbittorrentApiModule {}
