import EditButton from '../../Common/EditButton'
import DeleteButton from '../../Common/DeleteButton'
import { IRuleJson } from '../Rule'
import { useContext, useState } from 'react'
import { DeleteApiHandler } from '../../../utils/ApiHandler'
import LibrariesContext from '../../../contexts/libraries-context'
import { PencilIcon, TrashIcon } from '@heroicons/react/solid'

export interface IRuleGroup {
  id: number
  name: string
  description: string
  libraryId: number
  isActive: boolean
  collectionId: number
  rules: IRuleJson[]
  useRules: boolean
  type?: number
  listExclusions?: boolean
}

const RuleGroup = (props: {
  group: IRuleGroup
  onDelete: () => void
  onEdit: (group: IRuleGroup) => void
}) => {
  const [showsureDelete, setShowSureDelete] = useState<boolean>(false)
  const LibrariesCtx = useContext(LibrariesContext)

  const onRemove = () => {
    setShowSureDelete(true)
  }

  const onEdit = () => {
    props.onEdit(props.group)
  }

  const confirmedDelete = () => {
    DeleteApiHandler(`/rules/${props.group.id}`)
      .then((resp) => {
        if (resp.code === 1) props.onDelete()
        else console.log('Error while deleting Rulegroup')
      })
      .catch((err) => {
        console.log(err)
      })
  }

  return (
    <div className="flex-auto">
      <div className="text-base font-bold text-white sm:text-lg">
        {props.group.name}
      </div>
      <div className="mt-2 h-28 overflow-hidden overflow-y-auto overflow-ellipsis font-semibold">
        {props.group.description}
      </div>
      <div className="mb-2 mt-2 grid grid-cols-3 gap-3">
        <div>
          <div className="align-center flex justify-center text-sm font-medium">
            Status
          </div>
          <div>
            {props.group.isActive ? (
              <span className="flex justify-center font-semibold text-green-600">
                Active
              </span>
            ) : (
              <span className="flex justify-center font-semibold text-red-600">
                Inactive
              </span>
            )}
          </div>
        </div>
        <div>
          <div className="m-auto mr-2 flex justify-center text-sm font-medium">
            Library
          </div>
          <div className="flex justify-center font-semibold text-amber-500">
            {`${
              LibrariesCtx.libraries.find(
                (el) => +el.key === +props.group.libraryId,
              )?.title ?? ''
            }`}
          </div>
        </div>
        <div>
          <div className="m-auto mr-2 flex justify-center text-sm font-medium">
            Rules
          </div>
          <div className="flex justify-center font-semibold text-amber-500">
            {props.group.rules.length}
          </div>
        </div>
      </div>
      <div className="m-auto grid w-full grid-cols-1 gap-1 xl:grid-cols-2">
        <div>
          <EditButton
            onClick={onEdit}
            text="Edit"
            svgIcon={<PencilIcon className="m-auto h-5 text-zinc-200" />}
          />
        </div>
        <div>
          {showsureDelete ? (
            <DeleteButton onClick={confirmedDelete} text="Are you sure?" />
          ) : (
            <DeleteButton
              onClick={onRemove}
              text="Delete"
              svgIcon={<TrashIcon className="m-auto h-5 text-zinc-200" />}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default RuleGroup
