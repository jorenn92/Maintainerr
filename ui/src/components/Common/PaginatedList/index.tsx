import React, { useState } from 'react'

interface ListItem {
  id: number
  title: string
}

interface PaginatedListProps {
  items: ListItem[]
  onEdit: (id: number) => void
  onAdd: () => void
  addName?: string
}

const PaginatedList: React.FC<PaginatedListProps> = ({
  items,
  onEdit,
  onAdd,
  addName
}) => {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const totalPages = Math.ceil(items.length / itemsPerPage)

  const currentItems = items.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1)
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1)
  }

  return (
    <div className="max-w-full mx-auto mt-8 p-6 bg-zinc-800 text-zinc-400 rounded-lg shadow-lg">
      <ul className="space-y-3">
        {currentItems.map((item) => (
          <li
            key={item.id}
            className="flex justify-between items-center bg-zinc-700 p-4 rounded-md hover:bg-zinc-600 transition-all"
          >
            <div className="flex flex-col space-y-2">
              <span className="text-lg font-medium">{item.title}</span>
              <button
                onClick={() => onEdit(item.id)}
                className="self-start text-zinc-400 font-bold underline hover:text-amber-600 transition-all"
              >
                Edit
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex justify-between items-center text-white">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-md ${currentPage === 1 ? 'opacity-50 cursor-not-allowed bg-zinc-600' : 'bg-zinc-700 hover:bg-zinc-600'}`}
        >
          Previous
        </button>

        <span className="text-sm">
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded-md ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed bg-zinc-600' : 'bg-zinc-700 hover:bg-zinc-600'}`}
        >
          Next
        </button>
      </div>

      <div className="mt-6 flex justify-center">
        <button
          onClick={onAdd}
          className="inline-flex items-center justify-center border border-transparent leading-5 font-medium focus:outline-none transition ease-in-out duration-150 cursor-pointer disabled:opacity-50 whitespace-nowrap text-white bg-amber-600 border-amber-600 hover:bg-amber-500 hover:border-amber-500 rounded-md focus:border-amber-700 focus:ring-amber active:bg-amber-700 active:border-amber-700 px-4 py-2 text-sm button-md "
        >
          {addName ? addName : 'Add'}
        </button>
      </div>
    </div>
  )
}

export default PaginatedList
