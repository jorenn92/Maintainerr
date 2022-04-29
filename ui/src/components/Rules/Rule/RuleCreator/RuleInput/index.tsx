import { TrashIcon } from '@heroicons/react/solid'
import { FormEvent, useContext, useEffect, useState } from 'react'
import { IRule } from '../'
import ConstantsContext, {
  IProperty,
  MediaType,
} from '../../../../../contexts/constants-context'

enum RulePossibility {
  BIGGER,
  SMALLER,
  EQUALS,
  NOT_EQUALS,
  CONTAINS,
  BEFORE,
  AFTER,
  IN_LAST,
  IN_NEXT,
}

enum RuleType {
  NUMBER,
  DATE,
  TEXT,
}
enum RuleOperators {
  AND,
  OR,
}

enum CustomParams {
  CUSTOM_NUMBER = 'custom_number',
  CUSTOM_DAYS = 'custom_days',
  CUSTOM_DATE = 'custom_date',
  CUSTOM_TEXT = 'custom_text',
}

interface IRuleInput {
  id?: number
  tagId?: number
  mediaType?: MediaType
  section?: number
  newlyAdded?: number[]
  editData?: { rule: IRule }
  onCommit: (id: number, rule: IRule) => void
  onIncomplete: (id: number) => void
  onDelete: (section: number, id: number) => void
}

const RuleInput = (props: IRuleInput) => {
  const ConstantsCtx = useContext(ConstantsContext)
  const [operator, setOperator] = useState<string>()
  const [firstval, setFirstVal] = useState<string>()
  const [action, setAction] = useState<string>()
  const [secondVal, setSecondVal] = useState<string>()

  const [customValType, setCustomValType] = useState<number>()
  const [customVal, setCustomVal] = useState<string>()
  const [customValActive, setCustomValActive] = useState<boolean>(true)

  const [possibilities, setPossibilities] = useState<number[]>([])
  const [ruleType, setRuleType] = useState<number>(0)

  useEffect(() => {
    if (props.editData?.rule) {
      setOperator(props.editData.rule.operator?.toString())
      setFirstVal(JSON.stringify(props.editData.rule.firstVal))
      setAction(props.editData.rule.action.toString())

      if (props.editData.rule.customVal) {
        switch (props.editData.rule.customVal.ruleTypeId) {
          case 0:
            // TODO: improve this.. Currently this is a hack to determine if param is amount of days or really a number
            if (
              (props.editData.rule.customVal.value as number) % 86400 === 0 &&
              (props.editData.rule.customVal.value as number) != 0
            ) {
              setSecondVal(CustomParams.CUSTOM_DAYS)
              setRuleType(0)
            } else {
              setSecondVal(CustomParams.CUSTOM_NUMBER)
              setRuleType(0)
            }
            break
          case 1:
            setSecondVal(CustomParams.CUSTOM_DATE)
            setRuleType(1)
            break
          case 2:
            setSecondVal(CustomParams.CUSTOM_TEXT)
            setRuleType(2)
        }
        setCustomVal(props.editData.rule.customVal.value.toString())
      } else {
        setSecondVal(JSON.stringify(props.editData.rule.lastVal))
      }
      if (
        props.id &&
        props.newlyAdded &&
        props.newlyAdded?.includes(props.id)
      ) {
        setOperator(undefined)
        setFirstVal(undefined)
        setAction(undefined)
        setSecondVal(undefined)
        setCustomVal(undefined)
      }
    }
  }, [])

  const updateFirstValue = (event: { target: { value: string } }) => {
    setFirstVal(event.target.value)
    setSecondVal(undefined)
  }

  const updateSecondValue = (event: { target: { value: string } }) => {
    setSecondVal(event.target.value)
  }

  const updateCustomValue = (event: { target: { value: string } }) => {
    if (secondVal === 'custom_days') {
      setCustomVal((+event.target.value * 86400).toString())
    } else {
      setCustomVal(event.target.value)
    }
  }

  const updateAction = (event: { target: { value: string } }) => {
    setAction(event.target.value)
  }

  const updateOperator = (event: { target: { value: string } }) => {
    setOperator(event.target.value)
  }

  const onDelete = (e: FormEvent | null) => {
    e?.preventDefault()
    props.onDelete(props.section ? props.section : 0, props.id ? props.id : 0)
  }

  const submit = (e: FormEvent | null) => {
    if (e) {
      e.preventDefault()
    }

    if (
      firstval &&
      action &&
      ((secondVal &&
        secondVal !== 'custom_date' &&
        secondVal !== 'custom_days' &&
        secondVal !== 'custom_number' &&
        secondVal !== 'custom_text') ||
        customVal)
    ) {
      const ruleValues = {
        operator: operator ? operator : null,
        firstVal: JSON.parse(firstval),
        action: +action,
        section: props.section ? props.section - 1 : 0,
      }
      if (customVal) {
        props.onCommit(props.id ? props.id : 0, {
          customVal: {
            ruleTypeId: customValActive
              ? customValType === RuleType.DATE
                ? customValType
                : customValType === RuleType.NUMBER
                ? customValType
                : customValType === RuleType.TEXT && secondVal === 'custom_days'
                ? RuleType.NUMBER
                : customValType === RuleType.TEXT
                ? customValType
                : +ruleType
              : +ruleType,
            value: customVal,
          },
          ...ruleValues,
        })
      } else {
        props.onCommit(props.id ? props.id : 0, {
          lastVal: JSON.parse(secondVal!),
          ...ruleValues,
        })
      }
    } else {
      props.onIncomplete(props.id ? props.id : 0)
    }
  }

  useEffect(() => {
    submit(null)
  }, [secondVal, customVal, operator, action, firstval])

  useEffect(() => {
    if (firstval) {
      const prop = getPropFromTuple(firstval)
      if (prop?.type.key) {
        setRuleType(+prop?.type.key)
        setPossibilities(prop.type.possibilities)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstval])

  useEffect(() => {
    if (secondVal) {
      if (secondVal === 'custom_number') {
        setCustomValActive(true)
        setCustomValType(RuleType.NUMBER)
      } else if (secondVal === 'custom_date') {
        setCustomValActive(true)
        setCustomValType(RuleType.DATE)
      } else if (secondVal === 'custom_days') {
        setCustomValActive(true)
        setCustomValType(RuleType.TEXT)
      } else if (secondVal === 'custom_text') {
        setCustomValActive(true)
        setCustomValType(RuleType.TEXT)
      } else {
        setCustomValActive(false)
        setCustomVal(undefined)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondVal])

  const getPropFromTuple = (
    value: [number, number] | string
  ): IProperty | undefined => {
    if (typeof value === 'string') {
      value = JSON.parse(value)
    }
    const application = ConstantsCtx.constants.applications?.find(
      (el) => el.id === +value[0]
    )

    const prop = application?.props.find((el) => {
      return el.id === +value[1]
    })
    return prop
  }
  return (
    <div className="mt-10 h-full w-full" onSubmit={submit}>
      <div className="section h-full w-full">
        <h3 className="sm-heading max-width-form flex">
          <div>
            {props.tagId
              ? `Rule #${props.tagId}`
              : props.id
              ? `Rule #${props.id}`
              : `Rule #1`}
          </div>

          {props.id && props.id > 1 ? (
            <button
              className="ml-auto flex h-8 rounded bg-amber-900 text-zinc-200 shadow-md hover:bg-amber-800"
              onClick={onDelete}
              title={`Remove rule ${props.tagId}, section ${props.section}`}
            >
              {<TrashIcon className="m-auto ml-5 h-5" />}
              <p className="button-text m-auto ml-1 mr-5 text-zinc-100">
                Delete
              </p>
            </button>
          ) : undefined}
        </h3>
      </div>
      {props.id !== 1 ? (
        (props.id && props.id > 0) || (props.section && props.section > 1) ? (
          <div className="form-row">
            <label htmlFor="operator" className="text-label">
              Operator
              {!props.id ||
              (props.tagId ? props.tagId === 1 : props.id === 1) ? (
                <span className="label-tip">
                  {`Section ${props.section}'s action on all previous section results.`}
                </span>
              ) : (
                <span className="label-tip">
                  {`Action on the previous rule.`}
                </span>
              )}
            </label>
            <div className="form-input">
              <div className="form-input-field">
                <select
                  name="operator"
                  id="operator"
                  onChange={updateOperator}
                  value={operator}
                >
                  <option value={undefined}> </option>
                  {Object.keys(RuleOperators).map(
                    (value: string, key: number) => {
                      if (!isNaN(+value)) {
                        return (
                          <option key={key} value={key}>
                            {RuleOperators[key]}
                          </option>
                        )
                      }
                    }
                  )}
                </select>
              </div>
            </div>
          </div>
        ) : undefined
      ) : undefined}

      <div className="form-row">
        <label htmlFor="first_val" className="text-label">
          First value
        </label>
        <div className="form-input">
          <div className="form-input-field">
            <select
              name="first_val"
              id="first_val"
              onChange={updateFirstValue}
              value={firstval}
            >
              <option value={undefined}></option>
              {ConstantsCtx.constants.applications?.map((app) => {
                return app.mediaType === MediaType.BOTH ||
                  props.mediaType === app.mediaType ? (
                  <optgroup key={app.id} label={app.name}>
                    {app.props.map((prop) => {
                      return prop.mediaType === MediaType.BOTH ||
                        props.mediaType === prop.mediaType ? (
                        <option
                          key={app.id + 10 + prop.id}
                          value={JSON.stringify([app.id, prop.id])}
                        >{`${app.name} - ${prop.humanName}`}</option>
                      ) : undefined
                    })}
                  </optgroup>
                ) : undefined
              })}
            </select>
          </div>
        </div>
      </div>

      <div className="form-row">
        <label htmlFor="action" className="text-label">
          Action
        </label>
        <div className="form-input">
          <div className="form-input-field">
            <select
              name="action"
              id="action"
              onChange={updateAction}
              value={action}
            >
              <option value={undefined}> </option>
              {Object.keys(RulePossibility).map(
                (value: string, key: number) => {
                  if (!isNaN(+value)) {
                    if (possibilities.some((el) => +el === +value)) {
                      return (
                        <option key={+value} value={+value}>
                          {RulePossibility[+value]}
                        </option>
                      )
                    }
                  }
                }
              )}
            </select>
          </div>
        </div>
      </div>

      <div className="form-row">
        <label htmlFor="second_val" className="text-label">
          Second value
        </label>
        <div className="form-input">
          <div className="form-input-field">
            <select
              name="second_val"
              id="second_val"
              onChange={updateSecondValue}
              value={secondVal}
            >
              <option value={undefined}> </option>
              <optgroup label={`Custom value's`}>
                {ruleType === RuleType.DATE ? (
                  <>
                    <option value="custom_days">Amount of days.. </option>
                    <option value="custom_date">Specific date.. </option>
                  </>
                ) : undefined}
                {ruleType === RuleType.NUMBER ? (
                  <option value="custom_number">Custom number.. </option>
                ) : undefined}
                {ruleType === RuleType.TEXT ? (
                  <option value="custom_text">Custom text.. </option>
                ) : undefined}
              </optgroup>
              {ConstantsCtx.constants.applications?.map((app) => {
                return (app.mediaType === MediaType.BOTH ||
                  props.mediaType === app.mediaType) &&
                  action && +action !== +RulePossibility.IN_LAST &&
                  action && +action !== +RulePossibility.IN_NEXT ? (
                  <optgroup key={app.id} label={app.name}>
                    {app.props.map((prop) => {
                      if (+prop.type.key === ruleType) {
                        return prop.mediaType === MediaType.BOTH ||
                          props.mediaType === prop.mediaType ? (
                          <option
                            key={app.id + 10 + prop.id}
                            value={JSON.stringify([app.id, prop.id])}
                          >{`${app.name} - ${prop.humanName}`}</option>
                        ) : undefined
                      }
                    })}
                  </optgroup>
                ) : undefined
              })}
            </select>
          </div>
        </div>
      </div>

      {customValActive ? (
        <div className="form-row">
          <label htmlFor="custom_val" className="text-label">
            Custom value
          </label>
          <div className="form-input">
            <div className="form-input-field">
              {customValType === RuleType.TEXT &&
              secondVal === 'custom_days' ? (
                <input
                  type="number"
                  name="custom_val"
                  id="custom_val"
                  onChange={updateCustomValue}
                  value={customVal ? +customVal / 86400 : undefined}
                  placeholder="Amount of days"
                ></input>
              ) : customValType === RuleType.TEXT &&
                secondVal === 'custom_text' ? (
                <input
                  type="text"
                  name="custom_val"
                  id="custom_val"
                  onChange={updateCustomValue}
                  value={customVal}
                  placeholder="Text"
                ></input>
              ) : customValType === RuleType.DATE ? (
                <input
                  type="date"
                  name="custom_val"
                  id="custom_val"
                  onChange={updateCustomValue}
                  value={customVal}
                  placeholder="Date"
                ></input>
              ) : (
                <input
                  type="number"
                  name="custom_val"
                  id="custom_val"
                  onChange={updateCustomValue}
                  value={customVal}
                  placeholder="Number"
                ></input>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default RuleInput
