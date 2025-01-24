import { useRouter } from 'next/router'
import { useEffect } from 'react'

const SettingsLander = () => {
  const router = useRouter()

  useEffect(() => {
    document.title = 'Maintainerr - Settings'
    router.push('/settings/main')
  }, [])

  return <></>
}
export default SettingsLander
