import { Mocked, TestBed } from '@suites/unit';
import {
  createCollectionMedia,
  createPlexLibraryItem,
  createRulesDto,
} from '../../../../test/utils/data';
import { EPlexDataType } from '../../api/plex-api/enums/plex-data-type-enum';
import { PlexLibraryItem } from '../../api/plex-api/interfaces/library.interfaces';
import { PlexApiService } from '../../api/plex-api/plex-api.service';
import {
  OmbiApiService,
  OmbiSearchMovieResponse,
  OmbiSearchTvResponse,
  OmbiMovieResponse,
  OmbiTvResponse,
} from '../../api/ombi-api/ombi-api.service';
import { TmdbIdService } from '../../api/tmdb-api/tmdb-id.service';
import { CollectionMedia } from '../../collections/entities/collection_media.entities';
import { MaintainerrLogger } from '../../logging/logs.service';
import { OmbiGetterService } from './ombi-getter.service';

describe('OmbiGetterService', () => {
  let ombiGetterService: OmbiGetterService;
  let ombiApi: Mocked<OmbiApiService>;
  let plexApi: Mocked<PlexApiService>;
  let tmdbIdService: Mocked<TmdbIdService>;
  let logger: Mocked<MaintainerrLogger>;

  beforeEach(async () => {
    const { unit, unitRef } = await TestBed.solitary(OmbiGetterService).compile();

    ombiGetterService = unit;
    ombiApi = unitRef.get(OmbiApiService);
    plexApi = unitRef.get(PlexApiService);
    tmdbIdService = unitRef.get(TmdbIdService);
    logger = unitRef.get(MaintainerrLogger);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('addUser property', () => {
    let collectionMedia: CollectionMedia;
    let plexLibraryItem: PlexLibraryItem;

    beforeEach(() => {
      collectionMedia = createCollectionMedia(EPlexDataType.MOVIES);
      plexLibraryItem = createPlexLibraryItem('movie');
      tmdbIdService.getTmdbIdFromPlexData.mockResolvedValue({
        type: 'movie',
        id: 123,
      });
    });

    it('should return requesting user for movie', async () => {
      const mockMovieResponse: OmbiSearchMovieResponse = {
        tmdbId: 123,
        title: 'Test Movie',
        request: {
          id: 1,
          title: 'Test Movie',
          requestedDate: '2023-01-01',
          approved: true,
          available: false,
          requestedUser: {
            id: '1',
            userName: 'testuser',
            userType: 1,
          },
          tmdbId: 123,
        },
      };

      ombiApi.getMovie.mockResolvedValue(mockMovieResponse);

      const result = await ombiGetterService.get(1, plexLibraryItem);

      expect(result).toEqual(['testuser']);
      expect(ombiApi.getMovie).toHaveBeenCalledWith('123');
    });

    it('should return empty array when no movie found', async () => {
      ombiApi.getMovie.mockResolvedValue(null);

      const result = await ombiGetterService.get(1, plexLibraryItem);

      expect(result).toBeNull();
      expect(ombiApi.getMovie).toHaveBeenCalledWith('123');
    });

    it('should return requesting users for TV show', async () => {
      plexLibraryItem.type = 'show';
      const mockTvResponse: OmbiSearchTvResponse = {
        tmdbId: 456,
        title: 'Test Show',
        request: {
          id: 2,
          title: 'Test Show',
          requestedDate: '2023-01-01',
          approved: true,
          available: false,
          requestedUser: {
            id: '1',
            userName: 'mainuser',
            userType: 1,
          },
          tmdbId: 456,
          childRequests: [
            {
              id: 3,
              seasonRequests: [{ seasonNumber: 1, episodes: [] }],
              requestedDate: '2023-01-02',
              approved: true,
              available: false,
              requestedUser: {
                id: '2',
                userName: 'childuser',
                userType: 1,
              },
            },
          ],
        },
      };

      ombiApi.getShowByTmdbId.mockResolvedValue(mockTvResponse);

      const result = await ombiGetterService.get(1, plexLibraryItem);

      expect(result).toEqual(['mainuser', 'childuser']);
      expect(ombiApi.getShowByTmdbId).toHaveBeenCalledWith('123');
    });

    it('should handle seasons and episodes correctly', async () => {
      plexLibraryItem.type = 'show';
      plexLibraryItem.index = 1; // Season 1
      const origLibItem = { ...plexLibraryItem, parentIndex: 1 };
      
      const mockTvResponse: OmbiSearchTvResponse = {
        tmdbId: 456,
        title: 'Test Show',
        request: {
          id: 2,
          title: 'Test Show',
          requestedDate: '2023-01-01',
          approved: true,
          available: false,
          requestedUser: {
            id: '1',
            userName: 'mainuser',
            userType: 1,
          },
          tmdbId: 456,
          childRequests: [
            {
              id: 3,
              seasonRequests: [{ seasonNumber: 1, episodes: [] }],
              requestedDate: '2023-01-02',
              approved: true,
              available: false,
              requestedUser: {
                id: '2',
                userName: 'seasonuser',
                userType: 1,
              },
            },
          ],
        },
      };

      plexApi.getMetadata.mockResolvedValue(plexLibraryItem as any);
      ombiApi.getShowByTmdbId.mockResolvedValue(mockTvResponse);

      const result = await ombiGetterService.get(1, origLibItem, EPlexDataType.SEASONS);

      expect(result).toEqual(['seasonuser']);
      expect(plexApi.getMetadata).toHaveBeenCalledWith(origLibItem.parentRatingKey);
      expect(ombiApi.getShowByTmdbId).toHaveBeenCalledWith('123');
    });
  });

  describe('amountRequested property', () => {
    let plexLibraryItem: PlexLibraryItem;

    beforeEach(() => {
      plexLibraryItem = createPlexLibraryItem('movie');
      tmdbIdService.getTmdbIdFromPlexData.mockResolvedValue({
        type: 'movie',
        id: 123,
      });
    });

    it('should return 1 for requested movie', async () => {
      const mockMovieResponse: OmbiSearchMovieResponse = {
        tmdbId: 123,
        title: 'Test Movie',
        request: {
          id: 1,
          title: 'Test Movie',
          requestedDate: '2023-01-01',
          approved: true,
          available: false,
          tmdbId: 123,
        },
      };

      ombiApi.getMovie.mockResolvedValue(mockMovieResponse);

      const result = await ombiGetterService.get(7, plexLibraryItem);

      expect(result).toBe(1);
    });

    it('should return 0 for non-requested movie', async () => {
      ombiApi.getMovie.mockResolvedValue(null);

      const result = await ombiGetterService.get(7, plexLibraryItem);

      expect(result).toBeNull();
    });

    it('should return child request count for TV show', async () => {
      plexLibraryItem.type = 'show';
      const mockTvResponse: OmbiSearchTvResponse = {
        tmdbId: 456,
        title: 'Test Show',
        request: {
          id: 2,
          title: 'Test Show',
          requestedDate: '2023-01-01',
          approved: true,
          available: false,
          tmdbId: 456,
          childRequests: [
            {
              id: 3,
              seasonRequests: [{ seasonNumber: 1, episodes: [] }],
              requestedDate: '2023-01-02',
              approved: true,
              available: false,
            },
            {
              id: 4,
              seasonRequests: [{ seasonNumber: 2, episodes: [] }],
              requestedDate: '2023-01-03',
              approved: true,
              available: false,
            },
          ],
        },
      };

      ombiApi.getShowByTmdbId.mockResolvedValue(mockTvResponse);

      const result = await ombiGetterService.get(7, plexLibraryItem);

      expect(result).toBe(2);
    });
  });

  describe('requestDate property', () => {
    let plexLibraryItem: PlexLibraryItem;

    beforeEach(() => {
      plexLibraryItem = createPlexLibraryItem('movie');
      tmdbIdService.getTmdbIdFromPlexData.mockResolvedValue({
        type: 'movie',
        id: 123,
      });
    });

    it('should return request date for movie', async () => {
      const requestDate = '2023-01-01T10:00:00Z';
      const mockMovieResponse: OmbiSearchMovieResponse = {
        tmdbId: 123,
        title: 'Test Movie',
        request: {
          id: 1,
          title: 'Test Movie',
          requestedDate: requestDate,
          approved: true,
          available: false,
          tmdbId: 123,
        },
      };

      ombiApi.getMovie.mockResolvedValue(mockMovieResponse);

      const result = await ombiGetterService.get(2, plexLibraryItem);

      expect(result).toEqual(new Date(requestDate));
    });

    it('should return null when no movie found', async () => {
      ombiApi.getMovie.mockResolvedValue(null);

      const result = await ombiGetterService.get(2, plexLibraryItem);

      expect(result).toBeNull();
    });
  });

  describe('releaseDate property', () => {
    let plexLibraryItem: PlexLibraryItem;

    beforeEach(() => {
      plexLibraryItem = createPlexLibraryItem('movie');
      tmdbIdService.getTmdbIdFromPlexData.mockResolvedValue({
        type: 'movie',
        id: 123,
      });
    });

    it('should return release date for movie', async () => {
      const releaseDate = '2023-06-15';
      const mockMovieResponse: OmbiSearchMovieResponse = {
        tmdbId: 123,
        title: 'Test Movie',
        releaseDate: releaseDate,
        request: {
          id: 1,
          title: 'Test Movie',
          requestedDate: '2023-01-01',
          approved: true,
          available: false,
          tmdbId: 123,
        },
      };

      ombiApi.getMovie.mockResolvedValue(mockMovieResponse);

      const result = await ombiGetterService.get(3, plexLibraryItem);

      expect(result).toEqual(new Date(releaseDate));
    });

    it('should return first aired date for TV show', async () => {
      plexLibraryItem.type = 'show';
      const firstAired = '2023-01-15';
      const mockTvResponse: OmbiSearchTvResponse = {
        tmdbId: 456,
        title: 'Test Show',
        firstAired: firstAired,
        request: {
          id: 2,
          title: 'Test Show',
          requestedDate: '2023-01-01',
          approved: true,
          available: false,
          tmdbId: 456,
        },
      };

      ombiApi.getShowByTmdbId.mockResolvedValue(mockTvResponse);

      const result = await ombiGetterService.get(3, plexLibraryItem);

      expect(result).toEqual(new Date(firstAired));
    });
  });

  describe('approvalDate property', () => {
    let plexLibraryItem: PlexLibraryItem;

    beforeEach(() => {
      plexLibraryItem = createPlexLibraryItem('movie');
      tmdbIdService.getTmdbIdFromPlexData.mockResolvedValue({
        type: 'movie',
        id: 123,
      });
    });

    it('should return approval date for approved movie', async () => {
      const approvalDate = '2023-01-02T12:00:00Z';
      const mockMovieResponse: OmbiSearchMovieResponse = {
        tmdbId: 123,
        title: 'Test Movie',
        request: {
          id: 1,
          title: 'Test Movie',
          requestedDate: '2023-01-01',
          approved: true,
          approvedDate: approvalDate,
          available: false,
          tmdbId: 123,
        },
      };

      ombiApi.getMovie.mockResolvedValue(mockMovieResponse);

      const result = await ombiGetterService.get(4, plexLibraryItem);

      expect(result).toEqual(new Date(approvalDate));
    });

    it('should return null for non-approved movie', async () => {
      const mockMovieResponse: OmbiSearchMovieResponse = {
        tmdbId: 123,
        title: 'Test Movie',
        request: {
          id: 1,
          title: 'Test Movie',
          requestedDate: '2023-01-01',
          approved: false,
          available: false,
          tmdbId: 123,
        },
      };

      ombiApi.getMovie.mockResolvedValue(mockMovieResponse);

      const result = await ombiGetterService.get(4, plexLibraryItem);

      expect(result).toBeNull();
    });
  });

  describe('mediaAddedAt property', () => {
    let plexLibraryItem: PlexLibraryItem;

    beforeEach(() => {
      plexLibraryItem = createPlexLibraryItem('movie');
      tmdbIdService.getTmdbIdFromPlexData.mockResolvedValue({
        type: 'movie',
        id: 123,
      });
    });

    it('should return available date for available movie', async () => {
      const availableDate = '2023-01-03T14:00:00Z';
      const mockMovieResponse: OmbiSearchMovieResponse = {
        tmdbId: 123,
        title: 'Test Movie',
        request: {
          id: 1,
          title: 'Test Movie',
          requestedDate: '2023-01-01',
          approved: true,
          available: true,
          availableDate: availableDate,
          tmdbId: 123,
        },
      };

      ombiApi.getMovie.mockResolvedValue(mockMovieResponse);

      const result = await ombiGetterService.get(5, plexLibraryItem);

      expect(result).toEqual(new Date(availableDate));
    });

    it('should return null for non-available movie', async () => {
      const mockMovieResponse: OmbiSearchMovieResponse = {
        tmdbId: 123,
        title: 'Test Movie',
        request: {
          id: 1,
          title: 'Test Movie',
          requestedDate: '2023-01-01',
          approved: true,
          available: false,
          tmdbId: 123,
        },
      };

      ombiApi.getMovie.mockResolvedValue(mockMovieResponse);

      const result = await ombiGetterService.get(5, plexLibraryItem);

      expect(result).toBeNull();
    });
  });

  describe('isRequested property', () => {
    let plexLibraryItem: PlexLibraryItem;

    beforeEach(() => {
      plexLibraryItem = createPlexLibraryItem('movie');
      tmdbIdService.getTmdbIdFromPlexData.mockResolvedValue({
        type: 'movie',
        id: 123,
      });
    });

    it('should return 1 for requested movie', async () => {
      const mockMovieResponse: OmbiSearchMovieResponse = {
        tmdbId: 123,
        title: 'Test Movie',
        request: {
          id: 1,
          title: 'Test Movie',
          requestedDate: '2023-01-01',
          approved: true,
          available: false,
          tmdbId: 123,
        },
      };

      ombiApi.getMovie.mockResolvedValue(mockMovieResponse);

      const result = await ombiGetterService.get(6, plexLibraryItem);

      expect(result).toBe(1);
    });

    it('should return 0 for non-requested movie', async () => {
      ombiApi.getMovie.mockResolvedValue(null);

      const result = await ombiGetterService.get(6, plexLibraryItem);

      expect(result).toBeNull();
    });

    it('should return 1 for requested TV show', async () => {
      plexLibraryItem.type = 'show';
      const mockTvResponse: OmbiSearchTvResponse = {
        tmdbId: 456,
        title: 'Test Show',
        request: {
          id: 2,
          title: 'Test Show',
          requestedDate: '2023-01-01',
          approved: true,
          available: false,
          tmdbId: 456,
        },
      };

      ombiApi.getShowByTmdbId.mockResolvedValue(mockTvResponse);

      const result = await ombiGetterService.get(6, plexLibraryItem);

      expect(result).toBe(1);
    });
  });

  describe('error handling', () => {
    let plexLibraryItem: PlexLibraryItem;

    beforeEach(() => {
      plexLibraryItem = createPlexLibraryItem('movie');
      tmdbIdService.getTmdbIdFromPlexData.mockResolvedValue({
        type: 'movie',
        id: 123,
      });
    });

    it('should handle API errors gracefully', async () => {
      ombiApi.getMovie.mockRejectedValue(new Error('API Error'));

      const result = await ombiGetterService.get(1, plexLibraryItem);

      expect(result).toBeUndefined();
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Ombi-Getter - Action failed'),
      );
    });

    it('should handle missing TMDB ID gracefully', async () => {
      tmdbIdService.getTmdbIdFromPlexData.mockResolvedValue(null);

      const result = await ombiGetterService.get(1, plexLibraryItem);

      expect(result).toBeNull();
      expect(logger.debug).toHaveBeenCalledWith(
        expect.stringContaining("Couldn't find tmdb id"),
      );
    });

    it('should handle unknown property gracefully', async () => {
      const mockMovieResponse: OmbiSearchMovieResponse = {
        tmdbId: 123,
        title: 'Test Movie',
        request: {
          id: 1,
          title: 'Test Movie',
          requestedDate: '2023-01-01',
          approved: true,
          available: false,
          tmdbId: 123,
        },
      };

      ombiApi.getMovie.mockResolvedValue(mockMovieResponse);

      const result = await ombiGetterService.get(99, plexLibraryItem); // Unknown property ID

      expect(result).toBeNull();
    });
  });
});