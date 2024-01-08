import { EPlexDataType } from '../../api/plex-api/enums/plex-data-type-enum';

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
  CONTAINS_PARTIAL,
  NOT_CONTAINS_PARTIAL,
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
    RulePossibility.CONTAINS_PARTIAL,
    RulePossibility.NOT_CONTAINS_PARTIAL,
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
  hashedValue: string; // SHA-1 hash of application.name. (i.e. plex.addDate)
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
          hashedValue: '9af3789c982568bc8b024c3e30c59a0ce538e531',
          mediaType: MediaType.BOTH,
          type: RuleType.DATE,
        } as Property,
        {
          id: 1,
          name: 'seenBy',
          humanName: '[list] Viewed by (username)',
          hashedValue: '35c089f88e6b5f368cf22adbb85783f06d235d19',
          mediaType: MediaType.MOVIE,
          type: RuleType.TEXT, // returns id[]
        } as Property,
        {
          id: 2,
          name: 'releaseDate',
          humanName: 'Release date',
          hashedValue: '7e5d3a95a5e0a89d0d30187212c57d1e41b4d674',
          mediaType: MediaType.BOTH,
          type: RuleType.DATE,
        } as Property,
        {
          id: 3,
          name: 'rating_user',
          humanName: 'User rating (scale 1-10)',
          hashedValue: '2369c5db408f6061fa453ef78c76a8a753d23808',
          mediaType: MediaType.BOTH,
          type: RuleType.NUMBER,
        } as Property,
        {
          id: 4,
          name: 'people',
          humanName: '[list] People involved',
          hashedValue: '817952c45d5a2275a04cd260f463a4d7c557745f',
          mediaType: MediaType.BOTH,
          type: RuleType.TEXT, // return text[]
        } as Property,
        {
          id: 5,
          name: 'viewCount',
          humanName: 'Times viewed',
          hashedValue: 'f2591dabad5bb3558b1d42fee02baa01d3bae11b',
          mediaType: MediaType.MOVIE,
          type: RuleType.NUMBER,
        } as Property,
        {
          id: 6,
          name: 'collections',
          humanName: 'Present in amount of other collections',
          hashedValue: 'd953a84cac53ae1fce118188880fae2ca3f9be7b',
          mediaType: MediaType.BOTH,
          type: RuleType.NUMBER,
        } as Property,
        {
          id: 7,
          name: 'lastViewedAt',
          humanName: 'Last view date',
          hashedValue: '77fe5e904e64f97b35eee99fd87fe93bd9f238ec',
          mediaType: MediaType.BOTH,
          type: RuleType.DATE,
        } as Property,
        {
          id: 8,
          name: 'fileVideoResolution',
          humanName: '[list] Media file resolution (4k, 1080,..)',
          hashedValue: 'e8cf90ad2a948d0c0635adf5cae193e20938afd9',
          mediaType: MediaType.MOVIE,
          type: RuleType.TEXT,
        } as Property,
        {
          id: 9,
          name: 'fileBitrate',
          humanName: 'Media file bitrate',
          hashedValue: '309ccaaef44916b76ebcc04ee59ecbd6fa3d44de',
          mediaType: MediaType.MOVIE,
          type: RuleType.NUMBER,
        } as Property,
        {
          id: 10,
          name: 'fileVideoCodec',
          humanName: 'Media file codec',
          hashedValue: '1874fab50181fc571eb3f995ffc60f7b86154149',
          mediaType: MediaType.MOVIE,
          type: RuleType.TEXT,
        } as Property,
        {
          id: 11,
          name: 'genre',
          humanName: '[list] List of genres (Action, Adventure,..)',
          hashedValue: 'efab7078560c321c2f5f4a54d82a9581f68ef26f',
          mediaType: MediaType.BOTH,
          type: RuleType.TEXT, // return text[]
        } as Property,
        {
          id: 12,
          name: 'sw_allEpisodesSeenBy',
          humanName: '[list] Users that saw all available episodes',
          hashedValue: '7aed45a842eb4a34b2dda0d26f861ab472aef2ec',
          mediaType: MediaType.SHOW,
          type: RuleType.TEXT, // return usernames []
          showType: [EPlexDataType.SHOWS, EPlexDataType.SEASONS],
        } as Property,
        {
          id: 13,
          name: 'sw_lastWatched',
          humanName: 'Newest episode view date',
          hashedValue: 'fa2006c64c22ab5ba22e3469e6080298e7d96d74',
          mediaType: MediaType.SHOW,
          type: RuleType.DATE,
          showType: [EPlexDataType.SHOWS, EPlexDataType.SEASONS],
        } as Property,
        {
          id: 14,
          name: 'sw_episodes',
          humanName: 'Amount of available episodes',
          hashedValue: 'af55e402802d1d30128fe301f020656ac9b24c67',
          mediaType: MediaType.SHOW,
          type: RuleType.NUMBER,
          showType: [EPlexDataType.SHOWS, EPlexDataType.SEASONS],
        } as Property,
        {
          id: 15,
          name: 'sw_viewedEpisodes',
          humanName: 'Amount of watched episodes',
          hashedValue: 'a725eae599e8a92a62eb4d28659354b80c787e43',
          mediaType: MediaType.SHOW,
          type: RuleType.NUMBER,
          showType: [EPlexDataType.SHOWS, EPlexDataType.SEASONS],
        } as Property,
        {
          id: 16,
          name: 'sw_lastEpisodeAddedAt',
          humanName: 'Last episode added at',
          hashedValue: '58a9e298f9f5fa200694acceeb7f0430b5f2befb',
          mediaType: MediaType.SHOW,
          type: RuleType.DATE,
          showType: [EPlexDataType.SHOWS, EPlexDataType.SEASONS],
        } as Property,
        {
          id: 17,
          name: 'sw_amountOfViews',
          humanName: 'Total views',
          hashedValue: '968a896ee95d9af84b95959c9732052ea754a0e9',
          mediaType: MediaType.SHOW,
          type: RuleType.NUMBER,
        } as Property,
        {
          id: 18,
          name: 'sw_watchers',
          humanName: '[list] Users that watch the show/season/episode',
          hashedValue: '093c64557f9a06fb1d1d1e3f87787913c18d50bc',
          mediaType: MediaType.SHOW,
          type: RuleType.TEXT, // return usernames []
          showType: [
            EPlexDataType.SHOWS,
            EPlexDataType.SEASONS,
            EPlexDataType.EPISODES,
          ],
        } as Property,
        {
          id: 19,
          name: 'collection_names',
          humanName: '[list] Collections media is present in (titles)',
          hashedValue: 'caa8771e98991cf6d7d3e3e4adc5e1cca5340ae8',
          mediaType: MediaType.BOTH,
          type: RuleType.TEXT,
        } as Property,
        {
          id: 20,
          name: 'playlists',
          humanName: 'Present in amount of playlists',
          hashedValue: 'bb54db4673ba2c96dc83553fe88aef2bf294a53e',
          mediaType: MediaType.BOTH,
          type: RuleType.NUMBER,
        } as Property,
        {
          id: 21,
          name: 'playlist_names',
          humanName: '[list] Playlists media is present in (titles)',
          hashedValue: 'f15b89dd039347c9df6197b40db07f6066073505',
          mediaType: MediaType.BOTH,
          type: RuleType.TEXT,
        } as Property,
        {
          id: 22,
          name: 'rating_critics',
          humanName: 'Critics rating (scale 1-10)',
          hashedValue: '6ee02a02ae7afb583707f08958af79e8cf466945',
          mediaType: MediaType.BOTH,
          type: RuleType.NUMBER,
        } as Property,
        {
          id: 23,
          name: 'rating_audience',
          humanName: 'Audience rating (scale 1-10)',
          hashedValue: 'aa5d805fdc288173eda64359152f10c816dfda56',
          mediaType: MediaType.BOTH,
          type: RuleType.NUMBER,
        } as Property,
        {
          id: 24,
          name: 'labels',
          humanName: '[list] Labels',
          hashedValue: 'fdeea16ffc313412e0230c647aefba46b182fb77',
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
          hashedValue: '1cfca784c5124f5a4677fcf327caa7848017056b',
          mediaType: MediaType.MOVIE,
          type: RuleType.DATE,
        } as Property,
        {
          id: 1,
          name: 'fileDate',
          humanName: 'Date file downloaded',
          hashedValue: '267b7b0188d46e6ec492e914c7d4ec468e1209f7',
          mediaType: MediaType.MOVIE,
          type: RuleType.DATE,
        } as Property,
        {
          id: 2,
          name: 'tags',
          humanName: '[list] Tags (Text if 1, otherwise list)',
          hashedValue: 'a72bd9efd0c7174b17a557cb1465710982fa3e3d',
          mediaType: MediaType.MOVIE,
          type: RuleType.TEXT, // return text[]
        } as Property,
        {
          id: 3,
          name: 'profile',
          humanName: 'Quality profile',
          hashedValue: '47dfb0500cbbc871872a458083bbb84f61907aa8',
          mediaType: MediaType.MOVIE,
          type: RuleType.TEXT,
        } as Property, // TODO
        {
          id: 4,
          name: 'releaseDate',
          humanName: 'Release date',
          hashedValue: '1411dfae10b055a88a5de155d7c46addfb328d36',
          mediaType: MediaType.MOVIE,
          type: RuleType.DATE,
        } as Property,
        {
          id: 5,
          name: 'monitored',
          humanName: 'is monitored',
          hashedValue: 'dc9e4c883cc9c0cd5f6c06fbb86d3d2d1edfada7',
          mediaType: MediaType.MOVIE,
          type: RuleType.BOOL,
        } as Property,
        {
          id: 6,
          name: 'inCinemas',
          humanName: 'In cinemas date',
          hashedValue: '37b76e815e1c3b96db8647ae0ada6a0c1de50df7',
          mediaType: MediaType.MOVIE,
          type: RuleType.DATE,
        } as Property,
        {
          id: 7,
          name: 'fileSize',
          humanName: 'File - size in MB',
          hashedValue: '63d3ee8078e245813ace092bad2d30874f78cef7',
          mediaType: MediaType.MOVIE,
          type: RuleType.NUMBER,
        } as Property,
        {
          id: 8,
          name: 'fileAudioChannels',
          humanName: '[list] File - audio channels',
          hashedValue: '0062173ca0e586662c6c3c8e43f04dbb395d7cd7',
          mediaType: MediaType.MOVIE,
          type: RuleType.NUMBER,
        } as Property,
        {
          id: 9,
          name: 'fileQuality',
          humanName: '[list] File - quality (2160, 1080,..)',
          hashedValue: '13b02a89b61a751e92b286f0f7be741953627452',
          mediaType: MediaType.MOVIE,
          type: RuleType.NUMBER,
        } as Property,
        {
          id: 10,
          name: 'fileDate',
          humanName: 'File - download date',
          hashedValue: '267b7b0188d46e6ec492e914c7d4ec468e1209f7',
          mediaType: MediaType.MOVIE,
          type: RuleType.DATE,
        } as Property,
        {
          id: 11,
          name: 'runTime',
          humanName: 'File - runtime in minutes',
          hashedValue: 'bac93254874c764939b26dde31edbfd31dbecb73',
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
          hashedValue: 'cecb6ac03a412a220ce540534483450fb4df75fa',
          mediaType: MediaType.SHOW,
          type: RuleType.DATE,
          showType: [EPlexDataType.SHOWS],
        } as Property,
        {
          id: 1,
          name: 'diskSizeEntireShow',
          humanName: 'Files - Disk size in MB ',
          hashedValue: '59a05f025fe8704c37fa8094a3f42605dfb4da84',
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
          humanName: '[list] Tags (show)',
          hashedValue: 'b69ae14dc92491cfd8c732f301f03b9d21ff6e8c',
          mediaType: MediaType.SHOW,
          type: RuleType.TEXT, // return text[]
        } as Property,
        {
          id: 3,
          name: 'qualityProfileId',
          humanName: 'Quality profile ID',
          hashedValue: '551225fb9aff2b81dffa68ea936b9cd976d022d0',
          mediaType: MediaType.SHOW,
          type: RuleType.NUMBER,
        } as Property,
        {
          id: 4,
          name: 'firstAirDate',
          humanName: 'First air date',
          hashedValue: 'aef9741af0e181c8785e7ba8b2639b125bc2ec7c',
          mediaType: MediaType.SHOW,
          type: RuleType.DATE,
        } as Property,
        {
          id: 5,
          name: 'seasons',
          humanName: 'Number of seasons / episodes (also unavailable)',
          hashedValue: '6c0f348e07a647d02783f188c4e56d9c46dfd992',
          mediaType: MediaType.SHOW,
          type: RuleType.NUMBER,
          showType: [EPlexDataType.SHOWS, EPlexDataType.SEASONS],
        } as Property,
        {
          id: 6,
          name: 'status (continuing, ended)',
          humanName: 'Status',
          hashedValue: '8df4a15a8a624b7a01e4d12bdaa1f14ca3068983',
          mediaType: MediaType.SHOW,
          type: RuleType.TEXT,
          showType: [EPlexDataType.SHOWS],
        } as Property,
        {
          id: 7,
          name: 'ended',
          humanName: 'Show ended',
          hashedValue: '15d4aad8812cf1d1b1add5350a0021abce1be442',
          mediaType: MediaType.SHOW,
          type: RuleType.BOOL,
          showType: [EPlexDataType.SHOWS],
        } as Property,
        {
          id: 8,
          name: 'monitored',
          humanName: 'Is monitored (deprecated)',
          hashedValue: 'dc7a03a8a5bc905e8d0cf0e3503a378885ee404f',
          mediaType: MediaType.SHOW,
          type: RuleType.NUMBER,
        } as Property,
        {
          id: 9,
          name: 'monitored',
          humanName: 'Is monitored',
          hashedValue: '3fb681ff1f488fc393cac4c407d63de2c6a7873b',
          mediaType: MediaType.SHOW,
          type: RuleType.BOOL,
        } as Property,
        {
          id: 10,
          name: 'unaired_episodes',
          humanName: 'Has unaired episodes',
          hashedValue: 'ee0edfc7cbf2c14585cca747a92a17c85cde6492',
          mediaType: MediaType.SHOW,
          type: RuleType.BOOL,
          showType: [EPlexDataType.SHOWS, EPlexDataType.SEASONS],
        } as Property,
        {
          id: 11,
          name: 'seasons_monitored',
          humanName: 'Number of monitored seasons / episodes',
          hashedValue: 'cb5bc4e31cd4fbbb8b9ff2c4fa7bd6bee4ba51f4',
          mediaType: MediaType.SHOW,
          type: RuleType.NUMBER,
          showType: [EPlexDataType.SHOWS, EPlexDataType.SEASONS],
        } as Property,
        {
          id: 12,
          name: 'unaired_episodes_season',
          humanName: 'Season has unaired episodes',
          hashedValue: 'fa746cbd7a25f3f778ecc58861e1076bfd69de06',
          mediaType: MediaType.SHOW,
          type: RuleType.BOOL,
          showType: [EPlexDataType.EPISODES],
        } as Property,
        {
          id: 13,
          name: 'part_of_latest_season',
          humanName: 'Is (part of) latest aired/airing season',
          hashedValue: '26a9d32c7b7ab98dc482720767ed280698bbc784',
          mediaType: MediaType.SHOW,
          type: RuleType.BOOL,
          showType: [EPlexDataType.EPISODES, EPlexDataType.SEASONS],
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
          hashedValue: 'b442a3f6f79c4d0f41923874e4c6934fb3ce1e1c',
          mediaType: MediaType.BOTH,
          type: RuleType.TEXT,
        } as Property, //  returns username[]
        {
          id: 1,
          name: 'requestDate',
          humanName: 'Request date',
          hashedValue: '304401ab1cc0ae06b81e2d607d5f8967c1f3badd',
          mediaType: MediaType.BOTH,
          type: RuleType.DATE,
        } as Property,
        {
          id: 2,
          name: 'releaseDate',
          humanName: 'Release/air date',
          hashedValue: '47c7fd4c5bfaa98c987feb5b9aabecda4dc93e89',
          mediaType: MediaType.BOTH,
          type: RuleType.DATE,
        } as Property,
        {
          id: 3,
          name: 'approvalDate',
          humanName: 'Approval date',
          hashedValue: 'fec0186362a4f3175ed9af95bd46d201a08c5ca7',
          mediaType: MediaType.BOTH,
          type: RuleType.DATE,
        } as Property,
        {
          id: 4,
          name: 'mediaAddedAt',
          humanName: 'Media downloaded date',
          hashedValue: 'c2c7379e31e069a7c12c495f6af4f82404ad6e0e',
          mediaType: MediaType.BOTH,
          type: RuleType.DATE,
        } as Property,
        {
          id: 5,
          name: 'amountRequested',
          humanName: 'Amount of requests',
          hashedValue: 'e7c4d6d6b16e4cbdb736f98a8a00a9d37860e050',
          mediaType: MediaType.BOTH,
          type: RuleType.NUMBER,
        } as Property,
        {
          id: 6,
          name: 'isRequested',
          humanName: 'Requested in Overseerr',
          hashedValue: 'e3ccf9d903426cbf7e8a87e4437eb374ab035d27',
          mediaType: MediaType.BOTH,
          type: RuleType.BOOL,
        } as Property,
      ],
    },
  ];
}
