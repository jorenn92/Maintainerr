import { z } from 'zod'
import { collectionSchema } from '../collections'
import { EPlexDataType } from '../plex'
import { ruleDefinitionSchema, ruleSchema } from './rule'

export const ruleGroupSchema = z.object({
  id: z.number().optional(), // TODO Why is this optional?
  libraryId: z.number(),
  name: z.string(),
  description: z.string(),
  isActive: z.boolean(),
  collectionId: z.number().optional(), // TODO Why is this optional?
  collection: collectionSchema.optional(),
  useRules: z.boolean(),
  rules: z.array(ruleSchema),
  dataType: z.coerce.number().pipe(z.nativeEnum(EPlexDataType)),
})

// isActive, name, description, libraryId and (dataType == type)
export const ruleGroupUpdateSchema = ruleGroupSchema
  .omit({ collection: true, rules: true })
  .extend({
    rules: z.array(ruleDefinitionSchema),
    collection: collectionSchema
      .pick({
        arrAction: true,
        listExclusions: true,
        forceOverseerr: true,
        manualCollection: true,
        manualCollectionName: true,
        tautulliWatchedPercentOverride: true,
        radarrSettingsId: true,
        sonarrSettingsId: true,
        visibleOnHome: true,
        visibleOnRecommended: true,
        keepLogsForMonths: true,
        deleteAfterDays: true,
      })
      .extend({
        radarrSettingsId: collectionSchema.shape.radarrSettingsId.optional(),
        sonarrSettingsId: collectionSchema.shape.sonarrSettingsId.optional(),
        deleteAfterDays: collectionSchema.shape.deleteAfterDays.optional(),
        tautulliWatchedPercentOverride:
          collectionSchema.shape.tautulliWatchedPercentOverride.optional(),
      }),
  })

export type RuleYamlDecodeDto = {
  code: 0 | 1
  result?: string
  message?: string
}
