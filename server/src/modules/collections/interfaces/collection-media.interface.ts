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
