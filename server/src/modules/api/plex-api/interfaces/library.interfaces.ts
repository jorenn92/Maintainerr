import { PlexMetadata, PlexPlaylist } from '@maintainerr/contracts';
import { PlexCollection } from './collection.interface';

export interface PlexLibraryResponse {
  MediaContainer: {
    size: number;
    totalSize?: number;
    Metadata?:
      | PlexMetadata[]
      | PlexCollection[]
      | PlexCollection
      | PlexPlaylist[];
  };
}

export interface PlexLibrary {
  type: 'show' | 'movie' | 'artist';
  key: string;
  title: string;
  agent: string;
}

export interface PlexLibrariesResponse {
  MediaContainer: {
    totalSize: number;
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

export interface SimplePlexUser {
  plexId: number;
  username: string;
  uuid?: string;
}
export interface PlexUserResponse {
  Account: PlexUserAccount[];
}
export interface PlexUserAccount {
  id: number;
  key: string;
  name: string;
  defaultAudioLanguage: string;
  autoSelectAudio: true;
  defaultSubtitleLanguage: string;
  subtitleMode: number;
  thumb: string;
}

export interface PlexSeenBy {
  historyKey: string;
  key: string;
  ratingKey: string;
  title: string;
  thumb: string;
  originallyAvailableAt: string;
  viewedAt: number;
  accountID: number;
  deviceID: number;
  parentRatingKey?: string;
  grandparentRatingKey?: string;
  parentTitle?: string;
  type: 'movie' | 'episode';
  librarySectionID: number;
  index?: number;
  parentIndex?: number;
}
