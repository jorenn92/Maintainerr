import { useEffect, useState } from 'react'

interface ArrActionProps {
  title: string
  default?: number
  options?: Option[]
  onUpdate: (value: number) => void
}

interface Option {
  id: number
  name: string
}

const ArrAction = (props: ArrActionProps) => {
  const [state, setState] = useState<string>(props.default ? props.default.toString() : '0')

  useEffect(() => {
    setState(props.default ? props.default.toString() : '0')
  }, [props.default])

  const options: Option[] = props.options
    ? props.options
    : [
        {
          id: 0,
          name: 'Delete',
        },
        {
          id: 1,
          name: 'Unmonitor and delete files',
        },
        {
          id: 3,
          name: 'Unmonitor and keep files',
        },
      ]

  return (
    <div className="form-row">
      <label htmlFor={`${props.title}-action`} className="text-label">
        {props.title} Action
      </label>
      <div className="form-input">
        <div className="form-input-field">
          <select
            name={`${props.title}-action`}
            id={`${props.title}-action`}
            value={state}
            onChange={(e: { target: { value: string } }) => {
              setState(e.target.value)
              props.onUpdate(+e.target.value)
            }}
          >
            {options.map((e: Option) => {
              return (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              )
            })}
          </select>
        </div>
      </div>
    </div>
  )
}
export default ArrAction
