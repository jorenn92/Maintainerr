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
  ]);
  static readonly DATE = new RuleType('1', [
    RulePossibility.BIGGER,
    RulePossibility.SMALLER,
    RulePossibility.EQUALS,
    RulePossibility.BEFORE,
    RulePossibility.AFTER,
    RulePossibility.IN_LAST,
    RulePossibility.IN_NEXT,
  ]);
  static readonly TEXT = new RuleType('2', [
    RulePossibility.EQUALS,
    RulePossibility.CONTAINS,
  ]);
  static readonly USER = new RuleType('3', [RulePossibility.EQUALS]);
  static readonly NUMBERGROUP = new RuleType('4', [RulePossibility.CONTAINS]);
  static readonly DATEGROUP = new RuleType('5', [RulePossibility.CONTAINS]);
  static readonly TEXTGROUP = new RuleType('6', [RulePossibility.CONTAINS]);
  static readonly USERGROUP = new RuleType('7', [RulePossibility.CONTAINS]);

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
          type: RuleType.USERGROUP,
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
          type: RuleType.TEXTGROUP,
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
          type: RuleType.TEXTGROUP,
        } as Property,
      ],
    },
    {
      id: Application.RADARR,
      name: 'Radarr',
      props: [
        { id: 0, name: 'addDate', type: RuleType.DATE, apiLoc: '' } as Property,
        {
          id: 1,
          name: 'fileDate',
          type: RuleType.DATE,
        } as Property,
        {
          id: 2,
          name: 'tags',
          type: RuleType.TEXTGROUP,
        } as Property,
        { id: 3, name: 'profile', type: RuleType.TEXT } as Property,
        { id: 4, name: 'size', type: RuleType.NUMBER } as Property,
        {
          id: 5,
          name: 'releaseDate',
          type: RuleType.DATE,
        } as Property,
      ],
    },
    {
      id: Application.SONARR,
      name: 'Sonarr',
      props: [
        { id: 0, name: 'addDate', type: RuleType.DATE, apiLoc: '' } as Property,
        {
          id: 1,
          name: 'fileDate',
          type: RuleType.DATE,
        } as Property,
        {
          id: 2,
          name: 'tags',
          type: RuleType.TEXTGROUP,
        } as Property,
        { id: 3, name: 'profile', type: RuleType.TEXT, apiLoc: '' } as Property,
        { id: 4, name: 'size', type: RuleType.NUMBER, apiLoc: '' } as Property,
        {
          id: 5,
          name: 'releaseDate',
          type: RuleType.DATE,
        } as Property,
        {
          id: 6,
          name: 'seasons',
          type: RuleType.NUMBER,
        } as Property,
      ],
    },
    {
      id: Application.OVERSEERR,
      name: 'Overseerr',
      props: [
        { id: 0, name: 'addUser', type: RuleType.USER, apiLoc: '' } as Property,
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
      ],
    },
  ];
}
