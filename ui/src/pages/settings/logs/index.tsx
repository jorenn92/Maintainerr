import { NextPage } from 'next'
import SettingsWrapper from '../../../components/Settings'
import LogSettings from '../../../components/Settings/Logs'

const SettingsLogs: NextPage = () => {
  return (
    <SettingsWrapper>
      <LogSettings />
    </SettingsWrapper>
  )
}

export default SettingsLogs
