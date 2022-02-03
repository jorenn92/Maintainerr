import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { CollectionWorkerService } from './collection-worker.service';
import { CollectionsService } from './collections.service';

@Controller('api/collections')
export class CollectionsController {
  constructor(
    private readonly collectionService: CollectionsService,
    private readonly collectionWorkerService: CollectionWorkerService,
  ) {}
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

  @Put()
  updateCollection(@Body() request: any) {
    return this.collectionService.updateCollection(request);
  }
  @Post('/handle')
  handleCollection(@Body() request: any) {
    return this.collectionWorkerService.handle();
  }
  @Get('/deactivate/:id')
  deactivate(@Param('id') id: number) {
    return this.collectionService.deactivateCollection(id);
  }
  @Get('/activate/:id')
  activate(@Param('id') id: number) {
    return this.collectionService.activateCollection(id);
  }

  @Get()
  getCollections(@Param('libraryId') libraryId: number) {
    return this.collectionService.getCollections(
      libraryId ? libraryId : undefined,
    );
  }
}
