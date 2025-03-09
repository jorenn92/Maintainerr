import { NextPage } from 'next'
import SettingsWrapper from '../../../components/Settings'
import JellyfinSettings from '../../../components/Settings/Jellyfin'

const SettingsJellyfin: NextPage = () => {
  return (
    <SettingsWrapper>
      <JellyfinSettings />
    </SettingsWrapper>
  )
}

export default SettingsJellyfin
