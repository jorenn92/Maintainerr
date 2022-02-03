import EditButton from '../../Common/EditButton'
import DeleteButton from '../../Common/DeleteButton'
import { IRule } from '../Rule'
import { useContext, useState } from 'react'
import { DeleteApiHandler } from '../../../helpers/ApiHandler'
import LibrariesContext from '../../../contexts/libraries-context'

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
  const LibrariesCtx = useContext(LibrariesContext)
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
    <div className="relative mb-5 flex-col sm:flex-row flex w-full overflow-hidden rounded-xl bg-gray-800 bg-cover bg-center p-4 text-gray-400 shadow ring-1 ring-gray-700">
      
      <div className="relative z-10 flex sm:w-5/6 w-full min-w-0 flex-col pr-4 sm:flex-row">
        <div className="flex flex-col sm:w-5/6 mb-3 sm:mb-0 ">
          <div className="flex text-xs font-medium text-white">
            <div className="overflow-hidden overflow-ellipsis whitespace-nowrap text-base font-bold text-white sm:text-lg">
              {props.group.name}
            </div>
          </div>

          <div className="my-0.5 flex text-sm sm:my-1">
            <span className="mr-2 font-bold ">{props.group.description}</span>
          </div>
        </div>

        <div className="flex-col text-left sm:w-1/6 w-full "> 
        <span className='font-medium text-sm'>Status </span>
        {
            props.group.isActive ? <span className='text-green-900 text-sm font-bold'>Active</span> : <span className='text-red-900 text-sm font-bold'>Inactive</span>
          }
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

      <div className="m-auto sm:w-1/6 w-full">
        <div className="mb-2 flex h-auto ">
          <EditButton onClick={onEdit} text="Edit" />
        </div>
        <div>
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
