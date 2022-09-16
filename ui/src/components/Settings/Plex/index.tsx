import { SaveIcon } from '@heroicons/react/solid'
import React, { useContext, useEffect, useRef, useState } from 'react'
import SettingsContext from '../../../contexts/settings-context'
import { DeleteApiHandler, PostApiHandler } from '../../../utils/ApiHandler'
import Alert from '../../Common/Alert'
import Button from '../../Common/Button'
import PlexLoginButton from '../../Login/Plex'
import axios from 'axios'
import TestButton from '../../Common/TestButton'
import DocsButton from '../../Common/DocsButton'

const PlexSettings = () => {
  const settingsCtx = useContext(SettingsContext)
  const hostnameRef = useRef<HTMLInputElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const portRef = useRef<HTMLInputElement>(null)
  const sslRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<boolean>()
  const [changed, setChanged] = useState<boolean>()
  const [tokenValid, setTokenValid] = useState<Boolean>(false)
  const [clearTokenClicked, setClearTokenClicked] = useState<Boolean>(false)
  const [testBanner, setTestbanner] = useState<{
    status: Boolean
    version: string
  }>({ status: false, version: '0' })

  useEffect(() => {
    document.title = 'Maintainerr - Settings - Plex'
  }, [])

  const submit = async (
    e: React.FormEvent<HTMLFormElement> | undefined,
    plex_token?: { plex_auth_token: string } | undefined
  ) => {
    e ? e.preventDefault() : undefined
    if (
      hostnameRef.current?.value &&
      nameRef.current?.value &&
      portRef.current?.value
      // sslRef.current?.value
    ) {
      let payload: {
        plex_hostname: string
        plex_port: number
        plex_name: string
        plex_ssl: number
        plex_auth_token?: string
      } = {
        plex_hostname: hostnameRef.current.value,
        plex_port: +portRef.current.value,
        plex_name: nameRef.current.value,
        plex_ssl: 0, //sslRef.current.checked ? 1 : 0,
      }

      if (plex_token) {
        payload = {
          ...payload,
          plex_auth_token: plex_token.plex_auth_token,
        }
      }

      const resp: { code: 0 | 1; message: string } = await PostApiHandler(
        '/settings',
        {
          ...settingsCtx.settings,
          ...payload,
        }
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

  const authsuccess = (token: string) => {
    verifyToken(token)
    submit(undefined, { plex_auth_token: token })
  }

  const authFailed = () => {
    setError(true)
  }

  const deleteToken = async () => {
    const status = await DeleteApiHandler('/settings/plex/auth')

    if (Boolean(status.code)) {
      settingsCtx.addSettings({
        ...settingsCtx.settings,
        plex_auth_token: null,
      })
      setError(false)
      setChanged(true)
      setTokenValid(false)
      setClearTokenClicked(false)
    } else {
      setError(true)
    }
  }

  const verifyToken = (token?: string) => {
    const authToken = token || settingsCtx.settings.plex_auth_token
    if (authToken) {
      axios
        .get('https://plex.tv/api/v2/user', {
          headers: {
            'X-Plex-Product': 'Maintainerr',
            'X-Plex-Version': '2.0',
            'X-Plex-Client-Identifier': '695b47f5-3c61-4cbd-8eb3-bcc3d6d06ac5',
            'X-Plex-Token': authToken,
          },
        })
        .then((response) => {
          setTokenValid(response.status === 200 ? true : false)
        })
        .catch(() => setTokenValid(false))
    } else {
      setTokenValid(false)
    }
  }

  useEffect(() => {
    if (settingsCtx.settings.plex_auth_token) verifyToken()
  }, [])

  const appTest = (result: { status: boolean; version: string }) => {
    setTestbanner({ status: result.status, version: result.version })
  }

  return (
    <div className="h-full w-full">
      <div className="section h-full w-full">
        <h3 className="heading">Plex Settings</h3>
        <p className="description">Plex configuration</p>
      </div>

      {error ? (
        <Alert type="warning" title="Not all fields contain values" />
      ) : changed ? (
        <Alert type="info" title="Settings succesfully updated" />
      ) : undefined}

      {tokenValid ? (
        ''
      ) : (
        <Alert
          type="info"
          title="Plex configuration is required for Maintainerr to function."
        />
      )}

      {testBanner.version !== '0' ? (
        testBanner.status ? (
          <Alert
            type="warning"
            title={`Succesfully connected to Plex (${testBanner.version})`}
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
            <label htmlFor="name" className="text-label">
              Name
            </label>
            <div className="form-input">
              <div className="form-input-field">
                <input
                  name="name"
                  id="name"
                  type="text"
                  ref={nameRef}
                  defaultValue={settingsCtx.settings.plex_name}
                ></input>
              </div>
            </div>
          </div>

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
                  defaultValue={settingsCtx.settings.plex_hostname}
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
                  defaultValue={settingsCtx.settings.plex_port}
                ></input>
              </div>
            </div>
          </div>

          {/* <div className="form-row">
            <label htmlFor="ssl" className="text-label">
              SSL
            </label>
            <div className="form-input">
              <div className="form-input-field">
                <input
                  type="checkbox"
                  name="ssl"
                  id="ssl"
                  defaultChecked={Boolean(settingsCtx.settings.plex_ssl)}
                  ref={sslRef}
                ></input>
              </div>
            </div>
          </div> */}

          <div className="form-row">
            <label htmlFor="ssl" className="text-label">
              Authentication
              <span className="label-tip">
                {`Authentication with the server's admin account is required to access the
                Plex API`}
              </span>
            </label>
            <div className="form-input">
              <div className="form-input-field">
                {tokenValid ? (
                  clearTokenClicked ? (
                    <Button
                      onClick={(e: React.FormEvent) => {
                        e.preventDefault()
                        deleteToken()
                      }}
                      buttonType="warning"
                    >
                      Clear credentials?
                    </Button>
                  ) : (
                    <Button
                      onClick={(e: React.FormEvent) => {
                        e.preventDefault()
                        setClearTokenClicked(true)
                      }}
                      buttonType="success"
                    >
                      Authenticated
                    </Button>
                  )
                ) : (
                  <PlexLoginButton
                    onAuthToken={authsuccess}
                    onError={authFailed}
                  ></PlexLoginButton>
                )}
              </div>
            </div>
          </div>

          <div className="actions mt-5 w-full">
            <div className="flex flex-wrap sm:flex-nowrap w-full">
              <span className="m-auto sm:mr-auto sm:ml-3 rounded-md shadow-sm">
                <DocsButton page='tutorial-Configuration' />
              </span>
              <div className="flex sm:justify-end m-auto sm:m-0 mt-3 xs:mt-0">
                <TestButton onClick={appTest} testUrl="/settings/test/plex" />

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
export default PlexSettings
