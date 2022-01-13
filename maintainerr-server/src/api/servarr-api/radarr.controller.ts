import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { RadarrApiService } from './radarr.service';

@Controller('api/radarr')
export class RadarrApiController {
  radarrApi: RadarrApiService;
  constructor() {
    this.radarrApi = new RadarrApiService({
      url: 'http://192.168.0.2:7878/api/v3/',
      apiKey: '52d7528e1490412e8f98e5413b11ee33',
    });
  }
  @Get('movies')
  getMovies() {
    return this.radarrApi.getMovies();
  }
  @Get('movie/:id')
  getMovie(@Param('id', new ParseIntPipe()) movieId: number) {
    return this.radarrApi.getMovie({ id: movieId });
  }
}
