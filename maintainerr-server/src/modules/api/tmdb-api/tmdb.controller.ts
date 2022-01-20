import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { TmdbApiService } from './tmdb.service';

@Controller('api/moviedb')
export class TmdbApiController {
  constructor(private readonly movieDbApi: TmdbApiService) {}

  @Get('/person/:personId')
  getPerson(@Param('personId', new ParseIntPipe()) personId: number) {
    return this.movieDbApi.getPerson({ personId: personId });
  }
  @Get('/movie/imdb/:id')
  getMovie(@Param('id') imdbId: number) {
    return this.movieDbApi.getByExternalId({
      externalId: imdbId.toString(),
      type: 'imdb',
    });
  }
}
