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
  notifications?: []
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
    <div className="relative mb-5 flex w-full flex-col overflow-hidden rounded-xl bg-zinc-800 bg-cover bg-center p-4 text-zinc-400 shadow ring-1 ring-zinc-700 sm:flex-row">
      <div className="relative z-10 flex w-full min-w-0 flex-col pr-4 sm:w-5/6 sm:flex-row">
        <div className="mb-3 flex flex-col sm:mb-0 sm:w-5/6 ">
          <div className="flex text-xs font-medium text-white">
            <div className="overflow-hidden overflow-ellipsis whitespace-nowrap text-base font-bold text-white sm:text-lg">
              {props.group.name}
            </div>
          </div>

          <div className="my-0.5 flex text-sm sm:my-1">
            <span className="mr-2 font-bold w-full overflow-hidden overflow-ellipsis">{props.group.description}</span>
          </div>
        </div>

        <div className="w-full flex-col text-left sm:w-1/6 ">
          <span className="text-sm font-medium">Status </span>
          {props.group.isActive ? (
            <span className="text-sm font-bold text-green-900">Active</span>
          ) : (
            <span className="text-sm font-bold text-red-900">Inactive</span>
          )}
          <div className="m-auto mr-2 flex text-sm font-medium">
            {`Library ${
              LibrariesCtx.libraries.find(
                (el) => +el.key === +props.group.libraryId
              )?.title
            }`}
          </div>
          {props.group.rules.length > 0 ? (
            <span className="mr-2 text-sm font-medium">
              <p>
                {props.group.rules.length > 1
                  ? `${props.group.rules.length} rules`
                  : `${props.group.rules.length} rule`}
              </p>
            </span>
          ) : null}
        </div>
      </div>

      <div className="m-auto w-full sm:w-1/6">
        <div className="mb-2 flex h-auto ">
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
