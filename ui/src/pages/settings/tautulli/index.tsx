import { NextPage } from 'next'
import SettingsWrapper from '../../../components/Settings'
import TautulliSettings from '../../../components/Settings/Tautulli'

const SettingsTautulli: NextPage = () => {
  return (
    <SettingsWrapper>
      <TautulliSettings />
    </SettingsWrapper>
  )
}

export default SettingsTautulli
