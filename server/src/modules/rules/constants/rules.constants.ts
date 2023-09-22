import { EPlexDataType } from 'src/modules/api/plex-api/enums/plex-data-type-enum';

export const enum RulePossibility {
  BIGGER,
  SMALLER,
  EQUALS,
  NOT_EQUALS,
  CONTAINS,
  BEFORE,
  AFTER,
  IN_LAST,
  IN_NEXT,
  NOT_CONTAINS,
}

export const enum RuleOperators {
  AND,
  OR,
}

export const enum Application {
  PLEX,
  RADARR,
  SONARR,
  OVERSEERR,
}

export const enum ArrAction {
  DELETE,
  UNMONITOR, // this also deletes
  SW_UNMONITOR_EXISTING_SEASONS,
  UNMONITOR_NO_DELETE,
}

export const enum MediaType {
  BOTH,
  MOVIE,
  SHOW,
}

export class RuleType {
  static readonly NUMBER = new RuleType('0', [
    RulePossibility.BIGGER,
    RulePossibility.SMALLER,
    RulePossibility.EQUALS,
    RulePossibility.NOT_EQUALS,
    RulePossibility.CONTAINS,
    RulePossibility.NOT_CONTAINS,
  ]);
  static readonly DATE = new RuleType('1', [
    RulePossibility.EQUALS,
    RulePossibility.NOT_EQUALS,
    RulePossibility.BEFORE,
    RulePossibility.AFTER,
    RulePossibility.IN_LAST,
    RulePossibility.IN_NEXT,
  ]);
  static readonly TEXT = new RuleType('2', [
    RulePossibility.EQUALS,
    RulePossibility.NOT_EQUALS,
    RulePossibility.CONTAINS,
    RulePossibility.NOT_CONTAINS,
  ]);
  static readonly BOOL = new RuleType('3', [
    RulePossibility.EQUALS,
    RulePossibility.NOT_EQUALS,
  ]);
  private constructor(
    private readonly key: string,
    public readonly possibilities: number[],
  ) {}
  toString() {
    return this.key;
  }
}

export interface Property {
  id: number;
  name: string;
  type: RuleType;
  mediaType: MediaType;
  humanName: string;
}

export interface ApplicationProperties {
  id: number;
  name: string;
  description?: string;
  mediaType: MediaType;
  props: Property[];
  showType?: EPlexDataType[]; // if not configured = available for all types
}
export class RuleConstants {
  applications: ApplicationProperties[] = [
    {
      id: Application.PLEX,
      name: 'Plex',
      mediaType: MediaType.BOTH,
      props: [
        {
          id: 0,
          name: 'addDate',
          humanName: 'Date added',
          mediaType: MediaType.BOTH,
          type: RuleType.DATE,
        } as Property,
        {
          id: 1,
          name: 'seenBy',
          humanName: 'Viewed by (list of usernames)',
          mediaType: MediaType.MOVIE,
          type: RuleType.TEXT, // returns id[]
        } as Property,
        {
          id: 2,
          name: 'releaseDate',
          humanName: 'Release date',
          mediaType: MediaType.BOTH,
          type: RuleType.DATE,
        } as Property,
        {
          id: 3,
          name: 'rating',
          humanName: 'Rating',
          mediaType: MediaType.BOTH,
          type: RuleType.NUMBER,
        } as Property,
        {
          id: 4,
          name: 'people',
          humanName: 'People involved (list of names)',
          mediaType: MediaType.BOTH,
          type: RuleType.TEXT, // return text[]
        } as Property,
        {
          id: 5,
          name: 'viewCount',
          humanName: 'Times viewed',
          mediaType: MediaType.MOVIE,
          type: RuleType.NUMBER,
        } as Property,
        {
          id: 6,
          name: 'collections',
          humanName: 'Present in amount of other collections',
          mediaType: MediaType.BOTH,
          type: RuleType.NUMBER,
        } as Property,
        {
          id: 7,
          name: 'lastViewedAt',
          humanName: 'Last view date',
          mediaType: MediaType.BOTH,
          type: RuleType.DATE,
        } as Property,
        {
          id: 8,
          name: 'fileVideoResolution',
          humanName: 'Media file resolution (4k, 1080,..)',
          mediaType: MediaType.MOVIE,
          type: RuleType.TEXT,
        } as Property,
        {
          id: 9,
          name: 'fileBitrate',
          humanName: 'Media file bitrate',
          mediaType: MediaType.MOVIE,
          type: RuleType.NUMBER,
        } as Property,
        {
          id: 10,
          name: 'fileVideoCodec',
          humanName: 'Media file codec',
          mediaType: MediaType.MOVIE,
          type: RuleType.TEXT,
        } as Property,
        {
          id: 11,
          name: 'genre',
          humanName: 'List of genres (Action, Adventure,..)',
          mediaType: MediaType.BOTH,
          type: RuleType.TEXT, // return text[]
        } as Property,
        {
          id: 12,
          name: 'sw_allEpisodesSeenBy',
          humanName: 'Users that saw all available episodes',
          mediaType: MediaType.SHOW,
          type: RuleType.TEXT, // return usernames []
          showType: [EPlexDataType.SHOWS, EPlexDataType.SEASONS],
        } as Property,
        {
          id: 13,
          name: 'sw_lastWatched',
          humanName: 'Newest episode view date',
          mediaType: MediaType.SHOW,
          type: RuleType.DATE,
          showType: [EPlexDataType.SHOWS, EPlexDataType.SEASONS],
        } as Property,
        {
          id: 14,
          name: 'sw_episodes',
          humanName: 'Amount of available episodes',
          mediaType: MediaType.SHOW,
          type: RuleType.NUMBER,
          showType: [EPlexDataType.SHOWS, EPlexDataType.SEASONS],
        } as Property,
        {
          id: 15,
          name: 'sw_viewedEpisodes',
          humanName: 'Amount of watched episodes',
          mediaType: MediaType.SHOW,
          type: RuleType.NUMBER,
          showType: [EPlexDataType.SHOWS, EPlexDataType.SEASONS],
        } as Property,
        {
          id: 16,
          name: 'sw_lastEpisodeAddedAt',
          humanName: 'Last episode added at',
          mediaType: MediaType.SHOW,
          type: RuleType.DATE,
          showType: [EPlexDataType.SHOWS, EPlexDataType.SEASONS],
        } as Property,
        {
          id: 17,
          name: 'sw_amountOfViews',
          humanName: 'Total views',
          mediaType: MediaType.SHOW,
          type: RuleType.NUMBER,
        } as Property,
        {
          id: 18,
          name: 'sw_watchers',
          humanName: 'Users that watch the show/season',
          mediaType: MediaType.SHOW,
          type: RuleType.TEXT, // return usernames []
          showType: [EPlexDataType.SHOWS, EPlexDataType.SEASONS],
        } as Property,
        {
          id: 19,
          name: 'collection_names',
          humanName: 'Collections media is present in (list of titles)',
          mediaType: MediaType.BOTH,
          type: RuleType.TEXT,
        } as Property,
      ],
    },
    {
      id: Application.RADARR,
      name: 'Radarr',
      mediaType: MediaType.MOVIE,
      props: [
        {
          id: 0,
          name: 'addDate',
          humanName: 'Date added',
          mediaType: MediaType.MOVIE,
          type: RuleType.DATE,
        } as Property,
        {
          id: 1,
          name: 'fileDate',
          humanName: 'Date file downloaded',
          mediaType: MediaType.MOVIE,
          type: RuleType.DATE,
        } as Property,
        {
          id: 2,
          name: 'tags',
          humanName: 'Tags (Text if 1, otherwise list)',
          mediaType: MediaType.MOVIE,
          type: RuleType.TEXT, // return text[]
        } as Property,
        {
          id: 3,
          name: 'profile',
          humanName: 'Quality profile',
          mediaType: MediaType.MOVIE,
          type: RuleType.TEXT,
        } as Property, // TODO
        {
          id: 4,
          name: 'releaseDate',
          humanName: 'Release date',
          mediaType: MediaType.MOVIE,
          type: RuleType.DATE,
        } as Property,
        {
          id: 5,
          name: 'monitored',
          humanName: 'is monitored',
          mediaType: MediaType.MOVIE,
          type: RuleType.BOOL,
        } as Property,
        {
          id: 6,
          name: 'inCinemas',
          humanName: 'In cinemas date',
          mediaType: MediaType.MOVIE,
          type: RuleType.DATE,
        } as Property,
        {
          id: 7,
          name: 'fileSize',
          humanName: 'File - size in MB',
          mediaType: MediaType.MOVIE,
          type: RuleType.NUMBER,
        } as Property,
        {
          id: 8,
          name: 'fileAudioChannels',
          humanName: 'File - audio channels',
          mediaType: MediaType.MOVIE,
          type: RuleType.NUMBER,
        } as Property,
        {
          id: 9,
          name: 'fileQuality',
          humanName: 'File - quality (2160, 1080,..)',
          mediaType: MediaType.MOVIE,
          type: RuleType.NUMBER,
        } as Property,
        {
          id: 10,
          name: 'fileDate',
          humanName: 'File - download date',
          mediaType: MediaType.MOVIE,
          type: RuleType.DATE,
        } as Property,
        {
          id: 11,
          name: 'runTime',
          humanName: 'File - runtime in minutes',
          mediaType: MediaType.MOVIE,
          type: RuleType.NUMBER,
        } as Property,
      ],
    },
    {
      id: Application.SONARR,
      name: 'Sonarr',
      mediaType: MediaType.SHOW,
      props: [
        {
          id: 0,
          name: 'addDate',
          humanName: 'Date added',
          mediaType: MediaType.SHOW,
          type: RuleType.DATE,
          showType: [EPlexDataType.SHOWS],
        } as Property,
        {
          id: 1,
          name: 'diskSizeEntireShow',
          humanName: 'Files - Disk size in MB ',
          mediaType: MediaType.SHOW,
          type: RuleType.NUMBER,
          showType: [
            EPlexDataType.SHOWS,
            EPlexDataType.SEASONS,
            EPlexDataType.EPISODES,
          ],
        } as Property,
        {
          id: 2,
          name: 'tags',
          humanName: 'Tags (show)',
          mediaType: MediaType.SHOW,
          type: RuleType.TEXT, // return text[]
        } as Property,
        {
          id: 3,
          name: 'qualityProfileId',
          humanName: 'Quality profile ID',
          mediaType: MediaType.SHOW,
          type: RuleType.NUMBER,
        } as Property,
        {
          id: 4,
          name: 'firstAirDate',
          humanName: 'First air date',
          mediaType: MediaType.SHOW,
          type: RuleType.DATE,
        } as Property,
        {
          id: 5,
          name: 'seasons',
          humanName: 'Number of seasons / episodes',
          mediaType: MediaType.SHOW,
          type: RuleType.NUMBER,
          showType: [EPlexDataType.SHOWS, EPlexDataType.SEASONS],
        } as Property,
        {
          id: 6,
          name: 'status (continuing, ended)',
          humanName: 'Status',
          mediaType: MediaType.SHOW,
          type: RuleType.TEXT,
          showType: [EPlexDataType.SHOWS],
        } as Property,
        {
          id: 7,
          name: 'ended',
          humanName: 'Show ended',
          mediaType: MediaType.SHOW,
          type: RuleType.BOOL,
          showType: [EPlexDataType.SHOWS],
        } as Property,
        {
          id: 8,
          name: 'monitored',
          humanName: 'Is monitored (deprecated)',
          mediaType: MediaType.SHOW,
          type: RuleType.NUMBER,
        } as Property,
        {
          id: 9,
          name: 'monitored',
          humanName: 'Is monitored',
          mediaType: MediaType.SHOW,
          type: RuleType.BOOL,
        } as Property,
      ],
    },
    {
      id: Application.OVERSEERR,
      name: 'Overseerr',
      mediaType: MediaType.BOTH,
      props: [
        {
          id: 0,
          name: 'addUser',
          humanName: 'Requested by user (Plex username)',
          mediaType: MediaType.BOTH,
          type: RuleType.TEXT,
        } as Property, //  returns username[]
        {
          id: 1,
          name: 'requestDate',
          humanName: 'Request date',
          mediaType: MediaType.BOTH,
          type: RuleType.DATE,
        } as Property,
        {
          id: 2,
          name: 'releaseDate',
          humanName: 'Release/air date',
          mediaType: MediaType.BOTH,
          type: RuleType.DATE,
        } as Property,
        {
          id: 3,
          name: 'approvalDate',
          humanName: 'Approval date',
          mediaType: MediaType.BOTH,
          type: RuleType.DATE,
        } as Property,
        {
          id: 4,
          name: 'mediaAddedAt',
          humanName: 'Media downloaded date',
          mediaType: MediaType.BOTH,
          type: RuleType.DATE,
        } as Property,
        {
          id: 5,
          name: 'amountRequested',
          humanName: 'Amount of requests',
          mediaType: MediaType.BOTH,
          type: RuleType.NUMBER,
        } as Property,
        {
          id: 6,
          name: 'isRequested',
          humanName: 'Requested in Overseerr',
          mediaType: MediaType.BOTH,
          type: RuleType.BOOL,
        } as Property,
      ],
    },
  ];
}
