export const enum RulePossibility {
  BIGGER,
  SMALLER,
  EQUALS,
  CONTAINS,
  BEFORE,
  AFTER,
  IN_LAST,
  IN_NEXT,
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

export class RuleType {
  static readonly NUMBER = new RuleType('0', [
    RulePossibility.BIGGER,
    RulePossibility.SMALLER,
    RulePossibility.EQUALS,
    RulePossibility.CONTAINS,
  ]);
  static readonly DATE = new RuleType('1', [
    RulePossibility.BIGGER,
    RulePossibility.SMALLER,
    RulePossibility.EQUALS,
    RulePossibility.BEFORE,
    RulePossibility.AFTER,
    RulePossibility.IN_LAST,
    RulePossibility.IN_NEXT,
    RulePossibility.CONTAINS,
  ]);
  static readonly TEXT = new RuleType('2', [
    RulePossibility.EQUALS,
    RulePossibility.CONTAINS,
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
}

export interface ApplicationProperties {
  id: number;
  name: string;
  description?: string;
  props: Property[];
}
export class RuleConstants {
  applications: ApplicationProperties[] = [
    {
      id: Application.PLEX,
      name: 'Plex',
      props: [
        {
          id: 0,
          name: 'addDate',
          type: RuleType.DATE,
        } as Property,
        {
          id: 1,
          name: 'seenBy',
          type: RuleType.NUMBER, // returns id[]
        } as Property,
        {
          id: 2,
          name: 'releaseDate',
          type: RuleType.TEXT,
        } as Property,
        {
          id: 3,
          name: 'rating',
          type: RuleType.NUMBER,
        } as Property,
        {
          id: 4,
          name: 'people',
          type: RuleType.TEXT, // return text[]
        } as Property,
        {
          id: 5,
          name: 'viewCount',
          type: RuleType.NUMBER,
        } as Property,

        {
          id: 6,
          name: 'collections',
          type: RuleType.NUMBER,
        } as Property,
        {
          id: 7,
          name: 'lastViewedAt',
          type: RuleType.DATE,
        } as Property,
        {
          id: 8,
          name: 'fileVideoResolution',
          type: RuleType.TEXT,
        } as Property,
        {
          id: 9,
          name: 'fileBitrate',
          type: RuleType.NUMBER,
        } as Property,
        {
          id: 10,
          name: 'fileVideoCodec',
          type: RuleType.TEXT,
        } as Property,
        {
          id: 11,
          name: 'genre',
          type: RuleType.TEXT, // return text[]
        } as Property,
        {
          id: 12,
          name: 'sw_allEpisodesSeenBy',
          type: RuleType.NUMBER, // return id's []
        } as Property,
        {
          id: 13,
          name: 'sw_lastWatched',
          type: RuleType.DATE,
        } as Property,
        {
          id: 14,
          name: 'sw_episodes',
          type: RuleType.NUMBER,
        } as Property,
        {
          id: 15,
          name: 'sw_viewedEpisodes',
          type: RuleType.NUMBER,
        } as Property,
        {
          id: 16,
          name: 'sw_lastEpisodeAddedAt',
          type: RuleType.DATE,
        } as Property,
      ],
    },
    {
      id: Application.RADARR,
      name: 'Radarr',
      props: [
        { id: 0, name: 'addDate', type: RuleType.DATE } as Property,
        {
          id: 1,
          name: 'fileDate',
          type: RuleType.DATE,
        } as Property,
        {
          id: 2,
          name: 'tags',
          type: RuleType.TEXT, // return text[]
        } as Property,
        { id: 3, name: 'profile', type: RuleType.TEXT } as Property, // TODO
        { id: 4, name: 'fileSize', type: RuleType.NUMBER } as Property,
        {
          id: 5,
          name: 'releaseDate',
          type: RuleType.DATE,
        } as Property,
        { id: 6, name: 'monitored', type: RuleType.NUMBER } as Property,
        { id: 7, name: 'inCinemas', type: RuleType.DATE } as Property,
        { id: 8, name: 'fileAudioChannels', type: RuleType.NUMBER } as Property,
        { id: 9, name: 'fileQuality', type: RuleType.NUMBER } as Property,
        { id: 10, name: 'fileDate', type: RuleType.NUMBER } as Property,
        { id: 11, name: 'runTime', type: RuleType.NUMBER } as Property,
      ],
    },
    {
      id: Application.SONARR,
      name: 'Sonarr',
      props: [
        { id: 0, name: 'addDate', type: RuleType.DATE } as Property,
        {
          id: 1,
          name: 'diskSizeEntireShow',
          type: RuleType.DATE,
        } as Property,
        {
          id: 2,
          name: 'tags',
          type: RuleType.TEXT, // return text[]
        } as Property,
        { id: 3, name: 'qualityProfileId', type: RuleType.NUMBER } as Property,
        {
          id: 4,
          name: 'firstAirDate',
          type: RuleType.DATE,
        } as Property,
        {
          id: 5,
          name: 'seasons',
          type: RuleType.NUMBER,
        } as Property,
        {
          id: 6,
          name: 'status',
          type: RuleType.TEXT,
        } as Property,
        {
          id: 7,
          name: 'ended',
          type: RuleType.NUMBER,
        } as Property,
        {
          id: 8,
          name: 'monitored',
          type: RuleType.NUMBER,
        } as Property,
      ],
    },
    {
      id: Application.OVERSEERR,
      name: 'Overseerr',
      props: [
        { id: 0, name: 'addUser', type: RuleType.NUMBER } as Property, //  returns id[]
        {
          id: 1,
          name: 'requestDate',
          type: RuleType.DATE,
        } as Property,
        {
          id: 2,
          name: 'releaseDate',
          type: RuleType.DATE,
        } as Property,
        {
          id: 3,
          name: 'approvalDate',
          type: RuleType.DATE,
        } as Property,
        {
          id: 4,
          name: 'mediaAddedAt',
          type: RuleType.DATE,
        } as Property,
      ],
    },
  ];
}
