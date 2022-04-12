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
  const [ruleAmount, setRuleAmount] = useState<[number, number[]]>([1, [1]])
  const [totalRules, setTotalRules] = useState<number>(0)
  const [editData, setEditData] = useState<{ rules: IRule[] }>()
  const [createdRules, setCreatedRules] = useState<IRulesToCreate[]>([])
  const rulesCreated = useRef<IRulesToCreate[]>([])
  const ConstantsCtx = useContext(ConstantsContext)
  const [ruleAmountArr, setRuleAmountArr] = useState<[number[], [number[]]]>([
    [1],
    [[1]],
  ])
  const deleted = useRef<number>(0)
  const added = useRef<number[]>([])

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
      const toCommit = [...rules, { id: id, rule: rule }].sort(
        (a, b) => a.id - b.id
      )
      rulesCreated.current = toCommit
      setCreatedRules(toCommit)
      props.onUpdate(rulesCreated.current.map((el) => el.rule))
      added.current = added.current.filter((e) => e !== id)
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

  const ruleDeleted = (section = 0, id: number) => {
    if (rulesCreated.current.length > 0) {
      let rules = rulesCreated.current?.filter((el) => el.id !== id)
      rules = rules.map((e) => {
        e.id = e.id > id ? e.id - 1 : e.id
        return e
      })
      rulesCreated.current = [...rules]
      setCreatedRules([...rules])
      props.onUpdate(rulesCreated.current.map((el) => el.rule))
    }

    const rules = [...ruleAmount[1]]
    rules[section - 1] = rules[section - 1] - 1

    if (rulesCreated.current.length > 0) {
      setEditSections(ruleAmount[0] - rules.filter((e) => e <= 0).length)
      setEditData({ rules: rulesCreated.current.map((el) => el.rule) })
    }

    const nonEmptySections = rules.filter((e) => !(e <= 0))
    setRuleAmount([
      ruleAmount[0] - rules.filter((e) => e <= 0).length,
      nonEmptySections.length > 0 ? nonEmptySections : [1],
    ])

    deleted.current = deleted.current + 1
  }

  const RuleAdded = (section: number) => {
    console.log(`adding to ${section}`)
    console.log(createdRules)
    console.log(ruleAmountArr)
    console.log(ruleAmount)
    console.log(rulesCreated.current)

    const ruleId =
      ruleAmount[1].reduce((prev, cur, idx) =>
        idx + 1 <= section ? prev + cur : prev
      ) + 1
    console.log(`Giving rule ID ${ruleId}`)

    const newRulesCr = rulesCreated.current.map((e) => {
      e.id >= ruleId ? (e.id = e.id + 1) : e.id
      return e
    })

    let rules = [...ruleAmount[1]]
    rules[section - 1] = rules[section - 1] + 1

    setRuleAmount([ruleAmount[0], rules])
    added.current = [...added.current, ruleId]
    console.log([ruleAmount[0], rules])
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
      {rulesCreated.current.length !==
      ruleAmount[1].reduce((pv, cv) => pv + cv) ? (
        <Alert>{`Some incomplete rules won't get saved`} </Alert>
      ) : undefined}
      {ruleAmountArr[0].map((sid) => {
        return (
          <div key={`${sid}-${deleted.current}`}>
            <SectionHeading id={sid} name={'Section'} onAdd={RuleAdded} />
            <div className="ml-5">
              {ruleAmountArr[1][sid - 1].map((id) => (
                <RuleInput
                  key={`${sid}-${id}`}
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
                  newlyAdded={added.current.includes(id)}
                  mediaType={props.mediaType}
                  onCommit={ruleCommited}
                  onIncomplete={ruleOmitted}
                  onDelete={ruleDeleted}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default RuleCreator
