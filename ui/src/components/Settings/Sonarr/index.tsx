import {
  DocumentAddIcon,
  PlusCircleIcon,
  TrashIcon,
} from '@heroicons/react/solid'
import { useEffect, useState } from 'react'
import GetApiHandler, { DeleteApiHandler } from '../../../utils/ApiHandler'
import Button from '../../Common/Button'
import LoadingSpinner from '../../Common/LoadingSpinner'
import SonarrSettingsModal from './SettingsModal'
import { ICollection } from '../../Collection'
import Modal from '../../Common/Modal'

type DeleteSonarrSettingResponseDto =
  | {
      status: 'OK'
      code: 1
      message: string
      data?: never
    }
  | {
      status: 'NOK'
      code: 0
      message: string
      data: {
        collectionsInUse: ICollection[]
      } | null
    }

export interface ISonarrSetting {
  id: number
  serverName: string
  url: string
  apiKey: string
  isDefault: boolean
}

const SonarrSettings = () => {
  const [loaded, setLoaded] = useState(false)
  const [settings, setSettings] = useState<ISonarrSetting[]>([])
  const [settingsModalActive, setSettingsModalActive] = useState<
    ISonarrSetting | boolean
  >()
  const [collectionsInUseWarning, setCollectionsInUseWarning] = useState<
    ICollection[] | undefined
  >()

  const handleSettingsSaved = (setting: ISonarrSetting) => {
    const newSettings = [...settings]
    const index = newSettings.findIndex((s) => s.id === setting.id)
    if (index !== -1) {
      newSettings[index] = setting
    } else {
      newSettings.push(setting)
    }

    if (setting.isDefault) {
      newSettings.forEach((s) => {
        if (s.id !== setting.id) {
          s.isDefault = false
        }
      })
    }

    setSettings(newSettings)
    setSettingsModalActive(undefined)
  }

  const confirmedDelete = (id: number) => {
    DeleteApiHandler<DeleteSonarrSettingResponseDto>(`/settings/sonarr/${id}`)
      .then((resp) => {
        if (resp.code === 1) {
          setSettings(settings.filter((s) => s.id !== id))
        } else if (resp.data?.collectionsInUse) {
          setCollectionsInUseWarning(resp.data.collectionsInUse)
        }
      })
      .catch((err) => {
        console.log(err)
      })
  }

  useEffect(() => {
    if (loaded) return

    GetApiHandler<ISonarrSetting[]>('/settings/sonarr').then((resp) => {
      setSettings(resp)
      setLoaded(true)
    })
  }, [])

  useEffect(() => {
    document.title = 'Maintainerr - Settings - Sonarr'
  }, [])

  const showAddModal = () => {
    setSettingsModalActive(true)
  }

  if (!loaded) {
    return (
      <>
        <div className="mt-6">
          <LoadingSpinner />
        </div>
      </>
    )
  }

  return (
    <>
      <div className="h-full w-full">
        <div className="section h-full w-full">
          <h3 className="heading">Sonarr Settings</h3>
          <p className="description">Sonarr configuration</p>
        </div>

        <ul className="grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {settings.map((setting) => (
            <li
              key={setting.id}
              className="rounded-xl bg-zinc-800 p-4 text-zinc-400 shadow ring-1 ring-zinc-700 h-full"
            >
              <div className="flex gap-x-3 mb-2 items-center">
                <div className="text-base font-medium text-white sm:text-lg">
                  {setting.serverName}
                </div>
                {setting.isDefault && (
                  <div className="bg-amber-600 px-2 py-0.5 rounded text-zinc-200 shadow-md text-xs">
                    Default
                  </div>
                )}
              </div>

              <p className="text-gray-300 space-x-2 mb-4  truncate">
                <span className="font-semibold">Address</span>
                <a href={setting.url} className="hover:underline">
                  {setting.url}
                </a>
              </p>
              <div>
                <Button
                  buttonType="twin-primary-l"
                  buttonSize="md"
                  className="h-10 w-1/2"
                  onClick={() => {
                    setSettingsModalActive(setting)
                  }}
                >
                  {<DocumentAddIcon className="m-auto" />}{' '}
                  <p className="font-semibold m-auto">Edit</p>
                </Button>
                <DeleteButton
                  onDeleteRequested={() => confirmedDelete(setting.id)}
                />
              </div>
            </li>
          ))}

          <li className="rounded-xl bg-zinc-800 p-4 text-zinc-400 shadow border-2 border-dashed border-gray-400 flex items-center justify-center h-full">
            <button
              type="button"
              className="add-button bg-amber-600 hover:bg-amber-500 flex m-auto h-9 rounded text-zinc-200 shadow-md px-4"
              onClick={showAddModal}
            >
              {<PlusCircleIcon className="m-auto h-5" />}
              <p className="m-auto font-semibold ml-1">Add server</p>
            </button>
          </li>
        </ul>
      </div>
      {settingsModalActive && (
        <SonarrSettingsModal
          settings={
            typeof settingsModalActive === 'boolean'
              ? undefined
              : settingsModalActive
          }
          onUpdate={handleSettingsSaved}
          onCancel={() => {
            setSettingsModalActive(undefined)
          }}
        />
      )}
      {collectionsInUseWarning ? (
        <Modal
          title="Server in-use"
          size="sm"
          onOk={() => setCollectionsInUseWarning(undefined)}
        >
          <p className="mb-4">
            This server is currently being used by the following rules:
            <ul className="list-disc list-inside">
              {collectionsInUseWarning.map((x) => (
                <li key={x.id}>{x.title}</li>
              ))}
            </ul>
          </p>
          <p>
            You must re-assign these rules to a different server before
            deleting.
          </p>
        </Modal>
      ) : undefined}
    </>
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
      <p className="font-semibold m-auto">
        {showSureDelete ? <>Are you sure?</> : <>Delete</>}
      </p>
    </Button>
  )
}

export default SonarrSettings
