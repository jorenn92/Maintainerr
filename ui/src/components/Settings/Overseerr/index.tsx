import { SaveIcon } from '@heroicons/react/solid'
import { useContext, useEffect, useRef, useState } from 'react'
import SettingsContext from '../../../contexts/settings-context'
import { PostApiHandler } from '../../../utils/ApiHandler'
import {
  addPortToUrl,
  getPortFromUrl,
  handleSettingsInputChange,
  removePortFromUrl,
} from '../../../utils/SettingsUtils'
import Alert from '../../Common/Alert'
import Button from '../../Common/Button'
import DocsButton from '../../Common/DocsButton'
import TestButton from '../../Common/TestButton'

const OverseerrSettings = () => {
  const settingsCtx = useContext(SettingsContext)
  const hostnameRef = useRef<HTMLInputElement>(null)
  const portRef = useRef<HTMLInputElement>(null)
  const apiKeyRef = useRef<HTMLInputElement>(null)
  const [hostname, setHostname] = useState<string>()
  const [port, setPort] = useState<string>()
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
    document.title = 'Maintainerr - Settings - Overseerr'
  }, [])

  useEffect(() => {
    // hostname
    setHostname(removePortFromUrl(settingsCtx.settings.overseerr_url))
    // @ts-ignore
    hostnameRef.current = {
      value: removePortFromUrl(settingsCtx.settings.overseerr_url),
    }

    // port
    setPort(getPortFromUrl(settingsCtx.settings.overseerr_url))
    // @ts-ignore
    portRef.current = {
      value: getPortFromUrl(settingsCtx.settings.overseerr_url),
    }
  }, [settingsCtx])

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // if port not specified, but hostname is. Derive the port
    if (!portRef.current?.value && hostnameRef.current?.value) {
      const derivedPort = hostnameRef.current.value.includes('http://')
        ? 80
        : hostnameRef.current.value.includes('https://')
          ? 443
          : 80

      if (derivedPort) {
        setPort(derivedPort.toString())
        // @ts-ignore
        portRef.current = { value: derivedPort.toString() }
      }
    }

    if (
      hostnameRef.current?.value &&
      apiKeyRef.current?.value &&
      portRef.current?.value
    ) {
      const hostnameVal = hostnameRef.current.value.includes('http://')
        ? hostnameRef.current.value
        : hostnameRef.current.value.includes('https://')
          ? hostnameRef.current.value
          : portRef.current.value == '443'
            ? 'https://' + hostnameRef.current.value
            : 'http://' + hostnameRef.current.value

      const payload = {
        overseerr_url: addPortToUrl(hostnameVal, +portRef.current.value),
        overseerr_api_key: apiKeyRef.current.value,
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
        <h3 className="heading">Overseerr Settings</h3>
        <p className="description">Overseerr configuration</p>
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
            title={`Successfully connected to Overseerr (${testBanner.message})`}
          />
        ) : (
          <Alert type="error" title={testBanner.message} />
        ))}

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
                  defaultValue={hostname}
                  ref={hostnameRef}
                  value={hostnameRef.current?.value}
                  onChange={(e) =>
                    handleSettingsInputChange(e, hostnameRef, setHostname)
                  }
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
                  value={portRef.current?.value}
                  defaultValue={port}
                  onChange={(e) =>
                    handleSettingsInputChange(e, portRef, setPort)
                  }
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
                  defaultValue={settingsCtx.settings.overseerr_api_key}
                ></input>
              </div>
            </div>
          </div>

          <div className="actions mt-5 w-full">
            <div className="flex w-full flex-wrap sm:flex-nowrap">
              <span className="m-auto rounded-md shadow-sm sm:ml-3 sm:mr-auto">
                <DocsButton page="Configuration/#overseerr" />
              </span>
              <div className="m-auto mt-3 flex xs:mt-0 sm:m-0 sm:justify-end">
                <TestButton
                  onClick={appTest}
                  testUrl="/settings/test/overseerr"
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

export default OverseerrSettings
