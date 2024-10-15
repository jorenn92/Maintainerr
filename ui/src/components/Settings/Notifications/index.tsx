import { useContext, useEffect, useState } from 'react'
import SettingsContext from '../../../contexts/settings-context'
import React from 'react'
import PaginatedList from '../../Common/PaginatedList'
import CreateNotificationModal, {
  AgentConfiguration,
} from './CreateNotificationModal'
import GetApiHandler from '../../../utils/ApiHandler'

const NotificationSettings = () => {
  const settingsCtx = useContext(SettingsContext)
  const [addModalActive, setAddModalActive] = useState(false)
  const [configurations, setConfigurations] = useState<AgentConfiguration[]>()
  const [editConfig, setEditConfig] = useState<AgentConfiguration>()

  useEffect(() => {
    document.title = 'Maintainerr - Settings - Notifications'
    GetApiHandler('/notifications/configurations').then((configs) =>
      setConfigurations(configs),
    )
  }, [])

  const doEdit = (id: number) => {
    const config = configurations?.find((c) => c.id === id)

    setEditConfig(config)
    setAddModalActive(!addModalActive)
  }

  return (
    <div className="h-full w-full">
      <div className="section h-full w-full">
        <h3 className="heading">Notification Settings</h3>
        <p className="description">Notification configuration</p>
      </div>
      <div>
        {configurations ? (
          <PaginatedList
            items={configurations!.map((i) => {
              return { id: i.id!, title: i.name }
            })}
            onAdd={() => {
              setAddModalActive(!addModalActive)
            }}
            onEdit={doEdit}
            addName="Create Notification"
          />
        ) : null}
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
                },
              }
            : {})}
        />
      ) : null}
    </div>
  )
}

export default NotificationSettings
