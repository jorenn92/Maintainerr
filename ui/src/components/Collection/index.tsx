import { debounce } from 'lodash'
import { useContext, useEffect, useState } from 'react'
import LibrariesContext, { ILibrary } from '../../contexts/libraries-context'
import GetApiHandler, { PostApiHandler } from '../../utils/ApiHandler'
import ExecuteButton from '../Common/ExecuteButton'
import LibrarySwitcher from '../Common/LibrarySwitcher'
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
}

const Collection = () => {
  const LibrariesCtx = useContext(LibrariesContext)
  const [isLoading, setIsLoading] = useState(true)
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

  return (
    <div className="w-full">
      <LibrarySwitcher onSwitch={onSwitchLibrary} />

      <div className="m-auto mb-3 flex ">
        <div className="m-auto sm:m-0 ">
          <ExecuteButton
            onClick={debounce(doActions, 5000)}
            text="Handle collections"
          />
        </div>
      </div>

      <div className="w-full">
        <div className="m-auto mb-3 flex">
        <h1 className="m-auto sm:m-0 text-lg font-bold text-zinc-200 xl:m-0">
          {'Automatic collections'}
        </h1>
        </div>


        <div className="flex flex-col sm:flex-row">
          {collections?.map((col) => (
            <CollectionItem key={col.id} collection={col} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default Collection
