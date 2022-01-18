import { Injectable } from '@nestjs/common';
import { PlexLibraryItem } from 'src/modules/api/plex-api/interfaces/library.interfaces';
import { Application } from '../constants/rules.constants';
import { PlexGetterService } from './plex-getter.service';

@Injectable()
export class ValueGetterService {
  constructor(private plexGetter: PlexGetterService) {}

  get([val1, val2]: [number, number], libItem: PlexLibraryItem) {
    switch (val1) {
      case Application.PLEX: {
        return this.plexGetter.get(val2, libItem);
      }
      case Application.RADARR: {
        return this.plexGetter.get(val2, libItem);
      }
      case Application.SONARR: {
        return this.plexGetter.get(val2, libItem);
      }
      case Application.OVERSEERR: {
        return this.plexGetter.get(val2, libItem);
      }
    }
  }
}
