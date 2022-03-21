import Link from 'next/link'
import React, { useCallback, useEffect, useState } from 'react'
import Spinner from '../../../assets/spinner.svg'
import Transition from '../Transition'
import { useIsTouch } from '../../../hooks/useIsTouch'
import CachedImage from '../CachedImage'
import GetApiHandler from '../../../utils/ApiHandler'

interface IMediaCard {
  id: number
  image?: string
  summary?: string
  year?: string
  mediaType: 'movie' | 'show'
  title: string
  userScore: number
  canExpand?: boolean
  inProgress?: boolean
  tmdbid?: string
}

const MediaCard: React.FC<IMediaCard> = ({
  id,
  summary,
  year,
  mediaType,
  title,
  tmdbid = undefined,
  inProgress = false,
  canExpand = false,
}) => {
  const isTouch = useIsTouch()
  const [isUpdating, setIsUpdating] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [image, setImage] = useState(false)

  useEffect(() => {
    if (tmdbid) {
      GetApiHandler(`/moviedb/image/${mediaType}/${tmdbid}`).then((resp) =>
        setImage(resp)
      )
    }
  }, [])

  // Just to get the year from the date
  if (year) {
    year = year.slice(0, 4)
  }

  return (
    <div className={canExpand ? 'w-full' : 'w-36 sm:w-36 md:w-44'}>
      <div
        className={`relative transform-gpu cursor-default overflow-hidden rounded-xl bg-gray-800 bg-cover outline-none ring-1 transition duration-300 ${
          showDetail
            ? 'scale-105 shadow-lg ring-gray-500'
            : 'scale-100 shadow ring-gray-700'
        }`}
        style={{
          paddingBottom: '150%',
        }}
        onMouseEnter={() => {
          if (!isTouch) {
            setShowDetail(true)
          }
        }}
        onMouseLeave={() => setShowDetail(false)}
        onClick={() => setShowDetail(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            setShowDetail(true)
          }
        }}
        role="link"
        tabIndex={0}
      >
        <div className="absolute inset-0 h-full w-full overflow-hidden">
          <CachedImage
            className="absolute inset-0 h-full w-full"
            alt=""
            src={
              image
                ? `https://image.tmdb.org/t/p/w300_and_h450_face${image}`
                : `/images/overseerr_poster_not_found_logo_top.png`
            }
            layout="fill"
            objectFit="cover"
          />
          <div className="absolute left-0 right-0 flex items-center justify-between p-2">
            <div
              className={`pointer-events-none z-40 rounded-full shadow ${
                mediaType === 'movie' ? 'bg-blue-500' : 'bg-purple-600'
              }`}
            >
              <div className="flex h-4 items-center px-2 py-2 text-center text-xs font-medium uppercase tracking-wider text-white sm:h-5">
                {mediaType}
              </div>
            </div>
          </div>
          <Transition
            show={isUpdating}
            enter="transition ease-in-out duration-300 transform opacity-0"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition ease-in-out duration-300 transform opacity-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="absolute inset-0 z-40 flex items-center justify-center rounded-xl bg-gray-800 bg-opacity-75 text-white">
              <Spinner className="h-10 w-10" />
            </div>
          </Transition>

          <Transition
            show={!image || showDetail || showRequestModal}
            enter="transition transform opacity-0"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition transform opacity-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="absolute inset-0 overflow-hidden rounded-xl">
              {/* <Link href={mediaType === 'movie' ? `/movie/${id}` : `/tv/${id}`}>
                <a
                  className="absolute inset-0 h-full w-full cursor-pointer overflow-hidden text-left"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(45, 55, 72, 0.4) 0%, rgba(45, 55, 72, 0.9) 100%)',
                  }}
                > */}
              <div
                className="absolute inset-0 h-full w-full overflow-hidden text-left"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(45, 55, 72, 0.4) 0%, rgba(45, 55, 72, 0.9) 100%)',
                }}
              >
                <div className="flex h-full w-full items-end">
                  <div className={`px-2 pb-11 text-white`}>
                    {year && <div className="text-sm font-medium">{year}</div>}

                    <h1
                      className="whitespace-normal text-xl font-bold leading-tight"
                      style={{
                        WebkitLineClamp: 3,
                        display: '-webkit-box',
                        overflow: 'hidden',
                        WebkitBoxOrient: 'vertical',
                        wordBreak: 'break-word',
                      }}
                    >
                      {title}
                    </h1>
                    <div
                      className="whitespace-normal text-xs"
                      style={{
                        WebkitLineClamp: 5,
                        display: '-webkit-box',
                        overflow: 'hidden',
                        WebkitBoxOrient: 'vertical',
                        wordBreak: 'break-word',
                      }}
                    >
                      {summary}
                    </div>
                  </div>
                </div>
                {/* </a>
              </Link> */}
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  )
}

export default MediaCard
