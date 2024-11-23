import Badge from '../../../Common/Badge'
import Button from '../../../Common/Button'
import LoadingSpinner from '../../../Common/LoadingSpinner'
import ChangeLogModal from '../ChangeLogModal'
import { DocumentTextIcon } from '@heroicons/react/outline'
import dynamic from 'next/dynamic'
import { Fragment, useEffect, useState } from 'react'
import Modal from '../../../Common/Modal'

// Dynamic import for markdown
const ReactMarkdown = dynamic(() => import('react-markdown'), {
  ssr: false,
})

const messages = {
  releases: 'Releases',
  releasedataMissing: 'Release data is currently unavailable.',
  versionChangelog: '{version} Changelog',
  viewongithub: 'View on GitHub',
  latestversion: 'Latest',
  currentversion: 'Currently Installed',
  viewchangelog: 'View Changelog',
  close: 'Close',
}

const REPO_RELEASE_API =
  'https://api.github.com/repos/jorenn92/maintainerr/releases?per_page=10'

interface GitHubRelease {
  url: string
  assets_url: string
  upload_url: string
  html_url: string
  id: number
  node_id: string
  tag_name: string
  target_commitish: string
  name: string
  draft: boolean
  prerelease: boolean
  created_at: string
  published_at: string
  tarball_url: string
  zipball_url: string
  body: string
}
interface ModalProps {
  title: string
  children: React.ReactNode
  isOpen: boolean
  onCancel: () => void
  onOk?: () => void
  cancelText?: string
  okText?: string
}

interface ReleaseProps {
  release: GitHubRelease
  isLatest: boolean
  currentVersion: string
}

const calculateRelativeTime = (dateString: string): string => {
  const secondsAgo = Math.floor(
    (Date.now() - new Date(dateString).getTime()) / 1000,
  )
  const minutesAgo = Math.floor(secondsAgo / 60)
  const hoursAgo = Math.floor(minutesAgo / 60)
  const daysAgo = Math.floor(hoursAgo / 24)

  if (secondsAgo < 60) return `${secondsAgo} seconds ago`
  if (minutesAgo < 60) return `${minutesAgo} minutes ago`
  if (hoursAgo < 24) return `${hoursAgo} hours ago`
  return `${daysAgo} days ago`
}

const Release = ({ currentVersion, release, isLatest }: ReleaseProps) => {
  const [AboutModalActive, setModalActive] = useState()

  return (
    <div className="flex w-full flex-col space-y-3 rounded-md bg-gray-800 px-4 py-2 shadow-md ring-1 ring-gray-700 sm:flex-row sm:space-y-0 sm:space-x-3">
      <Modal
        loading={false}
        backgroundClickable={false}
        onCancel={() => setModalActive(false)}
        title={messages.versionChangelog.replace('{version}', release.name)}
        cancelText={messages.close}
        okText={messages.viewongithub}
        onOk={() => {
          window.open(release.html_url, '_blank')
        }}
      >
        <div className="prose">
          <ReactMarkdown>{release.body}</ReactMarkdown>
        </div>
      </Modal>
      <div className="flex w-full flex-grow items-center justify-center space-x-2 truncate sm:justify-start">
        <span className="truncate text-lg font-bold">
          <span className="mr-2 whitespace-nowrap text-xs font-normal">
            {calculateRelativeTime(release.created_at)}
          </span>
          {release.name}
        </span>
        {isLatest && (
          <Badge badgeType="success">{messages.latestversion}</Badge>
        )}
        {release.name.includes(currentVersion) && (
          <Badge badgeType="primary">{messages.currentversion}</Badge>
        )}
      </div>
      <Button buttonType="primary" onClick={showChangeLogModal}>
        <DocumentTextIcon />
        <span>{messages.viewchangelog}</span>
      </Button>
    </div>
  )
}

interface ReleasesProps {
  currentVersion: string
}

const Releases = ({ currentVersion }: ReleasesProps) => {
  const [data, setData] = useState<GitHubRelease[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchReleases = async () => {
      try {
        const response = await fetch(REPO_RELEASE_API)
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`)
        }
        const releases = await response.json()
        setData(releases)
      } catch (err) {
        setError(err.message || 'Failed to fetch releases')
      }
    }

    fetchReleases()
  }, [])

  if (!data && !error) {
    return <LoadingSpinner />
  }

  if (error) {
    return <div className="text-gray-300">{messages.releasedataMissing}</div>
  }

  return (
    <div>
      <h3 className="heading">{messages.releases}</h3>
      <div className="section space-y-3">
        {data!.map((release, index) => (
          <div key={`release-${release.id}`}>
            <Release
              release={release}
              currentVersion={currentVersion}
              isLatest={index === 0}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default Releases
