import React, { useContext, useEffect, useRef, useState } from 'react'
import GetApiHandler, {
  PostApiHandler,
  PutApiHandler,
} from '../../../../utils/ApiHandler'
import Image from 'next/image'
import RuleCreator, { ILoadedRule, IRule } from '../../Rule/RuleCreator'
import { ConstantsContextProvider } from '../../../../contexts/constants-context'
import LibrariesContext, {
  ILibrary,
} from '../../../../contexts/libraries-context'
import Alert from '../../../Common/Alert'
import ArrAction from './ArrAction'
import { IRuleGroup } from '..'
import { ICollection } from '../../../Collection'
import {
  BanIcon,
  CloudDownloadIcon,
  DocumentTextIcon,
  DownloadIcon,
  QuestionMarkCircleIcon,
  SaveIcon,
} from '@heroicons/react/solid'
import Router from 'next/router'
import Link from 'next/link'
import Button from '../../../Common/Button'
import { IRuleJson } from '../../Rule'
import CommunityRuleModal from '../../../Common/CommunityRuleModal'

interface AddModal {
  editData?: IRuleGroup
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
  const [selectedLibraryId, setSelectedLibraryId] = useState<string>(
    props.editData ? props.editData.libraryId.toString() : '1'
  )
  const [selectedLibrary, setSelectedLibrary] = useState<ILibrary>()
  const [collection, setCollection] = useState<ICollection>()
  const [isLoading, setIsLoading] = useState(true)
  const [CommunityModal, setCommunityModal] = useState(false)

  const nameRef = useRef<any>()
  const descriptionRef = useRef<any>()
  const libraryRef = useRef<any>()
  const deleteAfterRef = useRef<any>()
  const [showHome, setShowHome] = useState<boolean>(true)
  const [arrOption, setArrOption] = useState<number>()
  const [active, setActive] = useState<boolean>(
    props.editData ? props.editData.isActive : true
  )
  const [rules, setRules] = useState<IRule[]>(
    props.editData
      ? props.editData.rules.map((r) => JSON.parse(r.ruleJson) as IRule)
      : []
  )
  const [error, setError] = useState<boolean>(false)
  const [formIncomplete, setFormIncomplete] = useState<boolean>(false)
  const ruleCreatorVersion = useRef<number>(1)
  const LibrariesCtx = useContext(LibrariesContext)

  function setLibraryId(event: { target: { value: string } }) {
    setSelectedLibraryId(event.target.value)
  }

  function updateRules(rules: IRule[]) {
    setRules(rules)
  }

  const toggleCommunityRuleModal = (e: any) => {
    e.preventDefault()

    if (CommunityModal) {
      setCommunityModal(false)
    } else {
      setCommunityModal(true)
    }

    // const rule1: string =
    //   '{"lastVal":[3,2],"operator":null,"firstVal":[0,2],"action":3,"section":0}'

    // const rule2: string =
    //   '{"lastVal":[3,2],"operator":0,"firstVal":[0,2],"action":3,"section":1}'

    // loadJsonRules([rule1, rule2])
  }

  const loadJsonRules = (rules: string[]) => {
    const transformedRules: IRule[] = rules
      ? rules.map((r) => JSON.parse(r) as IRule)
      : []
    updateRules(transformedRules)
    ruleCreatorVersion.current = ruleCreatorVersion.current + 1
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
      })
    }
    if (props.editData) {
      GetApiHandler(
        `/collections/collection/${props.editData.collectionId}`
      ).then((resp: ICollection) => {
        resp ? setCollection(resp) : undefined
        resp ? setShowHome(resp.visibleOnHome!) : undefined
        resp ? setArrOption(resp.arrAction) : undefined
        setIsLoading(false)
      })
    } else {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // trapping next router before-pop-state to manipulate router change on browser back button
    Router.beforePopState(() => {
      props.onCancel()
      window.history.forward()
      return false
    })
    return () => {
      Router.beforePopState(() => {
        return true
      })
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

      if (!props.editData) {
        PostApiHandler('/rules', creationObj)
          .then((resp) => {
            if (resp.code === 1) props.onSuccess()
            else setError(true)
          })
          .catch((err) => {
            setError(true)
          })
      } else {
        PutApiHandler('/rules', { id: props.editData.id, ...creationObj })
          .then((resp) => {
            if (resp.code === 1) props.onSuccess()
            else setError(true)
          })
          .catch((err) => {
            setError(true)
          })
      }
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
      <div className="max-width-form-head flex">
        <div className="ml-0">
          <h3 className="heading">General </h3>
          <p className="description">
            General information about this group of rules
          </p>
        </div>
        <div className="ml-auto">
          <Link href={`/docs/tutorial-Rules.html`} passHref={true}>
            <a target="_blank" rel="noopener noreferrer">
              <Button className="ml-3" buttonType="default" type="button">
                <QuestionMarkCircleIcon />
                <span>Help</span>
              </Button>
            </a>
          </Link>
        </div>
      </div>

      {error ? (
        <Alert>
          Something went wrong saving the group.. Please verify that all values
          are valid
        </Alert>
      ) : undefined}
      {formIncomplete ? (
        <Alert>
          Not all required (*) fields contain values and at least 1 valid rule
          is required
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
                <input
                  name="name"
                  id="name"
                  type="text"
                  ref={nameRef}
                  defaultValue={props.editData?.name}
                ></input>
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
                  defaultValue={props.editData?.description}
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
          {selectedLibrary && selectedLibrary!.type === 'movie' ? (
            <ArrAction
              title="Radarr"
              default={arrOption}
              onUpdate={(e: number) => setArrOption(e)}
            />
          ) : (
            <ArrAction
              title="Sonarr"
              onUpdate={(e: number) => setArrOption(e)}
              options={[
                {
                  id: 0,
                  name: 'Delete show from Sonarr',
                },
                {
                  id: 1,
                  name: 'Delete files & unmonitor all seasons',
                },
                {
                  id: 2,
                  name: 'Delete files & unmonitor existing seasons',
                },
              ]}
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
                  name="is_active"
                  id="is_active"
                  className="border-zinc-600 hover:border-zinc-500 focus:border-zinc-500 focus:bg-opacity-100 focus:placeholder-zinc-400 focus:outline-none focus:ring-0"
                  defaultChecked={active}
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
                  className="border-zinc-600 hover:border-zinc-500 focus:border-zinc-500 focus:bg-opacity-100 focus:placeholder-zinc-400 focus:outline-none focus:ring-0"
                  defaultChecked={showHome}
                  onChange={() => {
                    setShowHome(!showHome)
                  }}
                />
              </div>
            </div>
          </div>

          <div className="form-row">
            <label htmlFor="collection_deleteDays" className="text-label">
              Media deleted after days*
            </label>
            <div className="form-input">
              <div className="form-input-field">
                <input
                  type="number"
                  name="collection_deleteDays"
                  id="collection_deleteDays"
                  defaultValue={collection ? collection.deleteAfterDays : 30}
                  ref={deleteAfterRef}
                />
              </div>
            </div>
          </div>
          <hr className="mt-5" />
          <div className="section">
            <div className="max-width-form-head flex">
              <div className="ml-0">
                <h3 className="heading">Rules</h3>
                <p className="description">
                  Specify the rules this group needs to enforce
                </p>
              </div>
              <div className="ml-auto">
                <button
                  className="ml-auto flex h-10 rounded bg-amber-900 text-zinc-900 shadow-md hover:bg-amber-800"
                  onClick={toggleCommunityRuleModal}
                >
                  {
                    <DownloadIcon className="m-auto ml-5 h-6 w-6 text-zinc-200" />
                  }
                  <p className="button-text m-auto mr-5 ml-1 text-zinc-100">
                    Community Rules
                  </p>
                </button>
              </div>
            </div>
          </div>
          {CommunityModal ? (
            <CommunityRuleModal
              onUpdate={() => {
                console.log('updated')
              }}
              onCancel={() => setCommunityModal(false)}
            />
          ) : undefined}
          <ConstantsContextProvider>
            <RuleCreator
              key={ruleCreatorVersion.current}
              mediaType={
                selectedLibrary ? (selectedLibrary.type === 'movie' ? 1 : 2) : 0
              }
              editData={{ rules: rules }}
              onCancel={cancel}
              onUpdate={updateRules}
            />
          </ConstantsContextProvider>

          <div className="mt-5 flex h-full w-full">
            {/* <AddButton text="Create" onClick={create} /> */}
            <div className="m-auto flex xl:m-0">
              <button
                className="ml-auto mr-3 flex h-10 rounded bg-amber-600 text-zinc-900 shadow-md hover:bg-amber-500"
                onClick={create}
              >
                {<SaveIcon className="m-auto ml-5 h-6 w-6 text-zinc-200" />}
                <p className="button-text m-auto mr-5 ml-1 text-zinc-100">
                  Save
                </p>
              </button>

              <button
                className="ml-auto flex h-10 rounded bg-amber-900 text-zinc-900 shadow-md hover:bg-amber-800"
                onClick={cancel}
              >
                {<BanIcon className="m-auto ml-5 h-6 w-6 text-zinc-200" />}
                <p className="button-text m-auto mr-5 ml-1 text-zinc-100">
                  Cancel
                </p>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddModal
