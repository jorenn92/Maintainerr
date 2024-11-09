import { useEffect, useState } from 'react'
import GetApiHandler from '../../../../../utils/ApiHandler'
import { IRadarrSetting } from '../../../../Settings/Radarr'
import { ISonarrSetting } from '../../../../Settings/Sonarr'

type ArrType = 'Radarr' | 'Sonarr'

interface ArrActionProps {
  type: ArrType
  arrAction?: number
  settingId?: number
  options?: Option[]
  onUpdate: (value: number, settingId?: number) => void
}

interface Option {
  id: number
  name: string
}

const ArrAction = (props: ArrActionProps) => {
  const [prevType, setPrevType] = useState<ArrType>(props.type)
  const [settings, setSettings] = useState<(IRadarrSetting | ISonarrSetting)[]>(
    [],
  )
  const [loading, setLoading] = useState<boolean>(true)
  const action = props.arrAction ? props.arrAction : 0

  const handleSelectedSettingIdChange = (id?: number) => {
    props.onUpdate(action, id)
  }

  const handleActionChange = (value: number) => {
    props.onUpdate(value, props.settingId)
  }

  const loadArrSettings = async (type: ArrType) => {
    setLoading(true)
    setSettings([])
    const settingsResponse = await GetApiHandler<IRadarrSetting[]>(
      `/settings/${type.toLowerCase()}`,
    )
    setPrevType(type)
    setSettings(settingsResponse)
    setLoading(false)

    if (!props.settingId || type != prevType) {
      if (settingsResponse.length > 0) {
        const defaultServer = settingsResponse.find((s) => s.isDefault)
        handleSelectedSettingIdChange(
          defaultServer ? defaultServer.id : settingsResponse[0]?.id,
        )
      } else {
        handleSelectedSettingIdChange(undefined)
      }
    }
  }

  useEffect(() => {
    loadArrSettings(props.type)
  }, [props.type])

  const options: Option[] = props.options
    ? props.options
    : [
        {
          id: 0,
          name: 'Delete',
        },
        {
          id: 1,
          name: 'Unmonitor and delete files',
        },
        {
          id: 3,
          name: 'Unmonitor and keep files',
        },
      ]

  return (
    <div>
      <div className="form-row">
        <label htmlFor={`${props.type}-server`} className="text-label">
          {props.type} server
        </label>
        <div className="form-input">
          <div className="form-input-field">
            <select
              name={`${props.type}-server`}
              id={`${props.type}-server`}
              value={props.settingId}
              onChange={(e) => {
                handleSelectedSettingIdChange(+e.target.value)
              }}
            >
              {settings.map((e) => {
                return (
                  <option key={e.id} value={e.id}>
                    {e.serverName}
                  </option>
                )
              })}
              {settings.length === 0 && (
                <option value="" disabled>
                  No servers added
                </option>
              )}
              {loading && (
                <option value="" disabled>
                  Loading servers...
                </option>
              )}
            </select>
          </div>
        </div>
      </div>
      <div className="form-row">
        <label htmlFor={`${props.type}-action`} className="text-label">
          {props.type} action
        </label>
        <div className="form-input">
          <div className="form-input-field">
            <select
              name={`${props.type}-action`}
              id={`${props.type}-action`}
              value={action}
              onChange={(e) => {
                handleActionChange(+e.target.value)
              }}
            >
              {options.map((e) => {
                return (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                )
              })}
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
export default ArrAction
