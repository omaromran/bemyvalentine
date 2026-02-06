import { useEffect, useRef, useState } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  life: number
  maxLife: number
  hue: number
}

const FLOAT_COUNT = 25
const FLOAT_SIZE_MIN = 8
const FLOAT_SIZE_MAX = 20
const FLOAT_SPEED = 0.15

export function HeartParticlesBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const particles: Particle[] = []
    const cw = canvas.width
    const ch = canvas.height
    for (let i = 0; i < FLOAT_COUNT; i++) {
      particles.push({
        x: Math.random() * cw,
        y: Math.random() * ch,
        vx: (Math.random() - 0.5) * FLOAT_SPEED,
        vy: -FLOAT_SPEED - Math.random() * FLOAT_SPEED,
        size: FLOAT_SIZE_MIN + Math.random() * (FLOAT_SIZE_MAX - FLOAT_SIZE_MIN),
        life: 1,
        maxLife: 1,
        hue: 340 + Math.random() * 30,
      })
    }

    let raf = 0
    const loop = () => {
      const w = canvas.width
      const h = canvas.height
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.clearRect(0, 0, w, h)

      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < -p.size) p.x = w + p.size
        if (p.x > w + p.size) p.x = -p.size
        if (p.y < -p.size) p.y = h + p.size
        if (p.y > h + p.size) p.y = -p.size

        const alpha = 0.2 + 0.25 * Math.sin(Date.now() * 0.002 + p.x) ** 2
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.scale(p.size / 12, p.size / 12)
        drawHeart(ctx, `hsla(${p.hue}, 80%, 75%, ${alpha})`)
        ctx.restore()
      })

      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="heart-particles-bg"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  )
}

function drawHeart(ctx: CanvasRenderingContext2D, fill: string) {
  ctx.beginPath()
  const scale = 1
  ctx.moveTo(0, -0.3 * scale)
  ctx.bezierCurveTo(0.6 * scale, -0.8 * scale, 1.2 * scale, 0.4 * scale, 0, 1 * scale)
  ctx.bezierCurveTo(-1.2 * scale, 0.4 * scale, -0.6 * scale, -0.8 * scale, 0, -0.3 * scale)
  ctx.fillStyle = fill
  ctx.fill()
}

/** Burst of hearts at a point (e.g. on hit) */
export function useHeartBurst() {
  const [burst, setBurst] = useState<{ x: number; y: number } | null>(null)
  const trigger = (x: number, y: number) => setBurst({ x, y })
  useEffect(() => {
    if (!burst) return
    const t = setTimeout(() => setBurst(null), 800)
    return () => clearTimeout(t)
  }, [burst])
  return { burst, trigger }
}

/** Confetti hearts on win — rendered in a portal or overlay */
export function ConfettiHearts({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    if (!canvas) return
    const w = window.innerWidth
    const h = window.innerHeight
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const pieces: { x: number; y: number; vx: number; vy: number; size: number; life: number }[] = []
    for (let i = 0; i < 40; i++) {
      pieces.push({
        x: w / 2 + (Math.random() - 0.5) * 100,
        y: h / 2,
        vx: (Math.random() - 0.5) * 12,
        vy: -8 - Math.random() * 14,
        size: 6 + Math.random() * 10,
        life: 1,
      })
    }

    let start = performance.now()
    const duration = 2500

    const loop = () => {
      const t = (performance.now() - start) / duration
      if (t >= 1) return
      ctx.clearRect(0, 0, w, h)
      pieces.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.4
        p.vx *= 0.99
        p.life = 1 - t
        const alpha = p.life
        if (alpha <= 0) return
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.scale(p.size / 10, p.size / 10)
        ctx.globalAlpha = alpha
        drawHeart(ctx, `hsla(350, 85%, 70%, 0.9)`)
        ctx.restore()
      })
      requestAnimationFrame(loop)
    }
    requestAnimationFrame(loop)
  }, [active])

  if (!active) return null
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 50,
      }}
    />
  )
}

/** Heart particle after a firework bursts */
interface HeartParticle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  hue: number
  life: number
  decay: number
}

/** Single firework: rocket goes up, then bursts into hearts */
interface Firework {
  x: number
  y: number
  vy: number
  stage: 'rising' | 'burst'
  burstAt: number
  hearts: HeartParticle[]
}

/**
 * Fireworks made of hearts: rockets shoot up from the bottom, then burst into hearts.
 * Shown on the Final Reveal (image together) screen.
 */
export function HeartFireworks({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    if (!canvas) return
    const w = window.innerWidth
    const h = window.innerHeight
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const fireworks: Firework[] = []
    const NUM_FIREWORKS = 7
    const BURST_HEARTS = 42
    const RISE_SPEED = -11 - Math.random() * 4
    const GRAVITY = 0.28

    function spawnRocket() {
      fireworks.push({
        x: w * 0.15 + Math.random() * w * 0.7,
        y: h + 20,
        vy: RISE_SPEED - Math.random() * 2,
        stage: 'rising',
        burstAt: h * (0.25 + Math.random() * 0.35),
        hearts: [],
      })
    }

    let raf = 0
    let lastSpawn = 0
    const spawnInterval = 520
    const startTime = performance.now()

    spawnRocket()

    const loop = (now: number) => {
      ctx.clearRect(0, 0, w, h)

      if (now - lastSpawn > spawnInterval && fireworks.length < NUM_FIREWORKS) {
        spawnRocket()
        lastSpawn = now
      }

      for (let i = fireworks.length - 1; i >= 0; i--) {
        const f = fireworks[i]
        if (f.stage === 'rising') {
          f.y += f.vy
          ctx.save()
          ctx.globalAlpha = 0.9
          ctx.fillStyle = '#ff6b8a'
          ctx.beginPath()
          ctx.arc(f.x, f.y, 3, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
          if (f.y <= f.burstAt) {
            f.stage = 'burst'
            for (let j = 0; j < BURST_HEARTS; j++) {
              const angle = (Math.PI * 2 * j) / BURST_HEARTS + Math.random() * 0.8
              const speed = 5 + Math.random() * 10
              f.hearts.push({
                x: f.x,
                y: f.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 2,
                size: 18 + Math.random() * 28,
                hue: 340 + Math.random() * 25,
                life: 1,
                decay: 0.01 + Math.random() * 0.008,
              })
            }
          }
        } else {
          f.hearts.forEach((p) => {
            p.x += p.vx
            p.y += p.vy
            p.vy += GRAVITY
            p.vx *= 0.98
            p.life -= p.decay
            if (p.life <= 0) return
            ctx.save()
            ctx.translate(p.x, p.y)
            ctx.scale(p.size / 10, p.size / 10)
            ctx.globalAlpha = p.life
            drawHeart(ctx, `hsla(${p.hue}, 85%, 72%, 0.95)`)
            ctx.restore()
          })
        }
      }

      if (now - startTime < 12000) raf = requestAnimationFrame(loop)
    }
    lastSpawn = startTime
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [active])

  if (!active) return null
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 50,
      }}
    />
  )
}
