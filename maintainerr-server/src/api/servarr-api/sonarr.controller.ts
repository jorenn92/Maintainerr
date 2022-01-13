import { Controller } from '@nestjs/common';
import { SonarrApiService } from './sonarr.service';

@Controller('api/sonarr')
export class SonarrApiController {
  sonarrApi: SonarrApiService;
  constructor() {
    this.sonarrApi = new SonarrApiService({
      url: 'https://sonarr.cyntek.be/api/v3/',
      apiKey: 'dc57f15a469d494492c896c1d26e0069',
    });
  }
}
