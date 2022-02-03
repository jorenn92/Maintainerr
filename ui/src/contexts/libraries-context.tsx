import {
  createContext,
  ReactChild,
  ReactFragment,
  ReactPortal,
  useState,
} from 'react'

export interface ILibrary {
  key: string
  type: string
  title: string
}
const LibrariesContext = createContext({
  libraries: [] as ILibrary[],
  addLibraries: (libraries: ILibrary[]) => {},
  removeLibraries: () => {},
})

export function LibrariesContextProvider(props: {
  children:
    | boolean
    | ReactChild
    | ReactFragment
    | ReactPortal
    | null
    | undefined
}) {
  const [libraries, setLibraries] = useState<ILibrary[]>([])

  function addLibrariesHandler(libraries: ILibrary[]) {
    setLibraries(() => {
      return libraries
    })
  }
  function removeLibrariesHandler() {
    setLibraries(() => {
      return [] as ILibrary[]
    })
  }

  const context: {
    libraries: ILibrary[]
    addLibraries: (libraries: ILibrary[]) => void
    removeLibraries: () => void
  } = {
    libraries: libraries,
    addLibraries: addLibrariesHandler,
    removeLibraries: removeLibrariesHandler,
  }

  return (
    <LibrariesContext.Provider value={context}>
      {props.children}
    </LibrariesContext.Provider>
  )
}

export default LibrariesContext
