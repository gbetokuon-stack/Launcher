import React, { useState, useEffect, useMemo } from 'react'
import {
  CloudArrowDown,
  ArrowClockwise,
  Folder,
  FolderOpen,
  File,
  HardDrives,
  CheckCircle,
  WarningCircle,
  XCircle,
  Trash,
  FloppyDisk,
  MagnifyingGlass,
  ArrowUp,
  DownloadSimple,
  ShieldCheck,
  Check,
  X,
  Play
} from '@phosphor-icons/react'
import { Button, Card, Badge } from '../../ui.jsx'

export default function FtpTab({ selectedProfileId, pageContext }) {
  const [presets, setPresets] = useState([])
  const [selectedPresetId, setSelectedPresetId] = useState('')
  const [host, setHost] = useState('127.0.0.1')
  const [port, setPort] = useState('21')
  const [user, setUser] = useState('anonymous')
  const [password, setPassword] = useState('')
  const [remotePath, setRemotePath] = useState('/mods')
  const [presetName, setPresetName] = useState('Máy chủ Mods FTP')
  const [cleanSync, setCleanSync] = useState(true)

  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [connError, setConnError] = useState(null)
  const [currentPath, setCurrentPath] = useState('/mods')
  const [files, setFiles] = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncProgress, setSyncProgress] = useState(null)
  const [syncResult, setSyncResult] = useState(null)
  const [singleDownloading, setSingleDownloading] = useState(null)

  const isElectron = typeof window !== 'undefined' && !!window.electronAPI

  // Load presets on mount
  useEffect(() => {
    if (!isElectron) return
    window.electronAPI.ftpGetPresets().then((saved) => {
      if (Array.isArray(saved) && saved.length > 0) {
        setPresets(saved)
        applyPreset(saved[0])
      }
    }).catch(() => {})

    // Listen for sync progress events
    const unsub = window.electronAPI.onFtpSyncProgress((data) => {
      setSyncProgress(data)
    })
    return () => unsub && unsub()
  }, [isElectron])

  const applyPreset = (p) => {
    if (!p) return
    setSelectedPresetId(p.id)
    setPresetName(p.name || '')
    setHost(p.host || '')
    setPort(p.port ? String(p.port) : '21')
    setUser(p.user || 'anonymous')
    setPassword(p.password || '')
    setRemotePath(p.remotePath || '/mods')
    setCleanSync(p.cleanSync !== undefined ? p.cleanSync : true)
    setConnected(false)
    setFiles([])
    setConnError(null)
  }

  const handleSelectPreset = (e) => {
    const val = e.target.value
    if (val === 'new') {
      setSelectedPresetId('new')
      setPresetName('Máy chủ mới')
      setHost('')
      setPort('21')
      setUser('anonymous')
      setPassword('')
      setRemotePath('/mods')
      setConnected(false)
      setFiles([])
    } else {
      const found = presets.find((p) => p.id === val)
      if (found) applyPreset(found)
    }
  }

  const handleSavePreset = async () => {
    if (!isElectron) return
    if (!host.trim()) {
      setConnError('Vui lòng nhập địa chỉ Host/IP của máy chủ FTP')
      return
    }
    const presetData = {
      id: selectedPresetId !== 'new' ? selectedPresetId : undefined,
      name: presetName.trim() || host.trim(),
      host: host.trim(),
      port: parseInt(port || '21', 10),
      user: user.trim(),
      password,
      remotePath: remotePath.trim() || '/mods',
      cleanSync,
    }

    const res = await window.electronAPI.ftpSavePreset(presetData)
    if (res?.ok) {
      setPresets(res.presets)
      setSelectedPresetId(res.preset.id)
      setConnError(null)
    } else if (res?.error) {
      setConnError(res.error)
    }
  }

  const handleDeletePreset = async () => {
    if (!isElectron || selectedPresetId === 'new') return
    const res = await window.electronAPI.ftpDeletePreset(selectedPresetId)
    if (res?.ok) {
      setPresets(res.presets)
      if (res.presets.length > 0) {
        applyPreset(res.presets[0])
      } else {
        setSelectedPresetId('new')
      }
    }
  }

  const getConfig = () => ({
    host: host.trim(),
    port: parseInt(port || '21', 10),
    user: user.trim() || 'anonymous',
    password,
    remotePath: remotePath.trim() || '/mods',
  })

  // Test connection and list files
  const handleConnect = async (targetFolder) => {
    if (!isElectron) {
      setConnError('Môi trường trình duyệt không hỗ trợ FTP IPC')
      return
    }
    if (!host.trim()) {
      setConnError('Vui lòng nhập địa chỉ máy chủ FTP (Host / IP)')
      return
    }

    setConnecting(true)
    setConnError(null)
    setSyncResult(null)

    const folderToList = targetFolder !== undefined ? targetFolder : remotePath
    const res = await window.electronAPI.ftpListDirectory({
      config: getConfig(),
      remotePath: folderToList,
      profileId: selectedProfileId,
    })

    setConnecting(false)
    if (res?.ok) {
      setConnected(true)
      setCurrentPath(res.currentPath)
      setFiles(res.files || [])
    } else {
      setConnected(false)
      setConnError(res?.error || 'Không thể kết nối đến máy chủ FTP')
    }
  }

  const handleNavigateUp = () => {
    if (currentPath === '/' || !currentPath) return
    const parts = currentPath.split('/').filter(Boolean)
    parts.pop()
    const parent = '/' + parts.join('/')
    handleConnect(parent)
  }

  const handleOpenFolder = (dirName) => {
    const next = currentPath.endsWith('/') ? currentPath + dirName : currentPath + '/' + dirName
    handleConnect(next)
  }

  // Single file download
  const handleDownloadSingle = async (file) => {
    if (!isElectron || !selectedProfileId) return
    setSingleDownloading(file.name)
    try {
      const res = await window.electronAPI.ftpDownloadFile({
        config: getConfig(),
        remotePath: currentPath,
        filename: file.name,
        profileId: selectedProfileId,
        targetSubdir: 'mods',
      })
      if (res?.ok) {
        // Refresh directory listing to update status
        handleConnect(currentPath)
      } else {
        alert('Lỗi tải file: ' + (res?.error || 'Lỗi không xác định'))
      }
    } finally {
      setSingleDownloading(null)
    }
  }

  // Full Mods Sync
  const handleStartSync = async () => {
    if (!isElectron) return
    if (!selectedProfileId) {
      setConnError('Vui lòng chọn một profile Minecraft để đồng bộ mods!')
      return
    }

    setIsSyncing(true)
    setSyncProgress({ phase: 'connecting', message: 'Bắt đầu quá trình đồng bộ...', percent: 0 })
    setSyncResult(null)

    const res = await window.electronAPI.ftpSyncMods({
      config: { ...getConfig(), remotePath: currentPath },
      profileId: selectedProfileId,
      cleanSync,
    })

    setIsSyncing(false)
    if (res?.ok) {
      setSyncResult(res)
      // Refresh list to update installed badges
      handleConnect(currentPath)
    } else {
      setConnError(res?.error || 'Quá trình đồng bộ thất bại')
    }
  }

  const handleCancelSync = async () => {
    if (!isElectron) return
    await window.electronAPI.ftpCancelSync()
    setIsSyncing(false)
  }

  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) return files
    const q = searchQuery.toLowerCase()
    return files.filter((f) => f.name.toLowerCase().includes(q))
  }, [files, searchQuery])

  const modStats = useMemo(() => {
    const modFiles = files.filter((f) => !f.isDirectory && f.isModFile)
    const installed = modFiles.filter((f) => f.status === 'installed').length
    const updates = modFiles.filter((f) => f.status === 'update_available').length
    const notInstalled = modFiles.filter((f) => f.status === 'new').length
    return { total: modFiles.length, installed, updates, notInstalled }
  }, [files])

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 min-w-0 p-6 space-y-5 overflow-y-auto">
      {/* FTP Connection Configuration Bar */}
      <div className="p-5 rounded-2xl bg-bg1 border border-line shadow-lg backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-line/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accentsoft/20 flex items-center justify-center text-accent">
              <HardDrives size={24} weight="duotone" />
            </div>
            <div>
              <h3 className="text-base font-bold text-fg flex items-center gap-2">
                Máy chủ FTP Mods
                {connected && (
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Đã kết nối
                  </span>
                )}
              </h3>
              <p className="text-xs text-fgfaint">
                Tải mod và đồng bộ hoá trực tiếp từ máy chủ FTP của cộng đồng hoặc server cá nhân
              </p>
            </div>
          </div>

          {/* Preset selector & actions */}
          <div className="flex items-center gap-2">
            <select
              value={selectedPresetId}
              onChange={handleSelectPreset}
              className="bg-bg0 border border-line rounded-xl px-3 py-1.5 text-xs text-fg focus:outline-none focus:border-accent"
            >
              {presets.map((p) => (
                <option key={p.id} value={p.id}>
                  📁 {p.name} ({p.host})
                </option>
              ))}
              <option value="new">+ Thêm cấu hình FTP mới...</option>
            </select>

            <Button variant="subtle" size="sm" onClick={handleSavePreset} title="Lưu cấu hình máy chủ">
              <FloppyDisk size={15} weight="bold" />
              Lưu
            </Button>

            {selectedPresetId !== 'new' && (
              <button
                onClick={handleDeletePreset}
                className="p-2 text-fgdim hover:text-error hover:bg-errorsoft/20 rounded-lg transition-colors"
                title="Xóa cấu hình này"
              >
                <Trash size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Input fields */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-4">
          <div className="md:col-span-3">
            <label className="text-[10px] uppercase font-bold text-fgfaint mb-1 block">Tên cấu hình</label>
            <input
              type="text"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              placeholder="VD: Server SMP Clan"
              className="w-full bg-bg0 border border-line rounded-lg px-3 py-1.5 text-xs text-fg focus:outline-none focus:border-accent"
            />
          </div>

          <div className="md:col-span-3">
            <label className="text-[10px] uppercase font-bold text-fgfaint mb-1 block">Host / IP</label>
            <input
              type="text"
              value={host}
              onChange={(e) => setHost(e.target.value)}
              placeholder="123.45.67.89 hoặc ftp.example.com"
              className="w-full bg-bg0 border border-line rounded-lg px-3 py-1.5 text-xs text-fg focus:outline-none focus:border-accent"
            />
          </div>

          <div className="md:col-span-1">
            <label className="text-[10px] uppercase font-bold text-fgfaint mb-1 block">Cổng</label>
            <input
              type="number"
              value={port}
              onChange={(e) => setPort(e.target.value)}
              placeholder="21"
              className="w-full bg-bg0 border border-line rounded-lg px-3 py-1.5 text-xs text-fg focus:outline-none focus:border-accent"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-[10px] uppercase font-bold text-fgfaint mb-1 block">Tài khoản</label>
            <input
              type="text"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              placeholder="anonymous"
              className="w-full bg-bg0 border border-line rounded-lg px-3 py-1.5 text-xs text-fg focus:outline-none focus:border-accent"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-[10px] uppercase font-bold text-fgfaint mb-1 block">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Để trống nếu anonymous"
              className="w-full bg-bg0 border border-line rounded-lg px-3 py-1.5 text-xs text-fg focus:outline-none focus:border-accent"
            />
          </div>

          <div className="md:col-span-1 flex items-end">
            <Button
              variant="primary"
              size="sm"
              className="w-full justify-center"
              onClick={() => handleConnect(remotePath)}
              loading={connecting}
              disabled={connecting}
            >
              <ArrowClockwise size={14} weight="bold" />
              Kết nối
            </Button>
          </div>
        </div>

        {connError && (
          <div className="mt-3 p-3 rounded-lg bg-errorsoft/30 border border-error/30 text-error text-xs flex items-center justify-between">
            <span className="flex items-center gap-2">
              <XCircle size={16} weight="bold" />
              {connError}
            </span>
            <button onClick={() => setConnError(null)} className="text-error hover:underline text-[11px]">
              Đóng
            </button>
          </div>
        )}
      </div>

      {/* Sync Action Banner */}
      {connected && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-accentsoft/30 via-bg1 to-bg1 border border-accent/30 shadow-xl flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CloudArrowDown size={22} weight="duotone" className="text-accent" />
              <h4 className="text-sm font-bold text-fg">Đồng bộ Mods tự động</h4>
              <span className="text-xs text-fgdim">
                Thư mục: <code className="px-1.5 py-0.5 rounded bg-bg0 text-accent font-mono text-[11px]">{currentPath}</code>
              </span>
            </div>
            <p className="text-xs text-fgdim">
              Tìm thấy <strong className="text-fg">{modStats.total}</strong> mods trên máy chủ:{' '}
              <span className="text-emerald-400 font-semibold">{modStats.installed} đã có</span>,{' '}
              <span className="text-amber-400 font-semibold">{modStats.updates} cần cập nhật</span>,{' '}
              <span className="text-indigo-400 font-semibold">{modStats.notInstalled} chưa tải</span>.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-xs text-fgdim hover:text-fg cursor-pointer select-none">
              <input
                type="checkbox"
                checked={cleanSync}
                onChange={(e) => setCleanSync(e.target.checked)}
                className="rounded border-line bg-bg0 text-accent focus:ring-0"
              />
              <span>Đồng bộ sạch (Xoá mod thừa không có trên FTP)</span>
            </label>

            <Button
              variant="primary"
              size="md"
              onClick={handleStartSync}
              disabled={isSyncing}
              className="shadow-lg shadow-accent/20"
            >
              <CloudArrowDown size={18} weight="bold" />
              ĐỒNG BỘ TẤT CẢ MODS
            </Button>
          </div>
        </div>
      )}

      {/* Sync Success Card */}
      {syncResult && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CheckCircle size={20} weight="fill" className="text-emerald-400" />
            <div>
              <p className="font-bold text-emerald-200">Đồng bộ hoàn tất thành công!</p>
              <p className="text-[11px] text-emerald-300/80">
                Đã tải {syncResult.downloadedCount} mods, dọn dẹp {syncResult.deletedCount} mods cũ. Tổng số mods hiện tại: {syncResult.totalRemoteMods}.
              </p>
            </div>
          </div>
          <button onClick={() => setSyncResult(null)} className="text-emerald-400 hover:text-emerald-200 text-xs font-semibold">
            Đóng
          </button>
        </div>
      )}

      {/* Remote File Explorer */}
      {connected ? (
        <div className="flex-1 flex flex-col min-h-[350px] rounded-2xl bg-bg1 border border-line overflow-hidden shadow-lg">
          {/* Header & Path Bar */}
          <div className="px-5 py-3 border-b border-line bg-bg0/60 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handleNavigateUp}
                disabled={currentPath === '/' || !currentPath}
                className="p-1.5 rounded-lg bg-bg1 hover:bg-bg2 border border-line text-fgdim hover:text-fg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Lên thư mục cha"
              >
                <ArrowUp size={14} weight="bold" />
              </button>
              <span className="text-xs font-mono text-fg bg-bg1 px-2.5 py-1 rounded-lg border border-line">
                {currentPath || '/'}
              </span>
            </div>

            {/* Search file */}
            <div className="relative w-64">
              <MagnifyingGlass size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-fgfaint" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm tên file mod..."
                className="w-full bg-bg1 border border-line rounded-lg pl-8 pr-3 py-1 text-xs text-fg placeholder:text-fgfaint focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          {/* Files List */}
          <div className="flex-1 overflow-y-auto divide-y divide-line/40">
            {filteredFiles.length === 0 ? (
              <div className="p-12 text-center text-fgdim">
                <FolderOpen size={40} weight="thin" className="mx-auto mb-2 opacity-40" />
                <p className="text-sm font-semibold">Không tìm thấy file nào trong thư mục này</p>
                <p className="text-xs text-fgfaint mt-1">Đảm bảo đường dẫn máy chủ trỏ đúng vào thư mục chứa mods</p>
              </div>
            ) : (
              filteredFiles.map((file) => (
                <div
                  key={file.name}
                  className="px-5 py-3 flex items-center justify-between hover:bg-bg2/40 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {file.isDirectory ? (
                      <Folder size={20} weight="fill" className="text-amber-400 shrink-0" />
                    ) : (
                      <File size={20} weight="duotone" className="text-accent shrink-0" />
                    )}

                    <div className="min-w-0">
                      {file.isDirectory ? (
                        <button
                          onClick={() => handleOpenFolder(file.name)}
                          className="text-xs font-bold text-fg hover:text-accent truncate block text-left transition-colors"
                        >
                          {file.name}
                        </button>
                      ) : (
                        <p className="text-xs font-semibold text-fg truncate">{file.name}</p>
                      )}
                      <p className="text-[10px] text-fgfaint">
                        {file.isDirectory ? 'Thư mục' : formatBytes(file.size)}
                        {file.modifiedAt && ` • ${new Date(file.modifiedAt).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {/* Status badge for mod files */}
                    {!file.isDirectory && file.isModFile && (
                      <>
                        {file.status === 'installed' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Đã cài đặt
                          </span>
                        )}
                        {file.status === 'update_available' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Cần cập nhật
                          </span>
                        )}
                        {file.status === 'new' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            Chưa có
                          </span>
                        )}

                        <Button
                          variant="subtle"
                          size="xs"
                          onClick={() => handleDownloadSingle(file)}
                          loading={singleDownloading === file.name}
                          disabled={isSyncing || singleDownloading === file.name}
                        >
                          <DownloadSimple size={12} weight="bold" />
                          Tải về
                        </Button>
                      </>
                    )}

                    {file.isDirectory && (
                      <button
                        onClick={() => handleOpenFolder(file.name)}
                        className="text-xs text-accent hover:underline px-2 py-1"
                      >
                        Mở thư mục &rarr;
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-12 rounded-2xl bg-bg1 border border-line border-dashed text-center">
          <CloudArrowDown size={48} weight="thin" className="text-fgfaint mb-3 opacity-60" />
          <h4 className="text-sm font-bold text-fg">Chưa kết nối đến máy chủ FTP</h4>
          <p className="text-xs text-fgfaint max-w-sm mt-1 mb-4">
            Nhập địa chỉ máy chủ FTP hoặc chọn cấu hình đã lưu ở phía trên, sau đó nhấn nút <strong>Kết nối</strong> để duyệt và đồng bộ danh sách mods.
          </p>
          <Button variant="primary" size="sm" onClick={() => handleConnect(remotePath)} loading={connecting}>
            <ArrowClockwise size={14} weight="bold" />
            Kết nối ngay
          </Button>
        </div>
      )}

      {/* Syncing Progress Modal */}
      {isSyncing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md p-6 rounded-2xl bg-bg1 border border-line shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2">
                <CloudArrowDown size={20} weight="duotone" className="text-accent animate-bounce" />
                <h3 className="font-bold text-sm text-fg">Đang đồng bộ mods từ máy chủ FTP</h3>
              </div>
              <span className="text-xs font-mono font-bold text-accent">
                {syncProgress?.percent || 0}%
              </span>
            </div>

            {/* Overall progress bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] text-fgdim">
                <span>Tiến độ tổng thể</span>
                {syncProgress?.currentFileIndex && syncProgress?.totalFiles && (
                  <span>
                    File {syncProgress.currentFileIndex} / {syncProgress.totalFiles}
                  </span>
                )}
              </div>
              <div className="w-full h-2 rounded-full bg-bg0 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-accent to-accentstrong transition-all duration-300 rounded-full"
                  style={{ width: `${syncProgress?.percent || 0}%` }}
                />
              </div>
            </div>

            {/* Current file notification */}
            <div className="p-3 rounded-xl bg-bg0 border border-line text-xs space-y-1">
              <p className="font-bold text-fg truncate">
                {syncProgress?.currentFile || 'Đang chuẩn bị file...'}
              </p>
              <p className="text-[11px] text-fgfaint truncate">
                {syncProgress?.message || 'Đang trao đổi dữ liệu...'}
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="danger" size="sm" onClick={handleCancelSync}>
                <X size={14} weight="bold" />
                Hủy đồng bộ
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
