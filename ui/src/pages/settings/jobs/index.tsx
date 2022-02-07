import { NextPage } from 'next'
import SettingsWrapper from '../../../components/Settings'
import JobSettings from '../../../components/Settings/Jobs'

const SettingsJobs: NextPage = () => {
  return (
    <SettingsWrapper>
      <JobSettings />
    </SettingsWrapper>
  )
}

export default SettingsJobs
