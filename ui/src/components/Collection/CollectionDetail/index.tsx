import { BackspaceIcon, RewindIcon } from '@heroicons/react/solid'
import { useEffect, useState } from 'react'
import Collection, { ICollection, ICollectionMedia } from '..'
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
    }

    setData(plexData)
    setLoading(false)
  }

  useEffect(() => {
    getData()
  }, [])

  return (
    <div className="w-full">
      <div className="m-auto mb-3 flex">
        <h1 className="m-auto text-lg font-bold text-zinc-200 sm:m-0 xl:m-0 flex">
          <span className='w-6 m-auto mr-2 hover:cursor-pointer text-amber-700' onClick={props.onBack}>{<RewindIcon />}</span>{' '}
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
