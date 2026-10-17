import React, { useEffect, useState, useRef } from 'react'
import {
  Bell, X, CircleNotch, ArrowSquareOut,
  Check, CornersOut, CornersIn,
  House, Play, Stack, PuzzlePiece,
  Globe, Camera, UserCircle, Gear, GameController,
  SpeakerHigh, SpeakerSlash, Sparkle, Palette, Clock
} from '@phosphor-icons/react'
import { THEMES } from '../theme/themeConfig.js'
import { playSound } from '../utils/sound.js'
import { useAccounts } from '../hooks/useAccounts.jsx'
import PlayerHead from './PlayerHead.jsx'

const NAV_ITEMS = [
  { id: 'home',        label: 'Trang Chủ',    icon: House },
  { id: 'play',        label: 'Vào Game',     icon: Play },
  { id: 'profiles',    label: 'Bản Cài',      icon: Stack },
  { id: 'mods',        label: 'Mods & FTP',   icon: PuzzlePiece },
  { id: 'servers',     label: 'Máy Chủ',      icon: Globe },
  { id: 'screenshots', label: 'Ảnh Chụp',     icon: Camera },
  { id: 'accounts',    label: 'Tài Khoản',    icon: UserCircle },
  { id: 'settings',    label: 'Cài Đặt',      icon: Gear },
]

export default function TitleBar({
  currentTheme = 'cyberpunk',
  onThemeChange,
  soundEnabled = true,
  onSoundToggle,
  particlesEnabled = true,
  onParticlesToggle,
  playState = 'idle',
  activePage = 'home',
  onNavigate,
}) {
  const isElectron = typeof window !== 'undefined' && !!window.electronAPI
  const [max, setMax] = useState(false)
  const { selectedAccount } = useAccounts()

  // Real-time HUD Clock
  const [timeStr, setTimeStr] = useState('')
  useEffect(() => {
    const update = () => {
      const now = new Date()
      setTimeStr(now.toLocaleTimeString('vi-VN', { hour12: false }))
    }
    update()
    const timer = setInterval(update, 1000)
    return () => clearInterval(timer)
  }, [])

  // Notification states
  const [releases, setReleases] = useState([])
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false)
  const [hasUnread, setHasUnread] = useState(false)
  const [selectedRelease, setSelectedRelease] = useState(null)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef(null)
  const themeDropdownRef = useRef(null)

  // Listen to maximize state changes
  useEffect(() => {
    if (!isElectron) return
    window.electronAPI.isMaximized().then(setMax)
    const off = window.electronAPI.onMaximizedState(setMax)
    return () => { try { off && off() } catch {} }
  }, [isElectron])

  // Load cached releases and fetch updates
  useEffect(() => {
    try {
      const cached = localStorage.getItem('xforge_releases')
      if (cached) {
        const parsed = JSON.parse(cached)
        setReleases(parsed)
        checkUnreadState(parsed)
      }
    } catch {}
    fetchReleases()
  }, [])

  // Click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(event.target)) {
        setThemeDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchReleases = async () => {
    setLoading(true)
    try {
      const res = await fetch('https://api.github.com/repos/gbetokuon-stack/AcousticLauncher/releases')
      if (res.ok) {
        const data = await res.json()
        const formatted = data.map(rel => ({
          id: rel.id,
          tag_name: rel.tag_name,
          name: rel.name || rel.tag_name,
          body: rel.body || '',
          published_at: rel.published_at,
          html_url: rel.html_url
        }))
        setReleases(formatted)
        localStorage.setItem('xforge_releases', JSON.stringify(formatted))
        checkUnreadState(formatted)
      }
    } catch (err) {
      console.warn('Không thể fetch changelog mới:', err)
    } finally {
      setLoading(false)
    }
  }

  const checkUnreadState = (list) => {
    if (!list || list.length === 0) return
    const lastRead = localStorage.getItem('xforge_last_read_release')
    const latestVersion = list[0].tag_name
    if (!lastRead || lastRead !== latestVersion) {
      setHasUnread(true)
    } else {
      setHasUnread(false)
    }
  }

  const handleOpenDropdown = () => {
    setDropdownOpen(!dropdownOpen)
    setThemeDropdownOpen(false)
    playSound('click', soundEnabled)
    if (releases.length > 0) {
      const latestVersion = releases[0].tag_name
      localStorage.setItem('xforge_last_read_release', latestVersion)
      setHasUnread(false)
    }
  }

  const handleMaximizeClick = async () => {
    playSound('click', soundEnabled)
    if (isElectron) {
      const isNowMax = await window.electronAPI.maximize()
      setMax(!!isNowMax)
    }
  }

  const handleTabClick = (id) => {
    playSound('tab', soundEnabled)
    onNavigate?.(id)
  }

  // Simple Markdown Renderer
  const renderMarkdown = (text) => {
    if (!text) return <p className="text-xs text-fgfaint">Không có nội dung cập nhật.</p>
    const lines = text.split('\n')

    const parseInline = (lineText) => {
      const parts = lineText.split('**')
      return parts.map((part, i) => {
        if (i % 2 === 1) {
          return <strong key={i} className="font-semibold text-fg">{part}</strong>
        }
        const subParts = part.split('`')
        return subParts.map((sub, j) => {
          if (j % 2 === 1) {
            return <code key={j} className="bg-bg3 px-1 py-0.5 rounded text-[11px] font-mono text-accent">{sub}</code>
          }
          return sub
        })
      })
    }

    return lines.map((line, idx) => {
      const content = line.trim()
      if (content.startsWith('###')) {
        return <h4 key={idx} className="text-xs font-bold text-fg mt-3 mb-1">{content.replace(/^###\s*/, '')}</h4>
      }
      if (content.startsWith('##')) {
        return <h3 key={idx} className="text-sm font-bold text-fg mt-4 mb-1 border-b border-line pb-1">{content.replace(/^##\s*/, '')}</h3>
      }
      if (content.startsWith('#')) {
        return <h2 key={idx} className="text-sm font-bold text-fg mt-4 mb-1.5">{content.replace(/^#\s*/, '')}</h2>
      }
      if (content.startsWith('-') || content.startsWith('*')) {
        return (
          <li key={idx} className="text-xs text-fgdim ml-4 list-disc my-1">
            {parseInline(content.replace(/^[-*]\s*/, ''))}
          </li>
        )
      }
      if (content === '') {
        return <div key={idx} className="h-1.5" />
      }
      return <p key={idx} className="text-xs text-fgdim my-1">{parseInline(content)}</p>
    })
  }

  const activeThemeObj = THEMES[currentTheme] || THEMES.dark

  return (
    <>
      {/* ── TOP TITLEBAR: drag area + tactical gaming HUD ── */}
      <header className="titlebar h-11 flex items-center justify-between select-none bg-bg0/90 backdrop-blur-md border-b border-line relative z-[9999] px-3 gap-2">
        {/* Left: Brand with Cyber Reticle & Engine Badge */}
        <div className="no-drag flex items-center gap-2.5 cursor-pointer shrink-0" onClick={() => handleTabClick('home')}>
          <div className="w-6 h-6 rounded-lg bg-accentsoft border border-accent/40 flex items-center justify-center text-accent shadow-sm relative group">
            <GameController size={14} weight="fill" className="group-hover:scale-110 transition-transform" />
            <div className="absolute -top-0.5 -left-0.5 w-1 h-1 bg-accent rounded-full" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black tracking-wider text-fg font-mono uppercase">
              ACOUSTIC<span className="text-accent">FORGE</span>
            </span>
            <span className="tech-tag text-[9px] text-accent border-accent/40 bg-accentsoft/50 py-0 px-1 font-mono hidden sm:inline-block">
              TITANIUM v0.1.7
            </span>
          </div>

          {/* Real-time HUD Clock */}
          {timeStr && (
            <div className="hidden xl:flex items-center gap-1 text-[10px] font-mono text-fgfaint px-2 py-0.5 rounded bg-bg1/60 border border-line">
              <Clock size={11} className="text-accent/80" />
              <span>{timeStr}</span>
            </div>
          )}
        </div>

        {/* Center: Navigation tabs with sleek HUD indicator */}
        <nav className="no-drag flex items-center gap-1 p-1 rounded-2xl bg-black/40 border border-white/[0.06] backdrop-blur-md">
          {NAV_ITEMS.map((item) => {
            const isActive = activePage === item.id
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={[
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer relative',
                  isActive
                    ? 'bg-gradient-to-r from-accent/25 to-accent/10 text-white border border-accent/40 shadow-[0_0_14px_rgba(59,130,246,0.25)] font-bold'
                    : 'text-white/50 hover:text-white hover:bg-white/[0.05] border border-transparent',
                ].join(' ')}
                title={item.label}
              >
                <Icon size={14} weight={isActive ? 'fill' : 'regular'} className={isActive ? 'text-accent' : ''} />
                <span className="hidden md:inline">{item.label}</span>
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-accent rounded-full shadow-[0_0_8px_var(--color-accent)]" />
                )}
              </button>
            )
          })}
        </nav>

        {/* Right: Quick Tools, Audio, Particles, Theme & Window controls */}
        <div className="no-drag flex items-center gap-1 shrink-0">
          {/* Game running status */}
          {playState === 'running' && (
            <button
              onClick={() => handleTabClick('play')}
              className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-500/15 border border-emerald-500/35 px-2.5 py-1 rounded-md cursor-pointer animate-pulse"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
              ĐANG CHƠI
            </button>
          )}
          {(playState === 'launching' || playState === 'preparing') && (
            <button
              onClick={() => handleTabClick('play')}
              className="flex items-center gap-1.5 text-[10px] font-mono text-accent bg-accentsoft border border-accent/35 px-2 py-1 rounded-md cursor-pointer"
            >
              <CircleNotch size={11} className="animate-spin" />
              ĐANG TẢI...
            </button>
          )}

          {/* Sound FX Toggle */}
          <button
            onClick={() => {
              onSoundToggle?.()
              playSound('click', !soundEnabled)
            }}
            className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors cursor-pointer ${
              soundEnabled
                ? 'text-fgdim hover:text-fg hover:bg-bg1'
                : 'text-fgfaint/50 hover:text-fgdim hover:bg-bg1'
            }`}
            title={soundEnabled ? 'Âm thanh: Đang bật' : 'Âm thanh: Đang tắt'}
          >
            {soundEnabled ? <SpeakerHigh size={14} className="text-accent" /> : <SpeakerSlash size={14} />}
          </button>

          {/* Particles FX Toggle */}
          <button
            onClick={() => {
              playSound('click', soundEnabled)
              onParticlesToggle?.()
            }}
            className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors cursor-pointer ${
              particlesEnabled
                ? 'text-accent hover:bg-bg1'
                : 'text-fgfaint/50 hover:text-fgdim hover:bg-bg1'
            }`}
            title={particlesEnabled ? 'Hiệu ứng hạt vũ trụ: Đang bật' : 'Hiệu ứng hạt: Đang tắt'}
          >
            <Sparkle size={14} weight={particlesEnabled ? 'fill' : 'regular'} />
          </button>

          {/* Quick Theme Switcher popover */}
          <div className="relative" ref={themeDropdownRef}>
            <button
              onClick={() => {
                playSound('click', soundEnabled)
                setThemeDropdownOpen(!themeDropdownOpen)
                setDropdownOpen(false)
              }}
              className="w-7 h-7 rounded-md flex items-center justify-center text-fgdim hover:text-accent hover:bg-bg1 transition-colors cursor-pointer relative"
              title="Đổi chủ đề giao diện HUD"
            >
              <Palette size={14} />
              <span
                className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: activeThemeObj.primaryColor }}
              />
            </button>

            {themeDropdownOpen && (
              <div className="absolute top-9 right-0 w-64 bg-bg1/95 backdrop-blur-md border border-linestrong rounded-xl shadow-2xl overflow-hidden z-50 flex flex-col p-2 space-y-1">
                <div className="flex items-center justify-between px-2 py-1.5 border-b border-line mb-1">
                  <span className="text-[11px] font-bold text-fg uppercase font-mono flex items-center gap-1.5">
                    <Palette size={12} className="text-accent" />
                    Chủ đề HUD Gaming
                  </span>
                  <span className="text-[9px] font-mono text-accent uppercase font-semibold">
                    {activeThemeObj.tag || 'PRO'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 max-h-64 overflow-y-auto custom-scrollbar p-0.5">
                  {Object.values(THEMES).filter((t, idx, arr) => arr.findIndex(x => x.id === t.id) === idx).map((t) => {
                    const isCur = currentTheme === t.id
                    return (
                      <button
                        key={t.id}
                        onClick={() => {
                          playSound('click', soundEnabled)
                          onThemeChange?.(t.id)
                          setThemeDropdownOpen(false)
                        }}
                        className={`flex items-center gap-2 p-1.5 rounded-lg border text-left transition-all cursor-pointer ${
                          isCur
                            ? 'bg-accentsoft border-accent shadow-sm'
                            : 'bg-bg0/80 border-line hover:border-linestrong hover:bg-bg2'
                        }`}
                      >
                        <div
                          className="w-4 h-4 rounded-md shrink-0 flex items-center justify-center border border-white/20"
                          style={{ backgroundColor: t.primaryColor }}
                        >
                          {isCur && <Check size={10} weight="bold" className="text-black" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[10px] font-bold text-fg truncate">{t.name}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* User account pill */}
          {selectedAccount ? (
            <button
              onClick={() => handleTabClick('accounts')}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-md hover:bg-bg1 border border-transparent hover:border-line transition-colors cursor-pointer"
              title="Quản lý tài khoản"
            >
              <PlayerHead uuid={selectedAccount.uuid} username={selectedAccount.username} size={16} />
              <span className="text-[11px] font-semibold text-fgdim max-w-[85px] truncate">{selectedAccount.username}</span>
            </button>
          ) : (
            <button
              onClick={() => handleTabClick('accounts')}
              className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] text-fgfaint hover:text-fgdim hover:bg-bg1 transition-colors cursor-pointer"
            >
              <UserCircle size={14} />
              <span className="hidden sm:inline">Đăng nhập</span>
            </button>
          )}

          {/* Notification bell */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={handleOpenDropdown}
              className="w-7 h-7 rounded-md flex items-center justify-center text-fgfaint hover:bg-bg1 hover:text-fgdim transition-colors relative"
              title="Thông báo cập nhật"
            >
              <Bell size={14} />
              {hasUnread && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
              )}
              {hasUnread && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-accent" />
              )}
            </button>

            {dropdownOpen && (
              <div className="absolute top-9 right-0 w-72 bg-bg1/95 backdrop-blur-md border border-linestrong rounded-xl shadow-2xl overflow-hidden z-50 flex flex-col max-h-80">
                <div className="flex items-center justify-between px-3 py-2 border-b border-line">
                  <span className="text-xs font-bold text-fg font-mono uppercase">Cập nhật</span>
                  <span className="text-[10px] text-fgfaint font-mono">
                    {releases.length > 0 ? `${releases.length} phiên bản` : ''}
                  </span>
                </div>

                <div className="overflow-y-auto p-1.5 space-y-0.5 custom-scrollbar">
                  {loading ? (
                    <div className="flex items-center justify-center p-4 text-fgfaint text-xs gap-2">
                      <CircleNotch size={12} className="animate-spin" />
                      Đang kiểm tra...
                    </div>
                  ) : releases.length === 0 ? (
                    <div className="p-4 text-center text-fgfaint text-xs">
                      Chưa có lịch sử cập nhật.
                    </div>
                  ) : (
                    releases.map((rel) => (
                      <div
                        key={rel.id}
                        onClick={() => {
                          playSound('click', soundEnabled)
                          setSelectedRelease(rel)
                          setDropdownOpen(false)
                        }}
                        className="p-2 rounded-lg hover:bg-bg2 transition-colors cursor-pointer flex flex-col gap-0.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-fg truncate">{rel.name}</span>
                          <span className="text-[9px] font-mono text-accent shrink-0">{rel.tag_name}</span>
                        </div>
                        <span className="text-[10px] text-fgfaint">
                          {new Date(rel.published_at).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Separator */}
          <div className="h-4 w-px bg-line mx-0.5" />

          {/* Window controls */}
          <button
            onClick={() => window.electronAPI?.minimize()}
            className="w-7 h-7 rounded-md flex items-center justify-center text-fgfaint hover:bg-bg1 hover:text-fg transition-colors"
            aria-label="Minimize"
          >
            <svg width="10" height="10" viewBox="0 0 10 10"><rect width="10" height="1" y="5" fill="currentColor" /></svg>
          </button>

          <button
            onClick={handleMaximizeClick}
            className="w-7 h-7 rounded-md flex items-center justify-center text-fgfaint hover:bg-bg1 hover:text-fg transition-colors"
            aria-label="Maximize"
          >
            {max ? <CornersIn size={12} weight="bold" /> : <CornersOut size={12} weight="bold" />}
          </button>

          <button
            onClick={() => window.electronAPI?.close()}
            className="w-7 h-7 rounded-md flex items-center justify-center text-fgfaint hover:bg-red-500/20 hover:text-red-400 transition-colors"
            aria-label="Close"
          >
            <svg width="10" height="10" viewBox="0 0 10 10">
              <path d="M1 1 L9 9 M9 1 L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </header>

      {/* Changelog Detail Modal */}
      {selectedRelease && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 no-drag">
          <div className="bg-bg1 border border-linestrong rounded-xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden max-h-[80vh]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-line bg-bg0/60">
              <div>
                <h3 className="text-sm font-bold text-fg flex items-center gap-2">
                  <span>Chi tiết bản phát hành</span>
                  <span className="text-[10px] font-mono text-accent bg-accentsoft px-1.5 py-0.5 rounded border border-accent/30">{selectedRelease.tag_name}</span>
                </h3>
                <p className="text-[10px] text-fgfaint mt-0.5 font-mono">
                  {new Date(selectedRelease.published_at).toLocaleDateString('vi-VN')}
                </p>
              </div>
              <button
                onClick={() => setSelectedRelease(null)}
                className="w-6 h-6 flex items-center justify-center rounded-lg text-fgfaint hover:text-fg hover:bg-bg2 transition-colors cursor-pointer"
              >
                <X size={13} weight="bold" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar select-text">
              <h2 className="text-sm font-bold text-fg mb-3 border-b border-line pb-2">
                {selectedRelease.name}
              </h2>
              <div className="space-y-0.5">
                {renderMarkdown(selectedRelease.body)}
              </div>
            </div>

            <div className="flex justify-end gap-2 px-4 py-2.5 border-t border-line bg-bg0/40">
              {isElectron && (
                <button
                  onClick={() => window.electronAPI.openExternal(selectedRelease.html_url)}
                  className="flex items-center gap-1 text-xs text-accent hover:text-accentstrong font-semibold px-3 py-1 rounded-lg border border-line hover:bg-bg2 transition-colors cursor-pointer"
                >
                  <ArrowSquareOut size={12} />
                  GitHub Release
                </button>
              )}
              <button
                onClick={() => setSelectedRelease(null)}
                className="text-xs text-fg font-medium bg-bg2 hover:bg-bg3 px-3.5 py-1 rounded-lg transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}