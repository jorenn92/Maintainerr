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
      <h3 className="sm-heading flex max-w-6xl">
        {props.id ? `${props.name} #${props.id}` : `${props.name} #1`}

        <div className="ml-auto text-amber-500">
          {props.addAvailable ? (
            <button
              className="ml-auto flex h-7 rounded bg-amber-600 text-sm shadow-md hover:bg-amber-500 md:h-8 md:text-base"
              onClick={addRule}
              title={`Add rule to section ${props.id}`}
            >
              {<DocumentAddIcon className="m-auto ml-5 h-5 text-zinc-200" />}
              <p className="button-text m-auto ml-1 mr-5 text-zinc-100">
                Add Rule
              </p>
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
