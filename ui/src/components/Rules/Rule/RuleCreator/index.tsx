import { useContext, useEffect, useRef, useState } from 'react'
import GetApiHandler from '../../../../utils/ApiHandler'
import ConstantsContext, {
  MediaType,
} from '../../../../contexts/constants-context'
import Alert from '../../../Common/Alert'
import RuleInput from './RuleInput'
import LoadingSpinner from '../../../Common/LoadingSpinner'
import SectionHeading from '../../../Common/SectionHeading'
import _ from 'lodash'

interface IRulesToCreate {
  id: number
  rule: IRule
}

export interface IRule {
  operator: string | null
  firstVal: [string, string]
  lastVal?: [string, string]
  section?: number
  customVal?: { ruleTypeId: number; value: string | number }
  action: number
}

interface iRuleCreator {
  mediaType?: MediaType
  editData?: { rules: IRule[] }
  onUpdate: (rules: IRule[]) => void
  onCancel: () => void
}

const RuleCreator = (props: iRuleCreator) => {
  const [isLoading, setIsLoading] = useState(true)
  const [editSections, setEditSections] = useState<number>()
  const [ruleAmount, setRuleAmount] = useState<[number, number[]]>(
    // editSections ? [editSections, sectionAmounts] : [1, [1]]
    [1, [1]]
  )
  const [totalRules, setTotalRules] = useState<number>(0)
  const [editData, setEditData] = useState<{ rules: IRule[] }>()
  const [createdRules, setCreatedRules] = useState<IRulesToCreate[]>([])
  const rulesCreated = useRef<IRulesToCreate[]>([]);
  const ConstantsCtx = useContext(ConstantsContext)
  const [ruleAmountArr, setRuleAmountArr] = useState<[number[], [number[]]]>([
    [1],
    [[1]],
  ])

  useEffect(() => {
    setIsLoading(true)

    // If we're editing.. initiate edit flow
    if (props.editData) {
      setEditData(props.editData)
      const editSec = props.editData
        ? props.editData.rules[props.editData.rules.length - 1]?.section! + 1
        : undefined

      editSec !== undefined ? setEditSections(editSec) : undefined
    }

    GetApiHandler('/rules/constants').then((resp) => {
      ConstantsCtx.addConstants(resp)
      setIsLoading(false)
    })
  }, [])

  useEffect(() => {
    if (editSections) {
      const sectionAmounts = [] as number[]
      // set sectionAmount
      editData
        ? editData.rules.forEach((el) =>
            el.section !== undefined
              ? sectionAmounts[el.section]
                ? sectionAmounts[el.section]++
                : (sectionAmounts[el.section] = 1)
              : (sectionAmounts[0] = 1)
          )
        : undefined
      setRuleAmount([editSections, sectionAmounts])
    }
  }, [editSections])

  const ruleCommited = (id: number, rule: IRule) => {
    if (rulesCreated) {
      const rules = rulesCreated.current.filter((el) => el.id !== id)
      rulesCreated.current = [...rules, { id: id, rule: rule }];
      setCreatedRules([...rules, { id: id, rule: rule }])
      props.onUpdate(rulesCreated.current.map((el) => el.rule))
    }
  }

  const ruleOmitted = (id: number) => {
    if (rulesCreated) {
      const rules = rulesCreated.current?.filter((el) => el.id !== id)
      rulesCreated.current = [...rules]
      setCreatedRules([...rules])
      props.onUpdate(rulesCreated.current.map((el) => el.rule))
    }
  }

  const addRule = (e: any) => {
    e.preventDefault()
    let rules = [...ruleAmount[1]]
    rules[rules.length - 1] = rules[rules.length - 1] + 1
    setRuleAmount([ruleAmount[0], rules])
  }

  const removeRule = (e: any) => {
    e.preventDefault()
    ruleOmitted(ruleAmount[1][ruleAmount[1].length - 1])
    const rules = [...ruleAmount[1]]
    rules[rules.length - 1] = rules[rules.length - 1] - 1
    setRuleAmount([ruleAmount[0], rules])
  }

  const addSection = (e: any) => {
    e.preventDefault()
    const rules = [...ruleAmount[1]]
    rules.push(1)
    setRuleAmount([ruleAmount[0] + 1, rules])
  }

  const removeSection = (e: any) => {
    e.preventDefault()
    const rules = _.cloneDeep(ruleAmount[1])
    rules.pop()
    setRuleAmount([ruleAmount[0] - 1, rules])
  }

  useEffect(() => {
    let s = 0,
      r = 0,
      lenS = ruleAmount[0]

    const worker: [number[], [number[]]] = [[], [[]]]

    while (++s <= lenS)
      worker[0].push(s), s > 1 ? worker[1].push([]) : undefined

    for (const sec of worker[0]) {
      r = 0
      while (++r <= ruleAmount[1][sec - 1]) worker[1][sec - 1].push(r)
    }
    setRuleAmountArr(worker)
  }, [ruleAmount])

  useEffect(() => {
    let counter = 0
    ruleAmountArr[0].forEach((sid) => {
      let c = _.clone(sid)
      counter = counter + ruleAmount[1][sid - 1]
    })
    setTotalRules(counter)

  }, [ruleAmountArr])

  if (isLoading) {
    return (
      <span className='className="h-full w-full'>
        <LoadingSpinner />
      </span>
    )
  }

  return (
    <div className="h-full w-full">
      {rulesCreated.current.length !== ruleAmount[1].reduce((pv, cv) => pv + cv ) ? (
        <Alert>{`Some incomplete rules won't get saved`} </Alert>
      ) : undefined}
      {ruleAmountArr[0].map((sid) => {
        return (
          <div key={sid - 1}>
            <SectionHeading id={sid} name={'Section'} />
            <div className="ml-5">
              {ruleAmountArr[1][sid - 1].map((id) => (
                <RuleInput
                  key={sid + id - 1}
                  id={
                    ruleAmount[1].length > 1
                      ? ruleAmount[1].reduce((pv, cv, idx) =>
                          sid === 1
                            ? cv - (cv - id)
                            : idx <= sid - 1
                            ? idx === sid - 1
                              ? cv - (cv - id) + pv
                              : cv + pv
                            : pv
                        )
                      : ruleAmount[1][0] - (ruleAmount[1][0] - id)
                  }
                  tagId={id}
                  editData={
                    editData
                      ? {
                          rule: editData.rules[
                            (ruleAmount[1].length > 1
                              ? ruleAmount[1].reduce((pv, cv, idx) =>
                                  sid === 1
                                    ? cv - (cv - id)
                                    : idx <= sid - 1
                                    ? idx === sid - 1
                                      ? cv - (cv - id) + pv
                                      : cv + pv
                                    : pv
                                )
                              : ruleAmount[1][0] - (ruleAmount[1][0] - id)) - 1
                          ],
                        }
                      : undefined
                  }
                  section={sid}
                  mediaType={props.mediaType}
                  onCommit={ruleCommited}
                  onIncomplete={ruleOmitted}
                />
              ))}
            </div>
          </div>
        )
      })}

      <div className="mt-5 flex w-full">
        <div className="m-auto xl:m-0">
          <button
            className="mr-3 h-10 w-24 rounded-full bg-amber-800 text-amber-100 shadow-lg"
            onClick={addSection}
          >
            <span>+ Section</span>
          </button>
          {ruleAmountArr[0].length > 1 ? (
            <button
              className="mr-3 mt-3 h-10 w-24 rounded-full bg-amber-800 text-amber-100 shadow-lg"
              onClick={removeSection}
            >
              <span>- Section </span>
            </button>
          ) : null}
          <button
            className="mr-3 mt-3 h-10 w-20 rounded-full bg-amber-800 text-amber-100 shadow-lg"
            onClick={addRule}
          >
            <span>+ Rule</span>
          </button>
          {ruleAmountArr[1][ruleAmount[1].length - 1]?.length > 1 ? (
            <button
              className="h-10 mt-3 w-20 rounded-full bg-amber-800 text-amber-100 shadow-lg"
              onClick={removeRule}
            >
              <span>- Rule</span>
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default RuleCreator
