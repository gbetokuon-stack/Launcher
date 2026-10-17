import React, { useState, useEffect, useRef } from 'react'
import {
  X,
  Globe,
  FolderOpen,
  CheckCircle,
  CircleNotch,
  DownloadSimple,
  Check,
  FileArrowUp,
  Sparkle
} from '@phosphor-icons/react'
import { useToast } from '../../hooks/useToast.jsx'
import { Button } from '../ui.jsx'

export default function ManualDownloadModal({
  isOpen,
  onClose,
  profileId,
  items = [],
  onSuccess,
  autoOpen = true
}) {
  const toast = useToast()
  const [completedIds, setCompletedIds] = useState(new Set())
  const [isDragOver, setIsDragOver] = useState(false)
  const [openingAll, setOpeningAll] = useState(false)
  const hasAutoOpenedRef = useRef(false)
  const isMounted = useRef(true)

  // Filter valid items
  const downloadItems = items.filter(Boolean)

  const handleOpenUrl = (url) => {
    if (!url) return
    if (window.electronAPI?.openBrowserDownloadUrl) {
      window.electronAPI.openBrowserDownloadUrl(url)
    } else if (window.electronAPI?.openExternal) {
      window.electronAPI.openExternal(url)
    }
  }

  const handleOpenAll = () => {
    setOpeningAll(true)
    const pendingItems = downloadItems.filter(item => {
      const key = item.id || item.versionId || item.fileName
      return !completedIds.has(key)
    })

    if (pendingItems.length === 0) {
      setOpeningAll(false)
      return
    }

    pendingItems.forEach((item, index) => {
      setTimeout(() => {
        if (item.browserUrl) handleOpenUrl(item.browserUrl)
        if (index === pendingItems.length - 1) setOpeningAll(false)
      }, index * 800)
    })

    toast.push({
      type: 'info',
      message: `Đang mở ${pendingItems.length} trang tải về trong trình duyệt...`
    })
  }

  // Automatic browser opening when modal opens
  useEffect(() => {
    if (isOpen && autoOpen && downloadItems.length > 0 && !hasAutoOpenedRef.current) {
      hasAutoOpenedRef.current = true
      const timer = setTimeout(() => {
        handleOpenAll()
      }, 400)
      return () => clearTimeout(timer)
    }
  }, [isOpen, autoOpen, downloadItems.length])

  useEffect(() => {
    isMounted.current = true
    if (!isOpen || !profileId || downloadItems.length === 0) return

    // Initialize watcher in Electron
    if (window.electronAPI?.startBrowserDownloadWatcher) {
      window.electronAPI.startBrowserDownloadWatcher({
        profileId,
        expectedFiles: downloadItems.map(item => ({
          id: item.id || item.versionId || item.fileName,
          fileName: item.fileName,
          name: item.name
        }))
      })
    }

    // Subscribe to detected files
    const unsubDetected = window.electronAPI?.onBrowserDownloadDetected?.((data) => {
      if (!isMounted.current) return
      setCompletedIds(prev => {
        const next = new Set(prev)
        next.add(data.id)
        const match = downloadItems.find(it => it.fileName === data.fileName)
        if (match) next.add(match.id || match.versionId || match.fileName)
        return next
      })
      toast.push({
        type: 'success',
        message: `Đã tự động nạp file: ${data.fileName}`
      })
    })

    const unsubAll = window.electronAPI?.onBrowserDownloadAllCompleted?.(() => {
      if (!isMounted.current) return
      toast.push({
        type: 'success',
        message: 'Hoàn tất! Tất cả mod còn thiếu đã được nạp thành công!'
      })
      if (onSuccess) onSuccess()
    })

    return () => {
      isMounted.current = false
      if (unsubDetected) unsubDetected()
      if (unsubAll) unsubAll()
      if (window.electronAPI?.stopBrowserDownloadWatcher) {
        window.electronAPI.stopBrowserDownloadWatcher()
      }
    }
  }, [isOpen, profileId, items])

  if (!isOpen) return null

  const totalCount = downloadItems.length
  const completedCount = downloadItems.filter(item => {
    const key = item.id || item.versionId || item.fileName
    return completedIds.has(key)
  }).length
  const isAllDone = totalCount > 0 && completedCount === totalCount

  const handleOpenDownloadsFolder = () => {
    if (window.electronAPI?.openDownloadsFolder) {
      window.electronAPI.openDownloadsFolder()
    }
  }

  const handlePickFile = async (item) => {
    const key = item.id || item.versionId || item.fileName
    try {
      const res = await window.electronAPI.pickBrowserDownloadFile({
        profileId,
        expectedFileName: item.fileName,
        id: key
      })
      if (res?.ok) {
        setCompletedIds(prev => new Set(prev).add(key))
      } else if (res?.error) {
        toast.push({ type: 'error', message: res.error })
      }
    } catch (err) {
      toast.push({ type: 'error', message: err.message })
    }
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    if (!files.length) return

    for (const f of files) {
      if (!f.name.endsWith('.jar')) continue
      const cleanName = f.name.toLowerCase().replace(/\s*\(\d+\)\.jar$/i, '.jar')
      const matched = downloadItems.find(it => {
        const key = it.id || it.versionId || it.fileName
        return !completedIds.has(key) && it.fileName.toLowerCase() === cleanName
      })

      if (matched) {
        const key = matched.id || matched.versionId || matched.fileName
        try {
          const res = await window.electronAPI.dropBrowserDownloadFile({
            profileId,
            filePath: f.path,
            expectedFileName: matched.fileName,
            id: key
          })
          if (res?.ok) {
            setCompletedIds(prev => new Set(prev).add(key))
            toast.push({ type: 'success', message: `Đã nạp file: ${matched.fileName}` })
          }
        } catch {}
      } else {
        toast.push({
          type: 'warn',
          message: `File ${f.name} không khớp với mod đang chờ nạp.`
        })
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`w-full max-w-2xl bg-bg1/95 border ${
          isDragOver ? 'border-accent shadow-2xl shadow-accent/25 ring-2 ring-accent' : 'border-line/80 ring-1 ring-white/10'
        } rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] backdrop-blur-2xl transition-all duration-200`}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-line/70 flex items-start justify-between gap-4 bg-gradient-to-r from-bg2/90 via-bg1 to-bg1">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-accent/20 border border-accent/40 text-accent flex items-center justify-center shrink-0 shadow-lg shadow-accent/15">
              <Globe size={24} weight="duotone" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-fg">
                  Tải Mod Còn Thiếu Cho Modpack
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold bg-accent/20 text-accent border border-accent/30 shadow-[0_0_10px_var(--color-accentsoft)]">
                  {completedCount}/{totalCount} hoàn tất
                </span>
              </div>
              <p className="text-xs text-fgfaint mt-1 leading-relaxed">
                Launcher đang tự động mở trình duyệt tải mod. Khi file tải về thư mục Downloads, hệ thống sẽ <span className="text-accent font-semibold">tự động bắt và nạp vào game</span>.
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

        {/* Global Toolbar */}
        <div className="px-6 py-3 bg-bg0/60 border-b border-line/70 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2.5">
            <Button
              variant="primary"
              size="xs"
              onClick={handleOpenAll}
              disabled={openingAll || isAllDone}
              className="gap-2 rounded-xl px-3 py-1.5 font-bold shadow-md shadow-accent/20"
            >
              {openingAll ? <CircleNotch size={14} className="animate-spin" /> : <Globe size={14} weight="bold" />}
              Mở lại trên trình duyệt
            </Button>
            <Button
              variant="subtle"
              size="xs"
              onClick={handleOpenDownloadsFolder}
              className="gap-2 rounded-xl px-3 py-1.5 font-medium border border-line/60 bg-bg2/80 hover:bg-bg3"
            >
              <FolderOpen size={14} />
              Thư mục Downloads
            </Button>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/25">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
            Đang tự động theo dõi Downloads
          </div>
        </div>

        {/* List of missing mods */}
        <div className="flex-1 overflow-y-auto p-6 space-y-2.5 min-h-0 bg-bg0/30 custom-scrollbar">
          {downloadItems.map((item, idx) => {
            const key = item.id || item.versionId || item.fileName
            const isDone = completedIds.has(key)

            return (
              <div
                key={key || idx}
                className={`p-3.5 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-3 ${
                  isDone
                    ? 'bg-emerald-500/10 border-emerald-500/40 shadow-sm shadow-emerald-500/10'
                    : 'bg-bg1/80 border-line/70 hover:border-accent/40 hover:bg-bg2/60'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                      isDone
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-md shadow-emerald-500/20'
                        : 'bg-bg2/80 text-fgdim border-line/60'
                    }`}
                  >
                    {isDone ? (
                      <Check size={18} weight="bold" />
                    ) : (
                      <DownloadSimple size={18} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-fg truncate">
                        {item.name || item.fileName}
                      </span>
                      {item.platform && (
                        <span className="text-[9.5px] px-1.5 py-0.5 rounded-md bg-white/5 border border-line text-fgfaint uppercase font-extrabold">
                          {item.platform}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-fgfaint truncate font-mono mt-0.5">
                      {item.fileName}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isDone ? (
                    <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 shadow-sm">
                      <Check size={14} weight="bold" />
                      Đã nạp xong
                    </span>
                  ) : (
                    <>
                      <Button
                        variant="subtle"
                        size="xs"
                        onClick={() => handleOpenUrl(item.browserUrl)}
                        className="gap-1.5 text-accent font-bold rounded-xl border border-accent/30 bg-accent/10 hover:bg-accent/20"
                        title="Mở liên kết tải trong trình duyệt"
                      >
                        <Globe size={13} weight="bold" />
                        Mở tải về
                      </Button>
                      <Button
                        variant="subtle"
                        size="xs"
                        onClick={() => handlePickFile(item)}
                        className="rounded-xl border border-line/60 bg-bg2/80 hover:bg-bg3"
                        title="Chọn file từ máy tính"
                      >
                        Chọn file
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )
          })}

          {/* Drag & drop banner */}
          <div
            className={`border-2 border-dashed rounded-2xl p-4 text-center text-xs transition-all duration-200 ${
              isDragOver
                ? 'border-accent bg-accent/15 text-accent shadow-xl scale-[1.01]'
                : 'border-line/70 bg-bg1/40 text-fgfaint hover:border-line hover:text-fgdim'
            }`}
          >
            <FileArrowUp size={22} className="mx-auto mb-1.5 opacity-70 text-accent" />
            <span className="font-semibold text-fg">Kéo thả file <code>.jar</code> vào đây</span> nếu bạn đã tải xong về máy
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-line/70 bg-bg0/70 flex items-center justify-between gap-4">
          <div className="text-xs text-fgdim">
            Đã hoàn thành <strong className="text-accent font-black">{completedCount}</strong> / {totalCount} mod
          </div>

          <div className="flex items-center gap-2.5">
            {isAllDone ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  if (onSuccess) onSuccess()
                  onClose()
                }}
                className="gap-1.5"
              >
                <Check size={14} weight="bold" />
                Hoàn tất
              </Button>
            ) : (
              <Button
                variant="subtle"
                size="sm"
                onClick={onClose}
              >
                Đóng (có thể nạp sau)
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
