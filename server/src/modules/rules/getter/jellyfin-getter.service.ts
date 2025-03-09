import { Injectable, Logger } from '@nestjs/common';
import {
  Application,
  Property,
  RuleConstants,
} from '../constants/rules.constants';
import { JellyfinApiService } from '../../api/jellyfin-api/jellyfin-api.service';
import { PlexLibraryItem } from '../../api/plex-api/interfaces/library.interfaces';

@Injectable()
export class JellyfinGetterService {
  jellyfinProperties: Property[];
  private readonly logger = new Logger(JellyfinGetterService.name);

  constructor(private readonly jellyfinApi: JellyfinApiService) {
    const ruleConstanst = new RuleConstants();
    this.jellyfinProperties = ruleConstanst.applications.find(
      (el) => el.id === Application.JELLYFIN,
    ).props;
  }

  async get(id: number, libItem: PlexLibraryItem) {
    try {
      const prop = this.jellyfinProperties.find((el) => el.id === id);

      switch (prop.name) {
        case 'lastViewedAt': {
          return await this.jellyfinApi
            .getLastSeen(libItem.title)
            .then((seenby) => {
              return seenby;
            })
            .catch(() => {
              return null;
            });
        }
      }
    } catch (e) {
      this.logger.warn(`Jellyfin-Getter - Action failed : ${e.message}`);
      return undefined;
    }
  }
}
