import { NextPage } from 'next'
import SettingsWrapper from '../../../components/Settings'
import QbittorrentSettings from '../../../components/Settings/Qbittorrent'

const SettingsQbittorrent: NextPage = () => {
  return (
    <SettingsWrapper>
      <QbittorrentSettings></QbittorrentSettings>
    </SettingsWrapper>
  )
}

export default SettingsQbittorrent
