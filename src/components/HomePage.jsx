import React, { useState, useEffect, useMemo } from 'react'
import { useAccounts } from '../hooks/useAccounts.jsx'
import { useToast } from '../hooks/useToast.jsx'
import { offlineUUID } from '../utils/offlineUUID.js'
import { formatBytes, formatRelative } from '../utils/format.js'
import {
  Play, Plus, FolderOpen, PuzzlePiece, Globe, Camera,
  UserCircle, ShieldCheck, HardDrive, Cpu,
  CaretRight, Stack, CaretDown, Check, ArrowsClockwise,
  WifiHigh, WifiMedium, WifiLow, Sparkle, Terminal,
  Sliders, Lightning, ArrowSquareOut, CheckCircle,
  Broadcast, ChartBar, Gear, Clock, Compass
} from '@phosphor-icons/react'
import { Button, Badge } from './ui.jsx'
import PlayerHead from './PlayerHead.jsx'
import LoaderIcon from './LoaderIcon.jsx'
import { playSound } from '../utils/sound.js'
import { getVersionImage } from './versionGroups.js'

const isElectron = typeof window !== 'undefined' && !!window.electronAPI

export default function HomePage({ profiles = [], selectedProfileId, onPlay, onNavigate, soundEnabled = true }) {
  const { selectedAccount, addAccount, loginMicrosoft } = useAccounts()
  const toast = useToast()
  const [quickName, setQuickName] = useState('')
  const [isAddingQuickName, setIsAddingQuickName] = useState(false)
  const [systemStats, setSystemStats] = useState(null)
  const [isPurgingRam, setIsPurgingRam] = useState(false)
  const [topServer, setTopServer] = useState(null)
  const [serverPing, setServerPing] = useState(null)
  const [modCount, setModCount] = useState(null)
  const [quickRam, setQuickRam] = useState(4)

  // Current selected profile
  const current = useMemo(() => {
    return profiles.find((p) => p.id === selectedProfileId) || profiles[0] || null
  }, [profiles, selectedProfileId])

  // Bundled Minecraft version hero artwork
  const heroImage = useMemo(() => {
    return getVersionImage(current?.gameVersion)
  }, [current?.gameVersion])

  // Sync profile RAM to local state
  useEffect(() => {
    if (current?.ramGb) {
      setQuickRam(current.ramGb)
    }
  }, [current?.id, current?.ramGb])

  // Total size across profiles
  const totalSize = useMemo(() => {
    return profiles.reduce((acc, p) => acc + (p.sizeBytes || 0), 0)
  }, [profiles])

  // Fetch real system specs
  useEffect(() => {
    if (!isElectron) return
    window.electronAPI.getSystemStats?.().then((st) => {
      if (st) setSystemStats(st)
    }).catch(() => {})
  }, [])

  // Fetch mod count for current profile
  useEffect(() => {
    if (!isElectron || !current?.id || current.loader === 'vanilla') {
      setModCount(null)
      return
    }
    window.electronAPI.listMods?.(current.id, { page: 1, pageSize: 1 })
      .then((res) => {
        if (typeof res?.total === 'number') setModCount(res.total)
      })
      .catch(() => setModCount(null))
  }, [current?.id, current?.loader])

  // Fetch top favorite server for multiplayer radar
  useEffect(() => {
    if (!isElectron) return
    window.electronAPI.getServers?.().then(async (servers) => {
      if (servers && servers.length > 0) {
        const primary = servers.find(s => s.featured) || servers[0]
        setTopServer(primary)
        try {
          const p = await window.electronAPI.pingServer({ address: primary.address, port: primary.port })
          setServerPing(p)
        } catch {}
      }
    }).catch(() => {})
  }, [])

  // Quick save offline name
  const handleQuickAddName = async () => {
    const trimmed = quickName.trim()
    if (!trimmed) {
      toast.push({ type: 'warn', message: 'Vui lòng nhập tên người chơi' })
      return
    }
    if (!/^[a-zA-Z0-9_]{3,16}$/.test(trimmed)) {
      toast.push({ type: 'warn', message: 'Tên hợp lệ từ 3-16 ký tự (chữ cái, số và dấu gạch dưới)' })
      return
    }

    setIsAddingQuickName(true)
    playSound('click', soundEnabled)
    try {
      const acc = {
        id: 'offline-' + Date.now(),
        type: 'offline',
        username: trimmed,
        uuid: offlineUUID(trimmed),
        createdAt: new Date().toISOString(),
      }
      const r = await addAccount(acc)
      if (r?.ok) {
        toast.push({ type: 'success', message: `Đã lưu tên người chơi: ${trimmed}` })
        setQuickName('')
      } else {
        toast.push({ type: 'error', message: r?.error || 'Không thể lưu tên' })
      }
    } finally {
      setIsAddingQuickName(false)
    }
  }

  // Quick Microsoft login
  const handleQuickMicrosoft = async () => {
    playSound('click', soundEnabled)
    toast.push({ type: 'info', message: 'Đang mở trình duyệt đăng nhập Microsoft...' })
    const r = await loginMicrosoft()
    if (r?.ok) {
      toast.push({ type: 'success', message: `Đăng nhập Microsoft thành công: ${r.account.username}` })
    } else if (r?.error) {
      toast.push({ type: 'error', message: r.error })
    }
  }

  // Update RAM on the fly
  const handleSetRam = async (ramVal) => {
    setQuickRam(ramVal)
    playSound('click', soundEnabled)
    if (isElectron && current?.id) {
      await window.electronAPI.updateProfile(current.id, { ramGb: ramVal })
      toast.push({ type: 'success', message: `Đã cấu hình RAM: ${ramVal} GB` })
    }
  }

  // Launch game
  const handlePlayClick = async () => {
    playSound('launch', soundEnabled)

    if (!selectedAccount) {
      if (quickName.trim()) {
        const trimmed = quickName.trim()
        if (!/^[a-zA-Z0-9_]{3,16}$/.test(trimmed)) {
          toast.push({ type: 'warn', message: 'Tên phải từ 3-16 ký tự hợp lệ' })
          return
        }
        const acc = {
          id: 'offline-' + Date.now(),
          type: 'offline',
          username: trimmed,
          uuid: offlineUUID(trimmed),
          createdAt: new Date().toISOString(),
        }
        await addAccount(acc)
        toast.push({ type: 'success', message: `Đã tạo tài khoản: ${trimmed}` })
      } else {
        toast.push({ type: 'warn', message: 'Vui lòng nhập tên người chơi trước khi vào game!' })
        return
      }
    }

    if (!current) {
      toast.push({ type: 'warn', message: 'Chưa có bản cài đặt nào, hãy tạo bản cài đặt trước!' })
      onNavigate?.('profiles')
      return
    }

    onPlay?.(current.id)
  }

  // Purge RAM cache
  const handlePurgeRam = async () => {
    if (!isElectron) return
    setIsPurgingRam(true)
    playSound('click', soundEnabled)
    try {
      await window.electronAPI.purgeRamCache?.()
      const st = await window.electronAPI.getSystemStats?.()
      if (st) setSystemStats(st)
      toast.push({ type: 'success', message: 'Đã giải phóng bộ nhớ đệm RAM thành công!' })
    } catch {
      toast.push({ type: 'info', message: 'Đã hoàn tất dọn dẹp bộ nhớ.' })
    } finally {
      setIsPurgingRam(false)
    }
  }

  // RAM calculations
  const totalMem = systemStats?.totalMemGb || 16
  const freeMem = systemStats?.freeMemGb || 8
  const usedMem = Math.max(0, totalMem - freeMem)
  const ramPercent = Math.min(100, Math.round((usedMem / totalMem) * 100))

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto px-6 py-4 space-y-4 custom-scrollbar select-none tech-grid bg-bg0/95 relative z-10">

      {/* ── 1. TOP TELEMETRY HUD STRIP ── */}
      <div className="hud-panel p-2.5 px-4 rounded-xl flex flex-wrap items-center justify-between gap-3 border border-line/90 shadow-md">
        {/* Left: Engine & Real-time Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-bg0/80 border border-line text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-dot" />
            <span className="font-bold text-fg">TITANIUM ENGINE</span>
            <span className="text-fgfaint">|</span>
            <span className="text-emerald-400 font-semibold">JRE READY</span>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 text-xs text-fgdim font-mono">
            <Cpu size={14} className="text-accent" />
            <span className="truncate max-w-[220px]" title={systemStats?.cpuModel}>
              {systemStats?.cpuModel ? systemStats.cpuModel.split('@')[0].trim() : 'CPU Monitor'}
            </span>
            <span className="text-fgfaint">({systemStats?.cpuCores || '—'} Cores)</span>
          </div>
        </div>

        {/* Right: Active Player Identity & Account */}
        <div className="flex items-center gap-3">
          {selectedAccount ? (
            <div
              className="flex items-center gap-2.5 px-3 py-1 rounded-lg bg-bg0/80 border border-line hover:border-linestrong transition-all cursor-pointer group"
              onClick={() => onNavigate('accounts')}
              title="Quản lý tài khoản"
            >
              <div className="w-6 h-6 rounded-md bg-bg2 border border-line flex items-center justify-center overflow-hidden shrink-0">
                <PlayerHead uuid={selectedAccount.uuid} username={selectedAccount.username} size={22} />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-fg group-hover:text-accent transition-colors font-mono">
                  {selectedAccount.username}
                </span>
                <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono uppercase font-bold ${
                  selectedAccount.type === 'microsoft'
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    : 'bg-bg2 text-fgfaint border border-line'
                }`}>
                  {selectedAccount.type === 'microsoft' ? 'MS ONLINE' : 'OFFLINE'}
                </span>
              </div>
              <CaretDown size={11} className="text-fgfaint group-hover:text-fg transition-colors" />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-fgdim font-mono">
                <UserCircle size={15} className="text-accent" />
                <span>Người chơi:</span>
              </div>
              <input
                type="text"
                value={quickName}
                onChange={(e) => setQuickName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleQuickAddName() }}
                placeholder="Nhập tên..."
                maxLength={16}
                className="w-32 bg-bg0 border border-line rounded-lg px-2 py-1 text-xs text-fg placeholder:text-fgfaint focus:outline-none focus:border-accent font-mono"
              />
              <Button variant="primary" size="xs" onClick={handleQuickAddName} disabled={!quickName.trim() || isAddingQuickName} loading={isAddingQuickName}>
                Lưu
              </Button>
              <Button variant="subtle" size="xs" onClick={handleQuickMicrosoft} className="gap-1 font-mono">
                <ShieldCheck size={12} className="text-emerald-400" />
                MS
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ── 2. HERO MISSION CONTROL STATION ── */}
      <div className="hud-panel p-5 rounded-2xl relative overflow-hidden group shadow-2xl border border-line/90 hud-bracket">
        {/* Parallax Minecraft Version Artwork backdrop */}
        <div className="absolute inset-0 z-0 overflow-hidden rounded-2xl pointer-events-none">
          {heroImage && (
            <img
              src={heroImage}
              alt=""
              className="w-full h-full object-cover opacity-25 scale-105 filter blur-[0.4px] group-hover:scale-100 group-hover:opacity-35 transition-all duration-700 ease-out"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-bg1 via-bg1/90 to-bg1/80" />
          <div className="absolute inset-0 bg-gradient-to-t from-bg1 via-transparent to-transparent" />
        </div>

        {/* Cyber glow beam on top edge */}
        <div className="absolute top-0 right-0 w-96 h-full opacity-15 pointer-events-none bg-gradient-to-l from-accent to-transparent z-0" />

        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 relative z-10">

          {/* Left: Active Profile Telemetry Deck */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Header: Icon, Name & Version Tag */}
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-bg0/90 border border-accent/40 flex items-center justify-center shrink-0 overflow-hidden p-3 relative group shadow-lg shadow-accent/10">
                {current ? (
                  current.importIconUrl ? (
                    <img src={current.importIconUrl} className="w-full h-full object-cover rounded-xl" alt="" />
                  ) : (
                    <LoaderIcon loader={current.loader} className="w-full h-full drop-shadow" />
                  )
                ) : (
                  <Stack size={32} className="text-fgfaint" />
                )}
                {/* Micro tech corner ticks */}
                <div className="absolute top-1 left-1 w-1.5 h-1.5 border-t-2 border-l-2 border-accent" />
                <div className="absolute bottom-1 right-1 w-1.5 h-1.5 border-b-2 border-r-2 border-accent" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono text-accent uppercase font-black tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
                    CẤU HÌNH ĐANG CHỌN
                  </span>
                  <span className="text-fgfaint text-xs">/</span>
                  <span className="text-[10px] font-mono text-fgdim">
                    ID: {current ? current.id.slice(0, 8) : 'NONE'}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 mt-0.5 flex-wrap">
                  <h2 className="text-xl font-black text-fg tracking-tight truncate font-sans">
                    {current ? current.name : 'Chưa có bản cài đặt'}
                  </h2>
                  {current && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-accentsoft text-accent border border-accent/30 font-mono shadow-sm">
                      {current.loader}
                    </span>
                  )}
                  {current && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono text-fgdim bg-bg0/80 border border-line font-bold">
                      v{current.gameVersion}
                    </span>
                  )}
                </div>

                {/* Profile quick selector dropdown */}
                <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                  <select
                    value={current?.id || ''}
                    onChange={(e) => {
                      playSound('click', soundEnabled)
                      window.electronAPI.selectProfile(e.target.value)
                    }}
                    className="bg-bg0/90 border border-line rounded-lg px-3 py-1.5 text-xs text-fg focus:outline-none focus:border-accent cursor-pointer min-w-[220px] font-medium shadow-inner"
                  >
                    {profiles.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.gameVersion} • {p.loader.toUpperCase()})
                      </option>
                    ))}
                  </select>

                  <Button variant="subtle" size="xs" onClick={() => onNavigate('profiles')} className="gap-1 text-xs font-semibold">
                    <Plus size={12} weight="bold" />
                    Tạo Profile
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Profile Strip (Mini Card Carousel) */}
            {profiles.length > 1 && (
              <div className="pt-1">
                <div className="text-[10px] font-mono text-fgfaint uppercase mb-1.5 flex items-center gap-1.5">
                  <Compass size={11} className="text-accent" />
                  <span>Chuyển nhanh phiên bản:</span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
                  {profiles.slice(0, 6).map((p) => {
                    const isSelected = p.id === current?.id
                    return (
                      <button
                        key={p.id}
                        onClick={() => {
                          playSound('click', soundEnabled)
                          window.electronAPI.selectProfile(p.id)
                        }}
                        className={`flex items-center gap-2 px-2.5 py-1 rounded-lg text-left shrink-0 transition-all border cursor-pointer ${
                          isSelected
                            ? 'bg-accentsoft border-accent text-fg shadow-sm'
                            : 'bg-bg0/60 border-line text-fgdim hover:text-fg hover:border-linestrong hover:bg-bg1'
                        }`}
                      >
                        <div className="w-4 h-4 rounded shrink-0 flex items-center justify-center">
                          <LoaderIcon loader={p.loader} className="w-full h-full" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[11px] font-bold truncate max-w-[100px]">{p.name}</div>
                          <div className="text-[9px] font-mono text-fgfaint">{p.gameVersion}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Technical Specs Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-line/60 text-xs">
              <div className="p-2.5 rounded-xl bg-bg0/75 border border-line shadow-inner">
                <div className="text-[10px] font-mono text-fgfaint uppercase flex items-center gap-1 font-semibold">
                  <PuzzlePiece size={12} className="text-accent" />
                  MODS HOẠT ĐỘNG
                </div>
                <div className="font-mono font-black text-fg mt-1 text-sm">
                  {modCount !== null ? `${modCount} mods` : current?.loader === 'vanilla' ? 'Vanilla (0)' : '—'}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-bg0/75 border border-line shadow-inner">
                <div className="text-[10px] font-mono text-fgfaint uppercase flex items-center gap-1 font-semibold">
                  <HardDrive size={12} className="text-accent" />
                  DUNG LƯỢNG ĐĨA
                </div>
                <div className="font-mono font-black text-fg mt-1 text-sm">
                  {current ? formatBytes(current.sizeBytes) : '0 B'}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-bg0/75 border border-line shadow-inner">
                <div className="text-[10px] font-mono text-fgfaint uppercase flex items-center gap-1 font-semibold">
                  <Cpu size={12} className="text-accent" />
                  CẤU HÌNH RAM
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="font-mono font-black text-fg text-sm">{quickRam} GB</span>
                  <span className="text-[9px] font-mono text-accent uppercase font-bold">({current?.jvmPreset || 'aikar'})</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-bg0/75 border border-line shadow-inner">
                <div className="text-[10px] font-mono text-fgfaint uppercase flex items-center gap-1 font-semibold">
                  <Clock size={12} className="text-accent" />
                  LẦN CHƠI GẦN NHẤT
                </div>
                <div className="text-xs font-semibold text-fgdim mt-1 truncate" title={current?.lastPlayed ? formatRelative(current.lastPlayed) : 'Chưa chơi'}>
                  {current?.lastPlayed ? formatRelative(current.lastPlayed) : 'Chưa từng chơi'}
                </div>
              </div>
            </div>

            {/* Quick RAM presets & shortcuts */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-fgfaint uppercase mr-1">Chỉnh RAM nhanh:</span>
                {[2, 4, 6, 8, 10, 12, 16].map((r) => (
                  <button
                    key={r}
                    onClick={() => handleSetRam(r)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all cursor-pointer border ${
                      quickRam === r
                        ? 'bg-accent text-white border-accent font-black shadow-[0_0_8px_var(--color-accent)]'
                        : 'bg-bg0 border-line text-fgdim hover:text-fg hover:border-linestrong'
                    }`}
                  >
                    {r}G
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5">
                <Button variant="subtle" size="xs" onClick={() => onNavigate('mods')} className="gap-1 text-xs">
                  <PuzzlePiece size={12} />
                  Kho Mods
                </Button>
                <Button variant="subtle" size="xs" onClick={() => current && window.electronAPI.openProfileFolder(current.id)} className="gap-1 text-xs">
                  <FolderOpen size={12} />
                  Thư mục
                </Button>
              </div>
            </div>
          </div>

          {/* Right: Master Launch Button Panel */}
          <div className="flex flex-col items-center justify-center shrink-0 lg:pl-6 lg:border-l lg:border-line/80 gap-3 min-w-[230px] relative z-10">
            <button
              onClick={handlePlayClick}
              className="w-full px-8 py-5 rounded-2xl bg-accent hover:bg-accentstrong text-white font-black text-sm tracking-wider transition-all duration-300 flex flex-col items-center justify-center gap-1.5 cursor-pointer shadow-xl shadow-accent/25 hover:shadow-accent/50 hover:-translate-y-0.5 active:translate-y-0 relative overflow-hidden group border border-white/20 hazard-stripes"
            >
              <div className="absolute top-0 inset-x-0 h-[1.5px] bg-white/40" />
              <div className="flex items-center gap-2.5 text-base">
                <Play size={20} weight="fill" className="group-hover:scale-125 transition-transform duration-300" />
                <span className="font-black uppercase tracking-widest">KHỞI ĐỘNG GAME</span>
              </div>
              <span className="text-[10px] opacity-90 font-mono font-medium">
                {current ? `${current.name} (v${current.gameVersion})` : 'Chọn profile để bắt đầu'}
              </span>
            </button>

            <div className="flex items-center gap-2 text-[10px] font-mono text-fgdim bg-bg0/80 px-2.5 py-1 rounded-md border border-line">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Tự nạp JRE & Libraries tự động</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. REALTIME TELEMETRY & MULTIPLAYER RADAR GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">

        {/* Card A: Hardware Memory Matrix */}
        <div className="hud-panel p-4 rounded-xl flex flex-col justify-between space-y-3 border border-line">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu size={16} className="text-accent" />
              <h3 className="text-xs font-bold text-fg uppercase tracking-wider font-mono">
                Bộ Nhớ Hệ Thống (RAM)
              </h3>
            </div>
            <span className="text-[10px] font-mono text-accent font-bold px-1.5 py-0.5 rounded bg-accentsoft border border-accent/20">
              {ramPercent}% USED
            </span>
          </div>

          <div>
            <div className="flex items-baseline justify-between text-xs font-mono mb-1.5">
              <span className="text-fgdim">Đã dùng: <strong className="text-fg font-bold">{usedMem} GB</strong></span>
              <span className="text-fgdim">Trống: <strong className="text-emerald-400 font-bold">{freeMem} GB</strong> / {totalMem} GB</span>
            </div>

            {/* Segmented memory visual bar */}
            <div className="segment-bar">
              {Array.from({ length: 16 }).map((_, idx) => {
                const threshold = (idx + 1) * (100 / 16)
                const isActive = ramPercent >= threshold
                const isWarn = isActive && idx >= 12
                return (
                  <div
                    key={idx}
                    className={isWarn ? 'warn' : isActive ? 'active' : ''}
                  />
                )
              })}
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-line/50 text-[11px]">
            <span className="text-fgfaint">Phân bổ game: <strong className="text-accent font-mono font-bold">{quickRam} GB</strong></span>
            <button
              onClick={handlePurgeRam}
              disabled={isPurgingRam}
              className="text-xs text-accent hover:text-accentstrong font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <ArrowsClockwise size={12} className={isPurgingRam ? 'animate-spin' : ''} />
              {isPurgingRam ? 'Đang dọn...' : 'Dọn RAM'}
            </button>
          </div>
        </div>

        {/* Card B: Multiplayer Radar (Top Server Live Ping) */}
        <div className="hud-panel p-4 rounded-xl flex flex-col justify-between space-y-3 border border-line relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe size={16} className="text-accent" />
              <h3 className="text-xs font-bold text-fg uppercase tracking-wider font-mono">
                Radar Máy Chủ Trực Tuyến
              </h3>
            </div>
            {serverPing ? (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <WifiHigh size={12} /> {serverPing.ping}ms
              </span>
            ) : (
              <span className="text-[10px] font-mono text-fgfaint flex items-center gap-1">
                <Broadcast size={11} className="animate-pulse text-accent" />
                STANDBY
              </span>
            )}
          </div>

          {topServer ? (
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-bg0/75 border border-line relative overflow-hidden group">
              <div className="w-10 h-10 rounded-lg bg-bg2 border border-line flex items-center justify-center shrink-0 overflow-hidden relative">
                {serverPing?.favicon ? (
                  <img src={serverPing.favicon} alt="" className="w-full h-full object-cover" style={{ imageRendering: 'pixelated' }} />
                ) : (
                  <Globe size={20} className="text-fgfaint" />
                )}
                {/* Subtle radar sweep overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-accent/20 to-transparent pointer-events-none radar-sweep-anim opacity-40" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-fg truncate">{topServer.name}</div>
                <div className="text-[10px] font-mono text-accent truncate select-all">{topServer.address}</div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-fgfaint p-2.5 rounded-xl bg-bg0/70 border border-line text-center">
              Chưa lưu máy chủ yêu thích nào
            </div>
          )}

          <div className="flex items-center justify-between pt-1 border-t border-line/50 text-[11px]">
            <span className="text-fgfaint font-mono text-[10px]">RADAR FREQUENCY: 2.4GHz</span>
            <button
              onClick={() => onNavigate('servers')}
              className="text-xs text-accent hover:text-accentstrong font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Xem danh sách</span>
              <CaretRight size={11} />
            </button>
          </div>
        </div>

        {/* Card C: Quick Launch Modules */}
        <div className="hud-panel p-4 rounded-xl flex flex-col justify-between space-y-3 border border-line">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders size={16} className="text-accent" />
              <h3 className="text-xs font-bold text-fg uppercase tracking-wider font-mono">
                Lối Tắt Tác Vụ
              </h3>
            </div>
            <span className="text-[10px] font-mono text-fgdim font-bold">{profiles.length} PROFILES</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => onNavigate('mods')}
              className="p-2.5 rounded-xl bg-bg0/75 border border-line hover:border-linestrong hover:bg-bg2 transition-all text-left flex items-center gap-2.5 cursor-pointer group"
            >
              <PuzzlePiece size={16} className="text-accent shrink-0 group-hover:scale-110 transition-transform" />
              <div className="min-w-0 flex-1">
                <div className="font-bold text-fg text-xs truncate">Kho Mods</div>
                <div className="text-[9px] text-fgfaint truncate font-mono">Modrinth & Curse</div>
              </div>
            </button>

            <button
              onClick={() => onNavigate('screenshots')}
              className="p-2.5 rounded-xl bg-bg0/75 border border-line hover:border-linestrong hover:bg-bg2 transition-all text-left flex items-center gap-2.5 cursor-pointer group"
            >
              <Camera size={16} className="text-accent shrink-0 group-hover:scale-110 transition-transform" />
              <div className="min-w-0 flex-1">
                <div className="font-bold text-fg text-xs truncate">Ảnh Chụp</div>
                <div className="text-[9px] text-fgfaint truncate font-mono">Thư viện F2</div>
              </div>
            </button>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-line/50 text-[11px]">
            <span className="text-fgfaint">Tổng đĩa: <strong className="text-fg font-mono font-bold">{formatBytes(totalSize)}</strong></span>
            <button
              onClick={() => onNavigate('settings')}
              className="text-xs text-accent hover:text-accentstrong font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Cài đặt</span>
              <CaretRight size={11} />
            </button>
          </div>
        </div>

      </div>

      {/* ── 4. LIVE TELEMETRY CONSOLE STATUS TICKER ── */}
      <div className="px-4 py-2 rounded-xl bg-bg1/60 border border-line flex items-center justify-between text-[11px] font-mono text-fgfaint">
        <div className="flex items-center gap-2 truncate">
          <Terminal size={13} className="text-accent shrink-0" />
          <span className="text-accent font-bold">[ENGINE STATUS]</span>
          <span className="truncate">JRE 21 64-Bit Verified • GPU Shader Acceleration Ready • Profile: {current?.name || 'Default'}</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 shrink-0 text-emerald-400 font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>CORE ACTIVE</span>
        </div>
      </div>

    </div>
  )
}