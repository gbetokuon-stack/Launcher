import React, { useState, useEffect, useRef, useMemo } from 'react'
import { FunnelSimple, CaretDown, ArrowsDownUp, MagnifyingGlass, Sparkle, ArrowClockwise } from '@phosphor-icons/react'

const isElectron = typeof window !== 'undefined' && !!window.electronAPI

const LOADER_OPTIONS = [
  { value: 'fabric',   label: 'Fabric',   color: 'from-indigo-500/20 to-purple-500/20 text-indigo-300 border-indigo-500/40', activeGlow: 'shadow-[0_0_12px_rgba(99,102,241,0.4)]' },
  { value: 'forge',    label: 'Forge',    color: 'from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/40',   activeGlow: 'shadow-[0_0_12px_rgba(245,158,11,0.4)]' },
  { value: 'neoforge', label: 'NeoForge', color: 'from-rose-500/20 to-pink-500/20 text-rose-300 border-rose-500/40',       activeGlow: 'shadow-[0_0_12px_rgba(244,63,94,0.4)]' },
  { value: 'quilt',    label: 'Quilt',    color: 'from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-500/40',         activeGlow: 'shadow-[0_0_12px_rgba(6,182,212,0.4)]' },
]

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Liên quan' },
  { value: 'downloads', label: 'Tải nhiều' },
  { value: 'follows',   label: 'Theo dõi' },
  { value: 'newest',    label: 'Mới nhất' },
  { value: 'updated',   label: 'Cập nhật' },
]

function VersionGroupDropdown({ value, onChange, groups }) {
  const [open, setOpen] = useState(false)
  const btnRef = useRef(null)
  const menuRef = useRef(null)

  const label = value === 'all' ? 'Tất cả' : `${value}.x`

  useEffect(() => {
    function handler(e) {
      if (!btnRef.current?.contains(e.target) && !menuRef.current?.contains(e.target))
        setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-bold bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-white/80 transition-all"
      >
        <span>{label}</span>
        <CaretDown size={10} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          ref={menuRef}
          className="fixed z-50 rounded-2xl overflow-hidden shadow-2xl bg-[#14141e]/98 border border-white/10 backdrop-blur-2xl py-1.5"
          style={{
            top: btnRef.current?.getBoundingClientRect().bottom + 6,
            left: btnRef.current?.getBoundingClientRect().left,
            minWidth: 150,
            maxHeight: 260,
            overflowY: 'auto',
          }}
        >
          <button
            type="button"
            onClick={() => { onChange('all'); setOpen(false) }}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold transition-all ${value === 'all' ? 'bg-accent/20 text-accent' : 'text-white/70 hover:bg-white/5'}`}
          >
            <span>Tất cả phiên bản</span>
            {value === 'all' && <span className="w-1.5 h-1.5 rounded-full bg-accent" />}
          </button>
          <div className="h-px bg-white/10 my-1 mx-2" />
          {groups.map(group => (
            <button
              key={group.key}
              type="button"
              onClick={() => { onChange(group.key); setOpen(false) }}
              className={`w-full flex items-center justify-between px-3 py-1.5 text-xs transition-all ${value === group.key ? 'bg-accent/20 text-accent font-bold' : 'text-white/65 hover:bg-white/5'}`}
            >
              <span>{group.key}.x</span>
              <span className="text-[10px] text-white/40">{group.count}</span>
            </button>
          ))}
        </div>
      )}
    </>
  )
}



export function ModFilters({ filters, onChange, platform, gameVersions = [], availableLoaders = [], lockFilters = false, total = 0 }) {
  console.log('ModFilters debug:', { lockFilters, filters, availableLoaders })
  const [versionGroup, setVersionGroup] = useState('all')
  const [versionSearch, setVersionSearch] = useState('')
  const [showVersions, setShowVersions] = useState(true)

  // Load game versions
  useEffect(() => {
    if (!isElectron || !window.electronAPI.modrinthGameVersions) return
    window.electronAPI.modrinthGameVersions().catch(() => {})
  }, [])

  const versionGroups = useMemo(() => {
    const groupMap = new Map()
    gameVersions.forEach(item => {
      const v = item.version || item
      const t = item.version_type || item.type || 'release'

      if (t !== 'release' || v.includes('-rc') || v.includes('-pre')) return

      const match = v.match(/^(\d+\.\d+)/)
      if (!match) return
      const key = match[1]
      groupMap.set(key, (groupMap.get(key) || 0) + 1)
    })
    return Array.from(groupMap.entries())
      .map(([key, count]) => ({ key, count }))
      .sort((a, b) => {
        const [aMaj, aMin] = a.key.split('.').map(Number)
        const [bMaj, bMin] = b.key.split('.').map(Number)
        return bMaj !== aMaj ? bMaj - aMaj : bMin - aMin
      })
  }, [gameVersions])

  function toggleLoader(loader) {
    if (lockFilters) return
    const cur = filters.loaders || []
    onChange({ loaders: cur.includes(loader) ? cur.filter(l => l !== loader) : [...cur, loader] })
  }

  function toggleVersion(v) {
    if (lockFilters) return
    const cur = filters.gameVersions || []
    onChange({ gameVersions: cur.includes(v) ? cur.filter(x => x !== v) : [...cur, v] })
  }

  const filteredVersions = gameVersions.filter(item => {
    const vStr = item.version || item
    const type = item.version_type || item.type || 'release'

    if (type !== 'release' || vStr.includes('-rc') || vStr.includes('-pre')) return false

    if (versionSearch && !vStr.toLowerCase().includes(versionSearch.toLowerCase())) return false
    if (versionGroup === 'all') return true

    return vStr === versionGroup || vStr.startsWith(versionGroup + '.')
  })

  const selectedVersions = filters.gameVersions || []
  const selectedLoaders = filters.loaders || []

  return (
    <aside className="w-64 flex-shrink-0 bg-[#12121a]/95 backdrop-blur-2xl border border-white/[0.08] rounded-3xl flex flex-col overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-white/[0.08] bg-white/[0.02] flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-white">
          <div className="p-1.5 rounded-xl bg-accent/20 text-accent">
            <FunnelSimple size={14} weight="bold" />
          </div>
          <span>BỘ LỌC TÙY CHỌN</span>
          {total > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-white/10 text-white/80 border border-white/10">
              {total.toLocaleString()}
            </span>
          )}
        </div>
        {!lockFilters && (selectedLoaders.length > 0 || selectedVersions.length > 0) && (
          <button
            onClick={() => onChange({ ...filters, loaders: [], gameVersions: [] })}
            className="flex items-center gap-1 text-[11px] font-semibold text-rose-400 hover:text-rose-300 px-2 py-0.5 rounded-lg hover:bg-rose-500/10 transition-colors"
          >
            <ArrowClockwise size={11} />
            <span>Reset</span>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5 custom-scrollbar">
        {/* Loaders */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-white/40 uppercase tracking-wider">Mod Loader</span>
            {selectedLoaders.length > 0 && !lockFilters && (
              <span className="text-[10px] text-accent font-bold">{selectedLoaders.length} đã chọn</span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {LOADER_OPTIONS.filter(opt => !availableLoaders.length || availableLoaders.includes(opt.value)).map(opt => {
              const active = selectedLoaders.includes(opt.value)
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggleLoader(opt.value)}
                  disabled={lockFilters}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold border transition-all duration-200 cursor-pointer ${
                    active
                      ? `bg-gradient-to-r ${opt.color} ${opt.activeGlow} scale-[1.02]`
                      : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/[0.06] text-white/60 hover:text-white'
                  }`}
                >
                  <span>{opt.label}</span>
                  {active && <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_#fff]" />}
                </button>
              )
            })}
          </div>
        </div>

        {/* Sort by */}
        <div>
          <div className="flex items-center gap-1.5 mb-2 text-[11px] font-bold text-white/40 uppercase tracking-wider">
            <ArrowsDownUp size={12} />
            <span>Sắp xếp kết quả</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-black/40 border border-white/[0.05]">
            {SORT_OPTIONS.map(opt => {
              const active = filters.sortBy === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onChange({ ...filters, sortBy: opt.value })}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold text-center transition-all ${
                    active
                      ? 'bg-accent text-white shadow-[0_2px_10px_rgba(59,130,246,0.5)] font-bold'
                      : 'text-white/60 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Game Versions */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={() => setShowVersions(v => !v)}
              className="flex items-center gap-1.5 text-[11px] font-bold text-white/40 uppercase tracking-wider hover:text-white transition-colors cursor-pointer"
            >
              <span>Phiên bản Game</span>
              <CaretDown size={11} className={`transition-transform duration-200 ${showVersions ? 'rotate-180' : ''}`} />
            </button>
            <div className="flex items-center gap-1">
              {!lockFilters && <VersionGroupDropdown value={versionGroup} onChange={setVersionGroup} groups={versionGroups} />}
              {selectedVersions.length > 0 && !lockFilters && (
                <button
                  type="button"
                  onClick={() => onChange({ ...filters, gameVersions: [] })}
                  className="px-1.5 py-0.5 rounded-md bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-[10px] font-bold transition-colors"
                >
                  ✕ {selectedVersions.length}
                </button>
              )}
            </div>
          </div>

          {showVersions && (
            <div className="flex-1 flex flex-col min-h-0 bg-black/40 rounded-2xl p-2.5 border border-white/[0.05]">
              {!lockFilters && (
                <div className="relative mb-2">
                  <MagnifyingGlass size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                  <input
                    type="text"
                    value={versionSearch}
                    onChange={e => setVersionSearch(e.target.value)}
                    placeholder="Tìm phiên bản..."
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50 transition-colors"
                  />
                </div>
              )}

              <div className="flex-1 overflow-y-auto max-h-52 flex flex-col gap-1 pr-1 custom-scrollbar">
                {filteredVersions.length === 0 ? (
                  <p className="text-white/40 text-xs py-4 text-center">Không tìm thấy</p>
                ) : (
                  filteredVersions.map(item => {
                    const vStr = item.version || item
                    const active = selectedVersions.includes(vStr)
                    return (
                      <button
                        key={vStr}
                        type="button"
                        onClick={() => toggleVersion(vStr)}
                        disabled={lockFilters}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          active
                            ? 'bg-accent/20 border border-accent/40 text-accent font-bold shadow-sm'
                            : 'text-white/60 hover:text-white hover:bg-white/[0.04] border border-transparent'
                        }`}
                      >
                        <span>{vStr}</span>
                        {active && <span className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_6px_var(--color-accent)]" />}
                      </button>
                    )
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
