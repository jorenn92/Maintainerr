// components/ToggleItem.tsx
import React, { useEffect, useState } from 'react'

interface ToggleItemProps {
  label: string
  toggled?: boolean
  onStateChange: (state: boolean) => void
}

const ToggleItem: React.FC<ToggleItemProps> = ({
  label,
  toggled,
  onStateChange,
}) => {
  const [isToggled, setIsToggled] = useState(false)

  useEffect(() => {
    if (toggled !== undefined) {
      setIsToggled(toggled)
    }
  }, [])

  const handleToggle = () => {
    onStateChange(!isToggled)
    setIsToggled(!isToggled)
  }

  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-700">
      <div className="flex items-center">
        <input
          type="checkbox"
          className="border-zinc-600 hover:border-zinc-500 focus:border-zinc-500 focus:bg-opacity-100 focus:placeholder-zinc-400 focus:outline-none focus:ring-0"
          checked={isToggled}
          onChange={handleToggle}
        />
        <span className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-400 cursor-pointer"></span>
        <span className="text-white ml-3">{label}</span>
      </div>
      {/* <a href="#" className="text-blue-400 hover:underline">Edit</a> */}
    </div>
  )
}

export default ToggleItem
