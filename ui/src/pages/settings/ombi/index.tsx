import { NextPage } from 'next'
import SettingsWrapper from '../../../components/Settings'
import OmbiSettings from '../../../components/Settings/Ombi'

const SettingsOmbi: NextPage = () => {
  return (
    <SettingsWrapper>
      <OmbiSettings />
    </SettingsWrapper>
  )
}

export default SettingsOmbi