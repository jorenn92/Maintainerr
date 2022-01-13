import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';
import webpush from 'web-push';
import { merge } from 'lodash';

let settings: SettingsService | undefined;

export interface Library {
  id: string;
  name: string;
  enabled: boolean;
  type: 'show' | 'movie';
  lastScan?: number;
}

export interface Region {
  iso_3166_1: string;
  english_name: string;
  name?: string;
}

export interface Language {
  iso_639_1: string;
  english_name: string;
  name: string;
}

export interface PlexSettings {
  name: string;
  machineId?: string;
  ip: string;
  port: number;
  useSsl?: boolean;
  libraries: Library[];
  webAppUrl?: string;
}

export interface DVRSettings {
  id: number;
  name: string;
  hostname: string;
  port: number;
  apiKey: string;
  useSsl: boolean;
  baseUrl?: string;
  activeProfileId: number;
  activeProfileName: string;
  activeDirectory: string;
  tags: number[];
  is4k: boolean;
  isDefault: boolean;
  externalUrl?: string;
  syncEnabled: boolean;
  preventSearch: boolean;
}

export interface RadarrSettings extends DVRSettings {
  minimumAvailability: string;
}

export interface SonarrSettings extends DVRSettings {
  activeAnimeProfileId?: number;
  activeAnimeProfileName?: string;
  activeAnimeDirectory?: string;
  activeAnimeLanguageProfileId?: number;
  activeLanguageProfileId?: number;
  animeTags?: number[];
  enableSeasonFolders: boolean;
}

interface Quota {
  quotaLimit?: number;
  quotaDays?: number;
}

export interface MainSettings {
  apiKey: string;
  applicationTitle: string;
  applicationUrl: string;
  csrfProtection: boolean;
  cacheImages: boolean;
  defaultQuotas: {
    movie: Quota;
    tv: Quota;
  };
  localLogin: boolean;
  newPlexLogin: boolean;
  region: string;
  originalLanguage: string;
  trustProxy: boolean;
  locale: string;
}

interface FullPublicSettings extends PublicSettings {
  applicationTitle: string;
  applicationUrl: string;
  localLogin: boolean;
  region: string;
  originalLanguage: string;
  cacheImages: boolean;
  vapidPublic: string;
  locale: string;
}

interface PublicSettings {
  initialized: boolean;
}

interface AllSettings {
  clientId: string;
  vapidPublic: string;
  vapidPrivate: string;
  main: MainSettings;
  plex: PlexSettings;
  radarr: RadarrSettings[];
  sonarr: SonarrSettings[];
  public: PublicSettings;
}

const SETTINGS_PATH = process.env.CONFIG_DIRECTORY
  ? `${process.env.CONFIG_DIRECTORY}/settings.json`
  : path.join(__dirname, '../../config/settings.json');

@Injectable()
export class SettingsService {
  private data: AllSettings;
  private initialSettings: AllSettings;

  constructor() {
    this.createSettings();
  }

  createSettings(initialSettings?: AllSettings): void {
    this.initialSettings = initialSettings
      ? initialSettings
      : this.initialSettings;
    this.data = {
      clientId: randomUUID(),
      vapidPrivate: '',
      vapidPublic: '',
      main: {
        apiKey: '',
        applicationTitle: 'Maintainerr',
        applicationUrl: '',
        csrfProtection: false,
        cacheImages: false,
        defaultQuotas: {
          movie: {},
          tv: {},
        },
        localLogin: true,
        newPlexLogin: true,
        region: '',
        originalLanguage: '',
        trustProxy: false,
        locale: 'en',
      },
      plex: {
        name: 'ELENA',
        ip: '192.168.0.2',
        port: 32400,
        useSsl: false,
        libraries: [],
      },
      radarr: [],
      sonarr: [],
      public: {
        initialized: false,
      },
    };
    if (initialSettings) {
      this.data = merge(this.data, initialSettings);
    }
  }

  get main(): MainSettings {
    if (!this.data.main.apiKey) {
      this.data.main.apiKey = this.generateApiKey();
      this.save();
    }
    return this.data.main;
  }

  set main(data: MainSettings) {
    this.data.main = data;
  }

  get plex(): PlexSettings {
    return this.data.plex;
  }

  set plex(data: PlexSettings) {
    this.data.plex = data;
  }

  get radarr(): RadarrSettings[] {
    return this.data.radarr;
  }

  set radarr(data: RadarrSettings[]) {
    this.data.radarr = data;
  }

  get sonarr(): SonarrSettings[] {
    return this.data.sonarr;
  }

  set sonarr(data: SonarrSettings[]) {
    this.data.sonarr = data;
  }

  get public(): PublicSettings {
    return this.data.public;
  }

  set public(data: PublicSettings) {
    this.data.public = data;
  }

  get fullPublicSettings(): FullPublicSettings {
    return {
      ...this.data.public,
      applicationTitle: this.data.main.applicationTitle,
      applicationUrl: this.data.main.applicationUrl,
      localLogin: this.data.main.localLogin,
      region: this.data.main.region,
      originalLanguage: this.data.main.originalLanguage,
      cacheImages: this.data.main.cacheImages,
      vapidPublic: this.vapidPublic,
      locale: this.data.main.locale,
    };
  }

  get clientId(): string {
    if (!this.data.clientId) {
      this.data.clientId = randomUUID();
      this.save();
    }

    return this.data.clientId;
  }

  get vapidPublic(): string {
    this.generateVapidKeys();

    return this.data.vapidPublic;
  }

  get vapidPrivate(): string {
    this.generateVapidKeys();

    return this.data.vapidPrivate;
  }

  public regenerateApiKey(): MainSettings {
    this.main.apiKey = this.generateApiKey();
    this.save();
    return this.main;
  }

  private generateApiKey(): string {
    return Buffer.from(`${Date.now()}${randomUUID()})`).toString('base64');
  }

  private generateVapidKeys(force = false): void {
    if (!this.data.vapidPublic || !this.data.vapidPrivate || force) {
      const vapidKeys = webpush.generateVAPIDKeys();
      this.data.vapidPrivate = vapidKeys.privateKey;
      this.data.vapidPublic = vapidKeys.publicKey;
      this.save();
    }
  }

  /**
   * Settings Load
   *
   * This will load settings from file unless an optional argument of the object structure
   * is passed in.
   * @param overrideSettings If passed in, will override all existing settings with these
   * values
   */
  public load(overrideSettings?: AllSettings): SettingsService {
    if (overrideSettings) {
      this.data = overrideSettings;
      return this;
    }

    if (!fs.existsSync(SETTINGS_PATH)) {
      this.save();
    }
    const data = fs.readFileSync(SETTINGS_PATH, 'utf-8');

    if (data) {
      this.data = merge(this.data, JSON.parse(data));
      this.save();
    }
    return this;
  }

  public save(): void {
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(this.data, undefined, ' '));
  }

  getSettings = (initialSettings?: AllSettings): SettingsService => {
    if (!settings) {
      settings = new SettingsService();
      settings.createSettings(initialSettings);
    }

    return settings;
  };
}
