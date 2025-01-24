import React from 'react'
import AsyncSelect from 'react-select/async'
import GetApiHandler from '../../../utils/ApiHandler'
import { IPlexMetadata } from '../../Overview/Content'
import { EPlexDataType } from '../../../utils/PlexDataType-enum'
import { SingleValue } from 'react-select'

export interface IMediaOptions {
  id: string
  name: string
  type: EPlexDataType
}

interface ISearchMediaITem {
  onChange: (item: SingleValue<IMediaOptions>) => void
  mediatype?: EPlexDataType
}

const SearchMediaItem = (props: ISearchMediaITem) => {
  const loadData = async (query: string): Promise<IMediaOptions[]> => {
    // load your data using query
    const resp: IPlexMetadata[] = await GetApiHandler(`/plex//search/${query}`)
    const output = resp.map((el) => {
      return {
        id: el.ratingKey,
        name: el.title,
        type: el.type === 'movie' ? 1 : 2,
      } as unknown as IMediaOptions
    })

    if (props.mediatype) {
      const type =
        props.mediatype !== EPlexDataType.MOVIES &&
        props.mediatype !== EPlexDataType.SHOWS
          ? 2
          : props.mediatype
      return output.filter((el) => el.type === type)
    }

    return output
  }

  return (
    <>
      <AsyncSelect
        className="react-select-container"
        classNamePrefix="react-select"
        isClearable
        getOptionLabel={(option: IMediaOptions) => option.name}
        getOptionValue={(option: IMediaOptions) => option.id}
        defaultValue={[]}
        defaultOptions={undefined}
        loadOptions={loadData}
        placeholder="Start typing... "
        onChange={(selectedItem) => {
          props.onChange(selectedItem)
        }}
      />
    </>
  )
}

export default SearchMediaItem
