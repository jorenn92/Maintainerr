import { CollectionMedia } from '../entities/collection_media.entities';

export interface ICollection {
  id?: number;
  type: 1 | 2;
  plexId?: number;
  libraryId: number;
  title: string;
  description?: string;
  isActive: boolean;
  arrAction: number;
  visibleOnHome?: boolean;
  deleteAfterDays?: number; // amount of days after add
  media?: CollectionMedia[];
}
