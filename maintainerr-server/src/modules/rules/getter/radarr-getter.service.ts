import { Injectable } from '@nestjs/common';
import { PlexLibraryItem } from 'src/modules/api/plex-api/interfaces/library.interfaces';
import { PlexApiService } from 'src/modules/api/plex-api/plex-api.service';
import {
  Application,
  Property,
  RuleConstants,
} from '../constants/rules.constants';

@Injectable()
export class RadarrGetterService {
  plexProperties: Property[];
  constructor(private readonly plexApi: PlexApiService) {
    const ruleConstanst = new RuleConstants();
    this.plexProperties = ruleConstanst.applications.find(
      (el) => el.id === Application.PLEX,
    ).props;
  }

  get(id: number, libItem: PlexLibraryItem) {
    const prop = this.plexProperties.find((el) => el.id === id);
    switch (prop.name) {
      case 'addDate': {
        return new Date(libItem.addedAt);
      }
      case 'seenBy': {
        return this.plexApi
          .getSeenBy(libItem.ratingKey)
          .then((seenby) => {
            return seenby.map((el) => el.accountID);
          })
          .catch((_err) => {
            return null;
          });
      }
      case 'releaseDate': {
        return new Date(libItem.originallyAvailableAt);
      }
      case 'rating': {
        return +libItem.rating;
      }
      case 'people': {
        return libItem.role ? libItem.role.map((el) => el.tag) : null;
      }
      case 'viewCount': {
        return +libItem.viewCount;
      }
      case 'collections': {
        return +0; // TODO
      }
      case 'lastViewedAt': {
        return new Date(libItem.lastViewedAt);
      }
      case 'fileVideoResolution': {
        return libItem.Media[0].videoResolution
          ? libItem.Media[0].videoResolution
          : null;
      }
      case 'fileBitrate': {
        return libItem.Media[0].bitrate ? libItem.Media[0].bitrate : null;
      }
      case 'fileVideoCodec': {
        return libItem.Media[0].videoCodec ? libItem.Media[0].videoCodec : null;
      }
      case 'genre': {
        return libItem.genre ? libItem.genre.map((el) => el.tag) : null;
      }
      default: {
        return null;
      }
    }
  }
}
