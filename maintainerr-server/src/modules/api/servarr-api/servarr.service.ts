import { Injectable } from '@nestjs/common';
import { RadarrApi } from './helpers/radarr.helper';
import { SonarrApi } from './helpers/sonarr.helper';

@Injectable()
export class ServarrService {
  RadarrApi: RadarrApi;
  SonarrApi: SonarrApi;
  constructor() {
    this.RadarrApi = new RadarrApi({
      url: 'http://192.168.0.2:7878/api/v3/',
      apiKey: '52d7528e1490412e8f98e5413b11ee33',
    });
    this.SonarrApi = new SonarrApi({
      url: 'http://192.168.0.2:8989/api/v3/',
      apiKey: 'dc57f15a469d494492c896c1d26e0069',
    });
  }
}
