import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { useAccounts } from '../hooks/useAccounts.jsx'
import { useToast } from '../hooks/useToast.jsx'
import { formatBytes, formatRelative } from '../utils/format.js'
import {
  Play, Stop, Plus, Copy, Trash, CaretDown,
  Stack, GameController, CircleNotch, Check, MagnifyingGlass,
  DownloadSimple, ShieldWarning, ArrowSquareOut,
  Terminal, Globe, Cpu, Clock, CheckCircle,
  CornersOut, CornersIn
} from '@phosphor-icons/react'

import { PageHeader, Card, Button, Badge, ProgressBar } from './ui.jsx'
import LoaderIcon from './LoaderIcon.jsx'
import { playSound } from '../utils/sound.js'
import { getVersionImage } from './versionGroups.js'

const isElectron = typeof window !== 'undefined' && !!window.electronAPI

const LEVEL_STYLES = {
  INFO:  'text-fgdim',
  WARN:  'text-amber-400',
  ERROR: 'text-rose-400 font-semibold',
  DEBUG: 'text-indigo-400',
}

const LAUNCH_STAGES = [
  { id: 1, name: 'Tài khoản' },
  { id: 2, name: 'Java Runtime' },
  { id: 3, name: 'Libraries & Assets' },
  { id: 4, name: 'Mod Loader' },
  { id: 5, name: 'Mở cửa sổ' },
  { id: 6, name: 'Sẵn sàng' },
]

export default function PlayPage({
  profiles,
  selectedProfileId,
  onNavigate,
  reload,
  onSelectProfile,
  logs,
  setLogs,
  state,
  setState,
  startedAtRef,
  onRequireJava,
  installState,
  doInstall,
  soundEnabled = true,
  launchOptions = null,
}) {
  const { selectedAccount } = useAccounts()
  const toast = useToast()
  const profile = profiles.find((p) => p.id === selectedProfileId) || profiles[0]

  const [filter, setFilter] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [autoScroll, setAutoScroll] = useState(true)
  const [showTimestamps, setShowTimestamps] = useState(true)
  const [fullscreenTerminal, setFullscreenTerminal] = useState(false)
  const [copied, setCopied] = useState(false)
  const logBoxRef = useRef(null)
  const [elapsed, setElapsed] = useState(0)

  // Elapsed ticker when running
  useEffect(() => {
    if (state !== 'running') {
      setElapsed(0)
      return
    }
    const t = setInterval(() => {
      if (startedAtRef?.current) setElapsed(Date.now() - startedAtRef.current)
    }, 500)
    return () => clearInterval(t)
  }, [state, startedAtRef])

  useEffect(() => {
    if (autoScroll && logBoxRef.current) {
      logBoxRef.current.scrollTop = logBoxRef.current.scrollHeight
    }
  }, [logs, autoScroll])

  const play = useCallback(async (customOpts = null) => {
    if (!profile) {
      toast.push({ type: 'warn', title: 'Chưa có profile', message: 'Tạo profile trước khi chơi.' })
      return
    }
    if (!selectedAccount) {
      toast.push({ type: 'warn', title: 'Chưa đăng nhập', message: 'Vào mục Tài khoản để thêm tài khoản.' })
      onNavigate?.('accounts')
      return
    }

    if (!profile.installedAt) {
      toast.push({ type: 'info', message: 'Bắt đầu tự động tải và cài đặt game...' })
      const ok = await doInstall?.(profile.id)
      if (!ok) return
    }

    const checkJava = await window.electronAPI.javaGetForVersion(profile.gameVersion)
    if (!checkJava?.found) {
      onRequireJava?.()
      return
    }

    playSound('launch', soundEnabled)
    setLogs([])
    setState('preparing')

    const opts = customOpts || launchOptions || {}
    const r = await window.electronAPI.launchProfile(profile.id, opts)
    if (r?.error) {
      setState('idle')
      toast.push({ type: 'error', title: 'Không khởi chạy được', message: r.error, timeout: 6000 })
    }
  }, [profile, selectedAccount, onNavigate, toast, setLogs, setState, onRequireJava, doInstall, soundEnabled, launchOptions])

  const kill = useCallback(async () => {
    playSound('click', soundEnabled)
    await window.electronAPI.killGame()
    toast.push({ type: 'info', message: 'Đã gửi tín hiệu dừng Minecraft.' })
  }, [toast, soundEnabled])

  const copyLogs = useCallback(async () => {
    playSound('click', soundEnabled)
    const text = logs.map((l) => `[${l.level || 'INFO'}] ${l.raw ?? l.msg}`).join('\n')
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1400)
      toast.push({ type: 'success', message: 'Đã sao chép log vào Clipboard.' })
    } catch {
      toast.push({ type: 'warn', message: 'Không thể sao chép tự động.' })
    }
  }, [logs, toast, soundEnabled])

  const exportLogsToFile = () => {
    playSound('click', soundEnabled)
    const text = logs.map((l) => `[${l.level || 'INFO'}] ${l.raw ?? l.msg}`).join('\n')
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `minecraft-log-${profile?.name || 'game'}-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast.push({ type: 'success', message: 'Đã xuất file log!' })
  }

  // Crash detection logic
  const crashAnalysis = useMemo(() => {
    if (logs.length === 0) return null
    const recent = logs.slice(-100)
    const allText = recent.map(l => (l.raw || l.msg || '').toLowerCase()).join(' ')

    if (allText.includes('outofmemoryerror') || allText.includes('java.lang.outofmemoryerror')) {
      return {
        type: 'memory',
        title: 'Tràn bộ nhớ RAM (OutOfMemoryError)',
        desc: 'Minecraft bị crash do không đủ RAM. Hãy vào Cài đặt hoặc sửa Profile để nâng RAM lên 4GB - 8GB.',
        action: 'settings',
      }
    }
    if (allText.includes('unsupportedclassversionerror') || allText.includes('has been compiled by a more recent version of the java runtime')) {
      return {
        type: 'java',
        title: 'Sai phiên bản Java',
        desc: 'Phiên bản Java không khớp với yêu cầu của bản Minecraft này. Hãy kiểm tra tab Java Runtime trong Cài đặt.',
        action: 'settings',
      }
    }
    if (allText.includes('mixintransformer') || allText.includes('modloadingexception') || allText.includes('incompatible mods found')) {
      return {
        type: 'mod',
        title: 'Xung đột Mod',
        desc: 'Một số mod cài thêm không tương thích với phiên bản game. Thử tắt các mod vừa cài gần đây.',
        action: 'mods',
      }
    }
    return null
  }, [logs])

  // Filter & Search
  const filtered = useMemo(() => {
    let list = filter === 'ALL' ? logs : logs.filter((l) => l.level === filter)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(l => (l.raw || l.msg || '').toLowerCase().includes(q))
    }
    return list
  }, [logs, filter, searchQuery])

  const counts = useMemo(() => {
    return logs.reduce((acc, l) => {
      acc[l.level] = (acc[l.level] || 0) + 1
      return acc
    }, {})
  }, [logs])

  const isRunning = state === 'running'
  const isLaunching = state === 'launching' || state === 'preparing'

  // Stage progress index (1-6)
  const currentStageIndex = useMemo(() => {
    if (state === 'running') return 6
    if (state === 'launching') return 5
    if (state === 'preparing') return 3
    if (installState) return 2
    return 0
  }, [state, installState])

  return (
    <div className={`flex-1 flex flex-col overflow-hidden min-h-0 min-w-0 ${fullscreenTerminal ? 'fixed inset-0 z-50 bg-bg0 p-4' : ''}`}>
      {!fullscreenTerminal && (
        <PageHeader
          eyebrow="KHỞI CHẠY"
          title="Khởi Chạy & Nhật Ký Game"
          subtitle="Khởi chạy Minecraft, xem tiến trình tải và kiểm tra nhật ký (console log) thời gian thực."
        >
          <ProfileSwitcher
            profiles={profiles}
            current={profile}
            onChange={async (id) => {
              playSound('tab', soundEnabled)
              await onSelectProfile?.(id)
              reload?.()
            }}
            onNavigateCreate={() => onNavigate?.('profiles')}
          />
        </PageHeader>
      )}

      {/* Profile & Launch Action Card */}
      {!fullscreenTerminal && (
        <div className="px-8 pt-4 pb-3 flex-shrink-0">
          <div className="hud-panel p-4 rounded-2xl hud-bracket flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 relative overflow-hidden group shadow-xl border border-line">
            {/* Version artwork backdrop */}
            {profile?.gameVersion && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl z-0">
                <img
                  src={getVersionImage(profile.gameVersion)}
                  alt=""
                  className="w-full h-full object-cover opacity-20 scale-105 filter blur-[0.5px] group-hover:scale-100 group-hover:opacity-30 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-bg1 via-bg1/90 to-bg1/75" />
              </div>
            )}

            <div className="flex items-center gap-3.5 min-w-0 flex-1 relative z-10">
              <div className="w-14 h-14 rounded-xl bg-bg0/90 border border-accent/40 flex items-center justify-center flex-shrink-0 overflow-hidden relative shadow-inner">
                {profile ? (
                  profile.importIconUrl ? (
                    <img src={profile.importIconUrl} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <LoaderIcon loader={profile.loader} className="w-full h-full p-2.5" />
                  )
                ) : (
                  <GameController size={24} className="text-fgfaint" />
                )}
                {/* Micro tech corner ticks */}
                <div className="absolute top-1 left-1 w-1.5 h-1.5 border-t-2 border-l-2 border-accent" />
                <div className="absolute bottom-1 right-1 w-1.5 h-1.5 border-b-2 border-r-2 border-accent" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-black text-fg text-base tracking-tight truncate font-sans">{profile ? profile.name : 'Chưa chọn bản cài'}</span>
                  {launchOptions?.server && (
                    <span className="tech-tag text-accent border-accent/40 bg-accentsoft/40 flex items-center gap-1 font-mono font-bold">
                      <Globe size={11} /> {launchOptions.server.address}
                    </span>
                  )}
                  {isRunning && (
                    <span className="tech-tag text-emerald-400 border-emerald-500/40 bg-emerald-500/15 flex items-center gap-1.5 font-mono font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-dot" />
                      UPTIME: {formatElapsed(elapsed)}
                    </span>
                  )}
                </div>

                <div className="text-xs text-fgfaint mt-1 flex items-center gap-2 flex-wrap font-mono">
                  {profile && (
                    <>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-accentsoft text-accent border border-accent/30 font-mono">
                        {profile.loader}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-fgdim bg-bg0/80 border border-line font-bold">
                        v{profile.gameVersion}
                      </span>
                      <span className="text-fgfaint/50">|</span>
                      <span className="text-fgdim font-bold">{profile.ramGb || 4} GB RAM</span>
                      <span className="text-fgfaint/50">|</span>
                      <span>{formatBytes(profile.sizeBytes)}</span>
                      <span className="text-fgfaint/50">|</span>
                      <span className="text-fgfaint font-sans">Lần cuối: {formatRelative(profile.lastPlayed)}</span>
                    </>
                  )}
                </div>

                {installState && state !== 'running' && (
                  <div className="mt-2.5 text-xs text-fgdim flex flex-col gap-1 w-80">
                    <div className="flex items-center gap-1.5 truncate font-mono text-[11px] text-accent font-semibold">
                      <CircleNotch size={12} className="animate-spin text-accent shrink-0" />
                      <span className="truncate">{installState.label || installState.phase}</span>
                    </div>
                    <ProgressBar value={installState.percent} />
                    {installState.total > 0 && (
                      <div className="text-[10px] text-fgfaint font-mono tabular-nums">
                        {installState.current.toLocaleString()} / {installState.total.toLocaleString()} files ({installState.percent}%)
                      </div>
                    )}
                  </div>
                )}

                {!installState && isLaunching && (
                  <div className="mt-2 inline-flex items-center gap-2 text-xs text-accent font-mono font-bold">
                    <CircleNotch size={13} className="animate-spin text-accent" />
                    <span>{state === 'preparing' ? '[IGNITION] Đang nạp Java Runtime & Thư viện...' : '[LAUNCH] Đang mở cửa sổ game Minecraft...'}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Launch / Stop Button */}
            <div className="flex items-center gap-3 flex-shrink-0 relative z-10">
              {installState && state !== 'running' ? (
                <div className="flex items-center gap-2 text-xs text-fgdim px-3 font-mono">
                  <CircleNotch size={14} className="animate-spin text-accent" />
                  Đang tải... {installState.percent > 0 ? `${installState.percent}%` : ''}
                </div>
              ) : state === 'idle' ? (
                <Button
                  variant="primary"
                  size="lg"
                  disabled={!profile || !selectedAccount}
                  onClick={() => play()}
                  className="gap-2 px-7 py-3 font-black text-sm shadow-xl shadow-accent/25 hover:shadow-accent/40 cursor-pointer hazard-stripes"
                >
                  <Play size={17} weight="fill" />
                  <span>VÀO CHƠI GAME</span>
                </Button>
              ) : isLaunching ? (
                <div className="flex items-center gap-2 text-xs text-accent px-4 py-2.5 rounded-xl bg-accentsoft border border-accent/40 font-mono font-bold shadow-lg">
                  <CircleNotch size={14} className="animate-spin text-accent" />
                  IGNITION RUNNING...
                </div>
              ) : isRunning ? (
                <Button variant="danger" size="lg" onClick={kill} className="gap-2 px-6 font-black shadow-lg shadow-error/30 cursor-pointer">
                  <Stop size={17} weight="fill" />
                  DỪNG MINECRAFT
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* 6-Stage Rocket Ignition Stepper */}
      {!fullscreenTerminal && (
        <div className="px-8 pb-2 flex-shrink-0">
          <div className="hud-panel p-2 px-3.5 rounded-xl flex items-center justify-between gap-2 text-xs font-mono overflow-x-auto custom-scrollbar border border-line">
            <div className="flex items-center gap-1.5 mr-2 shrink-0">
              <span className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-emerald-400 animate-pulse' : isLaunching ? 'bg-accent animate-ping' : 'bg-fgfaint'}`} />
              <span className="text-[10px] uppercase font-bold text-fgdim">CHECKLIST:</span>
            </div>
            {LAUNCH_STAGES.map((stg, i) => {
              const isPassed = currentStageIndex >= stg.id
              const isCurrent = currentStageIndex === stg.id - 1

              return (
                <React.Fragment key={stg.id}>
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all ${
                    isPassed
                      ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 font-bold'
                      : isCurrent
                      ? 'text-accent bg-accentsoft border border-accent/40 font-black shadow-[0_0_8px_var(--color-accentsoft)] animate-pulse'
                      : 'text-fgfaint/50 bg-bg0/40 border border-line'
                  }`}>
                    <span className="text-[10px]">{isPassed ? '✓' : isCurrent ? '▶' : `0${stg.id}`}</span>
                    <span className="truncate">{stg.name}</span>
                  </div>
                  {i < LAUNCH_STAGES.length - 1 && <span className="text-fgfaint/30">→</span>}
                </React.Fragment>
              )
            })}
          </div>
        </div>
      )}

      {/* Crash Diagnostic Alert Banner if detected */}
      {crashAnalysis && !fullscreenTerminal && (
        <div className="px-8 pb-3 flex-shrink-0">
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start justify-between gap-4">
            <div className="flex items-start gap-2.5">
              <ShieldWarning size={20} className="text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-semibold text-amber-300">{crashAnalysis.title}</h4>
                <p className="text-[11px] text-amber-200/80 mt-0.5">{crashAnalysis.desc}</p>
              </div>
            </div>
            <Button
              variant="subtle"
              size="xs"
              onClick={() => onNavigate?.(crashAnalysis.action)}
              className="shrink-0 gap-1 text-xs"
            >
              Xem cấu hình
              <ArrowSquareOut size={12} />
            </Button>
          </div>
        </div>
      )}

      {/* Log Console */}
      <div className="flex-1 min-h-0 px-8 pb-6 flex flex-col">
        <div className="flex-1 flex flex-col overflow-hidden rounded-xl hud-panel border border-line">
          {/* Log Controls Header */}
          <div className="flex flex-wrap items-center justify-between border-b border-line px-3 py-2 bg-bg0/60 flex-shrink-0 gap-2">
            {/* Filter Buttons */}
            <div className="flex items-center gap-1">
              {['ALL', 'INFO', 'WARN', 'ERROR', 'DEBUG'].map((lv) => (
                <button
                  key={lv}
                  onClick={() => {
                    setFilter(lv)
                    playSound('click', soundEnabled)
                  }}
                  className={[
                    'text-[11px] px-2 py-0.5 rounded font-medium transition-colors cursor-pointer',
                    filter === lv
                      ? 'bg-bg3 text-fg'
                      : 'text-fgfaint hover:text-fg hover:bg-bg2',
                  ].join(' ')}
                >
                  {lv}{lv !== 'ALL' && counts[lv] ? ` (${counts[lv]})` : ''}
                </button>
              ))}

              <span className="text-[11px] text-fgfaint ml-2 hidden sm:inline tabular-nums font-mono">
                {logs.length} dòng
              </span>
            </div>

            {/* Search Input & Action Buttons */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <div className="relative">
                <MagnifyingGlass size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-fgfaint" />
                <input
                  type="text"
                  placeholder="Lọc log..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-28 sm:w-36 pl-7 pr-2 py-1 text-xs rounded bg-bg1 border border-line text-fg placeholder-fgfaint focus:outline-none focus:border-accent font-mono"
                />
              </div>

              <label className="flex items-center gap-1 text-xs text-fgdim cursor-pointer select-none px-1">
                <input
                  type="checkbox"
                  checked={autoScroll}
                  onChange={(e) => setAutoScroll(e.target.checked)}
                  className="accent-accent"
                />
                <span className="text-[11px]">Tự cuộn</span>
              </label>

              <Button
                variant="subtle"
                size="xs"
                onClick={() => setShowTimestamps(!showTimestamps)}
                title="Bật/Tắt dấu thời gian"
                className="hidden md:flex"
              >
                <Clock size={12} />
                <span>{showTimestamps ? 'Ẩn giờ' : 'Hiện giờ'}</span>
              </Button>

              <Button variant="subtle" size="xs" onClick={copyLogs} disabled={logs.length === 0} className="gap-1">
                {copied ? <><Check size={12} /> Đã copy</> : <><Copy size={12} /> Copy</>}
              </Button>

              <Button variant="subtle" size="xs" onClick={exportLogsToFile} disabled={logs.length === 0} title="Xuất log ra file">
                <DownloadSimple size={12} />
              </Button>

              <Button
                variant="subtle"
                size="xs"
                onClick={() => setFullscreenTerminal(!fullscreenTerminal)}
                title={fullscreenTerminal ? 'Thu nhỏ giao diện' : 'Toàn màn hình console'}
              >
                {fullscreenTerminal ? <CornersIn size={12} /> : <CornersOut size={12} />}
              </Button>

              <Button
                variant="subtle"
                size="xs"
                onClick={() => {
                  playSound('click', soundEnabled)
                  setLogs([])
                }}
                disabled={logs.length === 0}
                title="Xóa bộ đệm log"
              >
                <Trash size={12} />
              </Button>
            </div>
          </div>

          {/* Log Stream */}
          <div
            ref={logBoxRef}
            className="flex-1 overflow-auto p-3 font-mono text-[11px] leading-5 custom-scrollbar select-text bg-bg0/40"
          >
            {filtered.length === 0 ? (
              <div className="text-fgfaint text-xs h-full flex flex-col items-center justify-center select-none gap-2">
                <Terminal size={24} className="opacity-30" />
                <span className="font-mono text-xs">
                  {logs.length === 0
                    ? 'Nhật ký trò chơi trống. Bấm [Vào Chơi Game] để khởi chạy Minecraft.'
                    : 'Không tìm thấy dòng log nào khớp với từ khóa tìm kiếm.'}
                </span>
              </div>
            ) : (
              filtered.map((l) => (
                <div key={l.id} className="flex items-start gap-2 px-1 py-0.5 hover:bg-white/4 rounded transition-colors group">
                  {showTimestamps && (
                    <span className="text-fgfaint text-[10px] flex-shrink-0 tabular-nums select-none">
                      {formatTs(l.ts)}
                    </span>
                  )}
                  <span className={[
                    'flex-shrink-0 w-11 text-right font-medium text-[10px] select-none',
                    LEVEL_STYLES[l.level] || 'text-fgdim',
                  ].join(' ')}>
                    [{l.level || 'INFO'}]
                  </span>
                  <span className={`break-all ${LEVEL_STYLES[l.level] || 'text-fg'}`}>
                    {renderHighlightedText(l.raw ?? l.msg, searchQuery)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function renderHighlightedText(text, query) {
  if (!query || !query.trim() || !text) return text
  const parts = text.split(new RegExp(`(${escapeRegex(query)})`, 'gi'))
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="bg-amber-400/30 text-amber-200 px-0.5 rounded">
        {part}
      </mark>
    ) : (
      part
    )
  )
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function formatTs(ts) {
  const d = new Date(ts)
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function formatElapsed(ms) {
  if (ms < 1000) return '0s'
  const s = Math.floor(ms / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h) return `${h}h ${m}m ${sec}s`
  if (m) return `${m}m ${sec}s`
  return `${sec}s`
}

function ProfileSwitcher({ profiles, current, onChange, onNavigateCreate }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    if (open) document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="px-3 py-1.5 rounded-lg bg-bg1 hover:bg-bg2 border border-line text-xs font-medium text-fg transition-colors flex items-center gap-2 cursor-pointer"
      >
        <span>{current ? current.name : 'Chọn profile'}</span>
        <CaretDown size={11} />
      </button>

      {open && (
        <div className="absolute right-0 mt-1.5 w-72 rounded-lg bg-bg1 border border-line shadow-xl z-50 overflow-hidden">
          <div className="max-h-[240px] overflow-y-auto custom-scrollbar divide-y divide-line/40">
            {profiles.length === 0 ? (
              <div className="p-3 text-xs text-fgdim">Chưa có profile nào.</div>
            ) : profiles.map((p) => (
              <button
                key={p.id}
                onClick={() => { onChange(p.id); setOpen(false) }}
                className={[
                  'w-full text-left px-3 py-2 flex items-center gap-2.5 transition-colors cursor-pointer',
                  p.id === current?.id ? 'bg-accentsoft' : 'hover:bg-bg2',
                ].join(' ')}
              >
                <div className="w-7 h-7 rounded bg-bg0 border border-line flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {p.importIconUrl ? (
                    <img src={p.importIconUrl} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <LoaderIcon loader={p.loader} className="w-full h-full p-1" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate text-fg">{p.name}</div>
                  <div className="text-[10px] text-fgfaint">
                    <span className="uppercase">{p.loader}</span> · <span className="font-mono">{p.gameVersion}</span>
                  </div>
                </div>

                {p.id === current?.id && <Check size={13} className="text-accent flex-shrink-0" />}
              </button>
            ))}
          </div>

          <button
            onClick={() => { onNavigateCreate(); setOpen(false) }}
            className="w-full text-left px-3 py-2 border-t border-line bg-bg0 hover:bg-bg2 text-accent text-xs font-medium transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Plus size={13} />
            Tạo profile mới
          </button>
        </div>
      )}
    </div>
  )
}