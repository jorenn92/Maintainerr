import { NextPage } from 'next'
import SettingsWrapper from '../../../components/Settings'
import SonarrSettings from '../../../components/Settings/Sonarr'

const SettingsSonarr: NextPage = () => {
  return (
    <SettingsWrapper>
      <SonarrSettings />
    </SettingsWrapper>
  )
}

export default SettingsSonarr
