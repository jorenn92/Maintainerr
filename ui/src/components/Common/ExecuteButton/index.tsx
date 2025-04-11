import { PlayIcon } from '@heroicons/react/solid'
import { useEffect, useState } from 'react'
import { SmallLoadingSpinner } from '../LoadingSpinner'

interface IExecuteButton {
  text: string
  onClick: () => void
  timeout?: number
  executing?: boolean
}

const ExecuteButton = (props: IExecuteButton) => {
  const [clicked, setClicked] = useState(false)

  useEffect(() => {
    setTimeout(
      () => {
        setClicked(false)
      },
      props.timeout ? props.timeout : 10000,
    )
  }, [clicked])

  const onClick = () => {
    setClicked(true)
    props.onClick()
  }

  return (
    <button
      className="edit-button m-auto flex h-9 rounded text-zinc-200 shadow-md"
      onClick={props.onClick}
      disabled={props.executing}
    >
      {props.executing ? (
        <SmallLoadingSpinner className="m-auto ml-2 h-5" />
      ) : (
        <PlayIcon className="m-auto ml-4 h-5" />
      )}{' '}
      <p className="rules-button-text m-auto ml-1 mr-4">{props.text}</p>
    </button>
  )
}

export default ExecuteButton
