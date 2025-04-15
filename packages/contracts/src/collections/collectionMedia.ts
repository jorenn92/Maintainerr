import { z } from 'zod'
import { EPlexDataType, PlexMetadata } from '../plex'
import { collectionSchema } from './collection'

export const collectionMediaSchema = z.object({
  id: z.number().int(),
  collectionId: z.number().int(),
  plexId: z.number().int(),
  tmdbId: z.number().int().nullable(),
  addDate: z.date(),
  image_path: z.string().nullable(),
  isManual: z.boolean().nullable(),
})

export const collectionMediaWithCollectionSchema = collectionMediaSchema.extend(
  {
    collection: collectionSchema,
  },
)

export const collectionMediaWithPlexDataSchema = collectionMediaSchema.extend({
  plexData: z.custom<PlexMetadata>(),
})

export interface IAlterableMediaDto {
  id: number
  index?: number
  parenIndex?: number
  type: EPlexDataType
}
