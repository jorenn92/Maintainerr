import { Injectable } from '@nestjs/common';
import { PlexLibraryItem } from '../../../modules/api/plex-api/interfaces/library.interfaces';
import { Application } from '../constants/rules.constants';
import { OverseerrGetterService } from './overseerr-getter.service';
import { PlexGetterService } from './plex-getter.service';
import { RadarrGetterService } from './radarr-getter.service';
import { SonarrGetterService } from './sonarr-getter.service';

@Injectable()
export class ValueGetterService {
  constructor(
    private readonly plexGetter: PlexGetterService,
    private readonly radarrGetter: RadarrGetterService,
    private readonly sonarrGetter: SonarrGetterService,
    private readonly overseerGetter: OverseerrGetterService,
  ) {}

  async get([val1, val2]: [number, number], libItem: PlexLibraryItem) {
    switch (val1) {
      case Application.PLEX: {
        return await this.plexGetter.get(val2, libItem);
      }
      case Application.RADARR: {
        return await this.radarrGetter.get(val2, libItem);
      }
      case Application.SONARR: {
        return await this.sonarrGetter.get(val2, libItem);
      }
      case Application.OVERSEERR: {
        return await this.overseerGetter.get(val2, libItem);
      }
      default: {
        return null;
      }
    }
  }
}
