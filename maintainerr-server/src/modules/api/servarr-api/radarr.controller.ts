import { Controller, Get } from '@nestjs/common';
import { RadarrApi } from './helpers/radarr.helper';
import { ServarrService } from './servarr.service';

@Controller('api/radarr')
export class RadarrController {
  @Get()
  getMovie() {
    const api = new RadarrApi({
      url: 'http://192.168.0.2:7878/api/v3/',
      apiKey: '52d7528e1490412e8f98e5413b11ee33',
    });
    return api.getMovie({ id: 2780 });
  }
}
