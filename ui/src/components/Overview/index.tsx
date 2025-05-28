import { orderBy } from 'lodash'
import { useContext, useEffect, useRef, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import LibrariesContext from '../../contexts/libraries-context'
import SearchContext from '../../contexts/search-context'
import GetApiHandler from '../../utils/ApiHandler'
import { metadataEnrichment } from '../../utils/MetadataEnrichment'
import FilterDropdown, { FilterOption } from '../Common/FilterDropdown'
import LibrarySwitcher from '../Common/LibrarySwitcher'
import SortDropdown, { SortOption } from '../Common/SortDropdown'
import ViewToggleDropdown, { ViewMode } from '../Common/ViewModeDropdown'
import OverviewContent, { IPlexMetadata } from './Content'

const Overview = () => {
  const loadingRef = useRef<boolean>(false)
  const [data, setData] = useState<IPlexMetadata[]>([])
  const [visibleCount, setVisibleCount] = useState(100)
  const [allItems, setAllItems] = useState<IPlexMetadata[]>([])
  const [selectedLibrary, setSelectedLibrary] = useState<number | undefined>(
    undefined,
  )
  const backendSortableFields = [
    'addedAt',
    'originallyAvailableAt',
    'viewCount',
    'lastViewedAt',
  ]

  useEffect(() => {
    const stored = sessionStorage.getItem('maintainerr_selectedLibrary')
    if (stored) {
      setSelectedLibrary(+stored)
    }
  }, [])

  const [searchUsed, setSearchUsed] = useState<boolean>(false)
  const SearchCtx = useContext(SearchContext)
  const LibrariesCtx = useContext(LibrariesContext)
  const [libraryCount, setLibraryCount] = useState<number>(1000)
  const [sortOption, setSortOption] = useState<SortOption>('title:asc')
  const [filterOption, setFilterOption] = useState<FilterOption>('all')
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('maintainerr_viewMode')
      return (stored as ViewMode) || 'poster'
    }
    return 'poster'
  })

  const [ruleGroups, setRuleGroups] = useState<Record<number, string>>({})

  useEffect(() => {
    GetApiHandler('/rules').then((resp) => {
      if (Array.isArray(resp)) {
        const map: Record<number, string> = {}
        for (const group of resp) {
          map[group.id] = group.name
        }
        setRuleGroups(map)
      }
    })
  }, [])

  useEffect(() => {
    sessionStorage.setItem('maintainerr_viewMode', viewMode)

    if (selectedLibrary !== undefined) {
      sessionStorage.setItem(
        'maintainerr_selectedLibrary',
        String(selectedLibrary),
      )
    }
  }, [viewMode, selectedLibrary])

  useEffect(() => {
    document.title = 'Maintainerr - Overview'

    if (typeof window === 'undefined') return
    if (!selectedLibrary && LibrariesCtx.libraries.length > 0) {
      const stored = sessionStorage.getItem('maintainerr_selectedLibrary')
      const fallbackId = +LibrariesCtx.libraries[0].key

      const validId =
        stored && LibrariesCtx.libraries.some((lib) => +lib.key === +stored)
          ? +stored
          : fallbackId

      switchLib(validId)
    }
  }, [LibrariesCtx.libraries])

  useEffect(() => {
    if (SearchCtx.search.text === '') {
      setSearchUsed(false)
      setData([])
      loadingRef.current = true

      if (selectedLibrary !== undefined) {
        switchLib(selectedLibrary)
      }
    }
  }, [SearchCtx.search.text])

  useEffect(() => {
    if (!searchUsed && selectedLibrary !== undefined) {
      switchLib(selectedLibrary)
    }
  }, [sortOption, filterOption])

  const sortData = (
    items: IPlexMetadata[],
    sort: SortOption,
  ): IPlexMetadata[] => {
    const [field, direction] = sort.split(':') as [string, 'asc' | 'desc']

    if (field === 'title') {
      return orderBy(
        items,
        [(el) => el.grandparentTitle || el.parentTitle || el.title || ''],
        [direction],
      )
    }

    if (field === 'addedAt') {
      return orderBy(items, ['addedAt'], [direction])
    }

    return items
  }

  const switchLib = async (libraryId: number) => {
    loadingRef.current = true
    setData([])
    setSearchUsed(false)
    setSelectedLibrary(libraryId)

    // Fetch count and exclusions first
    const [countResp, exclusionResp] = await Promise.all([
      GetApiHandler(`/plex/library/${libraryId}/content/count`),
      GetApiHandler(`/rules/exclusion/all`),
    ])

    const count = countResp?.count ?? 1000
    setLibraryCount(count)
    console.log(`Fetching ${count} items for library ${libraryId}`)

    // Fetch all metadata
    const sortField = sortOption.split(':')[0]
    const isBackendSortable = backendSortableFields.includes(sortField)
    const apiSortParam = isBackendSortable ? `&sort=${sortOption}` : ''

    const plexResp = await GetApiHandler(
      `/plex/library/${libraryId}/content?page=1&size=${count}${apiSortParam}`,
    )

    const enrichedItems = metadataEnrichment(plexResp.items, exclusionResp)
    const sortedItems = sortData(enrichedItems, sortOption)

    const filteredItems = sortedItems.filter((item) => {
      if (filterOption === 'excluded') return !!item.maintainerrExclusionType
      if (filterOption === 'nonExcluded') return !item.maintainerrExclusionType
      return true
    })

    setVisibleCount(100)
    setAllItems(filteredItems)
    setData(filteredItems.slice(0, 100))
    loadingRef.current = false
  }

  // Triggers additional data load when near the bottom
  const { ref, inView } = useInView({
    rootMargin: '400px',
    threshold: 0,
  })

  useEffect(() => {
    if (inView && data.length < allItems.length) {
      const nextItems = allItems.slice(0, data.length + 100)
      setData(nextItems)
      setVisibleCount(nextItems.length)
    }
  }, [inView])

  return (
    <div className="w-full">
      <div className="sticky top-16 z-10 flex flex-col items-center justify-center overflow-visible rounded-b-md bg-zinc-900 px-4 py-4 md:flex-row">
        {!searchUsed && (
          <>
            <div className="w-full md:w-1/2">
              <LibrarySwitcher
                allPossible={false}
                onSwitch={switchLib}
                value={selectedLibrary}
              />
            </div>
            <div className="ml-0 mt-2 flex space-x-2 md:ml-auto md:mt-0">
              <ViewToggleDropdown viewMode={viewMode} onChange={setViewMode} />
              <SortDropdown value={sortOption} onChange={setSortOption} />
              <FilterDropdown value={filterOption} onChange={setFilterOption} />
            </div>
          </>
        )}
      </div>

      {selectedLibrary ? (
        <OverviewContent
          loading={loadingRef.current}
          data={data}
          libraryId={selectedLibrary}
          viewMode={viewMode}
          ruleGroups={ruleGroups}
        />
      ) : undefined}

      <div ref={ref} className="h-10 w-full" />
    </div>
  )
}
export default Overview
