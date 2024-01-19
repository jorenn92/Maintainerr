import { PlayIcon } from '@heroicons/react/solid'
import { useEffect, useState } from 'react'
import { SmallLoadingSpinner } from '../LoadingSpinner'

interface IExecuteButton {
  text: string
  onClick: () => void
}

const ExecuteButton = (props: IExecuteButton) => {
  const [clicked, setClicked] = useState(false)

  useEffect(() => {
    setTimeout(() => {
      setClicked(false)
    }, 10000)
  }, [clicked])
  const onClick = () => {
    setClicked(true)
    props.onClick()
  }

  return (
    <button
      className="edit-button flex m-auto rounded h-9 text-zinc-200 shadow-md"
      disabled={clicked}
      onClick={onClick}
    >
      {clicked ? (
        <SmallLoadingSpinner className="h-5 m-auto ml-2" />
      ) : (
        <PlayIcon className="m-auto h-5 ml-4" />
      )}{' '}
      <p className="m-auto rules-button-text ml-1 mr-4">{props.text}</p>
    </button>
  )
}

export default ExecuteButton
