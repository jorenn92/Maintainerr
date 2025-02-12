import { useEffect } from 'react'
interface RuleHelpModalProps {
  onClose: () => void
}

const RuleHelpModal: React.FC<RuleHelpModalProps> = ({ onClose }) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const markdownContent = `
## Order:
  Rules run in order from the very first rule, on down to the last rule.
  `

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-65 px-3"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] max-w-2xl flex-col overflow-auto rounded-lg bg-zinc-800 p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="mb-4 text-lg font-semibold text-amber-500">Operators:</p>
        <div className="mb-1 flex flex-wrap rounded-lg bg-zinc-700 px-4 py-2 text-sm">
          <span className="font-semibold text-amber-500">Rules:</span>
          <p className="indent-2">
            Rules are ran in order from the very first rule, on down to the last
            one. As Maintainerr goes through the rules, it is making a{' '}
            <i>list</i> and taking away or adding to the list, depending on rule
            matches.
          </p>
          <p className="mt-2 indent-2">
            When using an <b>AND</b> operator, Maintainerr takes the results
            from the rule above, then looks to see if anything from those
            results meet this rule&apos;s criteria also. Anything that does not,
            is removed from the list.
          </p>
          <p className="mt-2 indent-2">
            When using an <b>OR</b> operator, Maintainerr looks through the{' '}
            <i>entire</i> library again, and anything that meets the{' '}
            <b>OR&apos;s</b> rule criteria is added to the list. Regardless of
            it meeting any other rule&apos;s criteria.
          </p>
          <p className="mt-2 indent-2">
            If you only want items that meet both of your rule criteria, you
            will need to use an <b>AND</b> operator. If you want items that meet
            one OR the other. Then you will use an <b>OR</b> operator.
          </p>
          <span className="mt-3 font-semibold text-amber-500">Sections:</span>
          <p className="mb-2 indent-2">
            This same concept applies to sections, but you should think of a
            section as a group of rules with its own results. Within a section,
            the operators work the same as outlined above. If you only want an
            outcome that meets both section&apos;s criteria use an <b>AND</b>{' '}
            operator. If you want an outcome that meets one or the other, use an{' '}
            <b>OR</b> operator.
          </p>
        </div>
        <div className="my-2 flex justify-end">
          <button
            onClick={onClose}
            className="h-fit rounded bg-amber-600 px-4 py-2 hover:bg-amber-500 focus:outline-none"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default RuleHelpModal
