import type { MediaItemType } from '../media-server/enums'

// ── Overlay scope ─────────────────────────────────────────────────────────

/**
 * How far below a show its countdown overlay reaches: the show's own poster,
 * its season posters as well, or every episode title card too. Seasons and
 * episodes are drawn on because they leave with the show, not because they
 * are members, so the scope only ever trims what is inherited.
 */
export const overlayScopeValues = ['show_only', 'show_seasons', 'all'] as const
export type OverlayScope = (typeof overlayScopeValues)[number]

/** Every level: how overlays behaved before the scope existed. */
export const DEFAULT_OVERLAY_SCOPE: OverlayScope = 'all'

/**
 * Only a show collection offers the choice. A season or episode collection's
 * own members already sit below the show, so the scope's levels do not
 * describe what it draws.
 */
export const overlayScopeApplies = (type: MediaItemType | undefined) =>
  type === 'show'

const isOverlayScope = (
  value: string | null | undefined,
): value is OverlayScope => overlayScopeValues.some((scope) => scope === value)

/**
 * The scope a collection's overlays use. Anything other than a show
 * collection, and any value that is not a scope, reads as the default, so a
 * value left behind by a change of media type cannot trim overlays unseen.
 * Shared so the rule form, the save path and the overlay run cannot drift.
 */
export const resolveOverlayScope = (
  type: MediaItemType | undefined,
  scope: string | null | undefined,
): OverlayScope =>
  overlayScopeApplies(type) && isOverlayScope(scope)
    ? scope
    : DEFAULT_OVERLAY_SCOPE
