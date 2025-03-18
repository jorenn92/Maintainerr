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
    <div>
      <h3 className="sm-heading max-width-form-head flex">
        {props.id ? `${props.name} #${props.id}` : `${props.name} #1`}
        <div className="ml-auto text-amber-500">
          {props.addAvailable ? (
            <button
              className="ml-auto flex h-8 rounded bg-amber-600 shadow-md hover:bg-amber-500"
              onClick={addRule}
              title={`Add rule to section ${props.id}`}
            >
              {<DocumentAddIcon className="m-auto ml-5 h-5 text-zinc-200" />}
              <p className="button-text m-auto ml-1 mr-5 text-zinc-100">Add</p>
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
