import axios from 'axios'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import useSWR from 'swr'
import GetApiHandler from '../../helpers/ApiHandler'
import AddButton from '../Common/AddButton'
import RuleGroup, { IRuleGroup } from './RuleGroup'
import AddModal from './RuleGroup/AddModal'

const fetchData = async () => {
  return await GetApiHandler('/rules')
}

const Rules: React.FC = () => {
  const [addModalActive, setAddModal] = useState(false)
  const [data, setData] = useState()

  useEffect(() => {
    fetchData().then((resp) => setData(resp))
  }, []);

  const showAddModal = () => {
    addModalActive ? setAddModal(false) : setAddModal(true)
  }

  const onCreate = (): void => {
    fetchData().then((resp) => setData(resp))
    setAddModal(false)
  }

  if (!data) {
    return (
      <span>
        <Image layout="fill" src="/spinner.svg" alt="Loading..."></Image>
      </span>
    )
  }

  if (addModalActive) {
    return (
      <AddModal
        onSuccess={onCreate}
        onCancel={() => {
          setAddModal(false)
        }}
      />
    )
  }

  return (
    <>
      <div className="w-full">
        {(data as IRuleGroup[]).map((el) => (
          <RuleGroup onDelete={onCreate} key={el.id} group={el as IRuleGroup} />
        ))}
      </div>
      <div className="m-auto h-10 w-10">
        <AddButton onClick={showAddModal} text="+" />
      </div>
    </>
  )
}

export default Rules
