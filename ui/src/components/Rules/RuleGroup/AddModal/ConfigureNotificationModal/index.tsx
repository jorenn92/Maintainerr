import { useEffect, useState } from 'react'
import GetApiHandler from '../../../../../utils/ApiHandler'
import Modal from '../../../../Common/Modal'
import { AgentConfiguration } from '../../../../Settings/Notifications/CreateNotificationModal'
import ToggleItem from '../../../../Common/ToggleButton'

interface ConfigureNotificationModal {
  onCancel: () => void
  onSuccess: (selectedConfigurations: AgentConfiguration[]) => void
}
const ConfigureNotificationModal = (props: ConfigureNotificationModal) => {
  const [notifications, setNotifications] = useState<AgentConfiguration[]>()
  const [activatedNotifications, setActivatedNotifications] = useState<
    AgentConfiguration[]
  >([])
  const [isLoading, setIsloading] = useState(true)

  useEffect(() => {
    GetApiHandler('/notifications/configurations').then(
      (notificationConfigs) => {
        setNotifications(notificationConfigs)
        setIsloading(false)
      },
    )
  }, [])

  return (
    <Modal
      loading={isLoading}
      backgroundClickable={false}
      onCancel={() => props.onCancel()}
      okDisabled={false}
      onOk={() => props.onSuccess(activatedNotifications)}
      okText={'OK'}
      okButtonType={'primary'}
      title={'Configure Notifications'}
      iconSvg={''}
    >
      <div>
        {!isLoading
          ? notifications!.map((n) => (
              <ToggleItem
                label={n.name}
                onStateChange={(state) => {
                  state
                    ? setActivatedNotifications([...activatedNotifications, n])
                    : setActivatedNotifications([
                        ...activatedNotifications.filter(
                          (el) => el.id !== n.id,
                        ),
                      ])
                }}
              />
            ))
          : undefined}
      </div>
    </Modal>
  )
}
export default ConfigureNotificationModal
