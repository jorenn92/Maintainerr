import { PlayIcon } from '@heroicons/react/solid'

interface IExecuteButton {
  text: string
  onClick: () => void
}

const ExecuteButton = (props: IExecuteButton) => {
  return (
    <button
      className="edit-button rounded-full text-zinc-900 shadow-md"
      onClick={props.onClick}
    >
      <div className="w-full">
        {<PlayIcon className="float-left h-8 w-8" />}{' '}
        <p className="rules-button-text">{props.text}</p>
      </div>
    </button>
  )
}

export default ExecuteButton
