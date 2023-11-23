import { SaveIcon } from '@heroicons/react/solid'
import { useContext, useEffect, useRef, useState } from 'react'
import SettingsContext from '../../../contexts/settings-context'
import { PostApiHandler } from '../../../utils/ApiHandler'
import Alert from '../../Common/Alert'
import Button from '../../Common/Button'
import DocsButton from '../../Common/DocsButton'
import TestButton from '../../Common/TestButton'

const RadarrSettings = () => {
  const settingsCtx = useContext(SettingsContext)
  const hostnameRef = useRef<HTMLInputElement>(null)
  const baseUrlRef = useRef<HTMLInputElement>(null)
  const portRef = useRef<HTMLInputElement>(null)
  const apiKeyRef = useRef<HTMLInputElement>(null)
  const [hostname, setHostname] = useState<string>()
  const [baseURl, setBaseUrl] = useState<string>()
  const [port, setPort] = useState<string>()
  const [error, setError] = useState<boolean>()
  const [changed, setChanged] = useState<boolean>()
  const [testBanner, setTestbanner] = useState<{
    status: Boolean
    version: string
  }>({ status: false, version: '0' })

  useEffect(() => {
    document.title = 'Maintainerr - Settings - Radarr'
  }, [])

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (
      hostnameRef.current?.value &&
      portRef.current?.value &&
      apiKeyRef.current?.value
    ) {
      const hostnameVal = hostnameRef.current.value.includes('http')
        ? hostnameRef.current.value
        : hostnameRef.current.value.includes('https')
        ? hostnameRef.current.value
        : 'http://' + hostnameRef.current.value
      const payload = {
        radarr_url: `${hostnameVal}:${portRef.current.value}${
          baseUrlRef.current?.value ? `/${baseUrlRef.current?.value}` : ''
        }`,
        radarr_api_key: apiKeyRef.current.value,
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

  useEffect(() => {
    const url = settingsCtx.settings.radarr_url?.split(':')
    if (url) setHostname(`${url[0]}:${url[1]}`)
  }, [settingsCtx])

  useEffect(() => {
    const url = settingsCtx.settings.radarr_url
      ?.split('')
      .reverse()
      .join('')
      .split(':')[0]
      .split('')
      .reverse()
      .join('')

    const splitted = url?.split('/')

    if (splitted?.length > 0) setPort(`${splitted[0]}`)
    if (splitted?.length > 1) setBaseUrl(`${splitted[1]}`)
  }, [settingsCtx])

  const appTest = (result: { status: boolean; version: string }) => {
    setTestbanner({ status: result.status, version: result.version })
  }

  return (
    <div className="h-full w-full">
      <div className="section h-full w-full">
        <h3 className="heading">Radarr Settings</h3>
        <p className="description">Radarr configuration</p>
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
            title={`successfully connected to Radarr (${testBanner.version})`}
          />
        ) : (
          <Alert
            type="error"
            title="Connection failed! Please check and save your settings"
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
                  ref={hostnameRef}
                  defaultValue={hostname}
                ></input>
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
                  ref={portRef}
                  defaultValue={port}
                ></input>
              </div>
            </div>
          </div>

          <div className="form-row">
            <label htmlFor="baseUrl" className="text-label">
              Base URL
            </label>
            <div className="form-input">
              <div className="form-input-field">
                <input
                  name="baseUrl"
                  id="baseUrl"
                  type="text"
                  ref={baseUrlRef}
                  defaultValue={baseURl}
                ></input>
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
                  ref={apiKeyRef}
                  defaultValue={settingsCtx.settings.radarr_api_key}
                ></input>
              </div>
            </div>
          </div>

          <div className="actions mt-5 w-full">
            <div className="flex w-full flex-wrap sm:flex-nowrap">
              <span className="m-auto rounded-md shadow-sm sm:mr-auto sm:ml-3">
                <DocsButton page="tutorial-Configuration" />
              </span>
              <div className="m-auto flex sm:m-0 sm:justify-end mt-3 xs:mt-0">
                <TestButton onClick={appTest} testUrl="/settings/test/radarr" />

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

export default RadarrSettings
