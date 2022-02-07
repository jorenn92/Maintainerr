import Error from 'next/error'
import Image from 'next/image'
import { useContext, useEffect, useState } from 'react'
import GetApiHandler from '../../../../utils/ApiHandler'
import ConstantsContext from '../../../../contexts/constants-context'
import Alert from '../../../Common/Alert'
import RuleInput from './RuleInput'

interface IRulesToCreate {
  id: number
  rule: IRule
}

export interface IRule {
  operator: string | null
  firstVal: [string, string]
  lastVal?: [string, string]
  customVal?: { ruleTypeId: number; value: string | number }
  action: number
}

interface iRuleCreator {
  onUpdate: (rules: IRule[]) => void
  onCancel: () => void
}

const RuleCreator = (props: iRuleCreator) => {
  const [isLoading, setIsLoading] = useState(true)
  const [ruleAmount, setRuleAmount] = useState<number>(1)
  const [createdRules, setCreatedRules] = useState<IRulesToCreate[]>([])
  const ConstantsCtx = useContext(ConstantsContext)

  useEffect(() => {
    setIsLoading(true)

    GetApiHandler('/rules/constants').then((resp) => {
      ConstantsCtx.addConstants(resp)
      setIsLoading(false)
    })
  }, [])

  useEffect(() => {
    props.onUpdate(createdRules.map((el) => el.rule))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createdRules])

  const ruleCommited = (id: number, rule: IRule) => {
    if (createdRules) {
      const rules = createdRules.filter((el) => el.id !== id)
      setCreatedRules([...rules, { id: id, rule: rule }])
    }
  }

  const ruleOmitted = (id: number) => {
    if (createdRules) {
      const rules = createdRules?.filter((el) => el.id !== id)
      setCreatedRules([...rules])
    }
  }

  const addRule = (e: any) => {
    e.preventDefault()
    setRuleAmount(ruleAmount + 1)
  }

  const removeRule = (e: any) => {
    e.preventDefault()
    setCreatedRules(createdRules.filter((el) => el.id !== ruleAmount - 1))
    setRuleAmount(ruleAmount - 1)
  }

  let ruleAmountArr: number[] = [],
    i = 0,
    len = ruleAmount
  while (++i <= len) ruleAmountArr.push(i)

  if (isLoading) {
    return (
      <span className='className="h-full w-full'>
        <Image layout="fill" src="/spinner.svg" alt="Loading..."></Image>
      </span>
    )
  }

  return (
    <div className="h-full w-full">
      {createdRules.length !== ruleAmountArr.length ? (
        <Alert>{`Some incomplete rules won't get saved`} </Alert>
      ) : undefined}

      {ruleAmountArr.map((id) => (
        <RuleInput
          key={id - 1}
          id={id - 1}
          onCommit={ruleCommited}
          onIncomplete={ruleOmitted}
        />
      ))}

      <div className="mt-5 flex">
        <div className="m-auto">
          <button
            className="mr-5 h-10 w-20 rounded-full bg-slate-500 text-gray-200 shadow-lg"
            onClick={addRule}
          >
            {' '}
            +{' '}
          </button>
          {ruleAmountArr.length > 1 ? (
            <button
              className="h-10 w-20 rounded-full bg-slate-500 text-gray-200 shadow-lg"
              onClick={removeRule}
            >
              {' '}
              -{' '}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default RuleCreator
