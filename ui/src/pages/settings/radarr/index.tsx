import { NextPage } from 'next'
import SettingsWrapper from '../../../components/Settings'
import RadarrSettings from '../../../components/Settings/Radarr'

const SettingsRadarr: NextPage = () => {
  return (
    <SettingsWrapper>
      <RadarrSettings />
    </SettingsWrapper>
  )
}

export default SettingsRadarr
