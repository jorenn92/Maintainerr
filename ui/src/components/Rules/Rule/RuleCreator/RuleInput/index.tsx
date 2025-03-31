import { TrashIcon } from '@heroicons/react/solid'
import _ from 'lodash'
import { FormEvent, useContext, useEffect, useState } from 'react'
import { IRule } from '../'
import ConstantsContext, {
  IProperty,
  MediaType,
  RulePossibility,
  RulePossibilityTranslations,
} from '../../../../../contexts/constants-context'
import { EPlexDataType } from '../../../../../utils/PlexDataType-enum'

enum RuleType {
  NUMBER,
  DATE,
  TEXT,
  BOOL,
  TEXT_LIST,
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
  CUSTOM_TEXT_LIST = 'custom_text_list',
  CUSTOM_BOOLEAN = 'custom_boolean',
}

interface IRuleInput {
  id?: number
  tagId?: number
  mediaType?: MediaType
  dataType?: EPlexDataType
  section?: number
  newlyAdded?: number[]
  editData?: { rule: IRule }
  onCommit: (id: number, rule: IRule) => void
  onIncomplete: (id: number) => void
  onDelete: (section: number, id: number) => void
  allowDelete?: boolean
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
              setRuleType(RuleType.NUMBER)
            } else {
              setSecondVal(CustomParams.CUSTOM_NUMBER)
              setRuleType(RuleType.NUMBER)
            }
            break
          case 1:
            setSecondVal(CustomParams.CUSTOM_DATE)
            setRuleType(RuleType.DATE)
            break
          case 2:
            setSecondVal(CustomParams.CUSTOM_TEXT)
            setRuleType(RuleType.TEXT)
            break
          case 3:
            setSecondVal(CustomParams.CUSTOM_BOOLEAN)
            setRuleType(RuleType.BOOL)
            break
          case 4:
            setSecondVal(CustomParams.CUSTOM_TEXT_LIST)
            setRuleType(RuleType.TEXT_LIST)
            break
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
  }

  const updateSecondValue = (event: { target: { value: string } }) => {
    setSecondVal(event.target.value)
  }

  const updateCustomValue = (event: { target: { value: string } }) => {
    if (secondVal === CustomParams.CUSTOM_DAYS) {
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
        secondVal !== CustomParams.CUSTOM_DATE &&
        secondVal !== CustomParams.CUSTOM_DAYS &&
        secondVal !== CustomParams.CUSTOM_NUMBER &&
        secondVal !== CustomParams.CUSTOM_TEXT &&
        secondVal !== CustomParams.CUSTOM_TEXT_LIST &&
        secondVal !== CustomParams.CUSTOM_BOOLEAN) ||
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
                  : customValType === RuleType.TEXT &&
                      secondVal === CustomParams.CUSTOM_DAYS
                    ? RuleType.NUMBER
                    : customValType === RuleType.TEXT
                      ? customValType
                      : customValType === RuleType.BOOL
                        ? customValType
                        : customValType === RuleType.TEXT_LIST
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
  }, [secondVal, customVal, operator, action, firstval, customValType])

  useEffect(() => {
    // reset firstval & secondval in case of type switch & choices don't exist
    const apps = _.cloneDeep(ConstantsCtx.constants.applications)?.map(
      (app) => {
        app.props = app.props.filter((prop) => {
          return (
            (prop.mediaType === MediaType.BOTH ||
              props.mediaType === prop.mediaType) &&
            (props.mediaType === MediaType.MOVIE ||
              prop.showType === undefined ||
              prop.showType.includes(props.dataType!))
          )
        })
        return app
      },
    )
    if (firstval) {
      const val = JSON.parse(firstval)
      const appId = val[0]
      if (!apps?.[appId]?.props.find((el) => el.id == val[1])) {
        setFirstVal(undefined)
      }
    }
  }, [props.dataType, props.mediaType])

  useEffect(() => {
    if (firstval) {
      const prop = getPropFromTuple(firstval)

      if (prop?.type.key) {
        if (possibilities.length <= 0) {
          setRuleType(+prop?.type.key)
          setPossibilities(prop.type.possibilities)
        } else if (+prop.type.key !== ruleType) {
          setSecondVal(undefined)
          setCustomVal('')
          setRuleType(+prop?.type.key)
          setPossibilities(prop.type.possibilities)
        }
      }
    }
  }, [firstval])

  useEffect(() => {
    if (secondVal) {
      if (secondVal === CustomParams.CUSTOM_NUMBER) {
        setCustomValActive(true)
        setCustomValType(RuleType.NUMBER)
      } else if (secondVal === CustomParams.CUSTOM_DATE) {
        setCustomValActive(true)
        setCustomValType(RuleType.DATE)
      } else if (secondVal === CustomParams.CUSTOM_DAYS) {
        setCustomValActive(true)
        setCustomValType(RuleType.TEXT)
      } else if (secondVal === CustomParams.CUSTOM_TEXT) {
        setCustomValActive(true)
        setCustomValType(RuleType.TEXT)
      } else if (secondVal === CustomParams.CUSTOM_TEXT_LIST) {
        setCustomValActive(true)
        setCustomValType(RuleType.TEXT_LIST)
      } else if (secondVal === CustomParams.CUSTOM_BOOLEAN) {
        setCustomValActive(true)
        setCustomValType(RuleType.BOOL)
        if (customVal !== '0') {
          setCustomVal('1')
        }
      } else {
        setCustomValActive(false)
        setCustomVal(undefined)
      }
    }
  }, [secondVal])

  const getPropFromTuple = (
    value: [number, number] | string,
  ): IProperty | undefined => {
    if (typeof value === 'string') {
      value = JSON.parse(value)
    }
    const application = ConstantsCtx.constants.applications?.find(
      (el) => el.id === +value[0],
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

          {props.allowDelete ? (
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
                    },
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
                      return (prop.mediaType === MediaType.BOTH ||
                        props.mediaType === prop.mediaType) &&
                        (props.mediaType === MediaType.MOVIE ||
                          prop.showType === undefined ||
                          prop.showType.includes(props.dataType!)) ? (
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
                          {Object.values(RulePossibilityTranslations)[+value]}
                        </option>
                      )
                    }
                  }
                },
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
              <optgroup label="Custom values">
                {ruleType === RuleType.DATE ? (
                  <>
                    <option value={CustomParams.CUSTOM_DAYS}>
                      Amount of days
                    </option>
                    {action &&
                    +action !== +RulePossibility.IN_LAST &&
                    action &&
                    +action !== +RulePossibility.IN_NEXT ? (
                      <option value={CustomParams.CUSTOM_DATE}>
                        Specific date
                      </option>
                    ) : undefined}
                  </>
                ) : undefined}
                {ruleType === RuleType.NUMBER ? (
                  <option value={CustomParams.CUSTOM_NUMBER}>Number</option>
                ) : undefined}
                {ruleType === RuleType.BOOL ? (
                  <option value={CustomParams.CUSTOM_BOOLEAN}>Boolean</option>
                ) : undefined}
                {ruleType === RuleType.TEXT ? (
                  <option value={CustomParams.CUSTOM_TEXT}>Text</option>
                ) : undefined}
                <MaybeNumberOrTextListOptions
                  ruleType={ruleType}
                  action={action}
                />
              </optgroup>
              {ConstantsCtx.constants.applications?.map((app) => {
                return (app.mediaType === MediaType.BOTH ||
                  props.mediaType === app.mediaType) &&
                  action &&
                  +action !== +RulePossibility.IN_LAST &&
                  action &&
                  +action !== +RulePossibility.IN_NEXT ? (
                  <optgroup key={app.id} label={app.name}>
                    {app.props.map((prop) => {
                      if (+prop.type.key === ruleType) {
                        return (prop.mediaType === MediaType.BOTH ||
                          props.mediaType === prop.mediaType) &&
                          (props.mediaType === MediaType.MOVIE ||
                            prop.showType === undefined ||
                            prop.showType.includes(props.dataType!)) ? (
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
              secondVal === CustomParams.CUSTOM_DAYS ? (
                <input
                  type="number"
                  name="custom_val"
                  id="custom_val"
                  onChange={updateCustomValue}
                  value={customVal ? +customVal / 86400 : undefined}
                  placeholder="Amount of days"
                ></input>
              ) : (customValType === RuleType.TEXT &&
                  secondVal === CustomParams.CUSTOM_TEXT) ||
                customValType === RuleType.TEXT_LIST ? (
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
              ) : customValType === RuleType.BOOL ? (
                <select
                  name="custom_val"
                  id="custom_val"
                  onChange={updateCustomValue}
                  value={customVal}
                >
                  <option value={1}>True</option>
                  <option value={0}>False</option>
                </select>
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

function MaybeNumberOrTextListOptions({
  ruleType,
  action,
}: {
  ruleType: RuleType
  action: string | undefined
}) {
  if (action == null || ruleType !== RuleType.TEXT_LIST) {
    return
  }

  if (
    [
      +RulePossibility.COUNT_EQUALS,
      +RulePossibility.COUNT_NOT_EQUALS,
      +RulePossibility.COUNT_BIGGER,
      +RulePossibility.COUNT_SMALLER,
    ].includes(+action)
  ) {
    return <option value={CustomParams.CUSTOM_NUMBER}>Count (number)</option>
  }

  return <option value={CustomParams.CUSTOM_TEXT_LIST}>Text</option>
}

export default RuleInput
