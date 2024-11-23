import React, { Fragment } from 'react'
import { useState } from 'react'
import Modal from '../../../Common/Modal'
import LoadingSpinner from '../../../Common/LoadingSpinner'
import dynamic from 'next/dynamic'

interface ChangeLogModal {
  title: string
  children: React.ReactNode
  isOpen: boolean
  onCancel: () => void
  onOk?: () => void
  cancelText?: string
  okText?: string
  release: GitHubRelease
  isLatest: boolean
  currentVersion: string
}
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
interface ReleaseProps {
  release: GitHubRelease
  isLatest: boolean
  currentVersion: string
}

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

const ReactMarkdown = dynamic(() => import('react-markdown'), {
  ssr: false,
})

const REPO_RELEASE_API =
  'https://api.github.com/repos/jorenn92/maintainerr/releases?per_page=10'

const ChangeLogModal = ({
  currentVersion,
  release,
  isLatest,
  onCancel,
}: ChangeLogModal) => {
  const handleCancel = () => {
    ChangeLogModal.onCancel()
  }

  return (
    <Modal
      loading={false}
      backgroundClickable={false}
      onCancel={handleCancel}
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
  )
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
