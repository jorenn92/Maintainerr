import { EPlexDataType } from '@maintainerr/contracts'
import { Editor } from '@monaco-editor/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import YAML from 'yaml'
import GetApiHandler, { PostApiHandler } from '../../../../utils/ApiHandler'
import Alert from '../../../Common/Alert'
import FormItem from '../../../Common/FormItem'
import Modal from '../../../Common/Modal'
import SearchMediaItem, { IMediaOptions } from '../../../Common/SearchMediaITem'

interface ITestMediaItem {
  onCancel: () => void
  onSubmit: () => void
  collectionId: number
  libraryId: number
  dataType: EPlexDataType
}

interface IOptions {
  id: number
  title: string
}

interface IComparisonResult {
  code: 1 | 0
  result: any
}

const emptyOption: IOptions = {
  id: -1,
  title: '-',
}

const TestMediaItem = (props: ITestMediaItem) => {
  const [mediaItem, setMediaItem] = useState<IMediaOptions>()
  const [selectedSeasons, setSelectedSeasons] = useState<number>(-1)
  const [selectedEpisodes, setSelectedEpisodes] = useState<number>(-1)
  const [seasonOptions, setSeasonOptions] = useState<IOptions[]>([emptyOption])
  const [episodeOptions, setEpisodeOptions] = useState<IOptions[]>([
    emptyOption,
  ])
  const [comparisonResult, setComparisonResult] = useState<IComparisonResult>()
  const editorRef = useRef(undefined)

  const testable = useMemo(() => {
    if (!mediaItem) return false

    // if movies or shows is selected
    if (
      props.dataType === EPlexDataType.MOVIES ||
      props.dataType === EPlexDataType.SHOWS
    ) {
      return true
    }

    // if seasons & season is selected
    else if (
      props.dataType === EPlexDataType.SEASONS &&
      selectedSeasons !== -1
    ) {
      return true
    }
    // if episodes mediaitem, season & episode is selected
    else if (
      props.dataType === EPlexDataType.EPISODES &&
      selectedSeasons !== -1 &&
      selectedEpisodes !== -1
    ) {
      return true
    }

    return false
  }, [mediaItem, selectedSeasons, selectedEpisodes])

  function handleEditorDidMount(editor: any, monaco: any) {
    editorRef.current = editor
  }

  const updateMediaItem = (item: IMediaOptions) => {
    setMediaItem(item)
    updateSelectedSeasons(-1)
    setSeasonOptions([emptyOption])

    if (item?.type == EPlexDataType.SHOWS) {
      // get seasons
      GetApiHandler(`/plex/meta/${item.id}/children`).then(
        (resp: [{ ratingKey: number; title: string }]) => {
          setSeasonOptions([
            emptyOption,
            ...resp.map((el) => {
              return {
                id: el.ratingKey,
                title: el.title,
              }
            }),
          ])
        },
      )
    }
  }

  const updateSelectedSeasons = (seasons: number) => {
    setSelectedSeasons(seasons)
    setSelectedEpisodes(-1)
    setEpisodeOptions([emptyOption])

    if (seasons !== -1) {
      // get episodes
      GetApiHandler(`/plex/meta/${seasons}/children`).then(
        (resp: [{ ratingKey: number; index: number }]) => {
          setEpisodeOptions([
            emptyOption,
            ...resp.map((el) => {
              return {
                id: el.ratingKey,
                title: `Episode ${el.index}`,
              }
            }),
          ])
        },
      )
    }
  }

  const onSubmit = async () => {
    setComparisonResult(undefined)

    const result = await PostApiHandler(`/rules/test`, {
      rulegroupId: props.collectionId,
      mediaId: selectedMediaId,
    })

    setComparisonResult(result)
  }

  const selectedMediaId = useMemo(() => {
    if (mediaItem) {
      return selectedEpisodes !== -1
        ? selectedEpisodes
        : selectedSeasons !== -1
          ? selectedSeasons
          : mediaItem?.id
    }
  }, [selectedSeasons, selectedEpisodes, mediaItem])

  useEffect(() => {
    if (editorRef.current) {
      ;(editorRef.current as any).setValue('')
      setComparisonResult(undefined)
    }
  }, [selectedSeasons, selectedEpisodes, mediaItem])

  return (
    <div className={'h-full w-full'}>
      <Modal
        loading={false}
        backgroundClickable={false}
        onCancel={props.onCancel}
        cancelText="Close"
        okDisabled={!testable}
        onOk={onSubmit}
        okText={'Test'}
        okButtonType={'primary'}
        title={'Test Media'}
        iconSvg={''}
      >
        <div className="h-[80vh] overflow-hidden">
          <div className="mt-1">
            <Alert type="info">
              {`Search for media items and validate them against the specified rule. The result will be a YAML document containing the validated steps.
            `}
              <br />
              <br />
              {`The rule group is of type ${
                props.dataType === EPlexDataType.MOVIES
                  ? 'movies'
                  : props.dataType === EPlexDataType.SEASONS
                    ? 'seasons'
                    : props.dataType === EPlexDataType.EPISODES
                      ? 'episodes'
                      : 'series'
              }, as a result only media of type ${
                props.dataType === EPlexDataType.MOVIES ? 'movies' : 'series'
              } will be displayed in the search bar.`}
            </Alert>
          </div>
          <FormItem label="Media">
            <SearchMediaItem
              mediatype={props.dataType}
              libraryId={props.libraryId}
              onChange={(el) => {
                updateMediaItem(el as unknown as IMediaOptions)
              }}
            />
          </FormItem>

          {/* seasons */}
          <div className="w-full">
            {props.dataType === EPlexDataType.SEASONS ||
            props.dataType === EPlexDataType.EPISODES ? (
              <FormItem label="Season">
                <select
                  name={`Seasons-field`}
                  id={`Seasons-field`}
                  value={selectedSeasons}
                  onChange={(e: { target: { value: string } }) => {
                    updateSelectedSeasons(+e.target.value)
                  }}
                >
                  {seasonOptions.map((e: IOptions) => {
                    return (
                      <option key={e.id} value={e.id}>
                        {e.title}
                      </option>
                    )
                  })}
                </select>
              </FormItem>
            ) : undefined}

            {props.dataType === EPlexDataType.EPISODES ? (
              // episodes
              <FormItem label="Episode">
                <select
                  name={`episode-field`}
                  id={`episode-field`}
                  value={selectedEpisodes}
                  onChange={(e: { target: { value: string } }) => {
                    setSelectedEpisodes(+e.target.value)
                  }}
                >
                  {episodeOptions.map((e: IOptions) => {
                    return (
                      <option key={e.id} value={e.id}>
                        {e.title}
                      </option>
                    )
                  })}
                </select>
              </FormItem>
            ) : undefined}
          </div>

          <label htmlFor={`editor-field`} className="text-label mb-3">
            {'Output'}
          </label>
          <div className="editor-container h-full">
            <Editor
              options={{ readOnly: true, minimap: { enabled: false } }}
              defaultLanguage="yaml"
              theme="vs-dark"
              value={
                comparisonResult ? YAML.stringify(comparisonResult.result) : ''
              }
              onMount={handleEditorDidMount}
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default TestMediaItem
