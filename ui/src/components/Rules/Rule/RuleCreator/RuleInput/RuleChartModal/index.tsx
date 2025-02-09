import { useEffect } from 'react'
import mermaid from 'mermaid'

interface RuleChartModalProps {
  isOpen: boolean
  onClose: () => void
}

const RuleChartModal: React.FC<RuleChartModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden' // Prevent background scrolling

      // Initialize mermaid and render the diagram
      mermaid.initialize({ startOnLoad: true })
      mermaid.contentLoaded()
    }

    // Cleanup function to restore scrolling when the modal closes
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isOpen])

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 transition-opacity ${
        isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      <div className="w-full max-w-3xl rounded-lg bg-zinc-800 p-6 shadow-lg">
        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            Rule Group Visualization
          </h2>
          <button className="text-white hover:text-red-400" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Chart Container */}
        <div className="p-4">
          <div className="mermaid">
            {`graph TD; A[First Rule] -->|AND| B[Second Rule]`}
          </div>
        </div>

        {/* Close Button */}
        <button
          className="mt-4 w-full rounded-lg bg-red-500 py-2 text-white hover:bg-red-400"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  )
}

export default RuleChartModal
