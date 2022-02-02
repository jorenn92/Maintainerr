import EditButton from '../../Common/EditButton'
import DeleteButton from '../../Common/DeleteButton'
import Rule, { IRule } from '../Rule'
import { useState } from 'react'
import { DeleteApiHandler } from '../../../helpers/ApiHandler'

export interface IRuleGroup {
  id: number
  name: string
  description: string
  libraryId: number
  isActive: boolean
  collectionId: number
  rules: IRule[]
}

const RuleGroup = (props: { group: IRuleGroup; onDelete: () => void }) => {
  const [showsureDelete, setShowSureDelete] = useState<boolean>(false)
  const onEdit = () => {
    console.log('clicked edit')
  }
  const onRemove = () => {
    setShowSureDelete(true)
  }

  const confirmedDelete = () => {
    DeleteApiHandler(`/rules/${props.group.id}`)
      .then((resp) => {
        if (resp.code === 1) props.onDelete()
        else console.log('error!')
      })
      .catch((err) => {
        console.log(err)
      })
  }

  return (
    <div className="relative mb-5 flex w-full overflow-hidden rounded-xl bg-gray-800 bg-cover bg-center p-4 text-gray-400 shadow ring-1 ring-gray-700">
      <div className="relative z-10 flex min-w-0 flex-1 flex-col pr-4">
        <div className=" flex text-xs font-medium text-white">
          <div className="overflow-hidden overflow-ellipsis whitespace-nowrap text-base font-bold text-white sm:text-lg">
            {props.group.name}
          </div>
        </div>
        <div className="my-0.5 flex items-center text-sm sm:my-1">
          <span className="mr-2 font-bold ">{props.group.description}</span>
        </div>
        {props.group.rules.length > 0 ? (
          <span className="mr-2 text-sm font-bold">
            <p>
              {props.group.rules.length > 1
                ? `${props.group.rules.length} rules`
                : `${props.group.rules.length} rule`}
            </p>
          </span>
        ) : null}
      </div>
      <div className="m-auto w-1/4 xl:w-1/6">
        <div className="mb-2 flex h-auto w-full">
          <EditButton onClick={onEdit} text="Edit" />
        </div>
        <div className="flex h-auto w-full">
          {showsureDelete ? (
            <DeleteButton onClick={confirmedDelete} text="Are you sure?" />
          ) : (
            <DeleteButton onClick={onRemove} text="Delete" />
          )}
        </div>
      </div>
    </div>
  )
}

export default RuleGroup
