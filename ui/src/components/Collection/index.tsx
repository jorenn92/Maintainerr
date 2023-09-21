import { useContext, useEffect, useState } from 'react'
import LibrariesContext, { ILibrary } from '../../contexts/libraries-context'
import GetApiHandler, { PostApiHandler } from '../../utils/ApiHandler'
import LoadingSpinner from '../Common/LoadingSpinner'
import CollectionDetail from './CollectionDetail'
import CollectionOverview from './CollectionOverview'
import { EPlexDataType } from '../../utils/PlexDataType-enum'
import { IPlexMetadata } from '../Overview/Content'

export interface ICollection {
  id?: number
  plexId?: number
  libraryId: number
  title: string
  description?: string
  isActive: boolean
  visibleOnHome?: boolean
  deleteAfterDays?: number
  listExclusions?: boolean
  forceOverseerr?: boolean
  type: EPlexDataType
  arrAction: number
  media: ICollectionMedia[]
  manualCollection: boolean
  manualCollectionName: string
}

export interface ICollectionMedia {
  id: number
  collectionId: number
  plexId: number
  tmdbId: number
  tvdbid: number
  addDate: Date
  image_path: string
  isManual: boolean
  collection: ICollection
  plexData?: IPlexMetadata
}

const Collection = () => {
  const LibrariesCtx = useContext(LibrariesContext)
  const [isLoading, setIsLoading] = useState(true)
  const [detail, setDetail] = useState<{
    open: boolean
    collection: ICollection | undefined
  }>({ open: false, collection: undefined })
  const [library, setLibrary] = useState<ILibrary>()
  const [collections, setCollections] = useState<ICollection[]>()

  useEffect(() => {
    document.title = 'Maintainerr - Collections'
  }, [])

  const onSwitchLibrary = (id: number) => {
    const lib =
      id != 9999
        ? LibrariesCtx.libraries.find((el) => +el.key === id)
        : undefined
    lib ? setLibrary(lib) : setLibrary(undefined)
  }

  useEffect(() => {
    getCollections()
  }, [library])

  const getCollections = async () => {
    const colls: ICollection[] = library
      ? await GetApiHandler(`/collections?libraryId=${library.key}`)
      : await GetApiHandler('/collections')
    setCollections(colls)
    setIsLoading(false)
  }

  const doActions = () => {
    PostApiHandler('/collections/handle', {})
  }

  const openDetail = (collection: ICollection) => {
    setDetail({ open: true, collection: collection })
  }

  const closeDetail = () => {
    setIsLoading(true)
    setDetail({ open: false, collection: undefined })
    getCollections()
    setIsLoading(false)
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="w-full">
      {detail.open ? (
        <CollectionDetail
          libraryId={detail.collection ? detail.collection.libraryId : 0}
          title={detail.collection ? detail.collection.title : ''}
          collection={detail.collection!}
          onBack={closeDetail}
        />
      ) : (
        <CollectionOverview
          onSwitchLibrary={onSwitchLibrary}
          collections={collections}
          doActions={doActions}
          openDetail={openDetail}
        />
      )}
    </div>
  )
}

export default Collection
