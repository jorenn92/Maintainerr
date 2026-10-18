import z from 'zod'

export interface TracearrServer {
  id: string
  name: string
}

// GET /servers, served from Tracearr 2.7.0 on: every media server Tracearr
// tracks, and the version of the Tracearr answering.
export const tracearrServersResponseSchema = z.object({
  data: z.array(
    z.object({
      server_id: z.uuid(),
      server_name: z.string(),
      server_type: z.string().min(1),
    }),
  ),
  tracearr_version: z.string(),
})

export type TracearrServersResponse = z.infer<
  typeof tracearrServersResponseSchema
>

// Rating keys only mean anything within one media server, so a candidate is
// confirmed by reading its own library items: the same key resolving to the
// same title on the media server Maintainerr manages means one id space.
// /recently-added is used because it lists library items rather than plays,
// so it works on a server nobody has watched anything on.
export const tracearrRecentlyAddedPageSchema = z.object({
  data: z.array(
    z.object({
      rating_key: z.string().min(1).nullable(),
      title: z.string().min(1),
      // The media server's own added date, which every server reports for every
      // item. Year is not usable for this: it is absent on most rows.
      added_at: z.iso.datetime(),
    }),
  ),
})
