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
}

export interface CreateUpdateCollection {
  libraryId: string;
  collectionId?: number | string;
  type: 1 | 2;
  title?: string;
  summary?: string;
  child?: string;
}
