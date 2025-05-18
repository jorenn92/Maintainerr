import { createZodDto } from 'nestjs-zod'
import { tautulliSettingSchema } from './tautulliSetting'

export class TautulliSettingDto extends createZodDto(tautulliSettingSchema) {}
