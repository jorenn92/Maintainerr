import { EPlexDataType } from 'src/modules/api/plex-api/enums/plex-data-type-enum';

export interface ICollectionMedia {
  id: number;
  collectionId: number;
  plexId: number;
  tmdbId: number;
  tvdbid: number;
  addDate: Date;
}

export interface AddCollectionMedia {
  plexId: number;
}

export interface IAlterableMediaDto {
  id: number;
  index?: number;
  parenIndex?: number;
  type: EPlexDataType;
}
