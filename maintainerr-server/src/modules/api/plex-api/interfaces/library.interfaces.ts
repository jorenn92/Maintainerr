import { PlexCollection } from './collection.interface';
import { Media } from './media.interface';

export interface PlexLibraryItem {
  ratingKey: string;
  parentRatingKey?: string;
  grandparentRatingKey?: string;
  title: string;
  guid: string;
  parentGuid?: string;
  grandparentGuid?: string;
  addedAt: number;
  updatedAt: number;
  Guid?: {
    id: string;
  }[];
  type: 'movie' | 'show' | 'season' | 'episode' | 'collection';
  Media: Media[];
}

export interface PlexLibraryResponse {
  MediaContainer: {
    totalSize: number;
    Metadata: PlexLibraryItem[] | PlexCollection[];
  };
}

export interface PlexLibrary {
  type: 'show' | 'movie';
  key: string;
  title: string;
  agent: string;
}

export interface PlexLibrariesResponse {
  MediaContainer: {
    Directory: PlexLibrary[];
  };
}

export interface PlexHubResponse {
  MediaContainer: {
    Size: string;
    Hub: PlexHub[];
  };
}

export interface PlexHub {
  identifier: string;
  title: string;
  recommendationsVisibility: 'none' | string;
  homeVisibility: 'none' | string;
  promotedToRecommended: boolean;
  promotedToOwnHome: boolean;
  promotedToSharedHome: boolean;
  deletable: boolean;
}
