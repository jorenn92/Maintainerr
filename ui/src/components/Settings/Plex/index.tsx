import { SaveIcon } from '@heroicons/react/solid'
import { useContext, useRef, useState } from 'react'
import SettingsContext from '../../../contexts/settings-context'
import { PostApiHandler } from '../../../helpers/ApiHandler'
import Alert from '../../Common/Alert'
import Button from '../../Common/Button'

const PlexSettings = () => {
  const settingsCtx = useContext(SettingsContext)
  const hostnameRef = useRef<HTMLInputElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const portRef = useRef<HTMLInputElement>(null)
  const sslRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<boolean>()
  const [changed, setChanged] = useState<boolean>()

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (
      hostnameRef.current?.value &&
      nameRef.current?.value &&
      portRef.current?.value &&
      sslRef.current?.value
    ) {
      const payload = {
        plex_hostname: hostnameRef.current.value,
        plex_port: +portRef.current.value,
        plex_name: nameRef.current.value,
        plex_ssl: sslRef.current.checked ? 1 : 0,
      }
      console.log(payload)
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

          <div className="form-row">
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
          </div>

          <div className="actions mt-5 w-full">
            <div className="flex justify-end">
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
        </form>
      </div>
    </div>
  )
}
export default PlexSettings
