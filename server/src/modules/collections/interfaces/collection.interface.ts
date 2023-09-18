import { EPlexDataType } from 'src/modules/api/plex-api/enums/plex-data-type-enum';
import { CollectionMedia } from '../entities/collection_media.entities';

export interface ICollection {
  id?: number;
  type: EPlexDataType;
  plexId?: number;
  libraryId: number;
  title: string;
  description?: string;
  isActive: boolean;
  arrAction: number;
  visibleOnHome?: boolean;
  listExclusions?: boolean;
  deleteAfterDays?: number; // amount of days after add
  media?: CollectionMedia[];
  manualCollection?: boolean;
  manualCollectionName?: string;
}

export enum ServarrAction {
  DELETE,
  DELETE_UNMONITOR_ALL,
  DELETE_UNMONITOR_EXISTING,
  UNMONITOR,
}
