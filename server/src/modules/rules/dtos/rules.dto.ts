import { RuleDto } from './rule.dto';
import { RuleDbDto } from './ruleDb.dto';

export class RulesDto {
  id?: number;
  libraryId: number;
  name: string;
  description: string;
  isActive?: boolean;
  arrAction?: number;
  collection?: {
    visibleOnHome: boolean;
    deleteAfterDays: number | null;
  };
  rules: RuleDto[] | RuleDbDto[];
}
