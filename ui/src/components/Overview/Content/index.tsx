import { useEffect } from 'react'
import LoadingSpinner from '../../Common/LoadingSpinner'
import MediaCard from '../../Common/MediaCard'

interface IOverviewContent {
  data: IPlexMetadata[]
  dataFinished: Boolean
  loading: Boolean
  fetchData: () => void
  libraryId: number
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
    if (props.data.length < 20) {
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

  if (props.loading) {
    return <LoadingSpinner />
  }

  if (props.data && props.data.length > 0) {
    return (
      <div className="flex w-full flex-wrap overflow-auto">
        {props.data.map((el) => (
          <div className="mb-5 mr-5" key={+el.ratingKey}>
            <MediaCard
              id={+el.ratingKey}
              libraryId={props.libraryId}
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
            />
          </div>
        ))}
      </div>
    )
  }
  return <></>
}
export default OverviewContent
