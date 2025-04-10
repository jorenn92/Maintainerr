import { z } from 'zod'
import { EPlexDataType } from '../plex'

export enum ServarrAction {
  DELETE,
  UNMONITOR_DELETE_ALL,
  UNMONITOR_DELETE_EXISTING,
  UNMONITOR,
  DO_NOTHING,
}

export const collectionSchema = z.object({
  id: z.number(),
  type: z.coerce.number().pipe(z.nativeEnum(EPlexDataType)),
  plexId: z.number().nullable(),
  libraryId: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  isActive: z.boolean(),
  arrAction: z.coerce.number().pipe(z.nativeEnum(ServarrAction)),
  visibleOnRecommended: z.boolean(),
  visibleOnHome: z.boolean(),
  listExclusions: z.boolean(),
  forceOverseerr: z.boolean(),
  deleteAfterDays: z.number().nullable(), // amount of days after add
  manualCollection: z.boolean(),
  manualCollectionName: z.string().nullable(),
  keepLogsForMonths: z.number(),
  tautulliWatchedPercentOverride: z.number().nullable(),
  radarrSettingsId: z.number().nullable(),
  sonarrSettingsId: z.number().nullable(),
  addDate: z.date().nullable(), // nullable = true for old collections
  handledMediaAmount: z.number(),
  lastDurationInSeconds: z.number(),
})
