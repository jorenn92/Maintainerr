import { SaveIcon } from '@heroicons/react/solid'
import { useContext, useEffect, useRef, useState } from 'react'
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

  useEffect(() => {
    document.title = 'Maintainerr - Settings - Notifications'
    GetApiHandler('/notifications/configurations').then((configs) =>
      setConfigurations(configs),
    )
  }, [])

  return (
    <div className="h-full w-full">
      <div className="section h-full w-full">
        <h3 className="heading">Notification Settings</h3>
        <p className="description">Notification configuration</p>
      </div>
      <div>
        {configurations ? (
          <PaginatedList
            items={configurations!.map((i, index) => {
              return { id: index, title: i.name }
            })}
            onAdd={() => {
              setAddModalActive(!addModalActive)
            }}
            onEdit={() => {}}
            addName="Create Notification"
          />
        ) : null}
      </div>

      {addModalActive ? (
        <CreateNotificationModal
          onCancel={() => {
            setAddModalActive(!addModalActive)
          }}
          onSave={() => {
            setAddModalActive(!addModalActive)
          }}
          onTest={() => {}}
        />
      ) : null}
    </div>
  )
}

export default NotificationSettings
