import { useEffect, useRef, useState } from 'react'
import Modal from '../../../Common/Modal'
import GetApiHandler, { PostApiHandler } from '../../../../utils/ApiHandler'
import LoadingSpinner from '../../../Common/LoadingSpinner'
import { camelCaseToPrettyText } from '../../../../utils/SettingsUtils'

interface agentSpec {
  name: string
  options: [
    { field: string; type: string; required: boolean; extraInfo: string },
  ]
}

export interface AgentConfiguration {
  name: string
  agent: string
  enabled: boolean
  types: number[]
  options: {}
}

interface CreateNotificationModal {
  selected?: { agent: string; options: any }
  onSave: (status: boolean) => void
  onTest: () => void
  onCancel: () => void
}

const CreateNotificationModal = (props: CreateNotificationModal) => {
  const [availableAgents, setAvailableAgents] = useState<agentSpec[]>()
  const nameRef = useRef<HTMLInputElement>(null)
  const enabledRef = useRef<HTMLInputElement>()
  const [formValues, setFormValues] = useState({})

  const [targetAgent, setTargetAgent] = useState<agentSpec>()

  const handleSubmit = () => {
    if (targetAgent && nameRef.current?.value !== null) {
      const payload: AgentConfiguration = {
        name: nameRef.current!.value,
        agent: targetAgent.name,
        enabled:
          enabledRef.current?.value == null
            ? false
            : enabledRef.current?.value == 'on'
              ? true
              : false,
        types: [0, 1],
        options: formValues,
      }
      postNotificationConfig(payload)
    } else {
      props.onSave(false)
    }
  }

  useEffect(() => {
    GetApiHandler('/notifications/agents').then((agents) => {
      setAvailableAgents(agents)
    })
  }, [])

  const postNotificationConfig = (payload: AgentConfiguration) => {
    PostApiHandler('/notifications/configuration/add', payload).then((status) => {
      props.onSave(status)
    })
  }

  const handleInputChange = (fieldName: string, value: any) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      [fieldName]: value,
    }))
  }

  if (!availableAgents) {
    return (
      <span>
        <LoadingSpinner />
      </span>
    )
  } else {
    return (
      <Modal
        loading={false}
        backgroundClickable={false}
        onCancel={() => props.onCancel()}
        okDisabled={false}
        okText="Save"
        okButtonType={'primary'}
        title={'New Notification'}
        iconSvg={''}
        onOk={handleSubmit}
      >
        <div>
          <form className="space-y-4">
            {/* Config Name */}
            <div className="form-row">
              <label htmlFor="name" className="text-label">
                Name *
              </label>
              <div className="form-input">
                <div className="form-input-field">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    ref={nameRef}
                  ></input>
                </div>
              </div>
            </div>
            {/* Enabled */}
            <div className="form-row">
              <label htmlFor="enabled" className="text-label">
                Enabled
              </label>
              <div className="form-input">
                <div className="form-input-field">
                  <input
                    type="checkbox"
                    name="enabled"
                    id="enabled"
                    ref={enabledRef}
                  ></input>
                </div>
              </div>
            </div>
            {/* Select agent */}
            <div className="form-row">
              <label htmlFor="ssl" className="text-label">
                Type *
              </label>
              <div className="form-input">
                <div className="form-input-field">
                  <select
                    id="agent"
                    name="agent"
                    onChange={(e) => {
                      setFormValues({})
                      setTargetAgent(availableAgents[Number(e.target.value)])
                    }}
                    className="rounded-l-only"
                  >
                    {availableAgents?.map((agent, index) => (
                      <option key={`agent-${index}`} value={index}>
                        {`${agent.name}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              {/* Load fields */}
              {targetAgent?.options.map((option) => {
                return (
                  <div className="form-row">
                    <label htmlFor="name" className="text-label">
                      {camelCaseToPrettyText(
                        option.field + (option.required ? ' *' : ''),
                      )}
                      {option.extraInfo ? (
                        <span className="label-tip">{option.extraInfo}</span>
                      ) : null}
                    </label>
                    <div className="form-input">
                      <div className="form-input-field">
                        <input
                          name={option.field}
                          id={`${targetAgent.name}-${option.field}`}
                          type={option.type}
                          required={option.required}
                          key={`${targetAgent.name}-option-${option.field}`}
                          onChange={(e) =>
                            handleInputChange(option.field, e.target.value)
                          }
                        ></input>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </form>
        </div>
      </Modal>
    )
  }
}
export default CreateNotificationModal
