import { debounce } from 'lodash'
import { ICollection } from '..'
import ExecuteButton from '../../Common/ExecuteButton'
import LibrarySwitcher from '../../Common/LibrarySwitcher'
import CollectionItem from '../CollectionItem'

interface ICollectionOverview {
  collections: ICollection[] | undefined
  onSwitchLibrary: (id: number) => void
  doActions: () => void
  openDetail: (collection: ICollection) => void
}

const CollectionOverview = (props: ICollectionOverview) => {
  return (
    <div>
      <LibrarySwitcher onSwitch={props.onSwitchLibrary} />

      <div className="m-auto mb-3 flex ">
        <div className="m-auto sm:m-0 ">
          <ExecuteButton
            onClick={debounce(props.doActions, 5000)}
            text="Handle Collections"
          />
        </div>
      </div>

      <div className="w-full">
        <div className="m-auto mb-3 flex">
          <h1 className="m-auto text-lg font-bold text-zinc-200 sm:m-0 xl:m-0">
            {'Automatic collections'}
          </h1>
        </div>
        <ul className="xs:collection-cards-vertical">
          {props.collections?.map((col) => (
            <li
              key={+col.id!}
              className="collection relative mb-5 flex h-fit flex-col overflow-hidden rounded-xl bg-zinc-800 bg-cover bg-center p-4 text-zinc-400 shadow ring-1 ring-zinc-700 sm:mb-0 sm:mr-5 xs:w-full transform-gpu"
            >
              <CollectionItem
                key={col.id}
                collection={col}
                onClick={() => props.openDetail(col)}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
export default CollectionOverview
