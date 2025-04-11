import { EPlexDataType } from '../enums/plex-data-type-enum';

export class PlexCollection {
  ratingKey: string;
  key: string;
  guid: string;
  type: string;
  title: string;
  subtype: string;
  summary: string;
  index: number;
  ratingCount: number;
  thumb: string;
  addedAt: number;
  updatedAt: number;
  childCount: string;
  maxYear: string;
  minYear: string;
  smart?: boolean;
}

export interface PlexCollectionResponse {
  MediaContainer: {
    size: number;
    totalSize?: number; // Present when paging
    Metadata?: PlexCollection[];
  };
}

export interface CreateCollection {
  libraryId: string;
  type: EPlexDataType;
  title: string;
  summary?: string;
  child?: string;
}

export interface UpdateCollection extends CreateCollection {
  collectionId: number | string;
}

export interface PlexPlaylist {
  ratingKey: string;
  key: string;
  guid: string;
  type: string;
  title: string;
  summary: string;
  smart: boolean;
  playlistType: string;
  composite: string;
  viewCount: number;
  lastViewedAt: number;
  duration: number;
  leafCount: number;
  addedAt: number;
  updatedAt: number;
  itemCount: number;
}
