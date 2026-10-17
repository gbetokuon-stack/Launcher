import React from 'react'
import { DownloadSimple, Heart, Package, ArrowUpRight } from '@phosphor-icons/react'
import { formatDownloads } from './shared.jsx'

// Loader neon styling & colors
const LOADER_STYLES = {
  fabric:   { badge: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30', dot: 'bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)]', name: 'Fabric' },
  forge:    { badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',    dot: 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]',   name: 'Forge' },
  neoforge: { badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30',       dot: 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.8)]',     name: 'NeoForge' },
  quilt:    { badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',       dot: 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]',     name: 'Quilt' },
  vanilla:  { badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', dot: 'bg-emerald-400', name: 'Vanilla' }
}

export function ModCard({ mod, view, onClick, platform = 'curseforge' }) {
  const { title, icon, author, description, downloads, follows, loaders = [], categories = [] } = mod
  const isCf = platform === 'curseforge'
  const glowBorder = isCf
    ? 'group-hover:border-orange-500/50 group-hover:shadow-[0_12px_28px_rgba(249,115,22,0.18)]'
    : 'group-hover:border-emerald-500/50 group-hover:shadow-[0_12px_28px_rgba(16,185,129,0.18)]'
  const actionBtn = isCf
    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md hover:from-orange-400 hover:to-amber-400'
    : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md hover:from-emerald-400 hover:to-teal-400'

  if (view === 'list') {
    return (
      <div
        onClick={onClick}
        className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl bg-[#15151e]/85 hover:bg-[#1c1c28]/95 border border-white/[0.08] backdrop-blur-xl ${glowBorder} transition-all duration-200 cursor-pointer group text-left relative overflow-hidden`}
      >
        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-[#0e0e14] border border-white/10 p-0.5 group-hover:scale-105 transition-transform duration-200">
          {icon ? <img src={icon} alt="" className="w-full h-full object-cover rounded-lg" /> : (
            <div className="w-full h-full flex items-center justify-center bg-white/5"><Package size={22} className="text-white/40" /></div>
          )}
        </div>
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors truncate">{title}</h4>
            <div className="flex items-center gap-1 shrink-0">
              {loaders.slice(0, 3).map((l) => {
                const conf = LOADER_STYLES[l.toLowerCase()]
                return (
                  <span key={l} className={`text-[9px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${conf?.badge || 'bg-white/5 text-white/60 border-white/10'}`}>
                    <span className={`w-1 h-1 rounded-full ${conf?.dot || 'bg-white/40'}`} />
                    {conf?.name || l}
                  </span>
                )
              })}
            </div>
          </div>
          <p className="text-xs text-white/50 truncate font-normal">{description || 'Không có mô tả chi tiết cho mod này.'}</p>
        </div>
        <div className="hidden lg:flex items-center gap-2 text-xs text-white/60 shrink-0 w-32">
          <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white uppercase">{(author || 'U')[0]}</div>
          <span className="truncate">{author || 'Unknown'}</span>
        </div>
        <div className="flex items-center gap-3 text-xs shrink-0">
          {downloads !== undefined && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/70">
              <DownloadSimple size={13} className="text-emerald-400" />
              <span className="font-semibold text-[11px]">{formatDownloads(downloads)}</span>
            </div>
          )}
          {follows !== undefined && follows > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/70">
              <Heart size={13} className="text-rose-400" />
              <span className="font-semibold text-[11px]">{formatDownloads(follows)}</span>
            </div>
          )}
        </div>
        <div className="shrink-0 pl-2">
          <span className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${actionBtn}`}>
            <span>Xem</span>
            <ArrowUpRight size={13} weight="bold" />
          </span>
        </div>
      </div>
    )
  }

  // Grid view
  return (
    <div
      onClick={onClick}
      className={`group relative flex flex-col rounded-2xl bg-gradient-to-b from-[#171722]/90 via-[#12121a]/95 to-[#0e0e13] border border-white/[0.08] backdrop-blur-xl ${glowBorder} hover:-translate-y-1.5 transition-all duration-300 cursor-pointer overflow-hidden text-left shadow-lg`}
    >
      <div className="relative h-28 w-full bg-gradient-to-b from-white/[0.04] to-transparent p-3 flex items-start justify-between overflow-hidden">
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 group-hover:scale-125 transition-all duration-500 pointer-events-none" />
        <div className="relative z-10 w-16 h-16 rounded-2xl bg-[#0a0a0f] p-1 border border-white/15 shadow-[0_8px_20px_rgba(0,0,0,0.6)] group-hover:scale-110 transition-all duration-300">
          {icon ? <img src={icon} alt="" className="w-full h-full object-cover rounded-xl" loading="lazy" /> : (
            <div className="w-full h-full flex items-center justify-center rounded-xl bg-white/5"><Package size={28} className="text-white/30" /></div>
          )}
        </div>
        <div className="relative z-10 flex flex-col items-end gap-1.5 max-w-[55%]">
          {loaders.length > 0 ? (
            <div className="flex flex-wrap gap-1 justify-end">
              {loaders.slice(0, 2).map((loader) => {
                const conf = LOADER_STYLES[loader.toLowerCase()]
                return (
                  <span key={loader} className={`text-[8.5px] font-black uppercase px-2 py-0.5 rounded-full border backdrop-blur-md flex items-center gap-1 shadow-sm ${conf?.badge || 'bg-white/10 text-white border-white/20'}`}>
                    <span className={`w-1 h-1 rounded-full ${conf?.dot || 'bg-white'}`} />
                    {conf?.name || loader}
                  </span>
                )
              })}
              {loaders.length > 2 && (
                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-white/10 border border-white/10 text-white/70">+{loaders.length - 2}</span>
              )}
            </div>
          ) : (
            <span className="text-[8.5px] font-bold uppercase px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/50">Minecraft</span>
          )}
          {categories.length > 0 && (
            <span className="text-[9px] font-medium text-white/50 bg-black/40 border border-white/5 px-2 py-0.5 rounded-md truncate max-w-full">{categories[0]}</span>
          )}
        </div>
      </div>
      <div className="p-3.5 pt-1 flex-1 flex flex-col justify-between z-10">
        <div>
          <h3 className="text-[13.5px] font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1 leading-snug tracking-tight">{title}</h3>
          <div className="flex items-center gap-1.5 text-[10.5px] text-white/50 mt-1 mb-2">
            <span className="text-white/30">bởi</span>
            <span className="font-medium text-white/80 hover:text-white truncate">{author || 'Ẩn danh'}</span>
          </div>
          <p className="text-[11.5px] text-white/55 line-clamp-2 leading-relaxed h-[34px] font-normal">{description || 'Khám phá và tải mod này cho trải nghiệm Minecraft phong phú.'}</p>
        </div>
        <div className="mt-3 pt-2.5 border-t border-white/[0.07] flex items-center justify-between">
          <div className="flex items-center gap-2">
            {downloads !== undefined && (
              <div className="flex items-center gap-1 text-[11px] font-bold text-white/75 bg-white/[0.04] px-2 py-0.5 rounded-lg border border-white/5">
                <DownloadSimple size={12} className="text-emerald-400" />
                <span>{formatDownloads(downloads)}</span>
              </div>
            )}
            {follows !== undefined && follows > 0 && (
              <div className="flex items-center gap-1 text-[11px] font-bold text-white/75 bg-white/[0.04] px-1.5 py-0.5 rounded-lg border border-white/5">
                <Heart size={12} className="text-rose-400" />
                <span>{formatDownloads(follows)}</span>
              </div>
            )}
          </div>
          <div className="opacity-85 group-hover:opacity-100 transition-opacity">
            <span className={`text-[10.5px] font-extrabold px-2.5 py-1 rounded-xl flex items-center gap-1 ${actionBtn} transition-all transform group-hover:scale-105`}>
              <span>Xem</span>
              <ArrowUpRight size={11} weight="bold" />
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
