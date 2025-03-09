import {
  createContext,
  ReactChild,
  ReactFragment,
  ReactPortal,
  useState,
} from 'react'

export interface ISettings {
  id: number
  clientId: string
  applicationTitle: string
  applicationUrl: string
  apikey: string
  locale: string
  cacheImages: number
  plex_name: string
  plex_hostname: string
  plex_port: number
  plex_ssl: number
  plex_auth_token: string | null
  jellyfin_url: string
  jellyfin_api_key: string
  jellyfin_username: string
  jellyfin_password: string
  overseerr_url: string
  overseerr_api_key: string
  tautulli_url: string
  tautulli_api_key: string
  collection_handler_job_cron: string
  rules_handler_job_cron: string
}

const SettingsContext = createContext({
  settings: {} as ISettings,
  addSettings: (settings: ISettings) => {},
  removeSettings: () => {},
})

export function SettingsContextProvider(props: {
  children:
    | boolean
    | ReactChild
    | ReactFragment
    | ReactPortal
    | null
    | undefined
}) {
  const [settings, setSettings] = useState<ISettings>({} as ISettings)

  function addSettingsHandler(settings: ISettings) {
    setSettings(() => {
      return settings
    })
  }
  function removeSettingsHandler() {
    setSettings(() => {
      return {} as ISettings
    })
  }

  const context: {
    settings: ISettings
    addSettings: (settings: ISettings) => void
    removeSettings: () => void
  } = {
    settings: settings,
    addSettings: addSettingsHandler,
    removeSettings: removeSettingsHandler,
  }

  return (
    <SettingsContext.Provider value={context}>
      {props.children}
    </SettingsContext.Provider>
  )
}

export default SettingsContext
