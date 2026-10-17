import React, { useEffect, useRef } from 'react'

export default function AmbientParticles({ enabled = true }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!enabled) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }

    window.addEventListener('resize', handleResize)

    const PARTICLE_COUNT = 42
    const particles = []

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2 + 1,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.3 - 0.15,
        alpha: Math.random() * 0.5 + 0.15,
        maxAlpha: Math.random() * 0.4 + 0.3,
        pulseSpeed: Math.random() * 0.015 + 0.005,
        shape: Math.random() < 0.25 ? 'diamond' : Math.random() < 0.45 ? 'cross' : 'circle',
        size: Math.random() * 3 + 2,
      })
    }

    // Helper to draw mini diamond
    const drawDiamond = (cx, cy, s) => {
      ctx.beginPath()
      ctx.moveTo(cx, cy - s)
      ctx.lineTo(cx + s, cy)
      ctx.lineTo(cx, cy + s)
      ctx.lineTo(cx - s, cy)
      ctx.closePath()
    }

    // Helper to draw mini crosshair (+)
    const drawCross = (cx, cy, s) => {
      ctx.beginPath()
      ctx.moveTo(cx - s, cy)
      ctx.lineTo(cx + s, cy)
      ctx.moveTo(cx, cy - s)
      ctx.lineTo(cx, cy + s)
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      // Fetch active accent color from CSS variable
      const accent = getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim() || '#3b82f6'

      // 1. Draw constellation lines between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 85) {
            const lineAlpha = (1 - dist / 85) * 0.12 * Math.min(particles[i].alpha, particles[j].alpha)
            ctx.strokeStyle = accent
            ctx.globalAlpha = lineAlpha
            ctx.lineWidth = 0.8
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }

      // 2. Render particles
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        p.alpha += p.pulseSpeed

        if (p.alpha > p.maxAlpha || p.alpha < 0.06) {
          p.pulseSpeed = -p.pulseSpeed
        }

        if (p.x < 0) p.x = width
        else if (p.x > width) p.x = 0
        if (p.y < 0) p.y = height
        else if (p.y > height) p.y = 0

        ctx.save()
        ctx.fillStyle = accent
        ctx.strokeStyle = accent
        ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha))
        ctx.shadowBlur = 8
        ctx.shadowColor = accent

        if (p.shape === 'diamond') {
          drawDiamond(p.x, p.y, p.size)
          ctx.fill()
        } else if (p.shape === 'cross') {
          ctx.lineWidth = 1
          drawCross(p.x, p.y, p.size)
          ctx.stroke()
        } else {
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
          ctx.fill()
        }

        ctx.restore()
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-[1] w-full h-full opacity-60"
    />
  )
}
