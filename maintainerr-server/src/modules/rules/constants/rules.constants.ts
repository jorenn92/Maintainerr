export const enum RulePossibility {
  BIGGER,
  SMALLER,
  EQUALS,
  ADD,
  ADDDAYS,
  ADDWEEKS,
  ADDMONTHS,
  ADDYEARS,
  CONTAINS,
  BEFORE,
  AFTER,
  IN_LAST,
  IN_NEXT,
}

export const enum RuleOperators {
  '&&',
  '||',
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
    RulePossibility.ADD,
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

export interface Rule {
  id: number;
  name: string;
  type: RuleType;
}

export interface RuleGroup {
  id: number;
  name: string;
  props: Rule[];
}
export class RuleConstants {
  rules: RuleGroup[] = [
    {
      id: 0,
      name: 'Plex',
      props: [
        {
          id: 0,
          name: 'addDate',
          type: RuleType.DATE,
        } as Rule,
        { id: 1, name: 'user', type: RuleType.USER } as Rule,
        { id: 2, name: 'seenBy', type: RuleType.USERGROUP } as Rule,
        { id: 3, name: 'releaseDate', type: RuleType.DATE } as Rule,
        { id: 4, name: 'imdbScore', type: RuleType.NUMBER } as Rule,
        { id: 5, name: 'quality', type: RuleType.TEXT } as Rule,
        { id: 6, name: 'label', type: RuleType.TEXT } as Rule,
        { id: 7, name: 'people', type: RuleType.TEXTGROUP } as Rule,
        { id: 8, name: 'collections', type: RuleType.NUMBER } as Rule,
      ],
    },
    {
      id: 1,
      name: 'Radarr',
      props: [
        { id: 0, name: 'addDate', type: RuleType.DATE } as Rule,
        { id: 1, name: 'fileDate', type: RuleType.DATE } as Rule,
        { id: 2, name: 'tags', type: RuleType.TEXTGROUP } as Rule,
        { id: 3, name: 'profile', type: RuleType.TEXT } as Rule,
        { id: 4, name: 'size', type: RuleType.NUMBER } as Rule,
        { id: 5, name: 'releaseDate', type: RuleType.DATE } as Rule,
      ],
    },
    {
      id: 2,
      name: 'Sonarr',
      props: [
        { id: 0, name: 'addDate', type: RuleType.DATE } as Rule,
        { id: 1, name: 'fileDate', type: RuleType.DATE } as Rule,
        { id: 2, name: 'tags', type: RuleType.TEXTGROUP } as Rule,
        { id: 3, name: 'profile', type: RuleType.TEXT } as Rule,
        { id: 4, name: 'size', type: RuleType.NUMBER } as Rule,
        { id: 5, name: 'releaseDate', type: RuleType.DATE } as Rule,
        { id: 6, name: 'seasons', type: RuleType.NUMBER } as Rule,
      ],
    },
    {
      id: 3,
      name: 'Overseerr',
      props: [
        { id: 0, name: 'addUser', type: RuleType.USER } as Rule,
        { id: 1, name: 'requestDate', type: RuleType.DATE } as Rule,
        { id: 2, name: 'releaseDate', type: RuleType.DATE } as Rule,
        { id: 3, name: 'approvalDate', type: RuleType.DATE } as Rule,
      ],
    },
  ];
}
