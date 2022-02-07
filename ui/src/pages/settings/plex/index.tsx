import { NextPage } from 'next'
import SettingsWrapper from '../../../components/Settings'
import PlexSettings from '../../../components/Settings/Plex'

const SettingsPlex: NextPage = () => {
  return (
    <SettingsWrapper>
      <PlexSettings />
    </SettingsWrapper>
  )
}

export default SettingsPlex
