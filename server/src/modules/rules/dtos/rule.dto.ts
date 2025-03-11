<<<<<<< HEAD
import { ApiProperty } from '@nestjs/swagger';
=======
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
>>>>>>> 6546365 (Merge remote-tracking branch 'origin/main' into rule-creation-UI)
import { RuleOperators, RulePossibility } from '../constants/rules.constants';

export class RuleDto {
  operator: RuleOperators | null;
  action: RulePossibility;
  @ApiProperty({ type: 'array', required: true, items: { type: 'number' } })
  firstVal: [number, number];
  @ApiProperty({
    type: 'array',
    required: false,
    items: { type: 'number' },
  })
  lastVal?: [number, number];
  customVal?: { ruleTypeId: number; value: string };
  section: number;
}
