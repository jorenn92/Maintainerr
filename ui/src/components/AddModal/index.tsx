import { useEffect, useMemo, useState } from 'react'
import GetApiHandler, {
  DeleteApiHandler,
  PostApiHandler,
} from '../../utils/ApiHandler'
import Alert from '../Common/Alert'
import Modal from '../Common/Modal'
import FormItem from '../Common/FormItem'

interface IAddModal {
  onCancel: () => void
  onSubmit: () => void
  libraryId?: number
  type?: number
  plexId: number
}

interface ICollectionMedia {
  media?: []
  id: number
  plexId?: number
  libraryId?: number
  title: string
  description?: string
  isActive?: boolean
  arrAction?: number
  visibleOnHome?: boolean
  deleteAfterDays?: number
  type?: 1 | 2
  collectionMedia?: []
}
const AddModal = (props: IAddModal) => {
  const [selectedCollection, setSelectedCollection] = useState<number>(-1)
  const [loading, setLoading] = useState(true)
  const [mediaChildren, setMediaChildren] = useState()
  const [selectedAction, setSelectedAction] = useState<number>(0)
  // For show only
  const [selectedSeasons, setSelectedSeasons] = useState<number>(-1)
  const [selectedEpisodes, setSelectedEpisodes] = useState<number>(-1)

  const [collectionOptions, setCollectionOptions] = useState<
    ICollectionMedia[]
  >([
    {
      id: -1,
      title: 'All collections',
    },
  ])
  const [seasonOptions, setSeasonOptions] = useState<ICollectionMedia[]>([
    {
      id: -1,
      title: 'All seasons',
    },
  ])
  const [episodeOptions, setEpisodeOptions] = useState<ICollectionMedia[]>([
    {
      id: -1,
      title: 'All episodes',
    },
  ])

  const selectedMediaId = useMemo(() => {
    return props.type === 1
      ? -1
      : selectedEpisodes !== -1
      ? selectedEpisodes
      : selectedSeasons
  }, [selectedSeasons, selectedEpisodes])

  const selectedContext = useMemo(() => {
    return props.type === 2
      ? selectedEpisodes !== -1
        ? 'episode'
        : selectedSeasons !== -1
        ? 'season'
        : null
      : null
  }, [selectedSeasons, selectedEpisodes])

  const handleCancel = () => {
    props.onCancel()
  }

  const handleOk = () => {
    console.log(
      selectedAction,
      selectedMediaId,
      selectedContext,
      selectedCollection,
    )
    switch (selectedAction) {
      case 0:
        // PostApiHandler(`/collections/media/add`, {
        //   mediaId: selectedMediaId,
        //   context: selectedContext,
        //   collectionId: selectedCollection,
        // })
        break
      case 1:
        // DeleteApiHandler(`/collections/media`, {
        //   mediaId: selectedMediaId,
        //   context: selectedContext,
        //   collectionId: selectedCollection,
        // })
        break
    }

    // switch (selectedCollection) {
    //   case -1:
    //     DeleteApiHandler(`/collections/media?mediaId=${props.plexId}`)
    //     break
    //   default:
    //     PostApiHandler(`/collections/media/add`, {
    //       mediaId: props.plexId,
    //       collectionId: selectedCollection,
    //     })
    //     break
    // }
    props.onSubmit()
  }

  useEffect(() => {
    document.title = 'Maintainerr - Overview'

    setSelectedSeasons(-1)
    setSelectedEpisodes(-1)

    if (props.type && props.type === 2) {
      // get seasons
      GetApiHandler(`/plex/meta/${props.plexId}/children`).then(
        (resp: [{ ratingKey: number; title: string }]) => {
          setSeasonOptions([
            {
              id: -1,
              title: 'All seasons',
            },
            ...resp.map((el) => {
              return {
                id: el.ratingKey,
                title: el.title,
              }
            }),
          ])
          setLoading(false)
        },
      )
    }

    // } else if (props.libraryId) {
    //   GetApiHandler(`/collections?libraryId=${props.libraryId}`).then(
    //     (resp) => {
    //       props.type === 1 ? setLoading(false) : undefined
    //       return setCollectionOptions([...collectionOptions, ...resp])
    //     },
    //   )
  }, [])

  useEffect(() => {
    if (selectedSeasons !== -1) {
      setLoading(true)

      // get episodes
      GetApiHandler(`/plex/meta/${selectedSeasons}/children`).then(
        (resp: [{ ratingKey: number; index: number }]) => {
          setEpisodeOptions([
            {
              id: -1,
              title: 'All episodes',
            },
            ...resp.map((el) => {
              return {
                id: el.ratingKey,
                title: `Episode ${el.index}`,
              }
            }),
          ])
          setLoading(false)
        },
      )
    }
  }, [selectedSeasons])

  // fetch correct collections based on selected type
  useEffect(() => {
    setLoading(true)

    props.type === 2
      ? selectedEpisodes !== -1
        ? GetApiHandler(`/collections?typeId=4`).then((resp) => {
            // get collections for episodes
            setCollectionOptions([
              {
                id: -1,
                title: 'All collections',
              },
              ...resp,
            ])
            setLoading(false)
          })
        : selectedSeasons !== -1
        ? GetApiHandler(`/collections?typeId=3`).then((resp) => {
            // get collections for episodes and seasons
            GetApiHandler(`/collections?typeId=4`).then((resp2) => {
              setCollectionOptions([
                {
                  id: -1,
                  title: 'All collections',
                },
                ...resp,
                ...resp2,
              ])
              setLoading(false)
            })
          })
        : GetApiHandler(`/collections?typeId=2`).then((resp) => {
            // get collections for episodes, seasons and shows
            GetApiHandler(`/collections?typeId=3`).then((resp2) => {
              GetApiHandler(`/collections?typeId=4`).then((resp3) => {
                setCollectionOptions([
                  {
                    id: -1,
                    title: 'All collections',
                  },
                  ...resp,
                  ...resp2,
                  ...resp3,
                ])
                setLoading(false)
              })
            })
          })
      : GetApiHandler(`/collections?typeId=1`).then((resp) => {
          // get collections for movies
          setCollectionOptions([
            {
              id: -1,
              title: 'All collections',
            },
            ...resp,
          ])
          setLoading(false)
        })
  }, [selectedSeasons, selectedEpisodes])

  return (
    <Modal
      loading={loading}
      backgroundClickable
      onCancel={handleCancel}
      onOk={handleOk}
      okDisabled={false}
      title={'Add / Remove from Collection'}
      okText={'Submit'}
      okButtonType={'primary'}
      iconSvg={''}
      // backdrop={`https://image.tmdb.org/t/p/w1920_and_h800_multi_faces/1`}
    >
      <div className="mt-6">
        <FormItem label="Action">
          <select
            name={`Action-field`}
            id={`Action-field`}
            value={selectedAction}
            onChange={(e: { target: { value: string } }) => {
              setSelectedAction(+e.target.value)
            }}
          >
            <option value={0}>Add</option>
            <option value={1}>Remove</option>
          </select>
        </FormItem>

        {/* For shows */}
        {props.type === 2 ? (
          <FormItem label="Seasons">
            <select
              name={`Seasons-field`}
              id={`Seasons-field`}
              value={selectedSeasons}
              onChange={(e: { target: { value: string } }) => {
                setSelectedSeasons(+e.target.value)
              }}
            >
              {seasonOptions.map((e: ICollectionMedia) => {
                return (
                  <option key={e.id} value={e.id}>
                    {e.title}
                  </option>
                )
              })}
            </select>
          </FormItem>
        ) : undefined}
        {/* For shows and specific seasons */}
        {props.type === 2 && selectedSeasons !== -1 ? (
          <FormItem label="Episodes">
            <select
              name={`Episodes-field`}
              id={`Episodes-field`}
              value={selectedEpisodes}
              onChange={(e: { target: { value: string } }) => {
                setSelectedEpisodes(+e.target.value)
              }}
            >
              {episodeOptions.map((e: ICollectionMedia) => {
                return (
                  <option key={e.id} value={e.id}>
                    {e.title}
                  </option>
                )
              })}
            </select>
          </FormItem>
        ) : undefined}

        <FormItem label="Collection">
          <select
            name={`Collection-field`}
            id={`Collection-field`}
            value={selectedCollection}
            onChange={(e: { target: { value: string } }) => {
              setSelectedCollection(+e.target.value)
            }}
          >
            {collectionOptions?.map((e: ICollectionMedia) => {
              return (
                <option key={e?.id} value={e?.id}>
                  {e?.title}
                </option>
              )
            })}
          </select>
        </FormItem>
      </div>
    </Modal>
  )
}
export default AddModal
