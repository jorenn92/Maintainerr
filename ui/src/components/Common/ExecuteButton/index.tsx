import { PlayIcon } from '@heroicons/react/solid'

interface IExecuteButton {
  text: string
  onClick: () => void
}

const ExecuteButton = (props: IExecuteButton) => {
  return (
    <button
      className="edit-button flex m-auto rounded h-9 text-zinc-200 shadow-md"
      onClick={props.onClick}
    >
        {<PlayIcon className="m-auto h-5 ml-5" />}{' '}
        <p className="m-auto rules-button-text ml-1 mr-5">{props.text}</p>
    </button>
  )
}

export default ExecuteButton
