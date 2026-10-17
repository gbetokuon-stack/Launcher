import React from 'react'
import {
  PuzzlePiece,
  Package,
  Sparkle,
  PaintBrush,
  Database,
} from '@phosphor-icons/react'

const SUB_TABS = [
  { id: 'mod',          label: 'Mods',            Icon: PuzzlePiece },
  { id: 'modpack',      label: 'Modpacks',         Icon: Package     },
  { id: 'shader',       label: 'Shaders',          Icon: Sparkle     },
  { id: 'resourcepack', label: 'Gói tài nguyên',   Icon: PaintBrush  },
  { id: 'datapack',     label: 'Gói dữ liệu',       Icon: Database    },
]

export function ModrinthSubTabs({ active, onChange }) {
  return (
    <div className="flex items-center gap-1.5 p-1 bg-[#12121c]/80 border border-white/[0.08] rounded-2xl backdrop-blur-xl overflow-x-auto scrollbar-hide">
      {SUB_TABS.map(({ id, label, Icon }) => {
        const isActive = active === id
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
              isActive
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-[0_0_16px_rgba(16,185,129,0.4)]'
                : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            <Icon size={15} weight={isActive ? 'fill' : 'duotone'} />
            <span>{label}</span>
          </button>
        )
      })}
    </div>
  )
}

export function CurseForgeSubTabs({ active, onChange }) {
  const tabs = [
    { id: 'mod', label: 'Mods', Icon: PuzzlePiece },
    { id: 'modpack', label: 'Modpacks', Icon: Package },
    { id: 'shader', label: 'Shaders', Icon: Sparkle },
  ]
  
  return (
    <div className="flex items-center gap-1.5 p-1 bg-[#12121c]/80 border border-white/[0.08] rounded-2xl backdrop-blur-xl overflow-x-auto scrollbar-hide">
      {tabs.map(({ id, label, Icon }) => {
        const isActive = active === id
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
              isActive
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-[0_0_16px_rgba(249,115,22,0.4)]'
                : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            <Icon size={15} weight={isActive ? 'fill' : 'duotone'} />
            <span>{label}</span>
          </button>
        )
      })}
    </div>
  )
}

export { SUB_TABS }
