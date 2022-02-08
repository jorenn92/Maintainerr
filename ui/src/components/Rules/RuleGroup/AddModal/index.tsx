import React, { useContext, useEffect, useRef, useState } from 'react'
import GetApiHandler, { PostApiHandler } from '../../../../utils/ApiHandler'
import Image from 'next/image'
import RuleCreator, { IRule } from '../../Rule/RuleCreator'
import { ConstantsContextProvider } from '../../../../contexts/constants-context'
import LibrariesContext, {
  ILibrary,
} from '../../../../contexts/libraries-context'
import Alert from '../../../Common/Alert'
import ArrAction from './ArrAction'

interface AddModal {
  onCancel: () => void
  onSuccess: () => void
}

interface ICreateApiObject {
  name: string
  description: string
  libraryId: number
  arrAction: number
  isActive: boolean
  collection: {
    visibleOnHome: boolean
    deleteAfterDays: number
  }
  rules: IRule[]
}

const AddModal = (props: AddModal) => {
  const [selectedLibraryId, setSelectedLibraryId] = useState<string>('1')
  const [selectedLibrary, setSelectedLibrary] = useState<ILibrary>()
  const [isLoading, setIsLoading] = useState(true)
  const nameRef = useRef<any>()
  const descriptionRef = useRef<any>()
  const libraryRef = useRef<any>()
  const deleteAfterRef = useRef<any>()
  const [showHome, setShowHome] = useState<boolean>(true)
  const [arrOption, setArrOption] = useState<number>()
  const [active, setActive] = useState<boolean>(true)
  const [rules, setRules] = useState<IRule[]>([])
  const [error, setError] = useState<boolean>(false)
  const [formIncomplete, setFormIncomplete] = useState<boolean>(false)
  const LibrariesCtx = useContext(LibrariesContext)

  function setLibraryId(event: { target: { value: string } }) {
    setSelectedLibraryId(event.target.value)
  }

  function updateRules(rules: IRule[]) {
    setRules(rules)
  }

  const cancel = () => {
    props.onCancel()
  }

  useEffect(() => {
    const lib = LibrariesCtx.libraries.find(
      (el: ILibrary) => +el.key === +selectedLibraryId
    )
    setSelectedLibrary(lib)
  }, [selectedLibraryId])

  useEffect(() => {
    setIsLoading(true)
    if (LibrariesCtx.libraries.length <= 0) {
      GetApiHandler('/plex/libraries/').then((resp) => {
        if (resp) {
          LibrariesCtx.addLibraries(resp)
        } else {
          LibrariesCtx.addLibraries([])
        }
        setIsLoading(false)
      })
    } else {
      setIsLoading(false)
    }
  }, [])

  const create = (e: any) => {
    e.preventDefault()
    if (
      nameRef.current.value &&
      libraryRef.current.value &&
      deleteAfterRef.current.value &&
      rules.length > 0
    ) {
      setFormIncomplete(false)
      const creationObj: ICreateApiObject = {
        name: nameRef.current.value,
        description: descriptionRef.current.value,
        libraryId: +libraryRef.current.value,
        arrAction: arrOption ? arrOption : 0,
        isActive: active,
        collection: {
          visibleOnHome: showHome,
          deleteAfterDays: +deleteAfterRef.current.value,
        },
        rules: rules,
      }

      PostApiHandler('/rules', creationObj)
        .then((resp) => {
          if (resp.code === 1) props.onSuccess()
          else setError(true)
        })
        .catch((err) => {
          setError(true)
        })
    } else {
      setFormIncomplete(true)
    }
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
      {error ? (
        <Alert>
          Something went wrong saving the group.. Please verify that all values
          are valid
        </Alert>
      ) : undefined}
      {formIncomplete ? (
        <Alert>
          Not all required (*) fields contain values and atleast 1 valid rule is
          required
        </Alert>
      ) : undefined}
      <div className="section">
        <form>
          <div className="form-row">
            <label htmlFor="name" className="text-label">
              Name *
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
              Library *
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
                  {LibrariesCtx.libraries.map((data: ILibrary) => {
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
          {selectedLibrary!.type === 'movie' ? (
            <ArrAction
              title="Radarr"
              onUpdate={(e: number) => setArrOption(e)}
            />
          ) : (
            <ArrAction
              title="Sonarr"
              onUpdate={(e: number) => setArrOption(e)}
              options={[{
                id: 0,
                name: 'Delete entire show',
              }, {
                id: 1,
                name: 'Delete & unmonitor all seasons',
              }, 
              {
                id: 2,
                name: 'Delete & unmonitor existing seasons',
              }]}
            />
          )}

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
              Items deleted after *
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
