import { createZodDto } from 'nestjs-zod/dto'
import { ombiSettingSchema } from './ombiSetting'

export class OmbiSettingDto extends createZodDto(ombiSettingSchema) {}