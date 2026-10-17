import React, { useState, useEffect } from 'react'
import { GameController } from '@phosphor-icons/react'

const TIPS = [
  'Đang kiểm tra cấu hình...',
  'Tối ưu hóa Java và RAM...',
  'Chuẩn bị dữ liệu game...',
  'Sẵn sàng khởi động...',
]

export default function LauncherSplashLoader({ progress = null, label = null }) {
  const [tipIdx, setTipIdx] = useState(0)
  const [simProgress, setSimProgress] = useState(15)

  useEffect(() => {
    const timer = setInterval(() => {
      setTipIdx((prev) => (prev + 1) % TIPS.length)
    }, 2000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (progress !== null) {
      setSimProgress(progress)
      return
    }
    const timer = setInterval(() => {
      setSimProgress((prev) => {
        if (prev >= 95) return prev
        return Math.min(prev + Math.random() * 12 + 4, 95)
      })
    }, 350)
    return () => clearInterval(timer)
  }, [progress])

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 select-none">
      <div className="flex flex-col items-center text-center max-w-xs w-full">
        {/* Icon */}
        <div className="w-14 h-14 rounded-xl bg-bg1 border border-line flex items-center justify-center mb-4">
          <GameController size={28} className="text-fgdim" />
        </div>

        {/* Title */}
        <h1 className="text-lg font-bold text-fg mb-1">Minecraft Launcher</h1>
        <p className="text-[10px] text-fgfaint mb-4">Offline · Microsoft · Mods</p>

        {/* Tip */}
        <div className="min-h-[32px] px-3 py-2 rounded-md bg-bg1 border border-line text-xs text-fgdim mb-4 flex items-center justify-center w-full">
          {label || TIPS[tipIdx]}
        </div>

        {/* Progress */}
        <div className="w-full space-y-1.5">
          <div className="h-1 w-full bg-bg2 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-accent transition-all duration-300"
              style={{ width: `${Math.round(simProgress)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-fgfaint">
            <span>Đang chuẩn bị...</span>
            <span className="font-mono">{Math.round(simProgress)}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}
