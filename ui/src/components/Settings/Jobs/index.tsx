import { SaveIcon } from '@heroicons/react/solid'
import { useContext, useState } from 'react'
import SettingsContext from '../../../contexts/settings-context'
import { PostApiHandler } from '../../../utils/ApiHandler'
import Alert from '../../Common/Alert'
import Button from '../../Common/Button'

const JobSettings = () => {
  const settingsCtx = useContext(SettingsContext)
  const [rulehander, setRuleHandler] = useState(null)
  const [collectionHandler, setCollectionHandler] = useState(null)
  const [error, setError] = useState<boolean>(true)
  const [changed, setChanged] = useState<boolean>()

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (
      rulehander &&
      collectionHandler &&
      false 
// forced false..
    ) {
      const payload = {
        collection_handler_job_cron: rulehander,
        rules_handler_job_cron: collectionHandler,
      }
      const resp: { code: 0 | 1; message: string } = await PostApiHandler(
        '/settings',
        {
          ...settingsCtx.settings,
          ...payload,
        }
      )
      if (Boolean(resp.code)) {
        setError(false)
        setChanged(true)
      } else setError(true)
    } else {
      setError(true)
    }
  }

  interface JobOption {
    name: string
    cron: string
  }

  const ruleHanlderOptions: JobOption[] = []
  const collectionHandlerOptions: JobOption[] = []

  const possibilities: JobOption[] = [

  ]

  return (
    <div className="h-full w-full">
      <div className="section h-full w-full">
        <h3 className="heading">Job Settings</h3>
        <p className="description">Job configuration</p>
      </div>

      {error ? (
        <Alert type="warning" title="Not yet implemented" />
      ) : changed ? (
        <Alert type="info" title="Settings succesfully updated" />
      ) : undefined}
      
      <div className="section">
        <form onSubmit={submit}>
          <div className="form-row">
            <label htmlFor="ruleHandler" className="text-label">
              Rule Handler
            </label>
            <div className="form-input">
              <div className="form-input-field">
                <select name="ruleHandler" id="rulehandler">
                  {ruleHanlderOptions.map((el, idx) => {
                    return <option key={idx}>{el.name}</option>
                  })}
                </select>
              </div>
            </div>
          </div>

          <div className="form-row">
            <label htmlFor="collectionHanlder" className="text-label">
              Collection Handler
            </label>
            <div className="form-input">
              <div className="form-input-field">
                <select name="collectionHanlder" id="rulehandler">
                  {collectionHandlerOptions.map((el, idx) => {
                    return <option key={idx}>{el.name}</option>
                  })}
                </select>
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

export default JobSettings
