import { useEffect, useState } from 'react'
import { ICommunityRule } from '../CommunityRuleModal'

interface ICommunityRuleTableRow {
  onClick: (id: number) => void
  clicked: boolean
  rule: ICommunityRule
}

const CommunityRuleTableRow = (props: ICommunityRuleTableRow) => {
  const click = () => {
    props.onClick(props.rule.id!)
  }

  return (
    <tr className={props.clicked ? 'bg-zinc-600' : ''}>
      <td
        onClick={click}
        className="md:w-105 whitespace-wrap inline-block max-h-24 w-60 overflow-hidden overflow-ellipsis px-4 py-4 text-left text-sm leading-5 text-white md:max-h-44"
      >
        {props.rule.name}
      </td>
      <td className="px-4 py-4 text-left text-sm leading-5 text-white">
        {props.rule.karma}
      </td>
    </tr>
  )
}
export default CommunityRuleTableRow
