import { NextPage } from 'next'
import SettingsWrapper from '../../../components/Settings'
import AboutSettings from '../../../components/Settings/Testing'
const SettingsAbout: NextPage = () => {
  return (
    <SettingsWrapper>
      <AboutSettings />
    </SettingsWrapper>
  )
}
export default SettingsAbout
