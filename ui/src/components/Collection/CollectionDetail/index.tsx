import { RewindIcon } from '@heroicons/react/solid'
import Router from 'next/router'
import { useEffect, useState } from 'react'
import { ICollection, ICollectionMedia } from '..'
import GetApiHandler from '../../../utils/ApiHandler'
import OverviewContent, { IPlexMetadata } from '../../Overview/Content'

interface ICollectionDetail {
  libraryId: number
  collection: ICollection
  title: string
  onBack: () => void
}

const CollectionDetail: React.FC<ICollectionDetail> = (
  props: ICollectionDetail
) => {
  const [isLoading, setLoading] = useState<boolean>(true)
  const [data, setData] = useState<IPlexMetadata[]>([])
  const [media, setMedia] = useState<ICollectionMedia[]>([])

  const getData = async () => {
    const media: ICollectionMedia[] = await GetApiHandler(
      `/collections/media?collectionId=${props.collection.id}`
    )
    setMedia(media)
    const plexData: IPlexMetadata[] = []

    for (const el of media) {
      plexData.push(await GetApiHandler(`/plex/meta/${el.plexId}`))

      if (plexData[plexData.length - 1]?.grandparentRatingKey) {
        plexData[plexData.length - 1].parentData = await GetApiHandler(
          `/plex/meta/${plexData[plexData.length - 1].grandparentRatingKey}`
        )
      } else if (plexData[plexData.length - 1]?.parentRatingKey) {
        plexData[plexData.length - 1].parentData = await GetApiHandler(
          `/plex/meta/${plexData[plexData.length - 1].parentRatingKey}`
        )
      }
    }

    setData(plexData)
    setLoading(false)
  }

  useEffect(() => {
    getData()
  }, [])

  useEffect(() => {
    // trapping next router before-pop-state to manipulate router change on browser back button
    Router.beforePopState(() => {
      props.onBack()
      window.history.forward()
      return false
    })
    return () => {
      Router.beforePopState(() => {
        return true
      })
    }
  }, [])

  return (
    <div className="w-full">
      <div className="m-auto mb-3 flex">
        <h1 className="m-auto flex text-lg font-bold text-zinc-200 sm:m-0 xl:m-0">
          <span
            className="m-auto mr-2 w-6 text-amber-700 hover:cursor-pointer"
            onClick={props.onBack}
          >
            {<RewindIcon />}
          </span>{' '}
          {`${props.title}`}
        </h1>
      </div>
      {/* 
      <div className="m-auto mb-3 flex ">
        <div className="m-auto sm:m-0 ">
          <ExecuteButton
            onClick={debounce(() => {}, 5000)}
            text="Handle collection"
          />
        </div>
      </div> */}

      <OverviewContent
        dataFinished={true}
        fetchData={() => {}}
        loading={isLoading}
        data={data}
        libraryId={props.libraryId}
        collectionPage={true}
        onRemove={() =>
          setTimeout(() => {
            getData()
          }, 300)
        }
        collectionInfo={media.map((el) => {
          props.collection.media = []
          el.collection = props.collection
          return el
        })}
      />
    </div>
  )
}
export default CollectionDetail
