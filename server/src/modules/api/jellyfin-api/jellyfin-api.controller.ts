import { Controller, Get } from '@nestjs/common';
import { JellyfinApiService } from './jellyfin-api.service';

@Controller('api/jellyfin')
export class JellyfinApiController {
  constructor(private readonly jellyfinApiService: JellyfinApiService) {}
  @Get()
  getStatus(): any {
    return this.jellyfinApiService.getStatus();
  }
}
