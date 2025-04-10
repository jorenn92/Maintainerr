import { CollectionDto, CollectionWithMediaDto } from '@maintainerr/contracts'
import { AxiosError } from 'axios'
import { useContext, useEffect, useState } from 'react'
import { useToasts } from 'react-toast-notifications'
import LibrariesContext, { ILibrary } from '../../contexts/libraries-context'
import GetApiHandler, { PostApiHandler } from '../../utils/ApiHandler'
import LoadingSpinner from '../Common/LoadingSpinner'
import CollectionDetail from './CollectionDetail'
import CollectionOverview from './CollectionOverview'

const Collection = () => {
  const LibrariesCtx = useContext(LibrariesContext)
  const [isLoading, setIsLoading] = useState(true)
  const [detail, setDetail] = useState<{
    open: boolean
    collection: CollectionDto | undefined
  }>({ open: false, collection: undefined })
  const [library, setLibrary] = useState<ILibrary>()
  const [collections, setCollections] = useState<CollectionWithMediaDto[]>()
  const { addToast } = useToasts()

  useEffect(() => {
    document.title = 'Maintainerr - Collections'
  }, [])

  const onSwitchLibrary = (id: number) => {
    const lib =
      id != 9999
        ? LibrariesCtx.libraries.find((el) => +el.key === id)
        : undefined
    setLibrary(lib)
  }

  useEffect(() => {
    getCollections()
  }, [library])

  const getCollections = async () => {
    const colls: CollectionWithMediaDto[] = library
      ? await GetApiHandler<CollectionWithMediaDto[]>(
          `/collections?libraryId=${library.key}`,
        )
      : await GetApiHandler<CollectionWithMediaDto[]>('/collections')
    setCollections(colls)
    setIsLoading(false)
  }

  const doActions = async () => {
    try {
      await PostApiHandler(`/collections/handle`, {})

      addToast('Initiated collection handling in the background.', {
        autoDismiss: true,
        appearance: 'success',
      })
    } catch (e) {
      if (e instanceof AxiosError) {
        if (e.response?.status === 409) {
          addToast('Collection handling is already running.', {
            autoDismiss: true,
            appearance: 'error',
          })
          return
        }
      }

      addToast('Failed to initiate collection handling.', {
        autoDismiss: true,
        appearance: 'error',
      })
    }
  }

  const openDetail = (collection: CollectionDto) => {
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
