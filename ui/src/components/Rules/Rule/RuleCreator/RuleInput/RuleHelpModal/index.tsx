import { useEffect, useRef } from 'react'

interface RuleHelpModalProps {
  onClose: () => void
}

const RuleHelpModal: React.FC<RuleHelpModalProps> = ({ onClose }) => {
  const modalRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose() // Close only if clicking outside the modal
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div ref={modalRef} className="rounded-lg bg-zinc-800 p-4 shadow-lg">
        <p className="font-semibold text-amber-400">How Operators Work:</p>
        <ul className="mt-2 list-disc space-y-1 pl-4 text-xs">
          <li>
            <strong>AND:</strong> Both conditions must be met.
          </li>
          <li>
            <strong>OR:</strong> At least one condition must be met.
          </li>
        </ul>
        <p className="mt-2 text-xs text-zinc-400">Click outside to close.</p>
      </div>
    </div>
  )
}

export default RuleHelpModal
