import { ReactNode, useContext, useEffect, useState } from 'react'
import SettingsContext from '../../contexts/settings-context'
import GetApiHandler from '../../utils/ApiHandler'
import LoadingSpinner from '../Common/LoadingSpinner'
import SettingsTabs, { SettingsRoute } from './Tabs'

const SettingsWrapper: React.FC<{ children?: ReactNode }> = (props: {
  children?: ReactNode
}) => {
  const settingsCtx = useContext(SettingsContext)
  const [loaded, setLoaded] = useState(false)

  const setupDone =
    settingsCtx.settings.plex_auth_token !== null ||
    settingsCtx.settings.jellyfin_api_key != null

  const settingsRoutes: SettingsRoute[] = [
    {
      text: 'General',
      route: '/settings/main',
      regex: /^\/settings(\/main)?$/,
      enable: setupDone,
    },
    {
      text: 'Plex',
      route: '/settings/plex',
      regex: /^\/settings(\/plex)?$/,
      enable: true,
    },
    {
      text: 'Overseerr',
      route: '/settings/overseerr',
      regex: /^\/settings(\/overseerr)?$/,
      enable: setupDone,
    },
    {
      text: 'Jellyseerr',
      route: '/settings/jellyseerr',
      regex: /^\/settings(\/jellyseerr)?$/,
      enable: setupDone,
    },
    {
      text: 'Jellyfin',
      route: '/settings/jellyfin',
      regex: /^\/settings(\/jellyfin)?$/,
      enable: setupDone,
    },
    {
      text: 'Radarr',
      route: '/settings/radarr',
      regex: /^\/settings(\/radarr)?$/,
      enable: setupDone,
    },
    {
      text: 'Sonarr',
      route: '/settings/sonarr',
      regex: /^\/settings(\/sonarr)?$/,
      enable: setupDone,
    },
    {
      text: 'Tautulli',
      route: '/settings/tautulli',
      regex: /^\/settings(\/tautulli)?$/,
      enable: setupDone,
    },
    {
      text: 'Qbittorrent',
      route: '/settings/qbittorrent',
      regex: /^\/settings(\/qbittorrent)?$/,
      enable: setupDone,
    },
    {
      text: 'Logs',
      route: '/settings/logs',
      regex: /^\/settings(\/logs)?$/,
      enable: setupDone,
    },
    {
      text: 'Jobs',
      route: '/settings/jobs',
      regex: /^\/settings(\/jobs)?$/,
      enable: setupDone,
    },
    {
      text: 'About',
      route: '/settings/about',
      regex: /^\/settings(\/about)?$/,
      enable: setupDone,
    },
  ]

  useEffect(() => {
    if (settingsCtx.settings?.id === undefined) {
      GetApiHandler('/settings').then((resp) => {
        settingsCtx.addSettings(resp)
        setLoaded(true)
      })
    } else {
      setLoaded(true)
    }
  }, [])

  if (loaded) {
    return (
      <>
        <div className="mt-6">
          <SettingsTabs
            settingsRoutes={settingsRoutes}
            allEnabled={setupDone}
          />
        </div>
        <div className="mt-10 text-white">{props.children}</div>
      </>
    )
  } else {
    return (
      <>
        <div className="mt-6">
          <LoadingSpinner />
        </div>
      </>
    )
  }
}
export default SettingsWrapper
