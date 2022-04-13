import { PlusCircleIcon } from '@heroicons/react/solid'

interface IAddButton {
  text: string
  onClick: () => void
}

const AddButton = (props: IAddButton) => {
  return (
    <button
      className="add-button bg-amber-600 hover:bg-amber-500 flex m-auto h-9 rounded text-zinc-200 shadow-md"
      onClick={props.onClick}
    >
      {<PlusCircleIcon className="m-auto h-5 ml-5" />}
      <p className="m-auto rules-button-text ml-1 mr-5">{props.text}</p>
    </button>
  )
}

export default AddButton
