import React, { useState } from 'react'
import {
  X,
  PuzzlePiece,
  CheckCircle,
  DownloadSimple,
  Globe,
  Sparkle,
  WarningCircle,
  CaretDown,
  CaretUp,
  ArrowSquareOut,
  Lightning
} from '@phosphor-icons/react'

export default function DependencyConfirmModal({
  isOpen,
  onClose,
  targetMod,
  missingDependencies = [],
  alreadySatisfied = [],
  onConfirmInstall
}) {
  const [selectedIds, setSelectedIds] = useState(() => {
    return new Set(missingDependencies.map(d => d.modId || d.slug))
  })
  const [showSatisfied, setShowSatisfied] = useState(false)

  if (!isOpen) return null

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleOpenSingleBrowser = (url) => {
    if (!url) return
    if (window.electronAPI?.openBrowserDownloadUrl) {
      window.electronAPI.openBrowserDownloadUrl(url)
    } else if (window.electronAPI?.openExternal) {
      window.electronAPI.openExternal(url)
    }
  }

  const handleInstallAll = () => {
    const chosenMissing = missingDependencies.filter(d => selectedIds.has(d.modId || d.slug))
    onConfirmInstall({
      includeDependencies: true,
      selectedDependencies: chosenMissing,
      autoOpenBrowser: true
    })
  }

  const handleInstallTargetOnly = () => {
    onConfirmInstall({
      includeDependencies: false,
      selectedDependencies: [],
      autoOpenBrowser: false
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-bg1/95 border border-line/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] backdrop-blur-2xl ring-1 ring-white/10">
        {/* Header */}
        <div className="px-6 py-5 border-b border-line/70 flex items-start justify-between gap-4 bg-gradient-to-r from-bg2/80 to-bg1/50">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-accent/20 border border-accent/40 flex items-center justify-center text-accent shrink-0 shadow-lg shadow-accent/15">
              <PuzzlePiece size={24} weight="duotone" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-fg">
                  Dò Tìm Mod Phụ Thuộc
                </h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-accent/20 text-accent border border-accent/30">
                  Auto-Detect
                </span>
              </div>
              <p className="text-xs text-fgfaint mt-1">
                Mod <strong className="text-fg">{targetMod?.name}</strong> yêu cầu các mod sau để Minecraft không bị crash khi khởi động.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-fgfaint hover:text-fg hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0 custom-scrollbar">
          {/* Missing dependencies list */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-black text-fg uppercase tracking-wider flex items-center gap-1.5">
                <span>Mod Còn Thiếu Cần Cài Đặt</span>
                <span className="px-1.5 py-0.2 rounded-md bg-accent/20 text-accent text-[10px]">
                  {missingDependencies.length}
                </span>
              </span>
              <span className="text-[11px] text-accent font-bold">Bắt buộc để chạy mod</span>
            </div>

            <div className="space-y-2">
              {missingDependencies.map((dep, idx) => {
                const key = dep.modId || dep.slug || idx
                const isSelected = selectedIds.has(key)

                return (
                  <div
                    key={key}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-accent/10 border-accent/40 text-fg shadow-sm'
                        : 'bg-bg2/40 border-line/40 text-fgfaint opacity-60'
                    }`}
                  >
                    <div
                      onClick={() => toggleSelect(key)}
                      className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="rounded border-line text-accent focus:ring-accent/40 w-4 h-4 cursor-pointer shrink-0"
                      />
                      {dep.icon ? (
                        <img
                          src={dep.icon}
                          alt=""
                          className="w-9 h-9 rounded-xl object-cover shrink-0 bg-bg2 border border-line/50"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-bg2/80 border border-line/50 flex items-center justify-center text-fgfaint shrink-0">
                          <PuzzlePiece size={18} />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold leading-snug truncate">
                          {dep.name || dep.slug}
                        </div>
                        <div className="text-[10.5px] text-fgfaint truncate font-mono mt-0.5">
                          {dep.fileName}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      {dep.browserUrl && (
                        <button
                          onClick={() => handleOpenSingleBrowser(dep.browserUrl)}
                          title="Mở trình duyệt tải ngay mod này"
                          className="p-1.5 rounded-lg bg-bg2 hover:bg-bg3 text-fgdim hover:text-accent border border-line/60 transition-colors cursor-pointer text-xs"
                        >
                          <ArrowSquareOut size={14} />
                        </button>
                      )}

                      {dep.needsManualDownload ? (
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                          <Globe size={12} />
                          Tự mở duyệt web
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <DownloadSimple size={12} />
                          Tải tự động
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Quick Notice */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-accent/10 to-transparent border border-accent/20 flex items-start gap-2.5 text-xs text-fgdim">
            <Lightning size={18} className="text-accent shrink-0 mt-0.5" weight="fill" />
            <div>
              <strong className="text-fg font-semibold">Tự động hóa thông minh:</strong> Khi chọn cài đặt, launcher sẽ tải các file trực tiếp và <span className="text-accent font-semibold">tự động mở trình duyệt</span> cho các mod còn thiếu, đồng thời tự bắt file trong thư mục Downloads nạp vào game!
            </div>
          </div>

          {/* Already satisfied list (collapsible) */}
          {alreadySatisfied.length > 0 && (
            <div className="pt-2 border-t border-line/40">
              <button
                onClick={() => setShowSatisfied(!showSatisfied)}
                className="w-full flex items-center justify-between text-xs text-fgfaint hover:text-fg py-1.5 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <CheckCircle size={15} className="text-emerald-400" weight="fill" />
                  Đã có sẵn trong profile ({alreadySatisfied.length} mod)
                </span>
                {showSatisfied ? <CaretUp size={13} /> : <CaretDown size={13} />}
              </button>

              {showSatisfied && (
                <div className="mt-2 space-y-1.5 pl-6 text-xs text-fgdim">
                  {alreadySatisfied.map((sat, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>{sat.name || sat.slug || sat.id}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4.5 border-t border-line/70 bg-bg0/60 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-bg2 hover:bg-bg3 text-fg text-xs font-semibold border border-line/60 transition-colors cursor-pointer"
          >
            Hủy
          </button>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleInstallTargetOnly}
              className="px-4 py-2 rounded-xl bg-bg2/80 hover:bg-bg3 text-fgdim hover:text-fg text-xs font-semibold border border-line/60 transition-colors cursor-pointer"
              title="Chỉ cài đặt mod này, bỏ qua các mod phụ thuộc"
            >
              Bỏ qua phụ thuộc
            </button>
            <button
              onClick={handleInstallAll}
              className="px-5 py-2.5 rounded-xl bg-accent hover:bg-accentstrong text-white text-xs font-black flex items-center gap-2 shadow-xl shadow-accent/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Sparkle size={15} weight="fill" />
              Cài Đặt & Mở Tải Mod Thiếu ({selectedIds.size + 1})
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
