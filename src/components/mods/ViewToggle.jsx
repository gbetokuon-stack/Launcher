import React from 'react'
import { List, SquaresFour } from '@phosphor-icons/react'

export default function ViewToggle({ view, onChange }) {
  return (
    <div className="flex items-center p-1 rounded-2xl bg-[#12121c]/80 border border-white/[0.08] backdrop-blur-xl">
      <button
        type="button"
        onClick={() => onChange('grid')}
        className={`flex items-center justify-center w-8 h-8 rounded-xl transition-all cursor-pointer ${
          view === 'grid'
            ? 'bg-accent text-white shadow-[0_0_12px_rgba(59,130,246,0.5)]'
            : 'text-white/50 hover:text-white hover:bg-white/[0.06]'
        }`}
        title="Lưới"
      >
        <SquaresFour size={16} weight={view === 'grid' ? 'fill' : 'bold'} />
      </button>
      <button
        type="button"
        onClick={() => onChange('list')}
        className={`flex items-center justify-center w-8 h-8 rounded-xl transition-all cursor-pointer ${
          view === 'list'
            ? 'bg-accent text-white shadow-[0_0_12px_rgba(59,130,246,0.5)]'
            : 'text-white/50 hover:text-white hover:bg-white/[0.06]'
        }`}
        title="Danh sách"
      >
        <List size={16} weight={view === 'list' ? 'bold' : 'regular'} />
      </button>
    </div>
  )
}
