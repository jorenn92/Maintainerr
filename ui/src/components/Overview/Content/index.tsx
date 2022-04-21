import { useEffect } from 'react'
import { ICollection, ICollectionMedia } from '../../Collection'
import LoadingSpinner from '../../Common/LoadingSpinner'
import MediaCard from '../../Common/MediaCard'

interface IOverviewContent {
  data: IPlexMetadata[]
  dataFinished: Boolean
  loading: Boolean
  fetchData: () => void
  onRemove?: () => void
  libraryId: number
  collectionPage?: boolean
  collectionInfo?: ICollectionMedia[]
}

export interface IPlexMetadata {
  ratingKey: string
  key: string
  parentRatingKey?: string
  art: string
  audienceRating?: number
  audienceRatingImage?: string
  contentRating?: string
  duration: number
  guid: string
  type: 'movie' | 'show' | 'season'
  title: string
  Guid: {
    id: string
  }[]
  Genre?: {
    id: string
  }[]
  Country?: {
    tag: string
  }[]
  Role?: {
    tag: string
  }[]
  Writer?: {
    tag: string
  }[]
  Director?: {
    tag: string
  }[]
  addedAt: number
  childCount?: number
  leafCount?: number
  viewedLeafCount?: number
  primaryExtraKey: string
  originallyAvailableAt: string
  updatedAt: number
  thumb: string
  tagline?: string
  summary: string
  studio: string
  year: number
}

const OverviewContent = (props: IOverviewContent) => {
  useEffect(() => {
    window.addEventListener('scroll', (event: Event) => {
      if (!props.dataFinished) {
        event.stopPropagation()
        const winheight =
          window.innerHeight ||
          (document.documentElement || document.body).clientHeight
        const docheight = getDocHeight()
        const scrollTop =
          window.pageYOffset ||
          (
            document.documentElement ||
            document.body.parentNode ||
            document.body
          ).scrollTop
        const trackLength = docheight - winheight
        const pctScrolled = Math.floor((scrollTop / trackLength) * 100)

        if (pctScrolled >= 80) {
          props.fetchData()
        }
      }
    })

    if (document.body.scrollHeight >= document.body.clientHeight) {
      props.fetchData()
    }
  }, [])

  useEffect(() => {
    if (props.data && props.data.length < 20) {
      if (document.body.scrollHeight >= document.body.clientHeight) {
        props.fetchData()
      }
    }
  }, [props.data])

  const getDocHeight = () => {
    var D = document
    return Math.max(
      D.body.scrollHeight,
      D.documentElement.scrollHeight,
      D.body.offsetHeight,
      D.documentElement.offsetHeight,
      D.body.clientHeight,
      D.documentElement.clientHeight
    )
  }

  const getDaysLeft = (plexId: number) => {
    if (props.collectionInfo) {
      const collectionData = props.collectionInfo.find(
        (colEl) => colEl.plexId === +plexId
      )
      if (collectionData && collectionData.collection) {
        const date = new Date(collectionData.addDate)
        const today = new Date()

        date.setDate(
          date.getDate() + collectionData.collection.deleteAfterDays!
        )

        const diffTime = Math.abs(date.getTime() - today.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays
      }
    }
  }

  if (props.loading) {
    return <LoadingSpinner />
  }

  if (props.data && props.data.length > 0) {
    return (
      <div className="flex w-full flex-wrap overflow-auto">
        {props.data.map((el) => (
          <div className="m-auto mb-2 mt-2 sm:m-2" key={+el.ratingKey}>
            <MediaCard
              id={+el.ratingKey}
              libraryId={props.libraryId}
              type={el.type === 'movie' ? 1 : 2}
              image={''}
              summary={el.summary}
              year={el.year.toString()}
              mediaType={
                el.type !== 'movie' && el.type !== 'show' ? 'movie' : el.type
              }
              title={el.title}
              userScore={el.audienceRating ? el.audienceRating : 0}
              tmdbid={
                el.Guid
                  ? el.Guid.find((e) => e.id.includes('tmdb'))?.id.split(
                      'tmdb://'
                    )[1]
                  : undefined
              }
              collectionPage={
                props.collectionPage ? props.collectionPage : false
              }
              onRemove={props.onRemove}
              {...(props.collectionInfo
                ? {
                    daysLeft: getDaysLeft(+el.ratingKey),
                    collectionId: props.collectionInfo.find(
                      (colEl) => colEl.plexId === +el.ratingKey
                    )?.collectionId,
                  }
                : {})}
            />
          </div>
        ))}
      </div>
    )
  }
  return <></>
}
export default OverviewContent
