import React, { useContext, useEffect, useState } from 'react'
import GetApiHandler from '../../utils/ApiHandler'
import LibrarySwitcher from '../Common/LibrarySwitcher'
import OverviewContent, { IPlexMetadata } from './Content'

const Overview: React.FC = () => {
  const [isLoading, setIsLoading] = useState<Boolean>(false)
  const [data, setData] = useState<IPlexMetadata[]>([])
  const [selectedLibrary, setSelectedLibrary] = useState<number>(9999)
  const [dataPage, setDataPage] = useState<number>(0)
  const [totalSize, setTotalSize] = useState<number>(0)

  useEffect(() => {
    if (selectedLibrary !== 9999) {
      GetApiHandler(
        `/plex/library/${selectedLibrary}/content/${dataPage + 1}`
      ).then((resp) => {
        setTotalSize(resp.totalSize)
        setDataPage(dataPage + 1)
        setData(resp.items)
        setIsLoading(false)
      })
    }
  }, [selectedLibrary])

  const switchLib = (libraryId: number) => {
    // get all movies & shows from plex
    setIsLoading(true)
    setDataPage(0)
    setTotalSize(0)
    setSelectedLibrary(libraryId)
  }


  return (
    <div className='w-full'>
      <LibrarySwitcher allPossible={false} onSwitch={switchLib} />
      <OverviewContent loading={isLoading} data={data} />
    </div>
  )
}
export default Overview
