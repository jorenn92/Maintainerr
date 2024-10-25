import { useContext } from 'react'
import { ICollection } from '..'
import LibrariesContext from '../../../contexts/libraries-context'
import CachedImage from '../../Common/CachedImage'

interface ICollectionItem {
  collection: ICollection
  onClick?: (collection: ICollection) => void
}

const CollectionItem = (props: ICollectionItem) => {
  const LibrariesCtx = useContext(LibrariesContext)

  return (
    <>
      <a
        className="hover:none hover:cursor-pointer"
        // onClick={() => props.onClick(props.collection)}
        {...(props.onClick
          ? { onClick: () => props.onClick!(props.collection) }
          : {})}
      >
        {/* <div className="collection relative mb-5 flex h-fit w-full flex-col overflow-hidden rounded-xl bg-zinc-800 bg-cover bg-center p-4 text-zinc-400 shadow ring-1 ring-zinc-700 sm:mb-0 sm:mr-5 sm:w-1/3"> */}
        {props.collection.media && props.collection.media.length > 1 ? (
          <div className="z-1 absolute inset-0 flex flex-row overflow-hidden">
            <CachedImage
              className="backdrop-image"
              width="600"
              height="800"
              src={`https://image.tmdb.org/t/p/w500${props.collection.media[0].image_path}`}
              alt="img"
            />
            <CachedImage
              className="backdrop-image"
              width="600"
              height="800"
              src={`https://image.tmdb.org/t/p/w500/${props.collection.media[1].image_path}`}
              alt="img"
            />
            <div className="collection-backdrop"></div>
          </div>
        ) : undefined}
        <div className="inset-0 z-0 h-fit p-3 ">
          <div className="overflow-hidden overflow-ellipsis whitespace-nowrap text-base font-bold text-white sm:text-lg">
            <a
              className="hover:underline hover:cursor-pointer"
              // onClick={() => props.onClick(props.collection)}
              {...(props.onClick
                ? { onClick: () => props.onClick!(props.collection) }
                : {})}
            >
              {props.collection.manualCollection
                ? `${props.collection.manualCollectionName} (manual)`
                : props.collection.title}
            </a>
          </div>
          <div className="max-h-12 h-12 line-clamp-2 whitespace-normal text-base text-zinc-400 hover:overflow-y-scroll sm:text-lg sm:h-14 sm:max-h-14">
            {props.collection.manualCollection
              ? `Handled by rule: '${props.collection.title}'`
              : props.collection.description}
          </div>
        </div>

        <div className="inset-0 z-0 flex h-fit flex-row p-3 text-base sm:flex-row">
          <div className="mr-5 flex flex-row sm:mr-0 sm:mt-auto sm:flex-col">
            <div className="mb-5 mr-5 sm:mr-0">
              <p className="font-bold">Library</p>
              <p className="">
                {' '}
                {
                  LibrariesCtx.libraries.find(
                    (el) => +el.key === +props.collection.libraryId,
                  )?.title
                }
              </p>
            </div>

            <div className="mr-5 sm:mr-0">
              <p className="font-bold">Items</p>
              <p className="">
                {' '}
                {`${
                  props.collection.media ? props.collection.media.length : 0
                }`}
              </p>
            </div>
          </div>

          <div className="ml-auto flex flex-row text-right sm:mt-auto sm:flex-col">
            <div className="mb-5 mr-5 sm:mr-0">
              <p className="font-bold">Status</p>
              <p className="">
                {' '}
                {props.collection.isActive ? (
                  <span className="text-green-900">Active</span>
                ) : (
                  <span className="text-red-700">Inactive</span>
                )}
              </p>
            </div>

            <div className="mr-0 sm:mr-0">
              <p className="font-bold">Delete</p>
              <p className="">{` After ${props.collection.deleteAfterDays} days`}</p>
            </div>
          </div>
        </div>
      </a>
    </>
  )
}
export default CollectionItem
