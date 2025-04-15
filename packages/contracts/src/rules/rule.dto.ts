import { createZodDto } from 'nestjs-zod'
import { ruleDefinitionSchema, ruleSchema } from './rule'

export class RuleDto extends createZodDto(ruleSchema) {}
export class RuleDefinitionDto extends createZodDto(ruleDefinitionSchema) {}
