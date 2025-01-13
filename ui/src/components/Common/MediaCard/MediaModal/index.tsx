import React, { memo, useEffect, useState, useMemo } from 'react'
import GetApiHandler from '../../../../utils/ApiHandler'

interface ModalContentProps {
  show: boolean
  onClose: () => void
  id: number
  image?: string
  userScore?: number
  backdrop?: string
  summary?: string
  year?: string
  mediaType: 'movie' | 'show' | 'season' | 'episode'
  title: string
  canExpand?: boolean
  inProgress?: boolean
  tmdbid?: string
  libraryId?: number
  type?: 1 | 2 | 3 | 4
  daysLeft?: number
  exclusionId?: number
  exclusionType?: 'global' | 'specific' | undefined
  collectionId?: number
  isManual?: boolean
}

interface Metadata {
  contentRating: string
  audienceRating: string
  Genre: { tag: string }[]
  Rating: { image: string; value: number; type: string }[]
  Guid: { id: string }[]
}

const MediaModalContent: React.FC<ModalContentProps> = memo(
  ({
    show,
    onClose,
    mediaType,
    backdrop,
    id,
    summary,
    year,
    title,
    tmdbid,
  }) => {
    useEffect(() => {
      if (show) {
        // Prevent background scrolling when modal is open
        document.body.classList.add('fixed', 'overflow-hidden', 'w-full')
      } else {
        document.body.classList.remove('fixed', 'overflow-hidden', 'w-full')
      }
      return () => {
        document.body.classList.remove('fixed', 'overflow-hidden', 'w-full')
      }
    }, [show])

    if (!show) return null

    const [loading, setLoading] = useState<boolean>(true)
    const [machineId, setMachineId] = useState<string | null>(null)
    const [tautulliModalUrl, setTautulliModalUrl] = useState<string | null>(
      null,
    )
    const [metadata, setMetadata] = useState<Metadata | null>(null)

    const mediaTypeOf = useMemo(
      () =>
        ['show', 'season', 'episode'].includes(mediaType) ? 'tv' : mediaType,
      [mediaType],
    )

    useEffect(() => {
      GetApiHandler('/plex').then((resp) =>
        setMachineId(resp.machineIdentifier),
      )
      GetApiHandler('/settings').then((resp) =>
        setTautulliModalUrl(resp?.tautulli_url || null),
      )
      GetApiHandler<Metadata>(`/plex/meta/${id}`).then((data) => {
        setMetadata(data)
        setLoading(false)
      })
    }, [id])

    return (
      <div
        className="fixed inset-0 z-50 flex items-start items-center justify-center bg-black bg-opacity-70 px-3"
        onClick={onClose} // Close modal when clicking outside
      >
        <div
          className="relative max-h-[90vh] w-full max-w-4xl overflow-auto rounded-xl bg-zinc-800 shadow-lg sm:w-3/4"
          onClick={(e) => e.stopPropagation()} // Prevent modal close on content click
        >
          {/* Top Half with Background Image */}
          <div className="relative h-0 w-full overflow-hidden p-2 md:h-60 lg:h-60 xl:h-96">
            <div
              className="h-full w-full rounded-xl bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: backdrop
                  ? `url(${backdrop})`
                  : 'linear-gradient(to bottom, #1e293b, #1e293b)',
              }}
            ></div>
            {loading && (
              <div className="absolute bottom-0 left-0 right-0 top-0 flex items-center justify-center bg-black bg-opacity-50">
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-t-4 border-sky-600 border-t-sky-200"></div>
              </div>
            )}

            <div className="absolute left-4 top-4 z-10 flex flex-col">
              <div
                className={`pointer-events-none rounded-lg bg-opacity-70 ${
                  mediaType === 'movie'
                    ? 'bg-black'
                    : mediaType === 'show'
                      ? 'bg-amber-900'
                      : mediaType === 'season'
                        ? 'bg-yellow-700'
                        : 'bg-rose-900'
                }`}
              >
                <div className="flex h-5 items-center justify-center px-3 text-xs font-medium uppercase text-zinc-200 xl:h-5">
                  {mediaType}
                </div>
              </div>
              {metadata?.contentRating && (
                <div className="pointer-events-none mt-1 flex h-5 items-center justify-center rounded-lg bg-black bg-opacity-70 p-2 text-xs font-medium uppercase text-zinc-200 xl:h-5">
                  {'Rated: '}
                  {metadata.contentRating || ''}
                </div>
              )}
            </div>
            <div className="absolute right-4 top-4 z-10 flex-col">
              {tmdbid && (
                <div>
                  <a
                    href={`https://themoviedb.org/${mediaTypeOf}/${tmdbid}`}
                    target="_blank"
                  >
                    <img
                      src={`/icons_logos/tmdb_logo.svg`}
                      alt="TMDB Logo"
                      className="h-8 w-32 rounded-lg bg-black bg-opacity-70 p-2 shadow-lg"
                    />
                  </a>
                </div>
              )}
              <div>
                <a
                  href={`https://app.plex.tv/desktop#!/server/${machineId}/details?key=%2Flibrary%2Fmetadata%2F${id}`}
                  target="_blank"
                >
                  <img
                    src={`/icons_logos/plex_logo.svg`}
                    alt="Plex Logo"
                    className="mt-1 h-8 w-32 rounded-lg bg-black bg-opacity-70 p-1 shadow-lg"
                  />
                </a>
              </div>
              {tautulliModalUrl && (
                <div>
                  <a
                    href={`${tautulliModalUrl}/info?rating_key=${id}&source=history`}
                    target="_blank"
                  >
                    <img
                      src={`/icons_logos/tautulli_logo.svg`}
                      alt="Plex Logo"
                      className="mt-1 h-8 w-32 rounded-lg bg-black bg-opacity-70 p-1.5 shadow-lg"
                    />
                  </a>
                </div>
              )}
            </div>
            {metadata && (
              <>
                {metadata.Rating && metadata.Rating.length > 0 ? (
                  <div className="pointer-default absolute bottom-4 left-4 z-10 flex flex-col">
                    {metadata.Rating.map((rating, index) => {
                      const prefix = rating.image.split('://')[0]
                      const type = rating.type

                      const iconMap: Record<string, Record<string, string>> = {
                        imdb: {
                          audience: '/icons_logos/imdb_icon.svg',
                        },
                        rottentomatoes: {
                          critic: '/icons_logos/rt_critic.svg',
                          audience: 'icons_logos/rt_audience.svg',
                        },
                        themoviedb: {
                          audience: '/icons_logos/tmdb_icon.svg',
                        },
                      }

                      const icon = iconMap[prefix]?.[type]
                      return (
                        <div
                          key={index}
                          className="mb-1 flex items-center justify-between space-x-1 rounded-lg bg-black bg-opacity-70 px-3 py-1 text-white shadow-lg"
                        >
                          <img
                            src={icon}
                            alt={`${prefix} ${type} Icon`}
                            className="h-6 w-6"
                            title={`${prefix}-${type}`}
                          />
                          <span className="flex cursor-default items-center justify-end text-sm font-medium">
                            {rating.value}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  ''
                )}
                {metadata.Genre && metadata.Genre.length > 0 ? (
                  <div className="pointer-events-none absolute bottom-4 right-4 z-10 flex flex-wrap">
                    {metadata.Genre.map((genre, index) => (
                      <span
                        key={index}
                        className="mr-0.5 flex h-8 items-center justify-center rounded-lg bg-black bg-opacity-70 px-2 font-medium text-white shadow-lg"
                      >
                        {genre.tag}
                      </span>
                    ))}
                  </div>
                ) : (
                  ''
                )}
              </>
            )}
          </div>

          <div className="p-4">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-100">
                  {title} ({year})
                </h2>
              </div>
            </div>

            <div className="mt-2 text-gray-300">
              <p>{summary || 'No summary available.'}</p>
            </div>

            <div className="mr-0.5 mt-6 flex flex-row items-center justify-between">
              {metadata?.Guid &&
                ['movie', 'show'].includes(mediaType) &&
                metadata.Guid.length > 0 && (
                  <div className="flex flex-wrap items-center text-xs text-zinc-400">
                    {metadata.Guid.map((guid, index) => (
                      <span
                        key={index}
                        className="mb-0.5 mr-0.5 flex h-8 items-center justify-center rounded-lg bg-zinc-700 bg-opacity-70 px-2 text-xs text-white shadow-lg"
                      >
                        {guid.id}
                      </span>
                    ))}
                    (Plex metadata IDs)
                  </div>
                )}
              <div className="ml-auto flex space-x-3">
                <button
                  onClick={onClose}
                  className="rounded bg-amber-600 px-4 py-2 hover:bg-amber-500 focus:outline-none"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  },
)

export default MediaModalContent
