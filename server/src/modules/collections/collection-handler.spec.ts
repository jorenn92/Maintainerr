import { ServarrAction } from '@maintainerr/contracts';
import { Mocked, TestBed } from '@suites/unit';
import {
  createCollection,
  createCollectionMedia,
  createPlexLibraries,
} from '../../../test/utils/data';
import { RadarrActionHandler } from '../actions/radarr-action-handler';
import { SonarrActionHandler } from '../actions/sonarr-action-handler';
import { PlexApiService } from '../api/plex-api/plex-api.service';
import { CollectionHandler } from './collection-handler';
import { CollectionsService } from './collections.service';

describe('CollectionHandler', () => {
  let collectionHandler: CollectionHandler;
  let plexApi: Mocked<PlexApiService>;
  let collectionsService: Mocked<CollectionsService>;
  let radarrActionHandler: Mocked<RadarrActionHandler>;
  let sonarrActionHandler: Mocked<SonarrActionHandler>;

  beforeEach(async () => {
    const { unit, unitRef } =
      await TestBed.solitary(CollectionHandler).compile();

    collectionHandler = unit;
    plexApi = unitRef.get(PlexApiService);
    collectionsService = unitRef.get(CollectionsService);
    radarrActionHandler = unitRef.get(RadarrActionHandler);
    sonarrActionHandler = unitRef.get(SonarrActionHandler);
  });

  it('should delete from disk', async () => {
    const collection = createCollection({
      arrAction: ServarrAction.DELETE,
    });
    const collectionMedia = createCollectionMedia(collection, 'show');

    plexApi.getLibraries.mockResolvedValue(
      createPlexLibraries({
        key: collection.libraryId.toString(),
      }),
    );

    await collectionHandler.handleMedia(collection, collectionMedia);

    expect(collectionsService.removeFromCollection).toHaveBeenCalledTimes(1);
    expect(plexApi.deleteMediaFromDisk).toHaveBeenCalled();
  });

  it('should call Radarr action handler', async () => {
    const collection = createCollection({
      arrAction: ServarrAction.DELETE,
      radarrSettingsId: 1,
    });
    const collectionMedia = createCollectionMedia(collection, 'movie');

    plexApi.getLibraries.mockResolvedValue(
      createPlexLibraries({
        key: collection.libraryId.toString(),
        type: 'movie',
      }),
    );

    await collectionHandler.handleMedia(collection, collectionMedia);

    expect(collectionsService.removeFromCollection).toHaveBeenCalledTimes(1);
    expect(radarrActionHandler.handleAction).toHaveBeenCalled();
  });

  it('should call Sonarr action handler', async () => {
    const collection = createCollection({
      arrAction: ServarrAction.DELETE,
      sonarrSettingsId: 1,
    });
    const collectionMedia = createCollectionMedia(collection, 'show');

    plexApi.getLibraries.mockResolvedValue(
      createPlexLibraries({
        key: collection.libraryId.toString(),
        type: 'show',
      }),
    );

    await collectionHandler.handleMedia(collection, collectionMedia);

    expect(collectionsService.removeFromCollection).toHaveBeenCalledTimes(1);
    expect(sonarrActionHandler.handleAction).toHaveBeenCalled();
  });
});
