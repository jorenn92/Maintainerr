import { useContext, useEffect, useState } from 'react'
import SettingsContext from '../../contexts/settings-context'
import GetApiHandler from '../../helpers/ApiHandler'
import SettingsTabs, { SettingsRoute } from './Tabs'

const SettingsWrapper: React.FC = ({ children }) => {
  const settingsCtx = useContext(SettingsContext)
  const [loaded, setLoaded] = useState(false)

  const settingsRoutes: SettingsRoute[] = [
    {
      text: 'General',
      route: '/settings/main',
      regex: /^\/settings(\/main)?$/,
    },
    {
      text: 'Overseerr',
      route: '/settings/overseerr',
      regex: /^\/settings(\/overseerr)?$/,
    },
    {
      text: 'Plex',
      route: '/settings/plex',
      regex: /^\/settings(\/plex)?$/,
    },
    {
      text: 'Radarr',
      route: '/settings/radarr',
      regex: /^\/settings(\/radarr)?$/,
    },
    {
      text: 'Sonarr',
      route: '/settings/sonarr',
      regex: /^\/settings(\/sonarr)?$/,
    },
    {
      text: 'Jobs',
      route: '/settings/jobs',
      regex: /^\/settings(\/jobs)?$/,
    },
  ]

  useEffect(() => {
    GetApiHandler('/settings').then((resp) => {
      settingsCtx.addSettings(resp)
      setLoaded(true)
    })
  }, [])

  if (loaded) {
    return (
      <>
        <div className="mt-6">
          <SettingsTabs settingsRoutes={settingsRoutes} />
        </div>
        <div className="mt-10 text-white">{children}</div>
      </>
    )
  } else {
    return (
      <>
        <div className="mt-6">
          {/* TODO: loader implementeren */}
          Loading...
        </div>
      </>
    )
  }
}
export default SettingsWrapper
