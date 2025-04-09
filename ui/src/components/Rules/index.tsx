import { RuleGroupDto } from '@maintainerr/contracts'
import { AxiosError } from 'axios'
import { useEffect, useState } from 'react'
import { useToasts } from 'react-toast-notifications'
import { ConstantsContextProvider } from '../../contexts/constants-context'
import { useTaskStatusContext } from '../../contexts/taskstatus-context'
import GetApiHandler, { PostApiHandler } from '../../utils/ApiHandler'
import AddButton from '../Common/AddButton'
import ExecuteButton from '../Common/ExecuteButton'
import LibrarySwitcher from '../Common/LibrarySwitcher'
import LoadingSpinner from '../Common/LoadingSpinner'
import RuleGroup from './RuleGroup'
import AddModal from './RuleGroup/AddModal'

const Rules = () => {
  const [addModalActive, setAddModal] = useState(false)
  const [editModalActive, setEditModal] = useState(false)
  const [data, setData] = useState<RuleGroupDto[]>()
  const [editData, setEditData] = useState<RuleGroupDto>()
  const [selectedLibrary, setSelectedLibrary] = useState<number>(9999)
  const [isLoading, setIsLoading] = useState(true)
  const { addToast } = useToasts()
  const { ruleHandlerRunning } = useTaskStatusContext()

  const fetchData = async () => {
    if (selectedLibrary === 9999)
      return await GetApiHandler<RuleGroupDto[]>('/rules')
    else
      return await GetApiHandler<RuleGroupDto[]>(
        `/rules?libraryId=${selectedLibrary}`,
      )
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

  const editHandler = (group: RuleGroupDto): void => {
    setEditData(group)
    setEditModal(true)
  }

  const sync = async () => {
    try {
      await PostApiHandler(`/rules/execute`, {})

      addToast('Initiated rule execution in the background.', {
        autoDismiss: true,
        appearance: 'success',
      })
    } catch (e) {
      if (e instanceof AxiosError) {
        if (e.response?.status === 409) {
          addToast('Rule execution is already running.', {
            autoDismiss: true,
            appearance: 'error',
          })
          return
        }
      }

      addToast('Failed to initiate rule execution.', {
        autoDismiss: true,
        appearance: 'error',
      })
    }
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
          <div className="ml-auto sm:ml-0">
            <AddButton onClick={showAddModal} text="New Rule" />
          </div>
          <div className="ml-2 mr-auto sm:mr-0">
            <ExecuteButton
              onClick={sync}
              text="Run Rules"
              executing={ruleHandlerRunning}
            />
          </div>
        </div>
        <h1 className="mb-3 text-lg font-bold text-zinc-200">{'Rules'}</h1>
        <ul className="xs:collection-cards-vertical">
          {data.map((el) => (
            <li
              key={el.id}
              className="collection relative mb-5 flex h-fit transform-gpu flex-col rounded-xl bg-zinc-800 bg-cover bg-center p-4 text-zinc-400 shadow ring-1 ring-zinc-700 xs:w-full sm:mb-0 sm:mr-5"
            >
              <RuleGroup
                onDelete={refreshData}
                onEdit={editHandler}
                group={el}
              />
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

export default Rules
