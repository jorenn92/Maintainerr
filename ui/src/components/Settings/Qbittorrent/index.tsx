import { SaveIcon } from '@heroicons/react/solid'
import { useContext, useEffect, useRef, useState } from 'react'
import SettingsContext from '../../../contexts/settings-context'
import { PostApiHandler } from '../../../utils/ApiHandler'
import Alert from '../../Common/Alert'
import Button from '../../Common/Button'
import DocsButton from '../../Common/DocsButton'
import TestButton from '../../Common/TestButton'

const QbittorrentSettings = () => {
  const settingsCtx = useContext(SettingsContext)
  const urlRef = useRef<HTMLInputElement>(null)
  const usernameRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<boolean>()
  const [changed, setChanged] = useState<boolean>()
  const [testBanner, setTestbanner] = useState<
    | {
        status: boolean
        message: string
      }
    | undefined
  >()

  useEffect(() => {
    document.title = 'Maintainerr - Settings - Torrents'
  }, [])

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (
      urlRef.current?.value &&
      usernameRef.current?.value &&
      passwordRef.current?.value
    ) {
      const payload = {
        qbittorrent_url: urlRef.current.value,
        qbittorrent_username: usernameRef.current.value,
        qbittorrent_password: passwordRef.current.value,
      }
      const resp: { code: 0 | 1; message: string } = await PostApiHandler(
        '/settings',
        {
          ...settingsCtx.settings,
          ...payload,
        },
      )
      if (Boolean(resp.code)) {
        settingsCtx.addSettings({
          ...settingsCtx.settings,
          ...payload,
        })
        setError(false)
        setChanged(true)
      } else setError(true)
    } else {
      setError(true)
    }
  }

  const appTest = (result: { status: boolean; message: string }) => {
    setTestbanner({ status: result.status, message: result.message })
  }

  return (
    <div className="h-full w-full">
      <div className="section h-full w-full">
        <h3 className="heading">Qbittorrent Settings</h3>
        <p className="description">Qbittorrent configuration</p>
      </div>
      {error ? (
        <Alert type="warning" title="Not all fields contain values" />
      ) : changed ? (
        <Alert type="info" title="Settings successfully updated" />
      ) : undefined}

      {testBanner &&
        (testBanner.status ? (
          <Alert
            type="warning"
            title={`Successfully connected to Qbittorrent (${testBanner.message})`}
          />
        ) : (
          <Alert type="error" title={testBanner.message} />
        ))}

      <div className="section">
        <form onSubmit={submit}>
          <div className="form-row">
            <label htmlFor="url" className="text-label">
              URL
            </label>
            <div className="form-input">
              <div className="form-input-field">
                <input
                  name="url"
                  id="url"
                  type="text"
                  ref={urlRef}
                  defaultValue={settingsCtx.settings.qbittorrent_url}
                ></input>
              </div>
            </div>
          </div>

          <div className="form-row">
            <label htmlFor="username" className="text-label">
              Username
            </label>
            <div className="form-input">
              <div className="form-input-field">
                <input
                  name="username"
                  id="username"
                  type="text"
                  ref={usernameRef}
                  defaultValue={settingsCtx.settings.qbittorrent_username}
                ></input>
              </div>
            </div>
          </div>

          <div className="form-row">
            <label htmlFor="password" className="text-label">
              Password
            </label>
            <div className="form-input">
              <div className="form-input-field">
                <input
                  name="password"
                  id="password"
                  type="password"
                  ref={passwordRef}
                  defaultValue={settingsCtx.settings.qbittorrent_password}
                ></input>
              </div>
            </div>
          </div>

          <div className="actions mt-5 w-full">
            <div className="flex w-full flex-wrap sm:flex-nowrap">
              <span className="m-auto rounded-md shadow-sm sm:ml-3 sm:mr-auto">
                <DocsButton page="Configuration/#torrents" />
              </span>
              <div className="m-auto mt-3 flex xs:mt-0 sm:m-0 sm:justify-end">
                <TestButton
                  onClick={appTest}
                  testUrl="/settings/test/qbittorrent"
                />
                <span className="ml-3 inline-flex rounded-md shadow-sm">
                  <Button
                    buttonType="primary"
                    type="submit"
                    // disabled={isSubmitting || !isValid}
                  >
                    <SaveIcon />
                    <span>Save Changes</span>
                  </Button>
                </span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default QbittorrentSettings
