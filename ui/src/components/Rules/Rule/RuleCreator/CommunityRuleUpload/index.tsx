import { useRef, useState } from 'react'
import { IRule } from '..'
import { PostApiHandler } from '../../../../../utils/ApiHandler'
import Alert from '../../../../Common/Alert'
import Modal from '../../../../Common/Modal'

interface ICommunityRuleUpload {
  rules: IRule[]
  type: 'movie' | 'show'
  onSubmit: () => void
  onCancel: () => void
}

const CommunityRuleUpload = (props: ICommunityRuleUpload) => {
  const nameRef = useRef<any>()
  const descriptionRef = useRef<any>()
  const [thanksModal, setThanksModal] = useState<boolean>(false)
  const [failed, setFailed] = useState<boolean>(false)

  const handleUpload = async () => {
    if (nameRef.current.value && descriptionRef.current.value) {
      await PostApiHandler(`/rules/community`, {
        name: nameRef.current.value,
        type: props.type,
        description: descriptionRef.current.value,
        JsonRules: props.rules,
      })
        .then((resp) => {
          if (resp.code === 1) {
            setThanksModal(true)
          } else {
            setFailed(true)
          }
        })
        .catch((e) => {
          setFailed(true)
        })
    }
  }
  return (
    <div>
      <Modal
        loading={false}
        backgroundClickable={false}
        onCancel={props.onCancel}
        cancelText={'Close'}
        okDisabled={false}
        onOk={handleUpload}
        okText={'Upload'}
        okButtonType={'primary'}
        title={'Upload Community Rules'}
        iconSvg={''}
      >
        <div className="mt-6">
          <Alert
            title={`Please make sure your rules are working correctly. You won't be able to edit them once uploaded`}
            type="warning"
          />

          {failed ? (
            <Alert
              title={`Something went wrong uploading your rules. Please try again later`}
              type="warning"
            />
          ) : undefined}

          <form>
            <div className="form-row">
              <label htmlFor="name" className="text-label">
                Name *
              </label>
              <div className="form-input ">
                <div className="form-input-field">
                  <input
                    className="!bg-zinc-800"
                    name="name"
                    id="name"
                    type="text"
                    ref={nameRef}
                  ></input>
                </div>
              </div>
            </div>

            <div className="form-row">
              <label htmlFor="description" className="text-label">
                Description *
              </label>
              <div className="form-input">
                <div className="form-input-field">
                  <textarea
                    className="!bg-zinc-800"
                    name="description"
                    id="description"
                    rows={5}
                    ref={descriptionRef}
                  ></textarea>
                </div>
              </div>
            </div>
          </form>
        </div>

        {thanksModal ? (
          <Modal
            loading={false}
            backgroundClickable={false}
            onCancel={() => {
              setThanksModal(false)
              props.onSubmit()
            }}
            cancelText={'Close'}
            title={'Upload Successful'}
            iconSvg={''}
          >
            <Alert title={`Thank you for contributing <3`} type="info" />
          </Modal>
        ) : undefined}
      </Modal>
    </div>
  )
}

export default CommunityRuleUpload
