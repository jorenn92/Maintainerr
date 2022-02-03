import { useContext, useEffect } from 'react'
import LibrariesContext from '../../../contexts/libraries-context'
import GetApiHandler from '../../../helpers/ApiHandler'

interface ILibrarySwitcher {
  onSwitch: (libraryId: number) => void
}

const LibrarySwticher = (props: ILibrarySwitcher) => {
  const LibrariesCtx = useContext(LibrariesContext)

  const onSwitchLibrary = (event: { target: { value: string } }) => {
    props.onSwitch(+event.target.value)
  }

  useEffect(() => {
    if (LibrariesCtx.libraries.length <= 0) {
      GetApiHandler('/plex/libraries/').then((resp) => {
        if (resp) {
          LibrariesCtx.addLibraries(resp)
        } else {
          LibrariesCtx.addLibraries([])
        }
      })
    }
  }, [])

  return (
    <>
        <div className="mb-5 w-full">
          <form>
            <select placeholder="Libraries" onChange={onSwitchLibrary}>
              <option value={9999}>All</option>
              {LibrariesCtx.libraries.map((el) => {
                return (
                  <option key={el.key} value={el.key}>
                    {el.title}
                  </option>
                )
              })}
            </select>
          </form>
        </div>
    </>
  )
}

export default LibrarySwticher
