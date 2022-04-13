import { RefreshIcon } from '@heroicons/react/outline'
import { PlayIcon } from '@heroicons/react/solid'
import Image from 'next/image'
import React, { useContext, useEffect, useState } from 'react'
import LibrariesContext from '../../contexts/libraries-context'
import GetApiHandler, { PostApiHandler } from '../../utils/ApiHandler'
import AddButton from '../Common/AddButton'
import ExecuteButton from '../Common/ExecuteButton'
import LibrarySwitcher from '../Common/LibrarySwitcher'
import LoadingSpinner from '../Common/LoadingSpinner'
import RuleGroup, { IRuleGroup } from './RuleGroup'
import AddModal from './RuleGroup/AddModal'

const Rules: React.FC = () => {
  const [addModalActive, setAddModal] = useState(false)
  const [editModalActive, setEditModal] = useState(false)
  const [data, setData] = useState()
  const [editData, setEditData] = useState<IRuleGroup>()
  const LibrariesCtx = useContext(LibrariesContext)
  const [selectedLibrary, setSelectedLibrary] = useState<number>(9999)
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = async () => {
    if (selectedLibrary === 9999) return await GetApiHandler('/rules')
    else return await GetApiHandler(`/rules?libraryId=${selectedLibrary}`)
  }

  useEffect(() => {
    document.title = 'Maintainerr - Rules'
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
    setEditModal(false)
  }

  const editHandler = (group: IRuleGroup): void => {
    setEditData(group)
    setEditModal(true)
  }

  const sync = () => {
    PostApiHandler(`/rules/execute`, {})
  }

  if (!data || isLoading) {
    return (
      <span>
        <LoadingSpinner />
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

  if (editModalActive) {
    return (
      <AddModal
        onSuccess={refreshData}
        editData={editData}
        onCancel={() => {
          setEditModal(false)
        }}
      />
    )
  }

  return (
    <>
      <div className="w-full">
        <LibrarySwitcher onSwitch={onSwitchLibrary} />

        <div className="mb-5 flex m-auto ">
          <div className="ml-auto sm:ml-0">
            <AddButton onClick={showAddModal} text="New rule" />
          </div>
          <div className="ml-2 mr-auto sm:mr-0 ">
            <ExecuteButton onClick={sync} text="Run rules" />
          </div>
        </div>

        <div>
          {(data as IRuleGroup[]).map((el) => (
            <RuleGroup
              onDelete={refreshData}
              onEdit={editHandler}
              key={el.id}
              group={el as IRuleGroup}
            />
          ))}
        </div>
      </div>
    </>
  )
}

export default Rules
