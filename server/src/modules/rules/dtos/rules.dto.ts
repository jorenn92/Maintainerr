import { EPlexDataType } from '../../api/plex-api/enums/plex-data-type-enum';
import { ICollection } from '../../collections/interfaces/collection.interface';
import { RuleDto } from './rule.dto';
import { RuleDbDto } from './ruleDb.dto';

export class RulesDto {
  id?: number;
  libraryId: number;
  name: string;
  description: string;
  isActive?: boolean;
  arrAction?: number;
  useRules?: boolean;
  deleteTorrents?: boolean;
  collection?: ICollection;
  listExclusions?: boolean;
  forceOverseerr?: boolean;
  rules: RuleDto[] | RuleDbDto[];
  manualCollection?: boolean;
  manualCollectionName?: string;
  dataType: EPlexDataType;
  tautulliWatchedPercentOverride?: number;
  radarrSettingsId?: number;
  sonarrSettingsId?: number;
}
