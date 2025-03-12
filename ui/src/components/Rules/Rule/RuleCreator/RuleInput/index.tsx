import { TrashIcon, QuestionMarkCircleIcon } from '@heroicons/react/solid'
import { FormEvent, useContext, useEffect, useState } from 'react'
import { IRule } from '../'
import ConstantsContext, {
  IProperty,
  MediaType,
  RulePossibilityTranslations,
} from '../../../../../contexts/constants-context'
import { EPlexDataType } from '../../../../../utils/PlexDataType-enum'
import _, { first } from 'lodash'

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
  NOT_CONTAINS,
  CONTAINS_PARTIAL,
  NOT_CONTAINS_PARTIAL,
}

enum RuleType {
  NUMBER,
  DATE,
  TEXT,
  BOOL,
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
  onOpenHelpModal: () => void
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
    <div
      className="w-full rounded-2xl bg-zinc-800 p-4 text-zinc-100 shadow-lg"
      onSubmit={submit}
    >
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-amber-600">
          {props.tagId
            ? `Rule #${props.tagId}`
            : props.id
              ? `Rule #${props.id}`
              : `Rule #1`}
        </h3>

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
          <div className="mb-3 mt-2 md:flex md:items-center">
            {!props.id || (props.tagId ? props.tagId === 1 : props.id === 1) ? (
              <label htmlFor="operator">Section Operator</label>
            ) : (
              <label htmlFor="operator">Operator</label>
            )}
            <div className="md:ml-4">
              <div className="flex w-1/2 md:w-fit">
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
                <button
                  className="ml-1 p-1 text-sm"
                  onClick={(e) => {
                    e.preventDefault()
                    props.onOpenHelpModal()
                  }}
                >
                  {
                    <QuestionMarkCircleIcon className="h-5 w-5 text-amber-500 hover:text-amber-600" />
                  }
                </button>
              </div>
            </div>
          </div>
        ) : undefined
      ) : undefined}

      {/* First Value Selection */}
      <div className="mt-1 grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-2">
        <div>
          <label htmlFor="first_val" className="block text-sm font-medium">
            First Value
          </label>
          <select
            name="first_val"
            id="first_val"
            onChange={updateFirstValue}
            value={firstval}
            className="w-full rounded-lg p-2 text-zinc-100 focus:border-amber-500 focus:ring-amber-500"
          >
            <option value={undefined}>Select First Value...</option>
            {ConstantsCtx.constants.applications?.map((app) =>
              app.mediaType === MediaType.BOTH ||
              props.mediaType === app.mediaType ? (
                <optgroup key={app.id} label={app.name}>
                  {app.props.map((prop) =>
                    (prop.mediaType === MediaType.BOTH ||
                      props.mediaType === prop.mediaType) &&
                    (props.mediaType === MediaType.MOVIE ||
                      prop.showType === undefined ||
                      prop.showType.includes(props.dataType!)) ? (
                      <option
                        key={`${app.id}-${prop.id}`}
                        value={JSON.stringify([app.id, prop.id])}
                      >
                        {`${app.name} - ${prop.humanName}`}
                      </option>
                    ) : null,
                  )}
                </optgroup>
              ) : null,
            )}
          </select>
        </div>

        {/* Action Selection */}
        <div>
          <label htmlFor="action" className="mb-1 block text-sm font-medium">
            Action
          </label>
          <select
            name="action"
            id="action"
            onChange={updateAction}
            value={action}
            className="w-full rounded-lg p-2 text-zinc-100 focus:border-amber-500 focus:ring-amber-500"
          >
            <option value={undefined}>Select Action...</option>
            {Object.keys(RulePossibility).map((value: string, key: number) => {
              if (!isNaN(+value)) {
                if (possibilities.includes(+value)) {
                  return (
                    <option key={+value} value={+value}>
                      {Object.values(RulePossibilityTranslations)[+value]}
                    </option>
                  )
                }
              }
            })}
          </select>
        </div>

        {/* Second Value Selection */}
        <div>
          <label
            htmlFor="second_val"
            className="mb-1 block text-sm font-medium"
          >
            Second Value
          </label>
          <select
            name="second_val"
            id="second_val"
            onChange={updateSecondValue}
            value={secondVal}
            className="w-full rounded-lg p-2 text-zinc-100 focus:border-amber-500 focus:ring-amber-500"
          >
            <option value={undefined}>Select Second Value...</option>
            <optgroup label="Custom Values">
              {ruleType === RuleType.DATE && (
                <>
                  <option value={CustomParams.CUSTOM_DAYS}>
                    Amount of Days
                  </option>
                  {action &&
                    +action !== +RulePossibility.IN_LAST &&
                    +action !== +RulePossibility.IN_NEXT && (
                      <option value={CustomParams.CUSTOM_DATE}>
                        Specific Date
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

        {/* Custom Value Input */}
        {customValActive && (
          <div className="mb-2">
            <label
              htmlFor="custom_val"
              className="mb-1 block text-sm font-medium"
            >
              Custom Value
            </label>
            {customValType === RuleType.TEXT &&
            secondVal === CustomParams.CUSTOM_DAYS ? (
              <input
                type="number"
                name="custom_val"
                id="custom_val"
                onChange={updateCustomValue}
                value={customVal ? +customVal / 86400 : undefined}
                placeholder="Amount of Days"
                className="w-full rounded-lg p-2 text-zinc-100 focus:border-amber-500 focus:ring-amber-500"
              />
            ) : customValType === RuleType.TEXT &&
              secondVal === CustomParams.CUSTOM_TEXT ? (
              <input
                type="text"
                name="custom_val"
                id="custom_val"
                onChange={updateCustomValue}
                value={customVal}
                placeholder="Text"
                className="w-full rounded-lg p-2 text-zinc-100 focus:border-amber-500 focus:ring-amber-500"
              />
            ) : customValType === RuleType.DATE ? (
              <input
                type="date"
                name="custom_val"
                id="custom_val"
                onChange={updateCustomValue}
                value={customVal}
                className="w-full rounded-lg p-2 text-zinc-100 focus:border-amber-500 focus:ring-amber-500"
              />
            ) : customValType === RuleType.BOOL ? (
              <select
                name="custom_val"
                id="custom_val"
                onChange={updateCustomValue}
                value={customVal}
                className="w-full rounded-lg p-2 text-zinc-100 focus:border-amber-500 focus:ring-amber-500"
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
                className="w-full rounded-lg p-2 text-zinc-100 focus:border-amber-500 focus:ring-amber-500"
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default RuleInput
