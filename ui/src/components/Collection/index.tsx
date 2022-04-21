import { debounce } from 'lodash'
import { useContext, useEffect, useState } from 'react'
import LibrariesContext, { ILibrary } from '../../contexts/libraries-context'
import GetApiHandler, { PostApiHandler } from '../../utils/ApiHandler'
import ExecuteButton from '../Common/ExecuteButton'
import LibrarySwitcher from '../Common/LibrarySwitcher'
import CollectionDetail from './CollectionDetail'
import CollectionItem from './CollectionItem'
import CollectionOverview from './CollectionOverview'

export interface ICollection {
  id?: number
  plexId?: number
  libraryId: number
  title: string
  description?: string
  isActive: boolean
  visibleOnHome?: boolean
  deleteAfterDays?: number
  type: number
  arrAction: number
  media: ICollectionMedia[]
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
    const lib = LibrariesCtx.libraries.find((el) => +el.key === id)
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
