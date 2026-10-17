import React from 'react'
import { ModCard } from './ModCard.jsx'
import { Broadcast, ArrowClockwise, Sparkle } from '@phosphor-icons/react'

export function ModGrid({ mods, view, onSelect, loading, hasMore, onLoadMore, onResetFilters }) {
  if (loading && mods.length === 0) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl bg-[#14141e]/80 border border-white/[0.06] overflow-hidden flex flex-col p-3 animate-pulse"
          >
            <div className="h-24 w-full bg-white/[0.04] rounded-xl mb-3 flex items-center justify-center">
              <div className="w-14 h-14 rounded-xl bg-white/[0.06]" />
            </div>
            <div className="h-4 bg-white/[0.08] rounded-md w-3/4 mb-2" />
            <div className="h-3 bg-white/[0.04] rounded-md w-1/2 mb-3" />
            <div className="h-2.5 bg-white/[0.03] rounded-md w-full mb-1.5" />
            <div className="h-2.5 bg-white/[0.03] rounded-md w-4/5 mt-auto pt-2" />
          </div>
        ))}
      </div>
    )
  }

  if (mods.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center rounded-3xl bg-[#12121a]/50 border border-white/[0.06] backdrop-blur-xl mx-auto max-w-lg">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
          <Broadcast size={32} weight="duotone" />
        </div>
        <h3 className="text-base font-bold text-white mb-1.5">Không tìm thấy mod phù hợp</h3>
        <p className="text-xs text-white/50 max-w-xs mb-4">
          Hãy thử tìm kiếm với từ khóa khác hoặc điều chỉnh lại các bộ lọc mod loader/phiên bản.
        </p>
        {onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-bold text-white transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowClockwise size={13} />
            <span>Làm mới bộ lọc</span>
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="pb-8">
      <div className={
        view === 'grid'
          ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5'
          : 'flex flex-col gap-2'
      }>
        {mods.map((mod) => (
          <ModCard
            key={`${mod.id}-${mod.title}`}
            mod={mod}
            view={view}
            platform={mod.platform}
            onClick={() => onSelect(mod)}
          />
        ))}
      </div>

      {hasMore && (
        <div className="mt-8 mb-4 flex justify-center">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={loading}
            className="px-8 py-2.5 rounded-2xl bg-gradient-to-r from-white/[0.07] to-white/[0.03] hover:from-white/[0.12] hover:to-white/[0.06] border border-white/10 hover:border-white/20 text-xs font-bold text-white shadow-lg transition-all duration-200 cursor-pointer disabled:opacity-50 flex items-center gap-2 group"
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Đang tải thêm nội dung...</span>
              </>
            ) : (
              <>
                <Sparkle size={14} className="text-amber-400 group-hover:rotate-45 transition-transform" />
                <span>Tải thêm kết quả</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
