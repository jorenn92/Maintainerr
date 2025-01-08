import { debounce } from 'lodash'
import React, { useEffect, useState } from 'react'
import GetApiHandler, { PostApiHandler } from '../../utils/ApiHandler'
import AddButton from '../Common/AddButton'
import ExecuteButton from '../Common/ExecuteButton'
import LibrarySwitcher from '../Common/LibrarySwitcher'
import LoadingSpinner from '../Common/LoadingSpinner'
import RuleGroup, { IRuleGroup } from './RuleGroup'
import AddModal from './RuleGroup/AddModal'
import { useToasts } from 'react-toast-notifications'
import { ConstantsContextProvider } from '../../contexts/constants-context'

const Rules: React.FC = () => {
  const [addModalActive, setAddModal] = useState(false)
  const [editModalActive, setEditModal] = useState(false)
  const [data, setData] = useState()
  const [editData, setEditData] = useState<IRuleGroup>()
  const [selectedLibrary, setSelectedLibrary] = useState<number>(9999)
  const [isLoading, setIsLoading] = useState(true)
  const { addToast } = useToasts()

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
    setAddModal(!addModalActive)
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
    addToast(
      'Initiated rule execution in the background, consult the logs for status updates.',
      {
        autoDismiss: true,
        appearance: 'success',
      },
    )
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
      <ConstantsContextProvider>
        <AddModal
          onSuccess={refreshData}
          onCancel={() => {
            setAddModal(false)
          }}
        />
      </ConstantsContextProvider>
    )
  }

  if (editModalActive) {
    return (
      <ConstantsContextProvider>
        <AddModal
          onSuccess={refreshData}
          editData={editData}
          onCancel={() => {
            setEditModal(false)
          }}
        />
      </ConstantsContextProvider>
    )
  }

  return (
    <>
      <div className="w-full">
        <LibrarySwitcher onSwitch={onSwitchLibrary} />

        <div className="m-auto mb-3 flex">
          <div className="mr-auto sm:mr-0">
            <ExecuteButton
              onClick={debounce(sync, 5000, {
                leading: true,
                trailing: false,
              })}
              text="Run Rules"
            />
          </div>
        </div>
        <h1 className="mb-4 text-lg font-bold text-zinc-200">
          {'Rules Listing'}
        </h1>
        <ul className="max-w-8xl grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          <li className="xl:border-1 relative flex items-center justify-center rounded-xl border-2 border-dashed border-gray-400 p-4 text-zinc-400 xl:border-solid xl:border-zinc-700">
            <div className="xl:bg-rule absolute inset-0 rounded-xl bg-zinc-800 xl:bg-center xl:bg-no-repeat xl:blur-lg"></div>
            <div className="relative">
              <AddButton
                onClick={showAddModal}
                text="New Rule"
                key="add-button"
              />
            </div>
          </li>
          {(data as IRuleGroup[]).map((el) => (
            <li
              key={el.id}
              className="flex h-full rounded-xl bg-zinc-800 p-4 text-zinc-400 shadow ring-1 ring-zinc-700"
            >
              <RuleGroup
                onDelete={refreshData}
                onEdit={editHandler}
                group={el as IRuleGroup}
              />
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

export default Rules
