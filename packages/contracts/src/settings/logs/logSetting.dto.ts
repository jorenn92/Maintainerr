import { createZodDto } from 'nestjs-zod'
import { logSettingSchema } from './logSetting'

export class LogSettingDto extends createZodDto(logSettingSchema) {}
