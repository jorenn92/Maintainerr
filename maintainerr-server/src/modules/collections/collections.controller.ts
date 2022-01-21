import { Body, Controller, Post } from '@nestjs/common';
import { CollectionsService } from './collections.service';

@Controller('api/collections')
export class CollectionsController {
  constructor(private readonly collectionService: CollectionsService) {}
  @Post()
  createCollection(@Body() request: any) {
    this.collectionService.createCollectionWithChildren(
      request.collection,
      request.media,
    );
  }
  @Post('/add')
  addToCollection(@Body() request: any) {
    this.collectionService.addToCollection(request.collectionId, request.media);
  }
  @Post('/remove')
  removeFromCollection(@Body() request: any) {
    this.collectionService.removeFromCollection(
      request.collectionId,
      request.media,
    );
  }
  @Post('/removeCollection')
  removeCollection(@Body() request: any) {
    return this.collectionService.deleteCollection(request.collectionId);
  }
}
