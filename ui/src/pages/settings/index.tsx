import { NextPage } from 'next'
import { useRouter } from 'next/router'
import SettingsWrapper from '../../components/Settings'

const Settings: NextPage = () => {
  const router = useRouter()
  router.push('/settings/main')
  return <SettingsWrapper></SettingsWrapper>
}

export default Settings
