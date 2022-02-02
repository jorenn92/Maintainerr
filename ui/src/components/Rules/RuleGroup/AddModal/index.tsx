import React, { LegacyRef, useEffect, useRef, useState } from 'react'
import GetApiHandler, { PostApiHandler } from '../../../../helpers/ApiHandler'
import Image from 'next/image'
import RuleCreator, { IRule } from '../../Rule/RuleCreator'
import { ConstantsContextProvider } from '../../../../store/constants-context'

interface ILibrary {
  key: string
  type: string
  title: string
}

interface AddModal {
  onCancel: () => void
  onSuccess: () => void
}

interface ICreateApiObject {
  name: string
  description: string
  libraryId: number
  active: boolean
  collection: {
    visibleOnHome: boolean
    deleteAfterDays: number
  }
  rules: IRule[]
}

const AddModal = (props: AddModal) => {
  const [selectedLibraryId, setSelectedLibraryId] = useState('1')
  const [isLoading, setIsLoading] = useState(true)
  const [libraries, setLibraries] = useState([])
  const nameRef = useRef<any>()
  const descriptionRef = useRef<any>()
  const libraryRef = useRef<any>()
  const deleteAfterRef = useRef<any>()
  const [showHome, setShowHome] = useState<boolean>(true)
  const [active, setActive] = useState<boolean>(true)
  const [rules, setRules] = useState<IRule[]>([])
  const [error, setError] = useState<boolean>(false)

  function setLibraryId(event: { target: { value: string } }) {
    setSelectedLibraryId(event.target.value)
    console.log(event.target.value)
  }

  function updateRules(rules: IRule[]) {
    setRules(rules)
  }

  const cancel = () => {
    props.onCancel()
  }

  useEffect(() => {
    setIsLoading(true)

    GetApiHandler('/plex/libraries/').then((resp) => {
      if (resp) {
        setLibraries(resp)
      } else {
        setLibraries([])
      }
      setIsLoading(false)
    })
  }, [])

  const create = (e: any) => {
    e.preventDefault()
    const creationObj: ICreateApiObject = {
      name: nameRef.current.value,
      description: descriptionRef.current.value,
      libraryId: +libraryRef.current.value,
      active: active,
      collection: {
        visibleOnHome: showHome,
        deleteAfterDays: +deleteAfterRef.current.value,
      },
      rules: rules,
    }

    PostApiHandler('/rules', creationObj).then((resp) => {
      if (resp.code === 1) props.onSuccess()
      else setError(true)
    }).catch((err) => {
      setError(true);
    });
  }

  if (isLoading) {
    return (
      <span>
        <Image layout="fill" src="/spinner.svg" alt="Loading..."></Image>
      </span>
    )
  }

  return (
    <div className="h-full w-full">
      <div className="section h-full w-full">
        <h3 className="heading">Add Rule Group</h3>
        <p className="description">Add a new rule group</p>
      </div>
      {
        error ? <div className='absolute top-2 text-red-800'> ERROR ! </div> : null
      }
      <div className="section">
        <form>
          <div className="form-row">
            <label htmlFor="name" className="text-label">
              Name
            </label>
            <div className="form-input">
              <div className="form-input-field">
                <input name="name" id="name" type="text" ref={nameRef}></input>
              </div>
            </div>
          </div>

          <div className="form-row">
            <label htmlFor="description" className="text-label">
              Description
            </label>
            <div className="form-input">
              <div className="form-input-field">
                <textarea
                  name="description"
                  id="description"
                  rows={5}
                  ref={descriptionRef}
                ></textarea>
              </div>
            </div>
          </div>

          <div className="form-row">
            <label htmlFor="library" className="text-label">
              Library
            </label>
            <div className="form-input">
              <div className="form-input-field">
                <select
                  name="library"
                  id="library"
                  value={selectedLibraryId}
                  onChange={setLibraryId}
                  ref={libraryRef}
                >
                  {libraries.map((data: ILibrary) => {
                    return (
                      <option key={data.key} value={data.key}>
                        {data.title}
                      </option>
                    )
                  })}
                </select>
              </div>
            </div>
          </div>

          <div className="form-row">
            <label htmlFor="active" className="text-label">
              Active
            </label>
            <div className="form-input">
              <div className="form-input-field">
                <input
                  type="checkbox"
                  name="active"
                  id="active"
                  defaultChecked
                  onChange={() => {
                    setActive(!active)
                  }}
                />
              </div>
            </div>
          </div>

          <div className="form-row">
            <label htmlFor="collection_visible" className="text-label">
              Show on home
            </label>
            <div className="form-input">
              <div className="form-input-field">
                <input
                  type="checkbox"
                  name="collection_visible"
                  id="collection_visible"
                  onChange={() => {
                    setShowHome(!showHome)
                  }}
                  defaultChecked
                />
              </div>
            </div>
          </div>

          <div className="form-row">
            <label htmlFor="collection_deleteDays" className="text-label">
              Items deleted after
            </label>
            <div className="form-input">
              <div className="form-input-field">
                <input
                  type="number"
                  name="collection_deleteDays"
                  id="collection_deleteDays"
                  defaultValue={30}
                  ref={deleteAfterRef}
                />
              </div>
            </div>
          </div>
          <hr className="mt-5" />
          <div className="section">
            <h3 className="heading">Rules</h3>
            <p className="description">
              Specify the rules this group needs to enforce
            </p>
          </div>
          <ConstantsContextProvider>
            <RuleCreator onCancel={cancel} onUpdate={updateRules} />
          </ConstantsContextProvider>

          <div className="mt-5 flex h-full w-full">
            {/* <AddButton text="Create" onClick={create} /> */}
            <div className="m-auto">
              <button
                className="add-button h-10 w-20 rounded-full text-white shadow-md"
                type="submit"
                onClick={create}
              >
                Create
              </button>
              <button
                className="cancel-button ml-5 h-10 w-20 rounded-full text-white shadow-md"
                type="reset"
                onClick={cancel}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddModal
