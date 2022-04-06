import React, { memo, useCallback, useEffect, useState } from 'react'
import Spinner from '../../../assets/spinner.svg'
import Transition from '../Transition'
import { useIsTouch } from '../../../hooks/useIsTouch'
import CachedImage from '../CachedImage'
import GetApiHandler from '../../../utils/ApiHandler'
import Button from '../Button'
import ExcludeModal from '../../ExcludeModal'
import AddModal from '../../AddModal'

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
  libraryId: number
}

const MediaCard: React.FC<IMediaCard> = ({
  id,
  summary,
  year,
  mediaType,
  title,
  libraryId,
  tmdbid = undefined,
  inProgress = false,
  canExpand = false,
}) => {
  const isTouch = useIsTouch()
  const [isUpdating, setIsUpdating] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [image, setImage] = useState(false)
  const [excludeModal, setExcludeModal] = useState(false)
  const [addModal, setAddModal] = useState(false)
  const [hasExclusion, setHasExclusion] = useState(false)

  useEffect(() => {
    if (tmdbid) {
      GetApiHandler(`/moviedb/image/${mediaType}/${tmdbid}`).then((resp) =>
        setImage(resp)
      )
    }
    getExclusions()
  }, [])

  const getExclusions = () => {
    GetApiHandler(`/rules/exclusion?plexId=${id}`).then((resp: []) =>
      resp.length > 0 ? setHasExclusion(true) : setHasExclusion(false)
    )
  }

  // Just to get the year from the date
  if (year) {
    year = year.slice(0, 4)
  }

  return (
    <div className={canExpand ? 'w-full' : 'w-36 sm:w-36 md:w-44'}>
      {excludeModal ? (
        <ExcludeModal
          plexId={id}
          libraryId={libraryId}
          onSubmit={() => {
            setExcludeModal(false)
            setTimeout(() => {
              getExclusions()
            }, 500)
          }}
          onCancel={() => setExcludeModal(false)}
        />
      ) : undefined}
      {addModal ? (
        <AddModal
          plexId={id}
          libraryId={libraryId}
          onSubmit={() => {
            setAddModal(false)
          }}
          onCancel={() => setAddModal(false)}
        />
      ) : undefined}
      <div
        className={`relative transform-gpu cursor-default overflow-hidden rounded-xl bg-zinc-800 bg-cover outline-none ring-1 transition duration-300 ${
          showDetail
            ? 'scale-105 shadow-lg ring-zinc-500'
            : 'scale-100 shadow ring-zinc-700'
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
                mediaType === 'movie' ? 'bg-zinc-600' : 'bg-amber-600'
              }`}
            >
              <div className="flex h-4 items-center px-2 py-2 text-center text-xs font-medium uppercase tracking-wider text-white sm:h-5">
                {mediaType}
              </div>
            </div>
          </div>

          {hasExclusion ? (
            <div className="absolute right-0 flex items-center justify-between p-2">
              <div
                className={`pointer-events-none z-40 rounded-full shadow ${'bg-amber-900'}`}
              >
                <div className="flex h-4 items-center px-2 py-2 text-center text-xs font-medium uppercase tracking-wider text-white sm:h-5">
                  {'EXCL'}
                </div>
              </div>
            </div>
          ) : undefined}

          <Transition
            show={isUpdating}
            enter="transition ease-in-out duration-300 transform opacity-0"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition ease-in-out duration-300 transform opacity-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="absolute inset-0 z-40 flex items-center justify-center rounded-xl bg-zinc-800 bg-opacity-75 text-white">
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
                  <div className={`px-2 pb-1 text-white`}>
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
                    <div>
                      <Button
                        buttonType="twin-primary-l"
                        buttonSize="md"
                        className="mt-2 h-6 w-1/2"
                        onClick={() => {
                          setAddModal(true)
                        }}
                      >
                        {'Add'}
                      </Button>
                      <Button
                        buttonSize="md"
                        buttonType="twin-primary-r"
                        className="mt-2 h-6 w-1/2"
                        onClick={() => {
                          setExcludeModal(true)
                        }}
                      >
                        {'Exclude'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  )
}
const propsEqual = (prev: IMediaCard, next: IMediaCard) => prev.id === next.id

export default memo(MediaCard, propsEqual)
