import {
  createContext,
  ReactChild,
  ReactFragment,
  ReactPortal,
  useState,
} from 'react'
import { EPlexDataType } from '../utils/PlexDataType-enum'

interface Iconstants {
  applications: IApplication[] | null
}
interface IApplication {
  id: number
  name: string
  mediaType: MediaType
  props: IProperty[]
}
export interface IProperty {
  id: number
  name: string
  humanName: string
  mediaType: MediaType
  type: IPropertyType
  showType?: EPlexDataType[]
}

interface IPropertyType {
  key: string
  possibilities: RulePossibility[]
}

export enum RulePossibility {
  BIGGER,
  SMALLER,
  EQUALS,
  NOT_EQUALS,
  CONTAINS,
  BEFORE,
  AFTER,
  IN_LAST,
  IN_NEXT,
  NOT_CONTAINS,
  CONTAINS_PARTIAL,
  NOT_CONTAINS_PARTIAL,
  COUNT_EQUALS,
  COUNT_NOT_EQUALS,
  COUNT_BIGGER,
  COUNT_SMALLER,
}

export enum RulePossibilityTranslations {
  BIGGER = 'Bigger',
  SMALLER = 'Smaller',
  EQUALS = 'Equals',
  NOT_EQUALS = 'Not Equals',
  CONTAINS = 'Contains (Exact list match)',
  BEFORE = 'Before',
  AFTER = 'After',
  IN_LAST = 'In Last',
  IN_NEXT = 'In Next',
  NOT_CONTAINS = 'Not Contains (Exact list match)',
  CONTAINS_PARTIAL = 'Contains (Partial list match)',
  NOT_CONTAINS_PARTIAL = 'Not Contains (Partial list match)',
  COUNT_EQUALS = 'Count Equals',
  COUNT_NOT_EQUALS = 'Count Does Not Equal',
  COUNT_BIGGER = 'Count Is Bigger Than',
  COUNT_SMALLER = 'Count Is Smaller Than',
}

export const enum MediaType {
  BOTH,
  MOVIE,
  SHOW,
}

export const enum Application {
  PLEX,
  RADARR,
  SONARR,
  OVERSEERR,
  TAUTULLI,
}

const ConstantsContext = createContext({
  constants: {} as Iconstants,
  setConstants: (constants: Iconstants) => {},
  removeConstants: () => {},
})

export function ConstantsContextProvider(props: {
  children:
    | boolean
    | ReactChild
    | ReactFragment
    | ReactPortal
    | null
    | undefined
}) {
  const [constants, setConstants] = useState<Iconstants>({ applications: null })

  function setConstantsHandler(constants: Iconstants) {
    setConstants(constants)
  }
  function removeConstantsHandler() {
    setConstants({} as Iconstants)
  }

  const context: {
    constants: Iconstants
    setConstants: (constants: Iconstants) => void
    removeConstants: () => void
  } = {
    constants: constants,
    setConstants: setConstantsHandler,
    removeConstants: removeConstantsHandler,
  }

  return (
    <ConstantsContext.Provider value={context}>
      {props.children}
    </ConstantsContext.Provider>
  )
}

export default ConstantsContext
