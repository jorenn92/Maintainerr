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
            text="Handle collections"
          />
        </div>
      </div>

      <div className="w-full">
        <div className="m-auto mb-3 flex">
          <h1 className="m-auto text-lg font-bold text-zinc-200 sm:m-0 xl:m-0">
            {'Automatic collections'}
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row">
          {props.collections?.map((col) => (
            <CollectionItem
              key={col.id}
              collection={col}
              onClick={() => props.openDetail(col)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
export default CollectionOverview
