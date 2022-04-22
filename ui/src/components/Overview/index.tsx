import { clone, debounce } from 'lodash'
import React, { useContext, useEffect, useRef, useState } from 'react'
import LibrariesContext from '../../contexts/libraries-context'
import SearchContext from '../../contexts/search-context'
import GetApiHandler from '../../utils/ApiHandler'
import LibrarySwitcher from '../Common/LibrarySwitcher'
import { SmallLoadingSpinner } from '../Common/LoadingSpinner'
import OverviewContent, { IPlexMetadata } from './Content'

const Overview = () => {
  const [isLoading, setIsLoading] = useState<Boolean>(false)
  const [loadingExtra, setLoadingExtra] = useState<Boolean>(false)

  const [data, setData] = useState<IPlexMetadata[]>([])
  const dataRef = useRef<IPlexMetadata[]>([])

  const [totalSize, setTotalSize] = useState<number>(999)
  const totalSizeRef = useRef<number>(999)

  const [selectedLibrary, setSelectedLibrary] = useState<number>()
  const selectedLibraryRef = useRef<number>()
  const [searchUsed, setsearchUsed] = useState<Boolean>(false)

  const pageData = useRef<number>(0)
  const SearchCtx = useContext(SearchContext)
  const LibrariesCtx = useContext(LibrariesContext)

  const fetchAmount = 30

  useEffect(() => {
    document.title = 'Maintainerr - Overview'
    setTimeout(() => {
      if (
        !isLoading &&
        data.length === 0 &&
        SearchCtx.search.text === '' &&
        LibrariesCtx.libraries.length > 0
      ) {
        switchLib(
          selectedLibrary ? selectedLibrary : +LibrariesCtx.libraries[0].key
        )
      }
    }, 300)
  }, [])

  useEffect(() => {
    if (SearchCtx.search.text !== '') {
      GetApiHandler(`/plex/search/${SearchCtx.search.text}`).then(
        (resp: IPlexMetadata[]) => {
          console.log(`git items: ${resp}`)
          setsearchUsed(true)
          setTotalSize(resp.length)
          pageData.current = resp.length * 50
          setData(resp ? resp : [])
          setIsLoading(false)
        }
      )
      setSelectedLibrary(+LibrariesCtx.libraries[0]?.key)
    } else {
      setsearchUsed(false)
      setData([])
      setTotalSize(999)
      pageData.current = 0
      setIsLoading(true)
      fetchData()
    }
  }, [SearchCtx.search.text])

  useEffect(() => {
    selectedLibraryRef.current = selectedLibrary
    fetchData()
  }, [selectedLibrary])

  useEffect(() => {
    dataRef.current = data
  }, [data])

  useEffect(() => {
    totalSizeRef.current = totalSize
  }, [totalSize])

  const switchLib = (libraryId: number) => {
    // get all movies & shows from plex
    setIsLoading(true)
    pageData.current = 0
    setTotalSize(999)
    setData([])
    dataRef.current = []
    setsearchUsed(false)
    setSelectedLibrary(libraryId)
  }

  const fetchData = async () => {
    // This function didn't work with normal state. Used a state/ref hack as a result.
    if (
      selectedLibraryRef.current &&
      SearchCtx.search.text === '' &&
      totalSizeRef.current >= pageData.current * fetchAmount
    ) {
      const askedLib = clone(selectedLibraryRef.current)

      const resp: { totalSize: number; items: IPlexMetadata[] } =
        await GetApiHandler(
          `/plex/library/${selectedLibraryRef.current}/content/${
            pageData.current + 1
          }?amount=${fetchAmount}`
        )

      if (askedLib === selectedLibraryRef.current) {
        // check lib again, we don't want to change array when lib was changed
        setTotalSize(resp.totalSize)
        pageData.current = pageData.current + 1
        setData([...dataRef.current, ...resp.items])
        setIsLoading(false)
      }
      setLoadingExtra(false)
    }
  }

  return (
    <div className="w-full">
      {!searchUsed ? (
        <LibrarySwitcher allPossible={false} onSwitch={switchLib} />
      ) : undefined}
      {selectedLibrary ? (
        <OverviewContent
          dataFinished={!(totalSize >= pageData.current * fetchAmount)}
          fetchData={debounce(() => {
            setLoadingExtra(true)
            fetchData()
          }, 100)}
          loading={isLoading}
          data={data}
          libraryId={selectedLibrary}
        />
      ) : undefined}
      {loadingExtra && !isLoading && (totalSize >= pageData.current * fetchAmount) ? <SmallLoadingSpinner /> : undefined}
    </div>
  )
}
export default Overview
