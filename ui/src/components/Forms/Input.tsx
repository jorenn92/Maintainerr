import clsx from 'clsx'
import { forwardRef, InputHTMLAttributes } from 'react'

type InputProps = {
  name: string
  className?: string
  error?: boolean
} & InputHTMLAttributes<HTMLInputElement>

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, required, error, ...props }: InputProps, ref) => {
    return (
      <input
        {...props}
        ref={ref}
        id={props.id || props.name}
        className={clsx(
          'block w-full min-w-0 flex-1 rounded-md border border-zinc-500 bg-zinc-700 text-white shadow-sm transition duration-150 ease-in-out disabled:opacity-50 sm:text-sm sm:leading-5',
          {
            '!border-red-500 outline-red-500 focus:border-red-500 focus:outline-none focus:ring-0':
              !props.disabled && error,
            className,
          },
        )}
        aria-required={required}
        aria-invalid={error}
      />
    )
  },
)

Input.displayName = 'Input'

type InputGroupProps = {
  name: string
  label: string
  error?: string
} & InputHTMLAttributes<HTMLInputElement>

export const InputGroup = forwardRef<HTMLInputElement, InputGroupProps>(
  ({ label, ...props }: InputGroupProps, ref) => {
    return (
      <div className="mt-6 max-w-6xl sm:mt-5 sm:grid sm:grid-cols-3 sm:items-start sm:gap-4">
        <label htmlFor={props.id || props.name} className="sm:mt-2">
          {label} {props.required && <>*</>}
        </label>
        <div className="px-3 py-2 sm:col-span-2">
          <div className="max-w-xl">
            <Input
              {...props}
              ref={ref}
              aria-describedby={props.error ? `${props.name}-error` : undefined}
              error={!!props.error}
            />
            {props.error && (
              <p
                className={'mt-2 min-h-5 text-sm text-red-500'}
                id={`${props.name}-error`}
              >
                {props.error}
              </p>
            )}
          </div>
        </div>
      </div>
    )
  },
)

InputGroup.displayName = 'InputGroup'
