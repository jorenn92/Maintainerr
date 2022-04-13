import { ReactNode } from 'react'

interface IEditButton {
  text: string
  svgIcon: ReactNode
  onClick: () => void
}

const EditButton = (props: IEditButton) => {
  return (
    <button
      className="bg-amber-600 hover:bg-amber-500 right-5 m-auto flex h-8 w-full rounded text-zinc-200 shadow-md"
      onClick={props.onClick}
    >
      <div className='m-auto ml-auto flex'>
        {props.svgIcon}
        <p className="button-text m-auto ml-1 text-zinc-200">{props.text}</p>
      </div>
    </button>
  )
}

export default EditButton
