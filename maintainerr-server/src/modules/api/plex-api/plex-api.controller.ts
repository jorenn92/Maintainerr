import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import {
  PlexCollection,
  CreateUpdateCollection,
} from './interfaces/collection.interface';
import { PlexApiService } from './plex-api.service';
import { PlexHub, PlexLibraryItem } from './interfaces/library.interfaces';
import { CollectionHubSettingsDto } from './dto/collection-hub-settings.dto';
import { BasicResponseDto } from './dto/basic-response.dto';

@Controller('api/plex')
export class PlexApiController {
  constructor(private readonly plexApiService: PlexApiService) {}
  @Get()
  getStatus(): any {
    return this.plexApiService.getStatus();
  }
  @Get('libraries')
  getLibraries() {
    return this.plexApiService.getLibraries();
  }
  @Get('libraries/sync')
  syncLibraries() {
    return this.plexApiService.syncLibraries();
  }
  @Get('library/:id/content/:page')
  getLibraryContent(
    @Param('id') id: string,
    @Param('page', new ParseIntPipe()) page: number,
  ) {
    const offset = (page - 1) * 50;
    return this.plexApiService.getLibraryContents(id, {
      offset: offset,
      size: 50,
    });
  }
  @Get('meta/:id')
  getMetadata(@Param('id') id: string) {
    return this.plexApiService.getMetadata(id);
  }
  @Get('meta/:id/seen')
  getSeenBy(@Param('id') id: string) {
    return this.plexApiService.getSeenBy(id);
  }
  @Get('users')
  getUser(){
    return this.plexApiService.getUsers();
  }
  @Get('meta/:id/children')
  getChildrenMetadata(@Param('id') id: string) {
    return this.plexApiService.getChildrenMetadata(id);
  }
  @Get('library/:id/recent')
  getRecentlyAdded(@Param('id', new ParseIntPipe()) id: number) {
    this.plexApiService.getRecentlyAdded(id.toString());
  }
  @Get('library/:id/collections')
  async getCollections(@Param('id', new ParseIntPipe()) id: number) {
    const collection: PlexCollection[] =
      await this.plexApiService.getCollections(id.toString());
    return collection;
  }
  @Get('library/collection/:collectionId')
  async getCollection(
    @Param('collectionId', new ParseIntPipe()) collectionId: number,
  ) {
    const collection: PlexCollection = await this.plexApiService.getCollection(
      collectionId.toString(),
    );
    return collection;
  }
  @Get('library/collection/:collectionId/children')
  async getCollectionChildren(
    @Param('collectionId', new ParseIntPipe()) collectionId: number,
  ) {
    const collection: PlexLibraryItem[] =
      await this.plexApiService.getCollectionChildren(collectionId.toString());
    return collection;
  }
  @Put('library/collection/:collectionId/child/:childId')
  async addChildToCollection(
    @Param('collectionId', new ParseIntPipe()) collectionId: number,
    @Param('childId', new ParseIntPipe()) childId: number,
  ) {
    const collection: PlexCollection | BasicResponseDto =
      await this.plexApiService.addChildToCollection(
        collectionId.toString(),
        childId.toString(),
      );
    return collection;
  }
  @Delete('library/collection/:collectionId/child/:childId')
  async deleteChildFromCollection(
    @Param('collectionId', new ParseIntPipe()) collectionId: number,
    @Param('childId', new ParseIntPipe()) childId: number,
  ) {
    const collection: BasicResponseDto =
      await this.plexApiService.deleteChildFromCollection(
        collectionId.toString(),
        childId.toString(),
      );
    return collection;
  }
  @Put('library/collection/update')
  async updateCollection(@Body() body: CreateUpdateCollection) {
    const collection: PlexCollection =
      await this.plexApiService.updateCollection(body);
    return collection;
  }

  @Post('library/collection/create')
  async createCollection(@Body() body: CreateUpdateCollection) {
    const collection: PlexCollection =
      await this.plexApiService.createCollection(body);
    return collection;
  }
  @Delete('library/collection/:collectionId')
  async deleteCollection(
    @Param('collectionId', new ParseIntPipe()) collectionId: number,
  ) {
    const collection: boolean = await this.plexApiService.deleteCollection(
      collectionId.toString(),
    );
    return collection;
  }
  @Put('library/collection/settings')
  async UpdateCollectionSettings(@Body() body: CollectionHubSettingsDto) {
    if (
      body.libraryId &&
      body.collectionId &&
      body.recommended !== undefined &&
      body.sharedHome !== undefined &&
      body.ownHome !== undefined
    ) {
      const response: PlexHub =
        await this.plexApiService.UpdateCollectionSettings(body);
      return response;
    } else {
      return 'Incorrect input parameters supplied.';
    }
  }
}
