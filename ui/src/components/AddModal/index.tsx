import { useEffect, useState } from 'react'
import GetApiHandler, {
  DeleteApiHandler,
  PostApiHandler,
} from '../../utils/ApiHandler'
import Alert from '../Common/Alert'
import Modal from '../Common/Modal'

interface IAddModal {
  onCancel: () => void
  onSubmit: () => void
  libraryId?: number
  type?: number
  plexId: number
}

interface ICollectionMedia {
  media?: []
  id: number
  plexId?: number
  libraryId?: number
  title: string
  description?: string
  isActive?: boolean
  arrAction?: number
  visibleOnHome?: boolean
  deleteAfterDays?: number
  type?: 1 | 2
  collectionMedia?: []
}
const AddModal = (props: IAddModal) => {
  const [selected, setSelected] = useState<string>('9999999998')
  const [options, setOptions] = useState<ICollectionMedia[]>([
    {
      id: 9999999998,
      title: 'Remove from all collections',
    },
  ])

  const handleCancel = () => {
    props.onCancel()
  }

  const handleOk = () => {
    switch (selected) {
      case '9999999998':
        DeleteApiHandler(`/collections/media?mediaId=${props.plexId}`)
        break
      default:
        PostApiHandler(`/collections/media/add`, {
          mediaId: props.plexId,
          collectionId: selected,
        })
        break
    }
    props.onSubmit()
  }

  useEffect(() => {
    document.title = 'Maintainerr - Overview'
    if (props.libraryId) {
      GetApiHandler(`/collections?libraryId=${props.libraryId}`).then((resp) =>
        setOptions([...options, ...resp])
      )
    } else if (props.type) {
      GetApiHandler(`/collections?typeId=${props.type}`).then((resp) =>
        setOptions([...options, ...resp])
      )
    }
  }, [])

  return (
    <Modal
      loading={false}
      backgroundClickable
      onCancel={handleCancel}
      onOk={handleOk}
      okDisabled={false}
      title={'Add media to a collection'}
      okText={'Add'}
      okButtonType={'primary'}
      iconSvg={''}
      backdrop={`https://image.tmdb.org/t/p/w1920_and_h800_multi_faces/1`}
    >
      <div className="mt-6">
        <Alert
          title={`Media will be added to the selected collection`}
          type="info"
        />

        <select
          name={`exclude-rule-action`}
          id={`exclude-rule-action`}
          value={selected}
          onChange={(e: { target: { value: string } }) => {
            setSelected(e.target.value)
          }}
        >
          {options.map((e: ICollectionMedia) => {
            return (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            )
          })}
        </select>
      </div>
    </Modal>
  )
}
export default AddModal
