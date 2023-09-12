import React, { memo, useEffect, useState } from 'react'
import Spinner from '../../../assets/spinner.svg'
import Transition from '../Transition'
import { useIsTouch } from '../../../hooks/useIsTouch'
import CachedImage from '../CachedImage'
import GetApiHandler from '../../../utils/ApiHandler'
import Button from '../Button'
import ExcludeModal from '../../ExcludeModal'
import AddModal from '../../AddModal'
import { DocumentAddIcon, DocumentRemoveIcon } from '@heroicons/react/solid'
import RemoveFromCollectionBtn from '../../Collection/CollectionDetail/RemoveFromCollectionBtn'

interface IMediaCard {
  id: number
  image?: string
  summary?: string
  year?: string
  mediaType: 'movie' | 'show' | 'season' | 'episode'
  title: string
  userScore: number
  canExpand?: boolean
  inProgress?: boolean
  tmdbid?: string
  libraryId?: number
  type?: 1 | 2 | 3 | 4
  collectionPage: boolean
  daysLeft?: number
  collectionId?: number
  onRemove?: (id: string) => void
}

const MediaCard: React.FC<IMediaCard> = ({
  id,
  summary,
  year,
  mediaType,
  title,
  libraryId,
  type,
  daysLeft = 999,
  collectionId = 0,
  tmdbid = undefined,
  canExpand = false,
  collectionPage = false,
  onRemove = (id: string) => {},
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
    if (!collectionPage) {
      GetApiHandler(`/rules/exclusion?plexId=${id}`).then((resp: []) =>
        resp.length > 0 ? setHasExclusion(true) : setHasExclusion(false)
      )
    }
  }

  // Just to get the year from the date
  if (year && mediaType !== 'episode') {
    year = year.slice(0, 4)
  }

  return (
    <div className={canExpand ? 'w-full' : 'w-36 sm:w-36 md:w-44'}>
      {excludeModal ? (
        <ExcludeModal
          plexId={id}
          {...(libraryId ? { libraryId: libraryId } : {})}
          {...(type ? { type: type } : {})}
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
          {...(libraryId ? { libraryId: libraryId } : {})}
          {...(type ? { type: type } : {})}
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
          {image ? (
            <CachedImage
              className="absolute inset-0 h-full w-full"
              alt=""
              src={`https://image.tmdb.org/t/p/w300_and_h450_face${image}`}
              fill
              style={{ objectFit: 'cover' }}
            />
          ) : undefined}
          <div className="absolute left-0 right-0 flex items-center justify-between p-2">
            <div
              className={`pointer-events-none z-40 rounded-full shadow ${
                mediaType === 'movie'
                  ? 'bg-zinc-900'
                  : mediaType === 'show'
                  ? 'bg-amber-900'
                  : mediaType === 'season'
                  ? 'bg-yellow-700'
                  : 'bg-rose-900'
              }`}
            >
              <div className="flex h-4 items-center px-2 py-2 text-center text-xs font-medium uppercase tracking-wider text-zinc-200 sm:h-5">
                {mediaType}
              </div>
            </div>
          </div>

          {hasExclusion && !collectionPage ? (
            <div className="absolute right-0 flex items-center justify-between p-2">
              <div
                className={`pointer-events-none z-40 rounded-full shadow ${
                  mediaType === 'movie'
                    ? 'bg-zinc-900'
                    : mediaType === 'show'
                    ? 'bg-amber-900'
                    : mediaType === 'season'
                    ? 'bg-yellow-700'
                    : 'bg-rose-900'
                }`}
              >
                <div className="flex h-4 items-center px-2 py-2 text-center text-xs font-medium uppercase tracking-wider text-zinc-200 sm:h-5">
                  {'EXCL'}
                </div>
              </div>
            </div>
          ) : undefined}

          {collectionPage && daysLeft !== 999 ? (
            <div className="absolute right-0 flex items-center justify-between p-2">
              <div
                className={`pointer-events-none z-40 rounded-full shadow ${
                  mediaType === 'movie'
                    ? 'bg-zinc-900'
                    : mediaType === 'show'
                    ? 'bg-amber-900'
                    : mediaType === 'season'
                    ? 'bg-yellow-700'
                    : 'bg-rose-900'
                }`}
              >
                <div className="flex h-4 items-center px-2 py-2 text-center text-xs font-medium uppercase tracking-wider text-zinc-200 sm:h-5">
                  {daysLeft > 0 ? daysLeft : 0}
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
            <div className="absolute inset-0 z-40 flex items-center justify-center rounded-xl bg-zinc-800 bg-opacity-75 text-zinc-200">
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
                  <div className={`w-full px-2 pb-1 text-zinc-200`}>
                    {year && <div className="text-sm font-medium">{year}</div>}

                    <h1
                      className="w-full whitespace-normal text-xl font-bold leading-tight"
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

                    {!collectionPage ? (
                      <div>
                        <Button
                          buttonType="twin-primary-l"
                          buttonSize="md"
                          className="mb-1 mt-2  h-6 w-1/2 text-zinc-200 shadow-md"
                          onClick={() => {
                            setAddModal(true)
                          }}
                        >
                          {<DocumentAddIcon className="m-auto ml-3 h-3" />}{' '}
                          <p className="rules-button-text m-auto mr-2">
                            {'Add'}
                          </p>
                        </Button>
                        <Button
                          buttonSize="md"
                          buttonType="twin-primary-r"
                          className="mt-2 h-6 w-1/2"
                          onClick={() => {
                            setExcludeModal(true)
                          }}
                        >
                          {<DocumentRemoveIcon className="m-auto ml-3 h-3" />}{' '}
                          <p className="rules-button-text m-auto mr-2">
                            {'Excl'}
                          </p>
                        </Button>
                      </div>
                    ) : (
                      <RemoveFromCollectionBtn
                        plexId={id}
                        onRemove={() => onRemove(id.toString())}
                        collectionId={collectionId}
                      />
                    )}
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
