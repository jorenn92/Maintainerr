import { InformationCircleIcon } from '@heroicons/react/solid'

interface IInfoButton {
  text: string
  onClick: () => void
  enabled?: boolean
}

const InfoButton = (props: IInfoButton) => {
  return (
    <button
      disabled={props.enabled !== undefined ? !props.enabled : false}
      className="bg-zinc-900 hover:bg-zinc-800 md:ml-2 flex mb-2 w-24 rounded h-9 text-zinc-200 shadow-md disabled:opacity-50" 
      onClick={props.onClick}
    >
        {<InformationCircleIcon className="m-auto h-5 ml-5" />}{' '}
        <p className="m-auto rules-button-text ml-1 mr-5">{props.text}</p>
    </button>
  )
}

export default InfoButton
