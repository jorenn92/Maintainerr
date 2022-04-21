import { useEffect, useState } from 'react'
import GetApiHandler, {
  DeleteApiHandler,
  PostApiHandler,
} from '../../utils/ApiHandler'
import Alert from '../Common/Alert'
import Modal from '../Common/Modal'
import { IPlexMetadata } from '../Overview/Content'
import { IRuleGroup } from '../Rules/RuleGroup'

interface IExcludeModal {
  onCancel: () => void
  onSubmit: () => void
  libraryId?: number
  type?: 1 | 2
  plexId: number
}

interface IExclusion {
  plexId: number
  ruleGroupId: number
}

const ExcludeModal = (props: IExcludeModal) => {
  const [selected, setSelected] = useState<string>('9999999998')
  const [options, setOptions] = useState<IRuleGroup[]>([
    {
      id: 9999999998,
      name: 'Remove exclusions',
      description: 'All',
      libraryId: 0,
      isActive: true,
      collectionId: 0,
      rules: [],
    },
    {
      id: 9999999999,
      name: 'Exclude for all',
      description: 'All',
      libraryId: 0,
      isActive: true,
      collectionId: 0,
      rules: [],
    },
  ])

  const handleCancel = () => {
    props.onCancel()
  }

  const handleOk = () => {
    switch (selected) {
      case '9999999998':
        DeleteApiHandler(`/rules/exclusions/${props.plexId}`)
        break
      case '9999999999':
        PostApiHandler('/rules/exclusion', {
          plexId: props.plexId,
          ruleGroupId: null,
        })
        break
      default:
        PostApiHandler('/rules/exclusion', {
          plexId: props.plexId,
          ruleGroupId: selected,
        })
        break
    }
    props.onSubmit()
  }

  useEffect(() => {
    document.title = 'Maintainerr - Overview'
    if (props.type) {
      GetApiHandler(`/rules?typeId=${props.type}`).then((resp) =>
        setOptions([...options, ...resp])
      )
    } else if (props.libraryId) {
      GetApiHandler(`/rules?libraryId=${props.libraryId}`).then((resp) =>
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
      title={'Exclude media from rules'}
      okText={'Exclude'}
      okButtonType={'primary'}
      iconSvg={''}
      backdrop={`https://image.tmdb.org/t/p/w1920_and_h800_multi_faces/1`}
    >
      <div className="mt-6">
        <Alert
          title={`Media will be excluded from the selected collection`}
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
          {options.map((e: IRuleGroup) => {
            return (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            )
          })}
        </select>
      </div>
    </Modal>
  )
}
export default ExcludeModal
