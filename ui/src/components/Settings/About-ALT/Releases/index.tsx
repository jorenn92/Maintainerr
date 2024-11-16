import Badge from '../../../Common/Badge'
import Button from '../../../Common/Button'
import LoadingSpinner from '../../../Common/LoadingSpinner'
import Modal from '../../../Common/Modal'
import { Transition } from '@headlessui/react'
import { DocumentTextIcon } from '@heroicons/react/outline'
import dynamic from 'next/dynamic'
import React, { Fragment, useContext, useEffect, useRef, useState } from 'react'
import GetApiHandler, { PostApiHandler } from '../../../../utils/ApiHandler'

const messages = {
  releases: 'Releases',
  releasedataMissing: 'Release data is currently unavailable.',
  versionChangelog: '{version} Changelog',
  viewongithub: 'View on GitHub',
  latestversion: 'Latest',
  currentversion: 'Current',
  viewchangelog: 'View Changelog',
}

const REPO_RELEASE_API =
  'https://api.github.com/repos/jorenn92/Maintainerr/releases?per_page=20'

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

const Release = ({ currentVersion, release, isLatest }: ReleaseProps) => {
  const [isModalOpen, setModalOpen] = useState(false)

  return (
    <div className="flex w-full flex-col space-y-3 rounded-md bg-gray-800 px-4 py-2 shadow-md ring-1 ring-gray-700 sm:flex-row sm:space-y-0 sm:space-x-3">
      <Transition
        as={Fragment}
        enter="transition-opacity duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-300"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
        show={isModalOpen}
      >
        <Modal
          onCancel={() => setModalOpen(false)}
          title={
            (messages.versionChangelog,
            {
              version: release.name,
            })
          }
          cancelText={'close'}
          okText={'viewongithub'}
          onOk={() => {
            window.open(release.html_url, '_blank')
          }}
        >
          <div className="prose">{release.body}</div>
        </Modal>
      </Transition>
      <div className="flex w-full flex-grow items-center justify-center space-x-2 truncate sm:justify-start">
        <span className="truncate text-lg font-bold">
          <span className="mr-2 whitespace-nowrap text-xs font-normal">
            <FormattedRelativeTime
              value={Math.floor(
                (new Date(release.created_at).getTime() - Date.now()) / 1000,
              )}
              updateIntervalInSeconds={1}
              numeric="auto"
            />
          </span>
          {release.name}
        </span>
        {isLatest && (
          <Badge badgeType="success">
            {('latestversion')}
          </Badge>
        )}
        {release.name.includes(currentVersion) && (
          <Badge badgeType="primary">
            {('currentversion')}
          </Badge>
        )}
      </div>
      <Button buttonType="primary" onClick={() => setModalOpen(true)}>
        <DocumentTextIcon />
        <span>{('viewchangelog')}</span>
      </Button>
    </div>
  )
}

interface ReleasesProps {
  currentVersion: string
}

useEffect(() => {
    GetApiHandler(REPO_RELEASE_API).then((resp: GitHubRelease) => {
      if (resp.id) {[]
      }
    })
  }, [])

  return (
    <div>
      <h3 className="heading">{('releases')}</h3>
      <div className="section space-y-3">
        {data.map((release, index) => {
          return (
            <div key={`release-${release.id}`}>
              <Release
                release={release}
                currentVersion={currentVersion}
                isLatest={index === 0}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Releases
