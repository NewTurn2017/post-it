import React from 'react'

interface ToolbarProps {
  onNewNote: () => void
  onFilter: (categoryId: string | null) => void
  onLogout: () => void
  categories: { _id: string; name: string }[]
  filterCategoryId: string | null
}

export function Toolbar({
  onNewNote,
  onFilter,
  onLogout,
  categories,
  filterCategoryId,
}: ToolbarProps) {
  return (
    <div
      className='fixed top-0 left-0 w-full z-40 flex items-center justify-between px-8 py-3'
      style={{ background: 'none' }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: 70,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      >
        <svg width='100%' height='70'>
          <rect x='0' y='0' width='100%' height='70' fill='#fef9c3' />
          <rect
            x='0'
            y='0'
            width='100%'
            height='70'
            fill='url(#toolbarGradient)'
            opacity='0.5'
          />
          <defs>
            <linearGradient
              id='toolbarGradient'
              x1='0'
              y1='0'
              x2='100%'
              y2='70'
              gradientUnits='userSpaceOnUse'
            >
              <stop stopColor='#fffde4' />
              <stop offset='1' stopColor='#ffe9a7' />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className='flex items-center gap-4' style={{ zIndex: 1 }}>
        <button
          className='px-4 py-2 bg-yellow-400 rounded shadow hover:bg-yellow-500 font-bold'
          onClick={onNewNote}
        >
          + New Note
        </button>
        <select
          className='px-2 py-1 rounded border border-yellow-300'
          value={filterCategoryId ?? ''}
          onChange={(e) => onFilter(e.target.value || null)}
        >
          <option value=''>All</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>
      <button
        className='px-4 py-2 bg-gray-400 rounded shadow hover:bg-gray-500 font-bold'
        onClick={onLogout}
        style={{ zIndex: 1 }}
      >
        Logout
      </button>
    </div>
  )
}
