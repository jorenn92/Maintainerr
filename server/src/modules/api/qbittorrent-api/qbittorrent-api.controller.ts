import { Controller, Get } from '@nestjs/common';
import { QbittorrentApiService } from './qbittorrent-api.service';

@Controller('api/torrents')
export class QbittorrentApiController {
  constructor(private readonly qbittorrentApiService: QbittorrentApiService) {}
  @Get()
  getStatus(): any {
    return this.qbittorrentApiService.getStatus();
  }
}
