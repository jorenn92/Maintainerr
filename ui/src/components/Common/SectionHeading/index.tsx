import { DocumentAddIcon } from '@heroicons/react/solid'
import { FormEvent } from 'react'

export interface ISectionHeading {
  id: number
  name: string
  description?: string
  addAvailable: boolean
  onAdd: (section: number) => void
}

const SectionHeading = (props: ISectionHeading) => {
  const addRule = (e: FormEvent) => {
    e.preventDefault()
    props.onAdd(props.id)
  }

  return (
    <div className="section h-full w-full">
      <h3 className="sm-heading max-width-form-head flex">
        {props.id ? `${props.name} #${props.id}` : `${props.name} #1`}

        <div className="ml-auto text-amber-500">
          {props.addAvailable ? (
            <button
              className="ml-auto flex h-8 rounded bg-amber-600 shadow-md hover:bg-amber-500"
              onClick={addRule}
              title={`Add rule to section ${props.id}`}
            >
              {<DocumentAddIcon className="m-auto h-5 ml-5 text-zinc-200" />}
              <p className="m-auto ml-1 mr-5 text-zinc-100 button-text">Add to Section</p>
            </button>
          ) : undefined}
        </div>
      </h3>
      {props.description ? (
        <p className="description">{props.description}</p>
      ) : undefined}
    </div>
  )
}
export default SectionHeading
