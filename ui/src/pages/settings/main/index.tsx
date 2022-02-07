import { NextPage } from 'next'
import SettingsWrapper from '../../../components/Settings'
import MainSettings from '../../../components/Settings/Main'

const SettingsMain: NextPage = () => {
  return (
    <SettingsWrapper>
      <MainSettings></MainSettings>
    </SettingsWrapper>
  )
}

export default SettingsMain
