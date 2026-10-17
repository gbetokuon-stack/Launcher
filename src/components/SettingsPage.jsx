import React, { useEffect, useState } from 'react'
import { useToast } from '../hooks/useToast.jsx'
import {
  Gear, Coffee, FolderOpen, Info, Cpu, Trash, DownloadSimple,
  CircleNotch, CheckCircle, Palette, SpeakerHigh, Check,
} from '@phosphor-icons/react'
import { PageHeader, Card, Button, Badge, Select } from './ui.jsx'
import { THEMES } from '../theme/themeConfig.js'
import { playSound } from '../utils/sound.js'

const isElectron = typeof window !== 'undefined' && !!window.electronAPI

const AVAILABLE_THEMES = [
  THEMES.cyberpunk,
  THEMES.dark,
  THEMES.amethyst,
  THEMES.crimson,
  THEMES.emerald,
  THEMES.solar,
  THEMES.midnight,
  THEMES.slate,
]

export default function SettingsPage({
  onSettingsChanged,
  onOpenJavaModal,
  currentTheme = 'cyberpunk',
  onThemeChange,
  soundEnabled = true,
  onSoundToggle,
  particlesEnabled = true,
  onParticlesToggle,
}) {
  const toast = useToast()
  const [settings, setSettings] = useState(null)
  const [distros, setDistros] = useState([])
  const [installed, setInstalled] = useState([])
  const [paths, setPaths] = useState(null)
  const [loading, setLoading] = useState(true)

  const reload = async () => {
    if (!isElectron) return
    const [s, d, i, p] = await Promise.all([
      window.electronAPI.getSettings(),
      window.electronAPI.javaFetchDistros(),
      window.electronAPI.javaGetInstalled(),
      window.electronAPI.getPaths(),
    ])
    setSettings(s)
    setDistros(d?.distros || [])
    setInstalled(i?.installed || [])
    setPaths(p)
    setLoading(false)
  }

  useEffect(() => { reload() }, [])

  const update = async (patch) => {
    const next = await window.electronAPI.setSettings(patch)
    setSettings(next)
    onSettingsChanged?.()
  }

  const removeJava = async (j) => {
    const r = await window.electronAPI.javaDelete(j.component, j.majorVersion)
    toast.push({ type: 'success', message: r?.ok ? 'Đã xoá runtime.' : 'Không xoá được.' })
    reload()
  }

  if (loading || !settings) {
    return (
      <div className="flex-1 flex items-center justify-center text-fgdim gap-2 text-xs">
        <CircleNotch size={18} className="animate-spin text-accent" />
        Đang tải cài đặt…
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto">
      <PageHeader
        eyebrow="CÀI ĐẶT"
        title="Cài Đặt Hệ Thống"
        subtitle="Quản lý giao diện, cấu hình RAM, Java Runtime (JRE) và vị trí thư mục lưu trữ."
      />

      <div className="px-8 pt-4 pb-6 space-y-4 max-w-4xl">
        {/* Appearance & Themes */}
        <Section
          icon={<Palette size={18} className="text-accent" />}
          title="Giao Diện & Màu Sắc HUD"
          desc="Tùy chọn chủ đề màu nền công nghệ cao, âm thanh tương tác và hiệu ứng hạt không gian."
        >
          <div>
            <div className="text-xs text-fgdim font-medium mb-2.5">Chủ đề giao diện (8 Phong cách):</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {AVAILABLE_THEMES.map((t) => {
                const isActive = currentTheme === t.id
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      playSound('click', soundEnabled)
                      onThemeChange?.(t.id)
                    }}
                    className={[
                      'flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden',
                      isActive
                        ? 'bg-accentsoft border-accent shadow-md shadow-accent/10'
                        : 'bg-bg1 border-line hover:border-linestrong hover:bg-bg2'
                    ].join(' ')}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg bg-gradient-to-br ${t.previewGradient} flex-shrink-0 border border-line flex items-center justify-center shadow-inner`}
                    >
                      {isActive && <Check size={14} weight="bold" className="text-white" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <div className="text-xs font-bold text-fg truncate">
                          {t.name}
                        </div>
                        <span className="text-[8px] font-mono font-bold text-accent px-1 rounded bg-accentsoft/60">
                          {t.tag}
                        </span>
                      </div>
                      <div className="text-[10px] text-fgfaint truncate mt-0.5">
                        {t.desc}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="h-px bg-line my-4" />

          {/* Sound Effects */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-fg flex items-center gap-2">
                <SpeakerHigh size={15} className="text-accent" />
                Âm thanh giao diện
              </div>
              <div className="text-[11px] text-fgfaint mt-0.5">Phát âm thanh nhẹ khi bấm nút và chuyển trang.</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={() => onSoundToggle?.()}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-bg2 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-fgdim peer-checked:after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent border border-line"></div>
            </label>
          </div>

          <div className="h-px bg-line my-4" />

          {/* Ambient Particles */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-fg flex items-center gap-2">
                <span className="text-accent font-bold">✨</span>
                Hiệu ứng hạt vũ trụ (Ambient Cyber Particles)
              </div>
              <div className="text-[11px] text-fgfaint mt-0.5">Hiển thị các hạt ánh sáng công nghệ và chùm sao trôi bồng bềnh phía sau màn hình.</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={particlesEnabled}
                onChange={() => onParticlesToggle?.()}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-bg2 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-fgdim peer-checked:after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent border border-line"></div>
            </label>
          </div>
        </Section>

        {/* General */}
        <Section
          icon={<Gear size={18} />}
          title="Cấu Hình Trò Chơi"
          desc="Thiết lập RAM mặc định và tích hợp hệ thống."
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-medium text-fg">RAM mặc định</div>
              <div className="text-[11px] text-fgfaint mt-0.5">Dung lượng bộ nhớ RAM cấp cho các profile mới tạo.</div>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1"
                max="16"
                value={settings.ramGb || 4}
                onChange={(e) => update({ ramGb: parseInt(e.target.value, 10) })}
                className="w-36 accent-accent cursor-pointer"
              />
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-bg1 border border-line">
                <Cpu size={13} className="text-accent" />
                <span className="text-xs text-fg font-mono tabular-nums">{settings.ramGb || 4} GB</span>
              </div>
            </div>
          </div>

          <div className="h-px bg-line my-4" />

          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-medium text-fg">Discord Rich Presence</div>
              <div className="text-[11px] text-fgfaint mt-0.5">Hiển thị trạng thái đang chơi Minecraft trên tài khoản Discord của bạn.</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={settings.discordRPC !== false}
                onChange={(e) => update({ discordRPC: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-bg2 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-fgdim peer-checked:after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent border border-line"></div>
            </label>
          </div>
        </Section>

        {/* Java */}
        <Section
          icon={<Coffee size={18} />}
          title="Java Runtime (JRE)"
          desc="Launcher tự động sử dụng Java phù hợp: Java 8 (≤1.16), Java 17 (1.17–1.20), Java 21 (1.21+)."
        >
          <RecommendationHint />
          
          {distros.length > 0 && (
            <div className="mb-4 flex items-center justify-between gap-4 p-3 rounded-lg bg-bg1 border border-line">
              <div>
                <div className="text-xs font-semibold text-fg">Cài đặt tự động toàn bộ JRE</div>
                <div className="text-[11px] text-fgfaint mt-0.5">Tải xuống các phiên bản Java Runtime cần thiết để chơi mọi bản Minecraft.</div>
              </div>
              <Button
                variant={installed.length < distros.length ? 'primary' : 'subtle'}
                size="sm"
                onClick={() => onOpenJavaModal?.('all', null, reload)}
                className="shrink-0"
              >
                <DownloadSimple size={13} />
                {installed.length < distros.length ? 'Cài đặt tất cả' : 'Tải lại toàn bộ'}
              </Button>
            </div>
          )}

          <div className="space-y-2">
            {distros.length === 0 && (
              <div className="text-xs text-fgdim flex items-center gap-2 py-2">
                <CircleNotch size={14} className="animate-spin text-accent" />
                Đang nạp danh sách runtime…
              </div>
            )}
            {distros.map((d) => {
              const isInstalled = installed.some((i) => i.component === d.component)
              return (
                <div
                  key={d.component}
                  className={[
                    'rounded-lg border p-3 flex items-center justify-between gap-3 transition-colors',
                    isInstalled ? 'bg-accentsoft/30 border-accent/40' : 'bg-bg1 border-line',
                  ].join(' ')}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-fg text-xs">{d.component}</span>
                      <Badge mono tone="neutral">Java {d.majorVersion}</Badge>
                      {isInstalled && (
                        <Badge tone="accent"><CheckCircle size={10} weight="fill" /> Đã cài</Badge>
                      )}
                    </div>
                    <div className="text-[10px] text-fgfaint mt-0.5 font-mono truncate">{d.version}</div>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    {isInstalled ? (
                      <Button
                        variant="danger-soft"
                        size="xs"
                        onClick={() => {
                          const i = installed.find((x) => x.component === d.component)
                          if (i) removeJava(i)
                        }}
                      >
                        <Trash size={12} />
                        Gỡ
                      </Button>
                    ) : (
                      <span className="text-[11px] text-fgfaint">Chưa cài</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {installed.length > 0 && (
            <div className="mt-4 pt-3 border-t border-line">
              <div className="text-xs font-semibold text-fg mb-2 flex items-center gap-1.5">
                <CheckCircle size={13} weight="fill" className="text-accent" />
                Đường dẫn Java đã cài ({installed.length})
              </div>
              
              <div className="divide-y divide-line rounded-lg border border-line overflow-hidden bg-bg1">
                {installed.map((j) => (
                  <div 
                    key={j.component} 
                    className="flex items-center justify-between gap-3 px-3 py-2 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-fg">{j.component}</span>
                        <Badge mono tone="neutral">Java {j.majorVersion}</Badge>
                      </div>
                      <div className="text-[10px] text-fgfaint font-mono mt-0.5 truncate select-all" title={j.exe}>
                        {j.exe}
                      </div>
                    </div>
                    
                    <Button
                      variant="subtle"
                      size="xs"
                      onClick={() => {
                        navigator.clipboard.writeText(j.exe)
                        toast.push({ type: 'success', message: 'Đã sao chép đường dẫn Java!' })
                      }}
                      className="shrink-0 font-mono text-[10px]"
                    >
                      Copy Path
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Section>

        {/* Data locations */}
        {paths && (
          <Section
            icon={<FolderOpen size={18} />}
            title="Thư Mục Dữ Liệu"
            desc="Vị trí lưu trữ dữ liệu, profile và assets của launcher."
          >
            <PathsDisplay paths={paths} />
          </Section>
        )}

        <Section icon={<Info size={18} />} title="Thông Tin Ứng Dụng" desc="Phiên bản phần mềm.">
          <div className="text-xs text-fgdim leading-relaxed space-y-1">
            <p><span className="text-fg font-semibold">AcousticForge Launcher</span> — Phiên bản 0.1.7</p>
            <p className="text-[11px] text-fgfaint">
              Minecraft là thương hiệu của Mojang Studios / Microsoft. Launcher này độc lập và không liên kết với Mojang.
            </p>
          </div>
        </Section>
      </div>
    </div>
  )
}

function Section({ icon, title, desc, children }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3 mb-3.5">
        <div className="w-8 h-8 rounded-md bg-bg2 border border-line flex items-center justify-center flex-shrink-0 text-fgdim">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-fg text-sm">{title}</h2>
          {desc && <p className="text-[11px] text-fgfaint mt-0.5">{desc}</p>}
        </div>
      </div>
      {children}
    </Card>
  )
}

function RecommendationHint() {
  const hash = typeof window !== 'undefined' ? window.location.hash : ''
  const m = hash.match(/javaFor=([^&]+)/)
  const mc = m ? decodeURIComponent(m[1]) : null
  if (!mc) return null
  const major = parseInt(mc.split('.')[0] || '0', 10)
  const minor = parseInt(mc.split('.')[1] || '0', 10)
  let rec
  if (major >= 25)         rec = { component: 'java-runtime-epsilon', major: 25 }
  else if (minor <= 16)    rec = { component: 'jre-legacy',          major: 8 }
  else if (minor <= 20)    rec = { component: 'java-runtime-gamma',  major: 17 }
  else                     rec = { component: 'java-runtime-delta',  major: 21 }
  return (
    <div className="mb-3 px-3 py-2 rounded-lg bg-accentsoft border border-accent/30 text-xs text-fg">
      Profile Minecraft <span className="font-mono font-semibold">{mc}</span> cần{' '}
      <span className="font-semibold">{rec.component}</span> (Java {rec.major}).
    </div>
  )
}

function PathsDisplay({ paths }) {
  const rows = [
    { key: 'Dữ liệu',   v: paths.dataDir },
    { key: 'Profiles',  v: paths.instancesDir },
    { key: 'Runtimes',  v: paths.runtimesDir },
    { key: 'Assets',    v: paths.assetsDir },
  ]
  return (
    <div className="space-y-1.5">
      {rows.map((r) => (
        <div key={r.key} className="flex items-center justify-between gap-3 px-3 py-2 rounded-md bg-bg1 border border-line">
          <div className="text-xs text-fgdim w-20 flex-shrink-0 font-medium">
            {r.key}
          </div>
          <div className="text-xs text-fg font-mono truncate flex-1 select-all" title={r.v}>{r.v}</div>
          <Button variant="subtle" size="xs" onClick={() => window.electronAPI.openFolder(r.v)}>
            <FolderOpen size={12} />
            Mở thư mục
          </Button>
        </div>
      ))}
    </div>
  )
}