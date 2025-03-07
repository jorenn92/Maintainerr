import { SaveIcon } from '@heroicons/react/solid'
import { zodResolver } from '@hookform/resolvers/zod'
import { BasicResponseDto, TautulliSettingDto } from '@maintainerr/contracts'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import GetApiHandler, { PostApiHandler } from '../../../utils/ApiHandler'
import {
  addPortToUrl,
  getBaseUrl,
  getHostname,
  getPortFromUrl,
} from '../../../utils/SettingsUtils'
import Alert from '../../Common/Alert'
import Button from '../../Common/Button'
import DocsButton from '../../Common/DocsButton'
import { InputGroup } from '../../Forms/Input'

interface TestStatus {
  status: boolean
  message: string
}

// TODO Make this + transform generic for other setting forms
const tautulliSplitSettingSchema = z.object({
  hostname: z.string().trim().min(1),
  port: z.union([
    z.literal('').transform((x) => null),
    z.coerce.number().min(1).max(65535),
  ]),
  baseUrl: z.string().trim().startsWith('/').or(z.literal('')),
  apiKey: z.string().trim().min(1),
})

const stripLeadingSlash = (url: string) =>
  url.endsWith('/') ? url.slice(0, -1) : url

type tautulliSplitSettingInput = z.input<typeof tautulliSplitSettingSchema>

const generateUrlFromParts = (
  hostname: string,
  port?: number | null,
  baseUrl?: string | null,
) => {
  let portToUse = port

  // if port not specified, but hostname is. Derive the port
  if (!portToUse) {
    const derivedPort = hostname.includes('http://')
      ? 80
      : hostname.includes('https://')
        ? 443
        : 80

    portToUse = derivedPort
  }

  const hostnameVal = hostname.includes('http://')
    ? hostname
    : hostname.includes('https://')
      ? hostname
      : portToUse == 443
        ? 'https://' + hostname
        : 'http://' + hostname

  let url = `${addPortToUrl(stripLeadingSlash(hostnameVal), +portToUse)}`
  url = `${url}${baseUrl ?? ''}`

  return url
}

const tautulliSplitSettingTransform =
  tautulliSplitSettingSchema.transform<TautulliSettingDto>(
    ({ hostname, port, baseUrl, apiKey }) => {
      const url = generateUrlFromParts(hostname, port, baseUrl)

      return {
        url,
        api_key: apiKey,
      }
    },
  )

const TautulliSettings = () => {
  const [testedSettings, setTestedSettings] = useState<
    tautulliSplitSettingInput | undefined
  >()

  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<TestStatus>()
  const [saveError, setSaveError] = useState<boolean>(false)
  const [isSubmitSuccessful, setIsSubmitSuccessful] = useState<boolean>(false)

  useEffect(() => {
    document.title = 'Maintainerr - Settings - Tautulli'
  }, [])

  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    watch,
    control,
    formState: { errors, isSubmitting, isLoading },
  } = useForm<tautulliSplitSettingInput, unknown, TautulliSettingDto>({
    resolver: zodResolver(tautulliSplitSettingTransform),
    defaultValues: async () => {
      const resp = await GetApiHandler<TautulliSettingDto>('/settings/tautulli')
      const port = getPortFromUrl(resp.url)

      const settings: tautulliSplitSettingInput = {
        hostname: getHostname(resp.url) ?? '',
        port: port ? parseInt(port) : '',
        baseUrl: getBaseUrl(resp.url) ?? '',
        apiKey: resp.api_key,
      }

      setTestedSettings(settings)

      return {
        hostname: getHostname(resp.url) ?? '',
        port: port ? parseInt(port) : '',
        baseUrl: getBaseUrl(resp.url) ?? '',
        apiKey: resp.api_key,
      }
    },
  })

  const hostname = watch('hostname')
  const baseUrl = watch('baseUrl')
  const port = watch('port')
  const apiKey = watch('apiKey')

  const requiresTestBeforeSave =
    hostname != testedSettings?.hostname ||
    baseUrl != testedSettings?.baseUrl ||
    port != testedSettings?.port ||
    apiKey != testedSettings?.apiKey ||
    !testResult?.status

  const syncGeneratedPortAndHostname = (url: TautulliSettingDto['url']) => {
    const port = parseInt(getPortFromUrl(url)!)
    const hostname = getHostname(url)!
    setValue('port', port)
    setValue('hostname', hostname)
  }

  const onSubmit = async (data: TautulliSettingDto) => {
    setSaveError(false)
    setIsSubmitSuccessful(false)
    syncGeneratedPortAndHostname(data.url)

    try {
      const resp = await PostApiHandler<BasicResponseDto>(
        '/settings/tautulli',
        data,
      )

      if (Boolean(resp.code)) {
        setIsSubmitSuccessful(true)
      } else {
        setSaveError(true)
      }
    } catch (err) {
      setSaveError(true)
    }
  }

  const performTest = async () => {
    if (testing) return

    const url = generateUrlFromParts(
      hostname,
      port === '' ? null : port,
      baseUrl,
    )
    syncGeneratedPortAndHostname(url)
    setTesting(true)

    const testPayload = tautulliSplitSettingTransform.safeParse({
      hostname,
      port,
      baseUrl,
      apiKey,
    })

    await PostApiHandler<BasicResponseDto>(
      '/settings/test/tautulli',
      testPayload.data,
    )
      .then((resp) => {
        setTestResult({
          status: resp.code == 1 ? true : false,
          message: resp.message ?? 'Unknown error',
        })

        if (resp.code == 1) {
          setTestedSettings({
            hostname,
            baseUrl,
            port,
            apiKey,
          })
        }
      })
      .catch((e) => {
        setTestResult({
          status: false,
          message: 'Unknown error',
        })
      })
      .finally(() => {
        setTesting(false)
      })
  }

  return (
    <div className="h-full w-full">
      <div className="section h-full w-full">
        <h3 className="heading">Tautulli Settings</h3>
        <p className="description">Tautulli configuration</p>
      </div>
      {saveError ? (
        <Alert type="warning" title="Something went wrong" />
      ) : isSubmitSuccessful ? (
        <Alert type="info" title="Tautulli settings successfully updated" />
      ) : undefined}

      {testResult != null &&
        (testResult?.status ? (
          <Alert
            type="warning"
            title={`Successfully connected to Tautulli (${testResult.message})`}
          />
        ) : (
          <Alert type="error" title={testResult.message} />
        ))}

      <div className="section">
        <form onSubmit={handleSubmit(onSubmit)}>
          <InputGroup
            label="Hostname or IP"
            placeholder="http://localhost"
            type="text"
            {...register('hostname')}
            error={errors.hostname?.message}
            required
          />

          <InputGroup
            label="Port"
            type="number"
            placeholder="8181"
            {...register('port')}
            error={errors.port?.message}
            required
          />

          <Controller
            name={'baseUrl'}
            control={control}
            render={({ field }) => (
              <InputGroup
                label="Base URL"
                value={field.value}
                placeholder="/maintainerr"
                onChange={field.onChange}
                onBlur={(event) =>
                  field.onChange(stripLeadingSlash(event.target.value))
                }
                ref={field.ref}
                name={field.name}
                type="text"
                error={errors.baseUrl?.message}
              />
            )}
          />

          <InputGroup
            label="Api key"
            type="password"
            {...register('apiKey')}
            error={errors.apiKey?.message}
          />

          <div className="actions mt-5 w-full">
            <div className="flex w-full flex-wrap sm:flex-nowrap">
              <span className="m-auto rounded-md shadow-sm sm:ml-3 sm:mr-auto">
                <DocsButton page="Configuration/#tautulli" />
              </span>
              <div className="m-auto mt-3 flex xs:mt-0 sm:m-0 sm:justify-end">
                <Button
                  buttonType="success"
                  onClick={performTest}
                  className="ml-3"
                  disabled={testing}
                >
                  {testing ? 'Testing...' : 'Test'}
                </Button>
                <span className="ml-3 inline-flex rounded-md shadow-sm">
                  <Button
                    buttonType="primary"
                    type="submit"
                    disabled={
                      isSubmitting || requiresTestBeforeSave || isLoading
                    }
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

export default TautulliSettings
