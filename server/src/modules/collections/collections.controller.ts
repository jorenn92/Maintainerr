import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CollectionWorkerService } from './collection-worker.service';
import { CollectionsService } from './collections.service';
import { AddCollectionMedia } from './interfaces/collection-media.interface';

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
  addToCollection(
    @Body()
    request: {
      collectionId: number;
      media: AddCollectionMedia[];
      manual?: boolean;
    },
  ) {
    this.collectionService.addToCollection(
      request.collectionId,
      request.media,
      request.manual ? request.manual : false,
    );
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
  getCollections(
    @Query('libraryId') libraryId: number,
    @Query('typeId') typeId: 1 | 2,
  ) {
    if (libraryId) {
      return this.collectionService.getCollections(libraryId, undefined);
    } else if (typeId) {
      return this.collectionService.getCollections(undefined, typeId);
    } else {
      return this.collectionService.getCollections(undefined, undefined);
    }
  }
  @Get('/collection/:id')
  getCollection(@Param('id') collectionId: number) {
    return this.collectionService.getCollection(
      collectionId ? collectionId : undefined,
    );
  }
  @Post('/media/add')
  addManuallyToCollection(
    @Body() request: { collectionId: number; mediaId: number },
  ) {
    return this.collectionService.addToCollection(
      request.collectionId,
      [{ plexId: request.mediaId }],
      true,
    );
  }
  @Delete('/media')
  deleteMediaFromCollection(@Query('mediaId') mediaId: number) {
    return this.collectionService.removeFromAllCollections([
      { plexId: mediaId },
    ]);
  }
  @Get('/media')
  getMediaInCollection(@Query('collectionId') collectionId: number) {
    return this.collectionService.getCollectionMedia(collectionId);
  }
}
