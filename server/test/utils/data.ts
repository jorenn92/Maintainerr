import { faker } from '@faker-js/faker';
import {
  CollectionMediaDto,
  CollectionMediaWithPlexDataDto,
  EPlexDataType,
  PlexMetadata,
  ServarrAction,
} from '@maintainerr/contracts';
import { PlexLibrary } from '../../src/modules/api/plex-api/interfaces/library.interfaces';
import {
  RadarrMovie,
  RadarrMovieFile,
} from '../../src/modules/api/servarr-api/interfaces/radarr.interface';
import {
  SonarrSeries,
  SonarrSeriesStatusTypes,
  SonarrSeriesTypes,
} from '../../src/modules/api/servarr-api/interfaces/sonarr.interface';
import { Collection } from '../../src/modules/collections/entities/collection.entities';
import { CollectionMedia } from '../../src/modules/collections/entities/collection_media.entities';

export const createCollection = (
  properties: Partial<Collection> = {},
): Collection => {
  return {
    id: faker.number.int(),
    title: faker.string.sample(10),
    description: '',
    isActive: true,
    arrAction: ServarrAction.DELETE,
    type: EPlexDataType.MOVIES,
    libraryId: faker.number.int(),
    plexId: faker.number.int(),
    addDate: faker.date.past(),
    collectionLog: [],
    collectionMedia: [],
    deleteAfterDays: 30,
    forceOverseerr: false,
    handledMediaAmount: 0,
    keepLogsForMonths: 6,
    lastDurationInSeconds: 0,
    manualCollection: false,
    manualCollectionName: undefined,
    radarrSettings: undefined,
    radarrSettingsId: undefined,
    sonarrSettings: undefined,
    sonarrSettingsId: undefined,
    listExclusions: false,
    ruleGroup: undefined,
    visibleOnHome: false,
    visibleOnRecommended: false,
    tautulliWatchedPercentOverride: undefined,
    ...properties,
  };
};

export const createCollectionMedia = (
  collection?: Collection,
  type?: PlexMetadata['type'],
  properties: Partial<CollectionMedia> = {},
): CollectionMedia => {
  const collectionToUse = collection ?? createCollection();

  return {
    id: faker.number.int(),
    collection: collectionToUse,
    collectionId: collectionToUse.id,
    addDate: faker.date.past(),
    image_path: '',
    isManual: false,
    plexId: faker.number.int(),
    tmdbId: faker.number.int(),
    ...properties,
  };
};

export const createCollectionMediaWithPlexData = (
  collection?: Collection,
  type?: PlexMetadata['type'],
  properties: Partial<CollectionMediaDto> = {},
): CollectionMediaWithPlexDataDto => {
  return {
    ...createCollectionMedia(collection, type, properties),
    plexData: {
      index: faker.number.int(),
      addedAt: faker.date.past().getTime(),
      updatedAt: faker.date.past().getTime(),
      title: faker.string.sample(10),
      type:
        type ??
        faker.helpers.arrayElement(['movie', 'show', 'season', 'episode']),
      Guid: faker.helpers.arrayElements([
        {
          id: faker.string.uuid(),
        },
        {
          id: faker.string.uuid(),
        },
      ]),
      guid: faker.string.uuid(),
      leafCount: faker.number.int(),
      viewedLeafCount: faker.number.int(),
      summary: faker.string.sample(10),
      ratingKey: faker.string.uuid(),
    },
    ...properties,
  } satisfies CollectionMediaWithPlexDataDto;
};

export const createPlexLibraries = (
  properties: Partial<PlexLibrary> = {},
): PlexLibrary[] => {
  return [
    createPlexLibrary(properties),
    createPlexLibrary(),
    createPlexLibrary(),
  ];
};

export const createPlexLibrary = (
  properties: Partial<PlexLibrary> = {},
): PlexLibrary => ({
  agent: faker.string.sample(10),
  type: faker.helpers.arrayElement(['movie', 'show']),
  key: faker.string.sample(10),
  title: faker.string.sample(10),
  ...properties,
});

export const createRadarrMovie = (
  properties: Partial<RadarrMovie> = {},
): RadarrMovie => ({
  title: faker.string.sample(10),
  originalLanguage: {
    id: 1,
    name: 'English',
  },
  downloaded: faker.datatype.boolean(),
  id: faker.number.int(),
  hasFile: faker.datatype.boolean(),
  monitored: faker.datatype.boolean(),
  added: faker.date.past().toISOString(),
  inCinemas: faker.date.past().toISOString(),
  physicalRelease: faker.date.past().toISOString(),
  digitalRelease: faker.date.past().toISOString(),
  folderName: faker.system.directoryPath(),
  isAvailable: faker.datatype.boolean(),
  imdbId: faker.string.sample(10),
  path: faker.system.directoryPath(),
  tmdbId: faker.number.int(),
  qualityProfileId: faker.number.int(),
  movieFile: {
    id: faker.number.int(),
    dateAdded: faker.date.past().toISOString(),
  } as RadarrMovieFile,
  ratings: {
    imdb: {
      votes: faker.number.int(),
      value: faker.number.float({ min: 0, max: 10 }),
      type: 'user',
    },
    tmdb: {
      votes: faker.number.int(),
      value: faker.number.float({ min: 0, max: 10 }),
      type: 'user',
    },
    metacritic: {
      votes: faker.number.int(),
      value: faker.number.float({ min: 0, max: 10 }),
      type: 'user',
    },
    rottenTomatoes: {
      votes: faker.number.int(),
      value: faker.number.float({ min: 0, max: 10 }),
      type: 'user',
    },
    trakt: {
      votes: faker.number.int(),
      value: faker.number.float({ min: 0, max: 10 }),
      type: 'user',
    },
  },
  sizeOnDisk: faker.number.int(),
  tags: [],
  titleSlug: faker.string.sample(10),
  ...properties,
});

export const createSonarrSeries = (
  properties: Partial<SonarrSeries> = {},
): SonarrSeries => {
  const title = faker.string.sample(10);

  return {
    title,
    originalLanguage: {
      id: 1,
      name: 'English',
    },
    id: faker.number.int(),
    monitored: faker.datatype.boolean(),
    added: faker.date.past().toISOString(),
    imdbId: faker.string.sample(10),
    path: faker.system.directoryPath(),
    tvdbId: faker.number.int(),
    qualityProfileId: faker.number.int(),
    ratings: {
      votes: faker.number.int(),
      value: faker.number.float({ min: 0, max: 10 }),
    },
    tags: [],
    titleSlug: faker.string.sample(10),
    sortTitle: title,
    status: faker.helpers.arrayElement(SonarrSeriesStatusTypes),
    overview: faker.string.sample(10),
    network: faker.string.sample(10),
    airTime: `${faker.number.int({ min: 0, max: 23 })}:${faker.number.int({
      min: 0,
      max: 59,
    })}`,
    images: [
      {
        coverType: 'poster',
        url: faker.system.filePath(),
      },
      {
        coverType: 'banner',
        url: faker.system.filePath(),
      },
    ],
    remotePoster: faker.internet.url(),
    seasons: [
      {
        seasonNumber: 0,
        monitored: faker.datatype.boolean(),
      },
      {
        seasonNumber: 1,
        monitored: faker.datatype.boolean(),
      },
      {
        seasonNumber: 2,
        monitored: faker.datatype.boolean(),
      },
    ],
    year: faker.number.int(),
    seasonFolder: faker.datatype.boolean(),
    useSceneNumbering: faker.datatype.boolean(),
    runtime: faker.number.int({ min: 0, max: 120 }),
    tvRageId: faker.number.int(),
    tvMazeId: faker.number.int(),
    firstAired: faker.date.past().toISOString(),
    seriesType: faker.helpers.arrayElement(SonarrSeriesTypes),
    cleanTitle: title.replace(/\s+/g, '-').toLowerCase(),
    certification: faker.string.sample(10),
    genres: [faker.string.sample(10), faker.string.sample(10)],
    ...properties,
  };
};
