import { useEffect, useMemo, useRef, useState } from 'react'
import Modal from '../../../Common/Modal'
import SearchMediaItem, { IMediaOptions } from '../../../Common/SearchMediaITem'
import { EPlexDataType } from '../../../../utils/PlexDataType-enum'
import FormItem from '../../../Common/FormItem'
import GetApiHandler, { PostApiHandler } from '../../../../utils/ApiHandler'
import { Editor } from '@monaco-editor/react'
import YAML from 'yaml'
import Alert from '../../../Common/Alert'

interface ITestMediaItem {
  onCancel: () => void
  onSubmit: () => void
  collectionId: number
}

interface IOptions {
  id: number
  title: string
}

interface IComparisonResult {
  code: 1 | 0
  result: any
}

const TestMediaItem = (props: ITestMediaItem) => {
  const [mediaItem, setMediaItem] = useState<IMediaOptions>()
  const [loading, setLoading] = useState(true)
  const [ruleGroup, setRuleGroup] = useState<{
    dataType: EPlexDataType
    id: String
  }>()
  const [selectedSeasons, setSelectedSeasons] = useState<number>(-1)
  const [selectedEpisodes, setSelectedEpisodes] = useState<number>(-1)
  const [seasonOptions, setSeasonOptions] = useState<IOptions[]>([
    {
      id: -1,
      title: '-',
    },
  ])
  const [episodeOptions, setEpisodeOptions] = useState<IOptions[]>([
    {
      id: -1,
      title: '-',
    },
  ])
  const [comparisonResult, setComparisonResult] = useState<IComparisonResult>()
  const editorRef = useRef(undefined)

  const testable = useMemo(() => {
    // if the rulegroup is available
    if (ruleGroup) {
      // if movies or shows & mediaitem is selected
      if (
        (ruleGroup?.dataType === EPlexDataType.MOVIES ||
          ruleGroup?.dataType === EPlexDataType.SHOWS) &&
        mediaItem
      ) {
        return true
      }

      // if seasons & mediaitem & season is selected
      else if (
        ruleGroup?.dataType === EPlexDataType.SEASONS &&
        mediaItem &&
        selectedSeasons !== -1
      ) {
        return true
      }
      // if episodes a mediaitem, season & episode is selected
      else if (
        ruleGroup?.dataType === EPlexDataType.EPISODES &&
        mediaItem &&
        selectedSeasons !== -1 &&
        selectedEpisodes !== -1
      ) {
        return true
      }
    }
    // all other cases = false
    return false
  }, [mediaItem, selectedSeasons, selectedEpisodes])

  function handleEditorDidMount(editor: any, monaco: any) {
    editorRef.current = editor
  }

  useEffect(() => {
    setSelectedSeasons(-1)
    setSelectedEpisodes(-1)
    if (mediaItem && mediaItem.type == EPlexDataType.SHOWS) {
      // get seasons
      GetApiHandler(`/plex/meta/${mediaItem.id}/children`).then(
        (resp: [{ ratingKey: number; title: string }]) => {
          setSeasonOptions([
            {
              id: -1,
              title: '-',
            },
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
  }, [mediaItem])

  useEffect(() => {
    if (selectedSeasons !== -1) {
      // get episodes
      GetApiHandler(`/plex/meta/${selectedSeasons}/children`).then(
        (resp: [{ ratingKey: number; index: number }]) => {
          setEpisodeOptions([
            {
              id: -1,
              title: '-',
            },
            ...resp.map((el) => {
              return {
                id: el.ratingKey,
                title: `Episode ${el.index}`,
              }
            }),
          ])
        },
      )
    } else {
      setSelectedEpisodes(-1)
    }
  }, [selectedSeasons])

  const onSubmit = async () => {
    if (ruleGroup) {
      const result = await PostApiHandler(`/rules/test`, {
        rulegroupId: ruleGroup.id,
        mediaId: selectedMediaId,
      })
      setComparisonResult(result)
    }
  }

  useEffect(() => {
    GetApiHandler(`/rules/collection/${props.collectionId}`).then((resp) => {
      setRuleGroup(resp), setLoading(false)
    })
  }, [])

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
  }, [selectedMediaId])

  return !loading && ruleGroup ? (
    <div className={'w-full h-full'}>
      <Modal
        loading={false}
        backgroundClickable={false}
        onCancel={() => props.onCancel()}
        cancelText="Close"
        okDisabled={!testable}
        onOk={() => onSubmit()}
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
                ruleGroup.dataType === EPlexDataType.MOVIES
                  ? 'movies'
                  : ruleGroup.dataType === EPlexDataType.SEASONS
                    ? 'seasons'
                    : ruleGroup.dataType === EPlexDataType.EPISODES
                      ? 'episodes'
                      : 'series'
              }, as a result only media of type ${
                ruleGroup.dataType === EPlexDataType.MOVIES
                  ? 'movies'
                  : 'series'
              } will be displayed in the searchbar.`}
            </Alert>
          </div>
          <FormItem label="Media">
            <SearchMediaItem
              mediatype={ruleGroup.dataType}
              onChange={(el) => {
                setMediaItem(el as unknown as IMediaOptions)
              }}
            />
          </FormItem>

          {/* seasons */}
          <div className="w-full">
            {ruleGroup.dataType === EPlexDataType.SEASONS ||
            ruleGroup.dataType === EPlexDataType.EPISODES ? (
              <FormItem label="Season">
                <select
                  name={`Seasons-field`}
                  id={`Seasons-field`}
                  value={selectedSeasons}
                  onChange={(e: { target: { value: string } }) => {
                    setSelectedSeasons(+e.target.value)
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

            {ruleGroup.dataType === EPlexDataType.EPISODES ? (
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
              {...(comparisonResult
                ? { value: YAML.stringify(comparisonResult.result) }
                : undefined)}
              onMount={handleEditorDidMount}
            />
          </div>
        </div>
      </Modal>
    </div>
  ) : undefined
}

export default TestMediaItem
