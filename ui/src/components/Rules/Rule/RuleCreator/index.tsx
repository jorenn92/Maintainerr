import Image from 'next/image'
import { useContext, useEffect, useRef, useState } from 'react'
import GetApiHandler from '../../../../helpers/ApiHandler'
import ConstantsContext, {
  ConstantsContextProvider,
} from '../../../../store/constants-context'
import AddButton from '../../../Common/AddButton'
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
  action: string
}

interface iRuleCreator {
  onUpdate: (rules: IRule[]) => void
  onCancel: () => void
}

const RuleCreator = (props: iRuleCreator) => {
  const rules: IRule[] = []
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
    props.onUpdate(createdRules.map(el => el.rule))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createdRules])

  const ruleCommited = (id: number, rule: IRule) => {
    if (createdRules) {
      const index = createdRules?.findIndex((el) => el.id === id)
      if (index !== -1) {
        createdRules?.splice(+index)
      }
      setCreatedRules([...createdRules, { id: id, rule: rule }])
    }
  }

  const addRule = (e: any) => {
    e.preventDefault()
    setRuleAmount(ruleAmount + 1)
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
      {ruleAmountArr.map((id) => (
        <RuleInput key={id - 1} id={id - 1} onCommit={ruleCommited} />
      ))}

      <div className="mt-5 flex">
        <button
          className="m-auto h-10 w-20 rounded-full bg-slate-500 text-gray-200 shadow-lg"
          onClick={addRule}
        >
          {' '}
          +{' '}
        </button>
      </div>
    </div>
  )
}

export default RuleCreator
