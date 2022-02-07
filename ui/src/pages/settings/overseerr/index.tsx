import { NextPage } from 'next'
import SettingsWrapper from '../../../components/Settings'
import OverseerrSettings from '../../../components/Settings/Overseerr'

const SettingsOverseerr: NextPage = () => {
  return (
    <SettingsWrapper>
      <OverseerrSettings />
    </SettingsWrapper>
  )
}

export default SettingsOverseerr
