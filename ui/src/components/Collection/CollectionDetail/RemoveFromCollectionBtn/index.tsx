import { TrashIcon } from '@heroicons/react/solid'
import { useRef, useState } from 'react'
import { ICollection } from '../..'
import { DeleteApiHandler, PostApiHandler } from '../../../../utils/ApiHandler'
import Button from '../../../Common/Button'
interface IRemoveFromCollectionBtn {
  plexId: number
  collectionId: number
  onRemove: () => void
}
const RemoveFromCollectionBtn = (props: IRemoveFromCollectionBtn) => {
  const [sure, setSure] = useState<boolean>(false)

  const handle = () => {
    DeleteApiHandler(`/collections/media?mediaId=${props.plexId}`)
    PostApiHandler('/rules/exclusion', {
      plexId: props.plexId,
      collectionId: props.collectionId,
    })
    props.onRemove()
  }

  return (
    <div>
      {!sure ? (
        <Button
          buttonType="primary"
          buttonSize="md"
          className="mt-2 mb-1 h-6 w-full text-zinc-200 shadow-md"
          onClick={() => setSure(true)}
        >
          {<TrashIcon className="m-auto ml-3 h-3" />}{' '}
          <p className="rules-button-text m-auto mr-2">{'Remove'}</p>
        </Button>
      ) : (
        <Button
          buttonType="primary"
          buttonSize="md"
          className="mt-2 mb-1 h-6 w-full text-zinc-200 shadow-md"
          onClick={handle}
        >
          <p className="rules-button-text m-auto mr-2">{'Are you sure?'}</p>
        </Button>
      )}
    </div>
  )
}
export default RemoveFromCollectionBtn
