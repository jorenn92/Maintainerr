import { Controller, Delete, Get, Param } from '@nestjs/common';
import { OmbiApiService } from './ombi-api.service';

@Controller('api/ombi')
export class OmbiApiController {
  constructor(private readonly ombiApi: OmbiApiService) {}

  @Get('movie/:id')
  getMovie(@Param('id') id: string) {
    return this.ombiApi.getMovie(id);
  }

  @Get('show/:id')
  getShow(@Param('id') id: string) {
    return this.ombiApi.getShow(id);
  }

  /*@Delete('request/:requestId')
  deleteRequest(@Param('requestId') requestId: string) {
    return this.ombiApi.deleteRequest(requestId);
  }

  @Delete('media/:mediaId')
  deleteMedia(@Param('mediaId') mediaId: string) {
    return this.ombiApi.deleteMediaItem(mediaId);
  }

  @Delete('media/tmdb/:mediaId')
  removeMediaByTmdbId(@Param('mediaId') mediaId: string) {
    return this.ombiApi.removeMediaByTmdbId(mediaId, 'movie');
  }*/
}
