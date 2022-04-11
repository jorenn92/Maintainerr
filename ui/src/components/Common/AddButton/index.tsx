import { PlusCircleIcon } from '@heroicons/react/solid'

interface IAddButton {
  text: string
  onClick: () => void
}

const AddButton = (props: IAddButton) => {
  return (
    <button
      className="add-button rounded-full text-zinc-900 shadow-md"
      onClick={props.onClick}
    >
      {<PlusCircleIcon className="float-left h-8 w-8" />}
      <p className="rules-button-text">{props.text}</p>
    </button>
  )
}

export default AddButton
