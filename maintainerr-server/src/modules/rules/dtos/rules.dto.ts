import { RuleDto } from './rule.dto';
import { RuleDbDto } from './ruleDB.dto';

export class RulesDto {
  id?: number;
  libraryId: number;
  name: string;
  description: string;
  isActive?: boolean;
  rules: RuleDto[] | RuleDbDto[];
}
