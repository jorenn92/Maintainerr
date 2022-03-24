import {
  createContext,
  ReactChild,
  ReactFragment,
  ReactPortal,
  useState,
} from 'react'

const SearchContext = createContext({
  text: {} as string,
  addText: (text: string) => {},
  removeText: () => {},
})

export function SearchContextProvider(props: {
  children:
    | boolean
    | ReactChild
    | ReactFragment
    | ReactPortal
    | null
    | undefined
}) {
  const [text, setText] = useState<string>('')

  function addSearchHandler(text: string) {
    setText(() => {
      return text
    })
  }
  function removeSearchHandler() {
    setText(() => {
      return '' as string
    })
  }

  const context: {
    text: string
    addText: (text: string) => void
    removeText: () => void
  } = {
    text: text,
    addText: addSearchHandler,
    removeText: removeSearchHandler,
  }

  return (
    <SearchContext.Provider value={context}>
      {props.children}
    </SearchContext.Provider>
  )
}

export default SearchContext
