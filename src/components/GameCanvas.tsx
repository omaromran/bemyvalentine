import { useCallback, useEffect, useRef, useState } from 'react'
import { createCupidLoop, cupidPointerMove } from '../levels/level1Cupid'
import { createKissesLoop } from '../levels/level2Kisses'
import { playPop } from '../utils/audio'

const LOGICAL_WIDTH = 400
const LOGICAL_HEIGHT = 600

type LevelId = 1 | 2

interface GameCanvasProps {
  level: LevelId
  onWin: () => void
  onHit?: (x: number, y: number) => void
  onHitKiss?: (x: number, y: number, combo: number) => void
  soundEnabled: boolean
}

export function GameCanvas({ level, onWin, onHit, onHitKiss, soundEnabled }: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const loopRef = useRef<ReturnType<typeof createCupidLoop> | ReturnType<typeof createKissesLoop> | null>(null)
  const [status, setStatus] = useState<'playing' | 'won' | 'timeup' | null>(null)

  const resize = useCallback(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    const rect = container.getBoundingClientRect()
    const scale = Math.min(rect.width / LOGICAL_WIDTH, rect.height / LOGICAL_HEIGHT, 2)
    const w = Math.floor(LOGICAL_WIDTH * scale)
    const h = Math.floor(LOGICAL_HEIGHT * scale)
    canvas.width = w
    canvas.height = h
    canvas.style.width = rect.width + 'px'
    canvas.style.height = rect.height + 'px'
  }, [])

  useEffect(() => {
    resize()
    const canvas = canvasRef.current
    if (!canvas) return

    if (loopRef.current) {
      loopRef.current.stop()
      loopRef.current = null
    }

    if (level === 1) {
      const loop = createCupidLoop(canvas, {
        onHit(x, y) {
          if (soundEnabled) playPop()
          onHit?.(x, y)
          const s = loop.getState()
          if (s.won) setStatus('won')
        },
        onWin() {
          onWin()
        },
        onTimeUp() {
          setStatus('timeup')
        },
      })
      loopRef.current = loop
      setStatus('playing')
      loop.start()
    } else if (level === 2) {
      const loop = createKissesLoop(canvas, {
        onHit(x, y, combo) {
          if (soundEnabled) playPop()
          onHitKiss?.(x, y, combo)
          const s = loop.getState()
          if (s.won) setStatus('won')
        },
        onWin() {
          onWin()
        },
        onTimeUp() {
          setStatus('timeup')
        },
      })
      loopRef.current = loop
      setStatus('playing')
      loop.start()
    }

    return () => {
      loopRef.current?.stop()
      loopRef.current = null
    }
  }, [level, onWin, onHit, onHitKiss, soundEnabled, resize])

  useEffect(() => {
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [resize])

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (level !== 1 || !canvasRef.current) return
      const angle = cupidPointerMove(canvasRef.current, e.clientX)
      ;(loopRef.current as ReturnType<typeof createCupidLoop>)?.setLauncherAngle?.(angle)
    },
    [level]
  )

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      const canvas = canvasRef.current
      if (!canvas || !loopRef.current) return
      e.preventDefault()
      if (level === 1) {
        ;(loopRef.current as ReturnType<typeof createCupidLoop>).fire?.()
      } else if (level === 2) {
        ;(loopRef.current as ReturnType<typeof createKissesLoop>).fire?.(e.clientX, e.clientY)
      }
    },
    [level]
  )

  return (
    <div
      ref={containerRef}
      className="canvas-wrap"
      style={{ aspectRatio: `${LOGICAL_WIDTH} / ${LOGICAL_HEIGHT}`, maxHeight: '70vh' }}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
    >
      <canvas
        ref={canvasRef}
        style={{ touchAction: 'none', display: 'block', width: '100%', height: '100%' }}
      />
      {status === 'timeup' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.4)',
            borderRadius: 20,
          }}
        >
          <span style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 700 }}>Time’s up! Try again.</span>
        </div>
      )}
    </div>
  )
}
