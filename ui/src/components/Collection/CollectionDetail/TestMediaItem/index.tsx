import { useEffect, useMemo, useRef, useState } from 'react'
import Modal from '../../../Common/Modal'
import SearchMediaItem, { IMediaOptions } from '../../../Common/SearchMediaITem'
import { EPlexDataType } from '../../../../utils/PlexDataType-enum'
import FormItem from '../../../Common/FormItem'
import GetApiHandler, { PostApiHandler } from '../../../../utils/ApiHandler'
import { IRuleGroup } from '../../../Rules/RuleGroup'
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
  const [ruleGroup, setRuleGroup] = useState<IRuleGroup>()
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
          setLoading(false)
        },
      )
    }
  }, [mediaItem])

  useEffect(() => {
    if (selectedSeasons !== -1) {
      setLoading(true)

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
          setLoading(false)
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

  return (
    <div className={'w-full h-full'}>
      <Modal
        loading={false}
        backgroundClickable={false}
        onCancel={() => props.onCancel()}
        cancelText="Close"
        okDisabled={false}
        onOk={() => onSubmit()}
        okText={'Test'}
        okButtonType={'primary'}
        title={'Test media item'}
        iconSvg={''}
      >
        <div className="mt-1">
          <Alert
            title={`Search for media items and validate them against your rule. Will return a YAML document containing the validated steps.`}
            type="info"
          />
        </div>
        <FormItem label="Media">
          <SearchMediaItem
            onChange={(el) => {
              setMediaItem(el as unknown as IMediaOptions)
            }}
          />
        </FormItem>

        {mediaItem && mediaItem.type === EPlexDataType.SHOWS ? (
          // Seasons
          <div className="w-full">
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

            {/* episodes */}
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
          </div>
        ) : undefined}

        <label htmlFor={`editor-field`} className="text-label">
          {'Output'}
        </label>
        <div className="editor-field mt-3">
          <Editor
            options={{ readOnly: true }}
            height="65vh"
            defaultLanguage="yaml"
            theme="vs-dark"
            {...(comparisonResult
              ? { value: YAML.stringify(comparisonResult.result) }
              : undefined)}
            onMount={handleEditorDidMount}
          />
        </div>
      </Modal>
    </div>
  )
}

export default TestMediaItem
