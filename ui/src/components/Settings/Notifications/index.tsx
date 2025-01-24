import { useContext, useEffect, useState } from 'react'
import SettingsContext from '../../../contexts/settings-context'
import React from 'react'
import CreateNotificationModal, {
  AgentConfiguration,
} from './CreateNotificationModal'
import GetApiHandler, {
  DeleteApiHandler,
  PostApiHandler,
} from '../../../utils/ApiHandler'
import Button from '../../Common/Button'
import {
  DocumentAddIcon,
  PlusCircleIcon,
  TrashIcon,
} from '@heroicons/react/solid'
import ExecuteButton from '../../Common/ExecuteButton'
import { debounce } from 'lodash'
import { useToasts } from 'react-toast-notifications'

const NotificationSettings = () => {
  const settingsCtx = useContext(SettingsContext)
  const [addModalActive, setAddModalActive] = useState(false)
  const [configurations, setConfigurations] = useState<AgentConfiguration[]>()
  const [editConfig, setEditConfig] = useState<AgentConfiguration>()
  const { addToast } = useToasts()

  useEffect(() => {
    document.title = 'Maintainerr - Settings - Notifications'
    GetApiHandler('/notifications/configurations').then((configs) =>
      setConfigurations(configs),
    )
  }, [])

  useEffect(() => {
    GetApiHandler('/notifications/configurations').then((configs) =>
      setConfigurations(configs),
    )
  }, [addModalActive])

  const doEdit = (id: number) => {
    const config = configurations?.find((c) => c.id === id)

    setEditConfig(config)
    setAddModalActive(!addModalActive)
  }

  function confirmedDelete(id: any) {
    DeleteApiHandler(`/notifications/configuration/${id}`).then(() => {
      setConfigurations(configurations?.filter((c) => c.id !== id))
    })
  }

  const doTest = () => {
    PostApiHandler(`/notifications/test`, {}).then(() => {
      addToast(
        "Test notification deployed to all agents with the 'Test' type",
        {
          autoDismiss: true,
          appearance: 'success',
        },
      )
    })
  }

  return (
    <div className="h-full w-full">
      <div className="section-settings h-full w-full">
        <h3 className="heading">Notification Settings</h3>
        <p className="description">Notification configuration</p>
      </div>
      <div className="m-auto mb-5 flex">
        <div className="ml-2 mr-auto sm:mr-0">
          <ExecuteButton
            onClick={debounce(doTest, 5000, {
              leading: true,
              trailing: false,
            })}
            text="Test Notifications"
          />
        </div>
      </div>

      <div>
        <ul className="grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {configurations?.map((config) => (
            <li
              key={config.id}
              className="h-full rounded-xl bg-zinc-800 p-4 text-zinc-400 shadow ring-1 ring-zinc-700"
            >
              <div className="mb-2 flex items-center gap-x-3">
                <div className="text-base font-bold text-white sm:text-lg">
                  {config.name}
                </div>
                {!config.enabled && (
                  <div className="rounded bg-amber-600 px-2 py-0.5 text-xs text-zinc-200 shadow-md">
                    Disabled
                  </div>
                )}
              </div>

              <p className="mb-4 space-x-2 truncate text-gray-300">
                <span className="font-semibold">Agent</span>
                <a href={config.agent} className="hover:underline">
                  {config.agent}
                </a>
              </p>
              <div>
                <Button
                  buttonType="twin-primary-l"
                  buttonSize="md"
                  className="h-10 w-1/2"
                  onClick={() => {
                    config.id ? doEdit(config.id) : undefined
                  }}
                >
                  {<DocumentAddIcon className="m-auto" />}{' '}
                  <p className="m-auto font-semibold">Edit</p>
                </Button>
                <DeleteButton
                  onDeleteRequested={() => confirmedDelete(config.id)}
                />
              </div>
            </li>
          ))}

          <li className="flex h-full items-center justify-center rounded-xl border-2 border-dashed border-gray-400 bg-zinc-800 p-4 text-zinc-400 shadow">
            <button
              type="button"
              className="add-button m-auto flex h-9 rounded bg-amber-600 px-4 text-zinc-200 shadow-md hover:bg-amber-500"
              onClick={() => setAddModalActive(!addModalActive)}
            >
              {<PlusCircleIcon className="m-auto h-5" />}
              <p className="m-auto ml-1 font-semibold">Add Notification</p>
            </button>
          </li>
        </ul>
      </div>

      {addModalActive ? (
        <CreateNotificationModal
          onCancel={() => {
            setAddModalActive(!addModalActive)
            setEditConfig(undefined)
          }}
          onSave={() => {
            setAddModalActive(!addModalActive)
            setEditConfig(undefined)
          }}
          onTest={() => {}}
          {...(editConfig
            ? {
                selected: {
                  id: editConfig.id!,
                  name: editConfig.name!,
                  enabled: editConfig.enabled!,
                  agent: editConfig.agent!,
                  types: editConfig.types!,
                  options: editConfig.options!,
                  aboutScale: editConfig.aboutScale!,
                },
              }
            : {})}
        />
      ) : null}
    </div>
  )
}

const DeleteButton = ({
  onDeleteRequested,
}: {
  onDeleteRequested: () => void
}) => {
  const [showSureDelete, setShowSureDelete] = useState(false)

  return (
    <Button
      buttonSize="md"
      buttonType="twin-secondary-r"
      className="h-10 w-1/2"
      onClick={() => {
        if (showSureDelete) {
          onDeleteRequested()
          setShowSureDelete(false)
        } else {
          setShowSureDelete(true)
        }
      }}
    >
      {<TrashIcon className="m-auto" />}{' '}
      <p className="m-auto font-semibold">
        {showSureDelete ? <>Are you sure?</> : <>Delete</>}
      </p>
    </Button>
  )
}

export default NotificationSettings
