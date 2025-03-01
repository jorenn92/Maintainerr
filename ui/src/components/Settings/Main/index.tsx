import {
  RefreshIcon,
  SaveIcon,
  EyeIcon,
  EyeOffIcon,
  ClipboardCopyIcon,
  CheckIcon,
} from '@heroicons/react/solid'
import React, { useContext, useEffect, useRef, useState } from 'react'
import SettingsContext from '../../../contexts/settings-context'
import { PostApiHandler } from '../../../utils/ApiHandler'
import Alert from '../../Common/Alert'
import { useToasts } from 'react-toast-notifications'
import Button from '../../Common/Button'
import DocsButton from '../../Common/DocsButton'
import { clearAuthSession } from '../../../utils/LogOut'

const MainSettings = () => {
  const settingsCtx = useContext(SettingsContext)
  const hostnameRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<boolean>()
  const [changed, setChanged] = useState<boolean>()
  const [cacheImage, setCacheImage] = useState<boolean>()
  const [authEnabled, setAuthEnabled] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [apiKey, setApiKey] = useState<string>('')
  const [originalApiKey, setOriginalApiKey] = useState<string>('')
  const [showApiKey, setShowApiKey] = useState(false)

  useEffect(() => {
    document.title = 'Maintainerr - Settings - General'

    fetch('http://localhost:3000/api/authentication/settings', {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        setAuthEnabled(data.authEnabled)
        setUsername(data.username || '')
        if (data.passwordHash) {
          setPassword(true)
        }
        setApiKey(data.apiKey || '')
        setOriginalApiKey(data.apiKey || '')
      })
  }, [])

  useEffect(() => {
    setCacheImage(settingsCtx.settings.cacheImages ? true : false)
  }, [settingsCtx])

  const handleInputChange = (
    setter: React.Dispatch<React.SetStateAction<any>>,
    value: any,
  ) => {
    setter(value)
    setHasChanges(true)
  }
  const isSaveDisabled =
    !hasChanges || // ✅ Disable if no changes have been made
    (authEnabled &&
      (!username.trim() || !newPassword.trim() || !confirmPassword.trim())) || // ✅ Require username + password if enabling authentication
    (isChangingPassword && (!newPassword.trim() || !confirmPassword.trim()))

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(false)
    setChanged(false)

    const hostname = hostnameRef.current?.value
    if (!hostname) {
      setError(true)
      return
    }
    if (
      authEnabled &&
      (!username.trim() ||
        (isChangingPassword &&
          (!newPassword.trim() || !confirmPassword.trim())))
    ) {
      setError(true)
      return alert('All fields are required when enabling authentication.')
    }
    if (isChangingPassword && newPassword !== confirmPassword) {
      setError(true)
      return alert('Passwords do not match.')
    }

    const payload = {
      applicationUrl: hostnameRef.current.value,
      cacheImages: cacheImage ? 1 : 0,
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
      setChanged(true)
    } else {
      setError(true)
    }

    const authPayload: any = {
      authEnabled,
      username,
    }
    if (apiKey !== originalApiKey) {
      authPayload.apiKey = apiKey // ✅ Save only if changed
    }

    if (isChangingPassword) {
      authPayload.password = newPassword
    }

    // ✅ Also save authentication settings
    const authResponse = await fetch(
      'http://localhost:3000/api/authentication/settings',
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(authPayload),
      },
    )

    if (!authResponse.ok) {
      setError(true)
    } else {
      setNewPassword('')
      setConfirmPassword('')
      setIsChangingPassword(false)
      setHasChanges(false)
      setOriginalApiKey(apiKey)

      if (authEnabled) {
        // Redirect to login
        window.location.href = '/login'
        await clearAuthSession(authEnabled)
      } else {
        // Clear authentication state & refresh
        localStorage.removeItem('isAuthenticated')
        document.cookie = 'sessionToken=; Max-Age=0; path=/;'
        window.location.reload()
      }
    }
  }

  const regenerateApiKey = async () => {
    try {
      const newKey = await fetch('/api/authentication/apikey/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      }).then((res) => res.json())

      if (newKey.apiKey) {
        setApiKey(newKey.apiKey) // ✅ Show new API key
        setHasChanges(true) // ✅ Enable Save button
      }
    } catch (error) {
      console.error('Failed to regenerate API key:', error)
    }
  }
  const { addToast } = useToasts()
  const copyApiKeyToClipboard = () => {
    navigator.clipboard.writeText(apiKey)
    addToast('API Key copied', {
      appearance: 'success',
      autoDismiss: true,
    })
  }

  return (
    <div className="h-full w-full">
      <div className="section h-full w-full">
        <h3 className="heading">General Settings</h3>
        <p className="description">Configure global settings</p>
      </div>
      {error ? (
        <Alert type="warning" title="Not all fields contain values" />
      ) : changed ? (
        <Alert type="info" title="Settings successfully updated" />
      ) : undefined}
      <div className="section">
        <form onSubmit={submit}>
          <div className="form-row">
            <label htmlFor="name" className="text-label">
              Hostname
            </label>
            <div className="form-input">
              <div className="form-input-field">
                <input
                  name="name"
                  id="name"
                  type="text"
                  ref={hostnameRef}
                  onChange={(e) => {
                    setHasChanges(true)
                  }}
                  defaultValue={settingsCtx.settings.applicationUrl}
                ></input>
              </div>
            </div>
          </div>
          {/* Enable/Disable Authentication */}
          <div className="form-row">
            <label className="text-label"> Enable Authentication</label>
            <div className="form-input">
              <input
                type="checkbox"
                checked={authEnabled}
                onChange={(e) => {
                  setAuthEnabled(e.target.checked)
                  setHasChanges(true)
                  if (!e.target.checked) {
                    // If disabling authentication, clear username & password state
                    setUsername('')
                    setNewPassword('')
                    setConfirmPassword('')
                  }
                }} // ✅ Directly toggle authentication
                className="h-5 w-5"
              />
            </div>
          </div>
          {/* Show Password Field Only if Authentication is Enabled */}
          {authEnabled && (
            <>
              {/* Username Input */}
              <div className="form-row">
                <label className="text-label">Username</label>
                <div className="form-input">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) =>
                      handleInputChange(setUsername, e.target.value)
                    }
                    className="form-input-field"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="form-row">
                <label className="text-label">Password</label>
                <div className="form-input flex">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={
                      isChangingPassword
                        ? newPassword
                        : password
                          ? '•••••••••••••••••••••'
                          : ''
                    }
                    placeholder="Enter New Password"
                    onFocus={() => {
                      setIsChangingPassword(true) // ✅ Trigger password change state on focus
                      setNewPassword('') // ✅ Clear dots when starting to type
                    }}
                    onChange={(e) =>
                      handleInputChange(setNewPassword, e.target.value)
                    }
                    className="form-input-field"
                    autoComplete="new-password"
                  />
                  {/* Eye Icon in Box */}
                  {isChangingPassword && (
                    <button
                      type="button"
                      className="flex items-center justify-center rounded-r border-l border-gray-600 bg-gray-700 px-3 py-2 hover:bg-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeIcon className="h-5 w-5 text-gray-300" />
                      ) : (
                        <EyeOffIcon className="h-5 w-5 text-gray-300" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Confirm New Password (Only Show If Changing Password) */}
              {isChangingPassword && (
                <div className="form-row">
                  <label className="text-label">Confirm New Password</label>
                  <div className="form-input flex">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) =>
                        handleInputChange(setConfirmPassword, e.target.value)
                      }
                      className="form-input-field"
                      autoComplete="new-password"
                    />
                    {/* Eye Icon in Box */}
                    <button
                      type="button"
                      className="flex items-center justify-center rounded-r border-l border-gray-600 bg-gray-700 px-3 py-2 hover:bg-gray-600"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeIcon className="h-5 w-5 text-gray-300" />
                      ) : (
                        <EyeOffIcon className="h-5 w-5 text-gray-300" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          <div className="form-row">
            <label htmlFor="apiKey" className="text-label">
              API Key
            </label>
            <div className="form-input flex">
              <input
                type={showApiKey ? 'text' : 'password'}
                onChange={() => setHasChanges(true)}
                value={
                  apiKey ? (showApiKey ? apiKey : '•••••••••••••••••••••') : ''
                }
                readOnly
                className="form-input-field !rounded-r-none rounded-l"
              />

              {/* Eye Icon (Toggle Visibility) */}
              <button
                type="button"
                className="flex items-center justify-center rounded-r border-l border-gray-600 bg-gray-700 px-3 py-2 hover:bg-gray-600"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? (
                  <EyeIcon className="h-5 w-5 text-gray-300" />
                ) : (
                  <EyeOffIcon className="h-5 w-5 text-gray-300" />
                )}
              </button>

              {/* Copy Button */}
              <button
                type="button"
                className="ml-2 flex items-center justify-center rounded bg-blue-600 px-3 py-2 hover:bg-blue-500"
                onClick={copyApiKeyToClipboard}
              >
                <ClipboardCopyIcon className="h-5 w-5 text-white" />
              </button>

              {/* Regenerate API Key Button */}
              <button
                type="button"
                className="ml-2 flex items-center justify-center rounded bg-red-600 px-3 py-2 hover:bg-red-500"
                onClick={regenerateApiKey}
              >
                <RefreshIcon className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>

          <div className="form-row">
            <label htmlFor="cacheImages" className="text-label">
              Cache Images
              <p className="text-xs font-normal">
                Deactivate if you&apos;re having issues with images
              </p>
            </label>
            <div className="form-input">
              <div className="form-input-field">
                <input
                  name="cacheImages"
                  id="cacheImages"
                  type="checkbox"
                  onClick={() => {
                    setCacheImage(!cacheImage)
                    setHasChanges(true)
                  }}
                  checked={cacheImage}
                ></input>
              </div>
            </div>
          </div>
          <div className="actions mt-5 w-full">
            <div className="flex justify-end">
              <div className="flex w-full">
                <span className="mr-auto flex rounded-md shadow-sm">
                  <DocsButton />
                </span>
                <span className="ml-auto flex rounded-md shadow-sm">
                  <Button
                    buttonType="primary"
                    type="submit"
                    disabled={!hasChanges}
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
export default MainSettings
