import Image from 'next/image'
import React, { useContext, useEffect, useState } from 'react'
import LibrariesContext from '../../contexts/libraries-context'
import GetApiHandler from '../../helpers/ApiHandler'
import AddButton from '../Common/AddButton'
import LibrarySwticher from '../Common/LibrarySwitcher'
import RuleGroup, { IRuleGroup } from './RuleGroup'
import AddModal from './RuleGroup/AddModal'

const Rules: React.FC = () => {
  const [addModalActive, setAddModal] = useState(false)
  const [data, setData] = useState()
  const LibrariesCtx = useContext(LibrariesContext)
  const [selectedLibrary, setSelectedLibrary] = useState<number>(9999)
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = async () => {
    if (selectedLibrary === 9999) return await GetApiHandler('/rules')
    else return await GetApiHandler(`/rules?libraryId=${selectedLibrary}`)
  }

  useEffect(() => {
    fetchData().then((resp) => {
      setData(resp)
      setIsLoading(false)
    })
  }, [])

  useEffect(() => {
    refreshData()
  }, [selectedLibrary])

  const showAddModal = () => {
    addModalActive ? setAddModal(false) : setAddModal(true)
  }

  const onSwitchLibrary = (libraryId: number) => {
    setSelectedLibrary(libraryId)
  }

  const refreshData = (): void => {
    fetchData().then((resp) => setData(resp))
    setAddModal(false)
  }

  if (!data || isLoading) {
    return (
      <span>
        <Image layout="fill" src="/spinner.svg" alt="Loading..."></Image>
      </span>
    )
  }

  if (addModalActive) {
    return (
      <AddModal
        onSuccess={refreshData}
        onCancel={() => {
          setAddModal(false)
        }}
      />
    )
  }

  return (
    <>
      <div className="w-full">
        <LibrarySwticher onSwitch={onSwitchLibrary} />

        <div>
          {(data as IRuleGroup[]).map((el) => (
            <RuleGroup
              onDelete={refreshData}
              key={el.id}
              group={el as IRuleGroup}
            />
          ))}
        </div>
        <div className="m-auto h-10 w-10">
          <AddButton onClick={showAddModal} text="+" />
        </div>
      </div>
    </>
  )
}

export default Rules
