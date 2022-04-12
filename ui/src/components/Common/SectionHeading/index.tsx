import { PlusCircleIcon } from '@heroicons/react/solid'
import { FormEvent } from 'react'

export interface ISectionHeading {
  id: number
  name: string
  description?: string
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
          <button onClick={addRule} title='Add rule to section'>
            <PlusCircleIcon className="h-6 w-6" />
          </button>
        </div>
      </h3>
      {props.description ? (
        <p className="description">{props.description}</p>
      ) : undefined}
    </div>
  )
}
export default SectionHeading
