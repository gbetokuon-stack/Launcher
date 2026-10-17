import React, { useState } from 'react'
import ModrinthTab from './mods/modrinth/ModrinthTab.jsx'
import CurseForgeTab from './mods/curseforge/CurseForgeTab.jsx'
import FtpTab from './mods/ftp/FtpTab.jsx'
import { Sparkle, Flame, HardDrives } from '@phosphor-icons/react'

function ModrinthIcon({ className }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="currentColor">
      <path d="M2 27L16 3l14 24H2z" />
      <path d="M10 22h12l-6-10-6 10z" fill="rgba(0,0,0,0.3)" />
    </svg>
  )
}

const PLATFORMS = [
  {
    id: 'curseforge',
    label: 'CurseForge',
    sub: 'Kho mod lớn nhất',
    Icon: Flame,
    activeColor: 'from-orange-500 to-amber-600 text-white shadow-[0_0_24px_rgba(249,115,22,0.45)] border-orange-400/50',
    idleHover: 'hover:border-orange-500/40 hover:bg-orange-500/10 text-orange-400',
    glowColor: 'bg-orange-500/15',
  },
  {
    id: 'modrinth',
    label: 'Modrinth',
    sub: 'Nguồn mở & Nhanh',
    Icon: ModrinthIcon,
    activeColor: 'from-emerald-500 to-teal-600 text-white shadow-[0_0_24px_rgba(16,185,129,0.45)] border-emerald-400/50',
    idleHover: 'hover:border-emerald-500/40 hover:bg-emerald-500/10 text-emerald-400',
    glowColor: 'bg-emerald-500/15',
  },
  {
    id: 'ftp',
    label: 'Máy Chủ FTP',
    sub: 'Đồng bộ máy chủ',
    Icon: HardDrives,
    activeColor: 'from-purple-500 to-indigo-600 text-white shadow-[0_0_24px_rgba(168,85,247,0.45)] border-purple-400/50',
    idleHover: 'hover:border-purple-500/40 hover:bg-purple-500/10 text-purple-400',
    glowColor: 'bg-purple-500/15',
  },
]

export default function ModsPage({ profiles = [], selectedProfileId, pageContext, setPageContext }) {
  const [platform, setPlatform] = useState('curseforge')
  const [inDetail, setInDetail] = useState(false)

  const currentPlatform = PLATFORMS.find(p => p.id === platform) || PLATFORMS[0]

  const handlePlatformChange = (p) => {
    setPlatform(p)
    setInDetail(false)
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 min-w-0 relative">
      {/* Dynamic Aurora Ambient Lighting */}
      <div className={`absolute top-0 left-1/4 w-[600px] h-64 ${currentPlatform.glowColor} rounded-full blur-[120px] pointer-events-none transition-all duration-700 -z-10`} />

      {!inDetail && (
        <header className="px-8 pt-5 pb-2 flex flex-col md:flex-row md:items-end justify-between gap-4 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/10 text-white/80 border border-white/10 backdrop-blur-md flex items-center gap-1.5">
                <Sparkle size={11} className="text-amber-400" weight="fill" />
                GAME CONTENT HUB
              </span>
              <span className="text-xs text-white/40">• Hơn 50,000+ tài nguyên Minecraft</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
              Kho Mods, Modpack & Shaders
            </h1>
            <p className="text-xs text-white/50 mt-1 max-w-xl">
              Khám phá và cài đặt tự động từ các nền tảng mod hàng đầu thế giới với tốc độ cao.
            </p>
          </div>

          {/* Platform Switcher Dock */}
          <div className="flex items-center gap-2 p-1.5 rounded-3xl bg-[#12121c]/90 border border-white/[0.08] backdrop-blur-2xl shadow-xl shrink-0">
            {PLATFORMS.map((p) => {
              const isActive = platform === p.id
              const IconComp = p.Icon
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handlePlatformChange(p.id)}
                  className={`flex items-center gap-2.5 px-4 py-2 rounded-2xl text-xs font-bold transition-all duration-300 cursor-pointer border ${
                    isActive
                      ? `bg-gradient-to-r ${p.activeColor}`
                      : `border-transparent ${p.idleHover} text-white/70`
                  }`}
                >
                  <IconComp className="w-4 h-4 shrink-0" size={16} />
                  <div className="flex flex-col text-left">
                    <span className="leading-tight">{p.label}</span>
                    <span className={`text-[9px] font-normal leading-tight opacity-75 ${isActive ? 'text-white/90' : 'text-white/40'}`}>
                      {p.sub}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </header>
      )}

      {!inDetail && pageContext && (
        <div className="mx-8 mb-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-accent/20 via-accent/10 to-transparent border border-accent/30 flex items-center justify-between text-xs text-white/80 shrink-0 backdrop-blur-xl">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-accent animate-ping" />
            <span>
              Đang lọc mod tương thích với profile: <strong className="text-white font-bold">{pageContext.profileName}</strong>
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-accent/20 border border-accent/40 text-[10px] font-black uppercase text-accent">
              {pageContext.loader} • MC {pageContext.gameVersion}
            </span>
          </div>
          <button
            onClick={() => setPageContext(null)}
            className="text-xs font-bold text-accent hover:text-white transition-colors cursor-pointer px-2.5 py-1 rounded-xl hover:bg-accent/20"
          >
            ✕ Xóa bộ lọc profile
          </button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-h-0 min-w-0">
        {platform === 'modrinth' && (
          <ModrinthTab
            selectedProfileId={selectedProfileId}
            pageContext={pageContext}
            onDetailStateChange={setInDetail}
          />
        )}
        {platform === 'curseforge' && (
          <CurseForgeTab
            selectedProfileId={selectedProfileId}
            pageContext={pageContext}
            onDetailStateChange={setInDetail}
          />
        )}
        {platform === 'ftp' && (
          <FtpTab
            selectedProfileId={selectedProfileId}
            pageContext={pageContext}
          />
        )}
      </div>
    </div>
  )
}
