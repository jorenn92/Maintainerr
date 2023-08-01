import {
  createContext,
  ReactChild,
  ReactFragment,
  ReactPortal,
  useState,
} from 'react'

interface Iconstants {
  applications: IApplication[] | null
}
interface IApplication {
  id: number
  name: string
  mediaType: MediaType,
  props: IProperty[]
}
export interface IProperty {
  id: number
  name: string
  humanName: string
  mediaType: MediaType,
  type: IPropertyType
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
  NOT_CONTAINS,
  BEFORE,
  AFTER,
  IN_LAST,
  IN_NEXT,
}

export const enum MediaType {
  BOTH,
  MOVIE,
  SHOW,
}

const ConstantsContext = createContext({
  constants: {} as Iconstants,
  addConstants: (constant: Iconstants) => {},
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

  function addConstantsHandler(constants: Iconstants) {
    setConstants(() => {
      return constants
    })
  }
  function removeConstantsHandler() {
    setConstants(() => {
      return {} as Iconstants
    })
  }

  const context: {
    constants: Iconstants
    addConstants: (constants: Iconstants) => void
    removeConstants: () => void
  } = {
    constants: constants,
    addConstants: addConstantsHandler,
    removeConstants: removeConstantsHandler,
  }

  return (
    <ConstantsContext.Provider value={context}>
      {props.children}
    </ConstantsContext.Provider>
  )
}

export default ConstantsContext
