import { RuleDto } from './rule.dto';

export class CommunityRule {
  id?: number;
  karma?: number;
  name: string;
  description: string;
  JsonRules: RuleDto;
}
