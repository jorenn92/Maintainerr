import { Controller, Get } from '@nestjs/common';
import { ServarrService } from './servarr.service';

@Controller('api/radarr')
export class RadarrController {
  constructor(private readonly servarr: ServarrService) {}
  @Get()
  getMovie() {
    return this.servarr.RadarrApi.getMovie({ id: 2780 });
  }
  @Get('/test')
  testRadarr() {
    this.servarr.SonarrApi.unmonitorSeasons(87, 'existing', false);
  }
}
