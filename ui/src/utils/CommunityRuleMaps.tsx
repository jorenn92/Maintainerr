import { IRule } from '../components/Rules/Rule/RuleCreator'

export enum Application {
  PLEX,
  RADARR,
  SONARR,
  OVERSEERR,
  TAUTULLI,
  JELLYSEERR,
}

export enum TVLevel {
  SHOW = 'show',
  SEASON = 'season',
  EPISODE = 'episode',
}

export const applicationNames: Record<number, string> = {
  [Application.PLEX]: 'PLEX',
  [Application.RADARR]: 'RADARR',
  [Application.SONARR]: 'SONARR',
  [Application.OVERSEERR]: 'OVERSEERR',
  [Application.TAUTULLI]: 'TAUTULLI',
  [Application.JELLYSEERR]: 'JELLYSEERR',
}

export function detectRequiredServices(rules: IRule[]): string[] {
  const usedAppIds = new Set<number>()

  for (const rule of rules) {
    const [groupId] = rule.firstVal
    usedAppIds.add(Number(groupId))

    if (rule.lastVal) {
      const [lastGroupId] = rule.lastVal
      usedAppIds.add(Number(lastGroupId))
    }
  }

  return Array.from(usedAppIds)
    .map((id) => applicationNames[id])
    .filter((name): name is string => !!name)
}
