import { NextPage } from 'next'
import SettingsWrapper from '../../../components/Settings'
import JellyseerrSettings from '../../../components/Settings/Jellyseerr'

const SettingsJellyseerr: NextPage = () => {
  return (
    <SettingsWrapper>
      <JellyseerrSettings />
    </SettingsWrapper>
  )
}

export default SettingsJellyseerr
