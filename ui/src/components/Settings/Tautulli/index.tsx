import { SaveIcon } from '@heroicons/react/solid'
import { useContext, useEffect, useState } from 'react'
import SettingsContext from '../../../contexts/settings-context'
import { PostApiHandler } from '../../../utils/ApiHandler'
import {
  addPortToUrl,
  getBaseUrl,
  getHostname,
  getPortFromUrl,
} from '../../../utils/SettingsUtils'
import Alert from '../../Common/Alert'
import Button from '../../Common/Button'
import DocsButton from '../../Common/DocsButton'
import TestButton from '../../Common/TestButton'

const TautulliSettings = () => {
  const settingsCtx = useContext(SettingsContext)
  const [hostname, setHostname] = useState<string>()
  const [baseUrl, setBaseUrl] = useState<string>()
  const [apiKey, setApiKey] = useState<string>()
  const [port, setPort] = useState<string>()
  const [error, setError] = useState<boolean>()
  const [changed, setChanged] = useState<boolean>()
  const [testBanner, setTestbanner] = useState<{
    status: boolean
    version: string
  }>({ status: false, version: '0' })

  useEffect(() => {
    document.title = 'Maintainerr - Settings - Tautulli'
  }, [])

  useEffect(() => {
    setHostname(getHostname(settingsCtx.settings.tautulli_url))
    setBaseUrl(getBaseUrl(settingsCtx.settings.tautulli_url))
    setPort(getPortFromUrl(settingsCtx.settings.tautulli_url))
    setApiKey(settingsCtx.settings.tautulli_api_key)
  }, [settingsCtx])

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    let portToUse = port

    // if port not specified, but hostname is. Derive the port
    if (!port && hostname) {
      const derivedPort = hostname.includes('http://')
        ? 80
        : hostname.includes('https://')
          ? 443
          : 80

      if (derivedPort) {
        portToUse = derivedPort.toString()
        setPort(portToUse)
      }
    }

    if (hostname && apiKey && portToUse) {
      const hostnameVal = hostname.includes('http://')
        ? hostname
        : hostname.includes('https://')
          ? hostname
          : portToUse == '443'
            ? 'https://' + hostname
            : 'http://' + hostname

      let tautulli_url = `${addPortToUrl(hostnameVal, +portToUse)}`
      tautulli_url = tautulli_url.endsWith('/')
        ? tautulli_url.slice(0, -1)
        : tautulli_url

      const payload = {
        tautulli_url: `${tautulli_url}${baseUrl ? `/${baseUrl}` : ''}`,
        tautulli_api_key: apiKey,
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
    setTestbanner({ status: result.status, version: result.message })
  }

  return (
    <div className="h-full w-full">
      <div className="section h-full w-full">
        <h3 className="heading">Tautulli Settings</h3>
        <p className="description">Tautulli configuration</p>
      </div>
      {error ? (
        <Alert type="warning" title="Not all fields contain values" />
      ) : changed ? (
        <Alert type="info" title="Settings successfully updated" />
      ) : undefined}

      {testBanner.version !== '0' ? (
        testBanner.status ? (
          <Alert
            type="warning"
            title={`Successfully connected to Tautulli (${testBanner.version})`}
          />
        ) : (
          <Alert
            type="error"
            title="Connection failed! Double check your entries and make sure to Save Changes before you Test."
          />
        )
      ) : undefined}

      <div className="section">
        <form onSubmit={submit}>
          <div className="form-row">
            <label htmlFor="hostname" className="text-label">
              Hostname or IP
            </label>
            <div className="form-input">
              <div className="form-input-field">
                <input
                  name="hostname"
                  id="hostname"
                  type="text"
                  value={hostname}
                  onChange={(e) => setHostname(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="form-row">
            <label htmlFor="port" className="text-label">
              Port
            </label>
            <div className="form-input">
              <div className="form-input-field">
                <input
                  name="port"
                  id="port"
                  type="number"
                  value={port}
                  onChange={(e) => setPort(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="form-row">
            <label htmlFor="baseUrl" className="text-label">
              Base URL
              <span className="label-tip">{`No Leading Slash`}</span>
            </label>
            <div className="form-input">
              <div className="form-input-field">
                <input
                  name="baseUrl"
                  id="baseUrl"
                  type="text"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="form-row">
            <label htmlFor="apikey" className="text-label">
              Api key
            </label>
            <div className="form-input">
              <div className="form-input-field">
                <input
                  name="apikey"
                  id="apikey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="actions mt-5 w-full">
            <div className="flex w-full flex-wrap sm:flex-nowrap">
              <span className="m-auto rounded-md shadow-sm sm:ml-3 sm:mr-auto">
                <DocsButton page="Configuration/#tautulli" />
              </span>
              <div className="m-auto mt-3 flex xs:mt-0 sm:m-0 sm:justify-end">
                <TestButton
                  onClick={appTest}
                  testUrl="/settings/test/tautulli"
                />
                <span className="ml-3 inline-flex rounded-md shadow-sm">
                  <Button buttonType="primary" type="submit">
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

export default TautulliSettings
