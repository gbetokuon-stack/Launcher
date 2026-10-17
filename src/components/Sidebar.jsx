import React from 'react'
import {
  TohruHornsIcon,
  DragonFlameIcon,
  DragonTailIcon,
  MagicCircleIcon,
  DragonMeatIcon,
  MaidBowIcon,
  MaidTeaIcon,
  KobayashiGlassesIcon,
} from './DragonIcons.jsx'

import { useAccounts } from '../hooks/useAccounts.jsx'
import PlayerHead from './PlayerHead.jsx'
import { playSound } from '../utils/sound.js'

const NAV = [
  { id: 'home',        label: 'Trang Chủ',    desc: 'Bắt đầu chơi game',        Icon: TohruHornsIcon, badge: 'Home' },
  { id: 'play',        label: 'Vào Game',     desc: 'Nhật ký & Khởi chạy',      Icon: DragonFlameIcon, badge: 'Play' },
  { id: 'profiles',    label: 'Bản Cài Game', desc: 'Quản lý phiên bản & Mod',  Icon: DragonTailIcon },
  { id: 'mods',        label: 'Kho Mods & FTP', desc: 'Modrinth, CurseForge, FTP', Icon: DragonMeatIcon },
  { id: 'servers',     label: 'Máy Chủ',      desc: 'Chơi Multiplayer online',   Icon: MagicCircleIcon },
  { id: 'accounts',    label: 'Tài Khoản',    desc: 'Offline & Microsoft',      Icon: MaidTeaIcon },
  { id: 'screenshots', label: 'Ảnh Chụp F2',  desc: 'Kho ảnh chụp màn hình',    Icon: MaidBowIcon },
  { id: 'settings',    label: 'Cài Đặt',      desc: 'RAM, Java & Hệ thống',     Icon: KobayashiGlassesIcon },
]

export default function Sidebar({ active, onChange, soundEnabled = true }) {
  const { selectedAccount } = useAccounts()

  const handleNavClick = (id) => {
    playSound('tab', soundEnabled)
    onChange(id)
  }

  return (
    <aside className="w-64 flex-shrink-0 p-4 pr-2 flex flex-col h-full z-20 select-none">
      <div className="flex-1 bg-bg1/70 border border-line rounded-3xl flex flex-col overflow-hidden shadow-2xl backdrop-blur-2xl ring-1 ring-white/5">
        {/* Profile / Account Header with Glow Effect */}
        <button
          onClick={() => handleNavClick('accounts')}
          className="h-18 px-4.5 flex items-center gap-3.5 border-b border-line hover:bg-white/5 transition-all duration-200 text-left w-full group cursor-pointer relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-accent/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {selectedAccount ? (
            <>
              <div className="relative flex-shrink-0 ring-2 ring-accent/50 rounded-xl overflow-hidden group-hover:ring-accent group-hover:scale-105 transition-all shadow-lg shadow-accent/20">
                <PlayerHead uuid={selectedAccount.uuid} username={selectedAccount.username} size={36} />
                <span className="absolute -bottom-1 -right-1 text-[10px] drop-shadow" title="Maid Dragon">🎀</span>
              </div>
              <div className="flex-1 min-w-0 z-10">
                <div className="text-xs font-black text-fg truncate group-hover:text-accent transition-colors leading-snug flex items-center gap-1.5">
                  <span className="truncate">{selectedAccount.username}</span>
                  <span className="text-[10px] text-accent">✦</span>
                </div>
                <div className="text-[9.5px] uppercase tracking-wider text-accent font-extrabold mt-1 leading-none flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                  <span>Sẵn sàng chơi</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="w-9 h-9 rounded-xl bg-bg2/80 border border-line flex items-center justify-center text-accent group-hover:border-accent/50 group-hover:scale-105 transition-all shrink-0 shadow-md">
                <MaidBowIcon size={20} />
              </div>
              <div className="flex-1 min-w-0 z-10">
                <div className="text-xs font-bold text-fgdim group-hover:text-accent transition-colors leading-snug">
                  Chưa có tài khoản
                </div>
                <div className="text-[9px] uppercase tracking-wider text-fgfaint font-bold mt-1 leading-none">
                  Nhập tên để chơi ngay
                </div>
              </div>
            </>
          )}
        </button>

        {/* Navigation list */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto custom-scrollbar">
          {NAV.map((it) => {
            const isActive = active === it.id
            return (
              <button
                key={it.id}
                onClick={() => handleNavClick(it.id)}
                className={[
                  'group w-full flex items-center gap-3 pl-3 pr-3 h-12 rounded-2xl transition-all duration-200 text-left relative overflow-hidden cursor-pointer',
                  isActive
                    ? 'bg-gradient-to-r from-accent/20 to-accent/5 border border-accent/40 text-fg font-bold shadow-[0_4px_20px_var(--color-accentsoft)] ring-1 ring-accent/30'
                    : 'border border-transparent text-fgdim hover:bg-white/5 hover:text-fg hover:border-line/70 hover:translate-x-0.5',
                ].join(' ')}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 rounded-r-full bg-accent shadow-[0_0_12px_var(--color-accent)]" />
                )}
                
                <div className={[
                  'w-8 h-8 rounded-xl flex items-center justify-center transition-all shrink-0',
                  isActive
                    ? 'text-accent scale-110 drop-shadow-[0_0_10px_var(--color-accent)] bg-accent/15'
                    : 'text-fgdim group-hover:text-accent group-hover:scale-105 bg-white/2 group-hover:bg-white/5'
                ].join(' ')}>
                  <it.Icon size={20} />
                </div>

                <div className="flex-1 min-w-0 leading-normal">
                  <div className="text-xs font-bold leading-tight flex items-center justify-between">
                    <span className="truncate">{it.label}</span>
                    {it.badge && (
                      <span className="text-[8.5px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-accent/20 text-accent ring-1 ring-accent/40 shadow-[0_0_8px_var(--color-accentsoft)]">
                        {it.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-[9.5px] text-fgfaint truncate mt-0.5 leading-normal">{it.desc}</div>
                </div>
              </button>
            )
          })}
        </nav>

        {/* Footer info: Kobayashi Tohru Easter Egg */}
        <div className="p-3.5 border-t border-line bg-bg0/30">
          <div className="flex items-center gap-2">
            <span className="text-base select-none">🐉</span>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-black text-accent truncate flex items-center gap-1">
                <span>Minecraft Launcher</span>
                <span className="text-[8px] px-1 rounded bg-accent/15">v0.1.5</span>
              </div>
              <div className="text-[8.5px] text-fgfaint truncate mt-0.5 font-medium">
                Offline · Microsoft · Mods & FTP
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}