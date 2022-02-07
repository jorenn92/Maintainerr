import { useContext, useEffect, useState } from 'react'
import LibrariesContext, { ILibrary } from '../../contexts/libraries-context'
import GetApiHandler from '../../utils/ApiHandler'
import LibrarySwticher from '../Common/LibrarySwitcher'
import CollectionItem from './CollectionItem'

export interface ICollection {
  id?: number
  plexId?: number
  libraryId: number
  title: string
  description?: string
  isActive: boolean
  visibleOnHome?: boolean
  deleteAfterDays?: number
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
}

const Collection = () => {
  const LibrariesCtx = useContext(LibrariesContext)
  const [isLoading, setIsLoading] = useState(true)
  const [library, setLibrary] = useState<ILibrary>()
  const [collections, setCollections] = useState<ICollection[]>()

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

  return (
    <>
      <LibrarySwticher onSwitch={onSwitchLibrary} />
      <div className="flex flex-col sm:flex-row">
        {collections?.map((col) => (
          <CollectionItem key={col.id} collection={col} />
        ))}
      </div>
    </>
  )
}

export default Collection
