import z from 'zod'

export enum RulePossibility {
  BIGGER,
  SMALLER,
  EQUALS,
  NOT_EQUALS,
  CONTAINS,
  BEFORE,
  AFTER,
  IN_LAST,
  IN_NEXT,
  NOT_CONTAINS,
  CONTAINS_PARTIAL,
  NOT_CONTAINS_PARTIAL,
  COUNT_EQUALS,
  COUNT_NOT_EQUALS,
  COUNT_BIGGER,
  COUNT_SMALLER,
}

export enum RuleType {
  NUMBER,
  DATE,
  TEXT,
  BOOL,
  TEXT_LIST,
}

export enum RuleOperator {
  AND,
  OR,
}

export enum Application {
  PLEX,
  RADARR,
  SONARR,
  OVERSEERR,
  TAUTULLI,
  JELLYSEERR,
}

export enum ArrAction {
  DELETE,
  UNMONITOR, // this also deletes
  SW_UNMONITOR_EXISTING_SEASONS,
  UNMONITOR_NO_DELETE,
}

export enum MediaType {
  BOTH,
  MOVIE,
  SHOW,
}

export const ruleDefinitionSchema = z.object({
  operator: z.coerce.number().pipe(z.nativeEnum(RuleOperator)).nullable(),
  action: z.coerce.number().pipe(z.nativeEnum(RulePossibility)),
  firstVal: z.tuple([z.number(), z.number()]),
  lastVal: z.tuple([z.number(), z.number()]).optional(),
  customVal: z
    .object({
      ruleTypeId: z.coerce.number().pipe(z.nativeEnum(RuleType)),
      value: z.string(),
    })
    .optional(),
  section: z.number(),
})

export const ruleSchema = z.object({
  id: z.number(),
  rule: ruleDefinitionSchema,
  section: z.number(),
  ruleGroupId: z.number(),
  isActive: z.boolean(),
})
