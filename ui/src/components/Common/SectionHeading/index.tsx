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
    <div className="section mb-4 mt-4 h-full w-full">
      <h3 className="sm-heading flex max-w-6xl">
        {props.id ? `${props.name} #${props.id}` : `${props.name} #1`}
      </h3>
      {props.description ? (
        <p className="description">{props.description}</p>
      ) : undefined}
    </div>
  )
}
export default SectionHeading
