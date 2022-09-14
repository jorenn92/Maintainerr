import { UploadIcon } from '@heroicons/react/solid'
import { useEffect, useRef, useState } from 'react'
import GetApiHandler, { PostApiHandler } from '../../../utils/ApiHandler'
import { IRule } from '../../Rules/Rule/RuleCreator'
import CommunityRuleUpload from '../../Rules/Rule/RuleCreator/CommunityRuleUpload'
import Alert from '../Alert'
import CommunityRuleTableRow from '../CommunityRowTableRow'
import InfoButton from '../InfoButton'
import LoadingSpinner from '../LoadingSpinner'
import Modal from '../Modal'
import Pagination from '../Pagination'
import SearchBar from '../SearchBar'

interface ICommunityRuleModal {
  onUpdate: (rules: IRule[]) => void
  onCancel: () => void
  currentRules?: IRule[]
}

interface ICommunityRuleKarmaHistory {
  id: number
  community_rule_id: number
}

export interface ICommunityRule {
  id?: number
  karma?: number
  appVersion?: string
  name: string
  description: string
  JsonRules: IRule[]
}

const CommunityRuleModal = (props: ICommunityRuleModal) => {
  const [communityRules, setCommunityRules] = useState<ICommunityRule[]>([])
  const [originalRules, setoriginalRules] = useState<ICommunityRule[]>([])
  const [shownRules, setShownRules] = useState<ICommunityRule[]>([])
  const [currentPage, setCurrentPage] = useState<number>(0)
  const [clickedRule, setClickedRule] = useState<number>(-1)
  const [history, setHistory] = useState<ICommunityRuleKarmaHistory[]>([])
  const [showInfo, setInfo] = useState<boolean>(false)
  const [uploadMyRules, setUploadMyRules] = useState<boolean>(false)
  const searchText = useRef<string>()
  const appVersion = useRef<string>('0.0.0')

  const paging = 5

  useEffect(() => {
    getAppVersion()
    GetApiHandler('/rules/community/').then((resp: ICommunityRule[]) => {
      if (resp) {
        if (!('code' in resp)) {
          resp = resp.filter(
            (e) =>
              e.appVersion!.replaceAll('.', '') <=
              appVersion.current.replaceAll('.', '')
          )
          resp = resp.sort((a, b) => b.karma! - a.karma!)
          setCommunityRules(resp)
          setoriginalRules(resp)
          setShownRules(resp.slice(0, paging))
        } else {
          setCommunityRules([])
          console.log(
            'An error occured fetching community rules. Does Maintainerr have privileges to access the internet?'
          )
        }
      } else {
        setCommunityRules([])
      }
    })

    getKarmaHistory()
  }, [])

  useEffect(() => {
    paginate(1)
  }, [communityRules])

  const paginate = (page: number) => {
    setShownRules(communityRules.slice((page - 1) * paging, page * paging))
    setCurrentPage(page)
  }

  const getAppVersion = () => {
    GetApiHandler('/settings/version').then((resp: string) => {
      if (resp) {
        appVersion.current = resp
      }
    })
  }

  const getKarmaHistory = () => {
    GetApiHandler('/rules/community/karma/history').then(
      (resp: ICommunityRuleKarmaHistory[]) => {
        if (resp) {
          setHistory(resp)
        } else {
          console.log(`Couldn't fetch community rule Karma history.`)
        }
      }
    )
  }

  const handleCancel = () => {
    props.onCancel()
  }

  const handleClick = (id: number) => {
    if (clickedRule === id) {
      setClickedRule(-1)
    } else {
      setClickedRule(id)
    }
  }

  const handleSubmit = () => {
    if (props.onUpdate !== undefined && clickedRule !== -1) {
      const rule = originalRules.find((r) => r.id === clickedRule)
      if (rule !== undefined) {
        props.onUpdate(rule.JsonRules)
      }
    }
  }

  const handleSearch = (input: string) => {
    searchText.current = input
    if (input === '') {
      setCommunityRules(originalRules)
    } else {
      setCommunityRules(
        originalRules.filter(
          (el) =>
            el.name.toLowerCase().includes(input.trim().toLowerCase()) ||
            el.description.toLowerCase().includes(input.trim().toLowerCase())
        )
      )
    }
  }

  const handleThumbsUp = (id: number) => {
    const rule = originalRules.find((e) => e.id === id)

    if (rule && rule.karma !== undefined) {
      ThumbPoster(id, rule.karma + 10)
      setoriginalRules(
        originalRules.map((e) => {
          if (e.id === id && e.karma !== undefined) {
            e.karma += 10
          }
          return e
        })
      )
      setHistory([{ id: history.length, community_rule_id: id }, ...history])
    }
  }

  const handleThumbsDown = (id: number) => {
    const rule = originalRules.find((e) => e.id === id)

    if (rule && rule.karma !== undefined) {
      ThumbPoster(id, rule.karma - 10)
      setoriginalRules(
        originalRules.map((e) => {
          if (e.id === id && e.karma !== undefined) {
            e.karma -= 10
          }
          return e
        })
      )
      setHistory([{ id: history.length, community_rule_id: id }, ...history])
    }
  }

  const ThumbPoster = async (id: number, karma: number): Promise<0 | 1> => {
    return await PostApiHandler('/rules/community/karma', {
      id: id,
      karma: karma,
    })
      .then((resp: { code: 0 | 1; result: string }) => {
        if (resp.code !== 0) {
          return 1
        } else {
          return 0
        }
      })
      .catch((e) => {
        return 0
      })
  }

  const handleInfo = () => {
    setInfo(true)
  }

  return (
    <div>
      <Modal
        loading={false}
        backgroundClickable={false}
        onCancel={handleCancel}
        okDisabled={clickedRule === -1}
        onOk={handleSubmit}
        okText={'Import'}
        okButtonType={'primary'}
        title={'Community Rules'}
        iconSvg={''}
      >
        <div className="mt-6">
          <Alert
            title={`Import rules made by the community. WARNING: This will override your current rules`}
            type="info"
          />
        </div>
        <SearchBar onSearch={handleSearch} />
        {originalRules.length > 0 ? (
          <div className="flex flex-col">
            <div className="my-2 -mx-4 overflow-x-auto md:mx-0 lg:mx-0">
              <div className="inline-block min-w-full py-2 align-middle">
                <div className="overflow-hidden rounded-lg shadow md:mx-0 lg:mx-0">
                  <table className="ml-2 mr-2 min-w-full table-fixed">
                    <tbody className="divide-y divide-zinc-600 bg-zinc-800">
                      <tr>
                        <th className="truncate bg-gray-500 px-4 py-3 text-left text-xs font-medium uppercase leading-4 tracking-wider text-gray-200">
                          <span>Name</span>
                        </th>
                        <th className="truncate bg-gray-500 px-4 py-3 text-center text-xs font-medium uppercase leading-4 tracking-wider text-gray-200">
                          <span>Karma</span>
                        </th>
                      </tr>
                      {shownRules.map((cr) => {
                        return (
                          <CommunityRuleTableRow
                            key={cr.id}
                            clicked={clickedRule === cr.id}
                            onClick={handleClick}
                            thumbsActive={
                              history.find(
                                (e) => e.community_rule_id === cr.id
                              ) === undefined
                            }
                            onThumbsUp={handleThumbsUp}
                            onThumbsDown={handleThumbsDown}
                            rule={cr}
                          />
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="">
              <span className="float-left">
                <InfoButton
                  text="Info"
                  enabled={clickedRule !== -1}
                  onClick={handleInfo}
                />
              </span>
              <span className="float-right">
                <button
                  disabled={false}
                  className="mb-2 flex h-9 w-fit rounded bg-zinc-900 text-zinc-200 shadow-md hover:bg-zinc-800 disabled:opacity-50 md:ml-2"
                  onClick={() => {
                    setUploadMyRules(true)
                  }}
                >
                  {<UploadIcon className="m-auto ml-5 h-5" />}{' '}
                  <p className="rules-button-text m-auto ml-1 mr-5">
                    Upload my rules
                  </p>
                </button>
              </span>
            </div>
            <Pagination
              totalItems={communityRules.length}
              currentPage={currentPage}
              pageSize={paging}
              handleForward={() => paginate(currentPage + 1)}
              handleBackward={() => paginate(currentPage - 1)}
            />
          </div>
        ) : (
          <LoadingSpinner />
        )}

        {showInfo ? (
          <Modal
            loading={false}
            onCancel={() => setInfo(false)}
            cancelText={'Close'}
            title={'Community Rule Description'}
            iconSvg={''}
          >
            <div className="block max-h-full w-full max-w-full overflow-auto  bg-zinc-600 p-3 text-zinc-200">
              {originalRules.find((r) => r.id === clickedRule)?.description}
            </div>
          </Modal>
        ) : undefined}

        {uploadMyRules ? (
          <CommunityRuleUpload
            onCancel={() => setUploadMyRules(false)}
            onSubmit={() => setUploadMyRules(false)}
            rules={props.currentRules ? props.currentRules : []}
          />
        ) : undefined}
      </Modal>
    </div>
  )
}
export default CommunityRuleModal
