export interface RadarrMovieOptions {
  title: string;
  qualityProfileId: number;
  minimumAvailability: string;
  tags: number[];
  profileId: number;
  year: number;
  rootFolderPath: string;
  tmdbId: number;
  monitored?: boolean;
  searchNow?: boolean;
}

export interface RadarrMovie {
  id: number;
  title: string;
  isAvailable: boolean;
  monitored: boolean;
  tmdbId: number;
  imdbId: string;
  titleSlug: string;
  folderName: string;
  path: string;
  profileId: number;
  qualityProfileId: number;
  added: string;
  downloaded: boolean;
  hasFile: boolean;
  movieFile: RadarrMovieFile;
  sizeOnDisk: number;
  physicalRelease: string;
  digitalRelease: string;
  inCinemas: string;
}

export interface RadarrMediaInfo {
  audioAdditionalFeatures: string;
  audioBitrate: number;
  audioChannels: number;
  audioCodec: string;
  audioLanguages: string;
  audioStreamCount: number;
  videoBitDepth: number;
  videoBitrate: number;
  videoCodec: string;
  videoFps: number;
  resolution: string;
  runTime: string;
  scanType: string;
  subtitles: string;
}

export interface RadarrMovieFile {
  id: number;
  dateAdded: string;
  quality: RadarrQualityContainer;
  size: number;
  mediainfo: RadarrMediaInfo;
}

export interface RadarrQualityContainer {
  quality: RadarrQuality;
}

export interface RadarrQuality {
  id: number;
  name: string;
  source: string;
  resolution: number;
  modifier: string;
}
