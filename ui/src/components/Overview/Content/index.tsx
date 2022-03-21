import { useEffect, useState } from 'react'
import GetApiHandler from '../../../utils/ApiHandler'
import LoadingSpinner from '../../Common/LoadingSpinner'
import MediaCard from '../../Common/MediaCard'

interface IOverviewContent {
  data: IPlexMetadata[]
  loading: Boolean
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
    window.addEventListener('scroll', scrollHandler)
  }, [])

  const scrollHandler = (event: React.UIEvent<HTMLElement>) => {
    event.stopPropagation()
    console.log(event.currentTarget)
    console.log('scrolled')

    if (
      event.currentTarget.scrollHeight - event.currentTarget.scrollTop ===
      event.currentTarget.clientHeight
    ) {
      console.log('bottom')
    }
  }

  if (props.loading) {
    return <LoadingSpinner />
  }

  if (props.data && props.data.length > 0) {
    return (
      <div
        onScroll={scrollHandler}
        className="flex w-full flex-col flex-wrap overflow-auto sm:flex-row"
      >
        {props.data.map((el) => {
          return (
            <div className="mb-5 mr-5" key={+el.ratingKey}>
              <MediaCard
                id={+el.ratingKey}
                image={''}
                summary={el.summary}
                year={el.year.toString()}
                mediaType={
                  el.type !== 'movie' && el.type !== 'show' ? 'movie' : el.type
                }
                title={el.title}
                userScore={el.audienceRating ? el.audienceRating : 0}
                tmdbid={
                  el.Guid.find((e) => e.id.includes('tmdb'))?.id.split(
                    'tmdb://'
                  )[1]
                }
              />
            </div>
          )
        })}
      </div>
    )
  }
  return <></>
}
export default OverviewContent
