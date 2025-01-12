import React, { memo, useEffect, useState } from 'react'
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
  Genre: { tag: string }
  Rating: string[]
}

const MediaModalContent: React.FC<ModalContentProps> = ({
  show,
  onClose,
  mediaType,
  image,
  backdrop,
  id,
  summary,
  year,
  title,
  userScore,
  libraryId,
  type,
  collectionId = 0,
  daysLeft = 9999,
  exclusionId = undefined,
  tmdbid = undefined,
  canExpand = false,
  exclusionType = undefined,
  isManual = false,
}) => {
  useEffect(() => {
    if (show) {
      // Disable background scroll while modal is open
      document.body.classList.add('overflow-hidden')
    } else {
      document.body.classList.remove('overflow-hidden')
    }
    return () => {
      document.body.classList.remove('overflow-hidden')
    }
  }, [show])
  if (!show) return null

  const [machineId, setMachineId] = useState<string | null>(null)
  const [tautulliModalUrl, setTautulliModalUrl] = useState<string | null>(null)
  const [metadata, setMetadata] = useState<Metadata | null>(null)

  const mediaTypeOf =
    mediaType === 'show' || mediaType === 'season' || mediaType === 'episode'
      ? 'tv'
      : mediaType

  useEffect(() => {
    GetApiHandler(`/plex`).then((resp) => setMachineId(resp.machineIdentifier))
  }, [])
  useEffect(() => {
    GetApiHandler(`/settings`).then((resp) => {
      if (resp?.tautulli_url) {
        setTautulliModalUrl(resp.tautulli_url)
      } else {
        setTautulliModalUrl('https://tautulli.com/#about')
        console.log('Tautulli is not configured')
      }
    })
  }, [])
  useEffect(() => {
    GetApiHandler<Metadata>(`/plex/meta/${id}`).then((resp) => {
      setMetadata(resp)
    })
  }, [id])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
      onClick={onClose} // Close modal when clicking outside
    >
      <div
        className="relative mt-4 w-full max-w-6xl overflow-hidden overflow-y-auto rounded-xl bg-zinc-800"
        onClick={(e) => e.stopPropagation()} // Prevent modal close on content click
      >
        {/* Top Half with Background Image */}
        <div className="relative h-screen w-full overflow-hidden p-2 xl:h-96">
          <div
            className="h-full w-full rounded-xl bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: backdrop
                ? `url(${backdrop})`
                : 'linear-gradient(to bottom, #1e293b, #1e293b)', // Fallback if no image is provided
            }}
          ></div>
          <div className="absolute left-4 top-4 z-10 flex flex-col">
            <div
              className={`pointer-events-none rounded-full bg-opacity-70 ${
                mediaType === 'movie'
                  ? 'bg-black'
                  : mediaType === 'show'
                    ? 'bg-amber-900'
                    : mediaType === 'season'
                      ? 'bg-yellow-700'
                      : 'bg-rose-900'
              }`}
            >
              <div className="flex h-5 items-center justify-center text-xs font-medium uppercase text-zinc-200 xl:h-5">
                {mediaType}
              </div>
            </div>
            <div className="mt-1 flex h-5 items-center justify-center rounded-full bg-zinc-900 bg-opacity-70 p-2 text-xs font-medium uppercase text-zinc-200 xl:h-5">
              {'Rated-'}
              {metadata ? metadata.contentRating : 'N/A'}
            </div>
          </div>
          <div className="absolute right-4 top-4 z-10 flex-col">
            <div className="">
              <a
                href={`https://themoviedb.org/${mediaTypeOf}/${tmdbid}`}
                target="_blank"
              >
                <img
                  src={`/icons_logos/tmdb_logo.svg`}
                  alt="TMDB Logo"
                  className="h-8 w-32 rounded-lg bg-black bg-opacity-70 p-2 shadow-lg" // Optional: Customize the size using Tailwind classes
                />
              </a>
            </div>
            <div className="">
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
              <div className="">
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
          <div className="absolute bottom-4 left-4 z-10 flex flex-row">
            <div className="mr-1 flex h-8 items-center justify-center rounded-lg bg-black bg-opacity-70 p-1 font-medium text-white shadow-lg">
              <img
                src="/icons_logos/tmdb_icon.svg"
                alt="TMDB Icon"
                className="" // Adjust size and spacing as needed
              />
              {userScore ? userScore * 10 : 'N/A'}%
            </div>
            <div className="ml-1 h-8 w-32 rounded-lg bg-black bg-opacity-70 p-1 text-white shadow-lg">
              testing
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-100">
                {title} ({year})
              </h2>
            </div>
          </div>

          <div className="mt-4 text-gray-300">
            <p>{summary || 'No description available.'}</p>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
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
  )
}

export default MediaModalContent
