import axios from 'axios'
import Image from 'next/image'
import { useState } from 'react'
import useSWR from 'swr'
import RuleGroup, { IRuleGroup } from './RuleGroup'

const Rules: React.FC = () => {
  const allRules = useState([])
  const fetcher = async (url: string) =>
    await axios.get(url).then((res) => res.data)

  const { data, error } = useSWR('http://localhost:3001/api/rules', fetcher)

  if (!data) {
    return (
      <span>
        <Image layout="fill" src="/spinner.svg" alt="Loading..."></Image>
      </span>
    )
  }
  return (
    <>
      <div className='w-full'>
        {(data as IRuleGroup[]).map((el) => (
          <RuleGroup key={el.id} group={el as IRuleGroup} />
        ))}
      </div>
    </>
  )
}

export default Rules
