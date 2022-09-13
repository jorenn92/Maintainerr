import { useEffect, useState } from 'react'
import GetApiHandler from '../../../utils/ApiHandler'
import { IRuleJson } from '../../Rules/Rule'
import { IRule } from '../../Rules/Rule/RuleCreator'
import Alert from '../Alert'
import CommunityRuleTableRow from '../CommunityRowTableRow'
import LoadingSpinner from '../LoadingSpinner'
import Modal from '../Modal'
import Pagination from '../Pagination'

interface ICommunityRuleModal {
  onUpdate: (rules: IRule[]) => void
  onCancel: () => void
}

export interface ICommunityRule {
  id?: number
  karma?: number
  name: string
  description: string
  JsonRules: IRule
}

const CommunityRuleModal = (props: ICommunityRuleModal) => {
  const [communityRules, setCommunityRules] = useState<ICommunityRule[]>([])
  const [shownRules, setShownRules] = useState<ICommunityRule[]>([])
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [clickedRule, setClickedRule] = useState<number>(-1)
  const paging = 5

  useEffect(() => {
    GetApiHandler('/rules/community/').then((resp: ICommunityRule[]) => {
      if (resp) {
        if (!('code' in resp)) {
          setCommunityRules(resp)
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
  }, [])

  const paginate = (forward: boolean) => {
    if (forward) {
      setShownRules(
        communityRules.slice(
          (currentPage + 1 - 1) * paging,
          (currentPage + 1) * paging
        )
      )
      setCurrentPage(currentPage + 1)
    } else {
      setShownRules(
        communityRules.slice(
          (currentPage - 1 - 1) * paging,
          (currentPage - 1) * paging
        )
      )
      setCurrentPage(currentPage - 1)
    }
  }

  const handleCancel = () => {
    props.onCancel()
  }

  const handleClick = (id: number) => {
    setClickedRule(id)
  }

  return (
    <Modal
      loading={false}
      backgroundClickable
      onCancel={handleCancel}
      okDisabled={true}
      title={'Community Rules'}
      iconSvg={''}
    >
      <div className="mt-6">
        <Alert
          title={`Add rules made by the community. WARNING: This will override your current rules`}
          type="info"
        />
      </div>
      {shownRules.length > 0 ? (
        <div className="flex flex-col">
          <div className="my-2 -mx-4 overflow-x-auto md:mx-0 lg:mx-0">
            <div className="inline-block min-w-full py-2 align-middle">
              <div className="overflow-hidden rounded-lg shadow md:mx-0 lg:mx-0">
                <table className="ml-2 mr-2 min-w-full table-fixed">
                  <tbody className="divide-y divide-zinc-600 bg-zinc-800">
                    <tr>
                      <th className="truncate bg-gray-500 px-4 py-3 text-left text-xs font-medium uppercase leading-4 tracking-wider text-gray-200">
                        Name
                      </th>
                      <th className="truncate bg-gray-500 px-4 py-3 text-left text-xs font-medium uppercase leading-4 tracking-wider text-gray-200">
                        Karma
                      </th>
                    </tr>
                    {shownRules.map((cr) => {
                      return (
                        <CommunityRuleTableRow
                          key={cr.id}
                          clicked={clickedRule === cr.id}
                          onClick={handleClick}
                          rule={cr}
                        />
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <Pagination
            totalItems={communityRules.length}
            currentPage={currentPage}
            pageSize={paging}
            handleForward={() => paginate(true)}
            handleBackward={() => paginate(false)}
          />
        </div>
      ) : (
        <LoadingSpinner />
      )}
    </Modal>
  )
}
export default CommunityRuleModal
