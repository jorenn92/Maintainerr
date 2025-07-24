import { Controller, Delete, Get, Param } from '@nestjs/common';
import { OmbiApiService } from './ombi-api.service';

@Controller('api/ombi')
export class OmbiApiController {
  constructor(private readonly ombiApi: OmbiApiService) {}

  @Get('movie/requests')
  getMovieRequests() {
    return this.ombiApi.getMovieRequests();
  }

  @Get('tv/requests')
  getTVRequests() {
    return this.ombiApi.getTVRequests();
  }

  @Get('users')
  getUsers() {
    return this.ombiApi.getUsers();
  }

  @Delete('request/movie/:requestId')
  deleteMovieRequest(@Param('requestId') requestId: string) {
    return this.ombiApi.deleteMovieRequest(requestId);
  }

  @Delete('request/tv/:requestId')
  deleteTVRequest(@Param('requestId') requestId: string) {
    return this.ombiApi.deleteTVRequest(requestId);
  }

  @Delete('media/movie/tmdb/:mediaId')
  removeMovieByTmdbId(@Param('mediaId') mediaId: string) {
    return this.ombiApi.removeMovieByTmdbId(mediaId);
  }

  @Delete('media/tv/tmdb/:mediaId')
  removeTVByTmdbId(@Param('mediaId') mediaId: string) {
    return this.ombiApi.removeTVByTmdbId(mediaId);
  }
}