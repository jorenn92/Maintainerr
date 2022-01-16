import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { MovieDbApiService } from './moviedb.service';

@Controller('api/moviedb')
export class MovieDbApiController {
  constructor(private readonly movieDbApi: MovieDbApiService) {}

  @Get('/person/:personId')
  getPerson(@Param('personId', new ParseIntPipe()) personId: number) {
    return this.movieDbApi.getPerson({ personId: personId });
  }
}
