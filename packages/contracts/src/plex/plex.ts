// these numbers equal the Plex API media types
export enum EPlexDataType {
  MOVIES = 1,
  SHOWS = 2,
  SEASONS = 3,
  EPISODES = 4,
}

// EPlexDataType values as strings
export const PlexDataTypeStrings: string[] = [
  'MOVIES',
  'SHOWS',
  'SEASONS',
  'EPISODES',
]

export interface PlexMetadata {
  ratingKey: string
  parentRatingKey?: string
  guid: string
  type: 'movie' | 'show' | 'season' | 'episode' | 'collection'
  title: string
  Guid: {
    id: string
  }[]
  Children?: {
    size: 12
    Metadata: PlexMetadata[]
  }
  index: number
  parentIndex?: number
  Collection?: { tag: string }[]
  leafCount: number
  grandparentRatingKey?: string
  viewedLeafCount: number
  addedAt: number
  updatedAt: number
  media?: Media[]
  parentData?: PlexMetadata
  Label?: { tag: string }[]
  rating?: number
  audienceRating?: number
  userRating?: number
  Role?: PlexActor[]
  originallyAvailableAt?: string
  Media?: Media[]
  Genre?: PlexGenre[]
  parentTitle?: string
  grandparentTitle?: string
  Rating?: PlexRating[]
  summary: string
  parentYear?: number
  year?: number
  contentRating?: string
}

export interface Media {
  id: number
  duration: number
  bitrate: number
  width: number
  height: number
  aspectRatio: number
  audioChannels: number
  audioCodec: string
  videoCodec: string
  videoResolution: string
  container: string
  videoFrameRate: string
  videoProfile: string
}

export interface PlexGenre {
  id: number
  filter: string
  tag: string
}

export interface PlexActor {
  id: number
  filter: string
  tag: string // contains name
  role: string
  thumb: string
}

export interface PlexRating {
  image: string
  value: number
  type: 'audience' | 'critic'
}
