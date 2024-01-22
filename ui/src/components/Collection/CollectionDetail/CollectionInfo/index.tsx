import { useEffect, useState } from 'react'
import { ICollection } from '../..'
import LoadingSpinner from '../../../Common/LoadingSpinner'
import Table from '../../../Common/Table'

interface ICollectionInfo {
  collection: ICollection
}

interface ICollectionInfoLog {
  timestamp: Date
  message: string
}

const CollectionInfo = (props: ICollectionInfo) => {
  const [data, setData] = useState<ICollectionInfoLog[]>()

  useEffect(() => {
    // get logs
  }, [])

  return (
    <div className="w-full">
      <ul className="collection-info">
        <li key={`addDate`}>
          <span>Date Added</span>
          <p className="collection-info-item">
            {props.collection.addDate
              ? new Date(props.collection.addDate).toLocaleDateString()
              : '-'}
          </p>
        </li>
        <li key={`addDate`}>
          <span>Handled media items</span>
          <p className="collection-info-item">
            {props.collection.handledMediaAmount}
          </p>
        </li>
        <li key={`addDate`}>
          <span>Last duration</span>
          <p className="collection-info-item">
            {props.collection.lastDurationInSeconds
              ? formatDuration(props.collection.lastDurationInSeconds)
              : '-'}
          </p>
        </li>
      </ul>

      <div className="text-zinc-300 font-bold heading mt-5">
        <h2>{'Logs'}</h2>
      </div>

      <div className="w-full pl-2 pr-2">
        <Table>
          <thead>
            <tr>
              <Table.TH>{'TIMESTAMP'}</Table.TH>
              <Table.TH>{'EVENT'}</Table.TH>
            </tr>
          </thead>
          <Table.TBody>
            {!data ? (
              <tr>
                <Table.TD colSpan={2} noPadding>
                  <LoadingSpinner />
                </Table.TD>
              </tr>
            ) : (
              data.map((row: ICollectionInfoLog, index: number) => {
                return (
                  <tr key={`log-list-${index}`}>
                    <Table.TD className="text-gray-300">
                      {row.timestamp.toLocaleDateString()}
                    </Table.TD>

                    <Table.TD className="text-gray-300">{row.message}</Table.TD>
                  </tr>
                )
              })
            )}
          </Table.TBody>
        </Table>
      </div>
    </div>
  )
}

const formatDuration = (seconds: number) => {
  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
    { label: 'second', seconds: 1 },
  ]

  const parts = []

  for (const interval of intervals) {
    const value = Math.floor(seconds / interval.seconds)

    if (value > 0) {
      parts.push(`${value} ${interval.label}${value !== 1 ? 's' : ''}`)
      seconds -= value * interval.seconds
    }
  }

  return parts.length > 0 ? parts.join(', ') : '0 seconds'
}

export default CollectionInfo
