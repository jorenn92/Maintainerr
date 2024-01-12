import { RuleOperators, RulePossibility } from '../constants/rules.constants';

export class RuleDto {
  operator: RuleOperators | null;
  action: RulePossibility;
  firstVal: [number, number];
  lastVal?: [number, number];
  customVal?: { ruleTypeId: number; value: string };
  section: number;
}
