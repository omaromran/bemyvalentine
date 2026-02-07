/**
 * Game 1: Cupid Arrow — throw a heart arrow into the flying face.
 * Difficulty constants at top.
 */

const HITS_TO_WIN = 3
const GAME_DURATION_SEC = 30
const FACE_SIZE = 72
const FACE_SPEED_X = 120
const FACE_SPEED_Y = 0
const SIN_AMPLITUDE = 80
const SIN_FREQ = 0.8
const ARROW_SPEED = -780
const ALEX_BOTTOM_PAD = 14

const HER_IMG = '/images/omar.jpg'
const ALEX_IMG = '/images/alex.jpeg'
const ALEX_SIZE = 56

export interface CupidCallbacks {
  onHit: (x: number, y: number) => void
  onWin: () => void
  onTimeUp: () => void
}

export interface CupidState {
  score: number
  timeLeft: number
  won: boolean
  timeUp: boolean
}

export function createCupidLoop(
  canvas: HTMLCanvasElement,
  callbacks: CupidCallbacks
): { start: () => void; stop: () => void; getState: () => CupidState; setLauncherAngle: (angle: number) => void; fire: () => void } {
  const ctx = canvas.getContext('2d')!
  let rafId = 0
  let running = false
  let startTime = 0
  let state: CupidState = { score: 0, timeLeft: GAME_DURATION_SEC, won: false, timeUp: false }

  let faceX = 0
  let faceY = 0
  let faceVx = FACE_SPEED_X / 60
  let faceVy = FACE_SPEED_Y / 60
  let effectiveFaceY = 0
  let faceImg: HTMLImageElement | null = null
  let alexImg: HTMLImageElement | null = null
  const faceImgLoaded = new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = HER_IMG
  })
  const alexImgLoaded = new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = ALEX_IMG
  })

  const arrows: { x: number; y: number; vx: number; vy: number; active: boolean }[] = []
  let launcherAngle = 0

  const w = () => canvas.width
  const h = () => canvas.height

  function getState() {
    return { ...state }
  }

  function spawnFace() {
    faceX = w() * 0.2 + Math.random() * w() * 0.6
    faceY = h() * 0.25 + Math.random() * h() * 0.35
    faceVx = (Math.random() > 0.5 ? 1 : -1) * (FACE_SPEED_X / 60)
    faceVy = 0
  }

  function hitTest(ax: number, ay: number): boolean {
    const cx = faceX + FACE_SIZE / 2
    const cy = effectiveFaceY + FACE_SIZE / 2
    const r = FACE_SIZE / 2
    const dx = ax + 8 - cx
    const dy = ay - cy
    return dx * dx + dy * dy <= r * r
  }

  function shoot() {
    const lx = w() / 2
    const ly = h() - ALEX_SIZE - ALEX_BOTTOM_PAD
    const rad = (launcherAngle * Math.PI) / 180
    const vx = Math.sin(rad) * ARROW_SPEED / 60
    const vy = Math.cos(rad) * (ARROW_SPEED / 60)
    arrows.push({ x: lx, y: ly, vx, vy, active: true })
  }

  function drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, fill: string) {
    ctx.save()
    ctx.translate(x, y)
    ctx.scale(size, size)
    ctx.beginPath()
    ctx.moveTo(0, -0.3)
    ctx.bezierCurveTo(0.6, -0.8, 1.2, 0.4, 0, 1)
    ctx.bezierCurveTo(-1.2, 0.4, -0.6, -0.8, 0, -0.3)
    ctx.fillStyle = fill
    ctx.fill()
    ctx.restore()
  }

  function loop(now: number) {
    if (!running) return
    const dt = 1 / 60
    const elapsed = (now - startTime) / 1000
    state.timeLeft = Math.max(0, GAME_DURATION_SEC - elapsed)

    if (state.timeUp || state.won) {
      rafId = requestAnimationFrame(loop)
      draw()
      rafId = requestAnimationFrame(loop)
      return
    }

    if (state.timeLeft <= 0) {
      state.timeUp = true
      callbacks.onTimeUp()
      draw()
      rafId = requestAnimationFrame(loop)
      return
    }

    const scale = h() / 600
    const sinOffset = Math.sin(elapsed * SIN_FREQ * Math.PI * 2) * SIN_AMPLITUDE * scale
    effectiveFaceY = faceY + sinOffset

    faceX += faceVx
    faceY += faceVy
    if (faceX <= 0 || faceX >= w() - FACE_SIZE) {
      faceVx *= -1
      faceX = Math.max(0, Math.min(w() - FACE_SIZE, faceX))
    }
    if (faceY <= 0 || faceY >= h() - FACE_SIZE) {
      faceVy *= -1
      faceY = Math.max(0, Math.min(h() - FACE_SIZE, faceY))
    }

    arrows.forEach((arr) => {
      if (!arr.active) return
      arr.x += arr.vx * dt
      arr.y += arr.vy * dt
      if (arr.y < -20 || arr.x < -20 || arr.x > w() + 20) {
        arr.active = false
        return
      }
      if (hitTest(arr.x, arr.y)) {
        arr.active = false
        state.score++
        callbacks.onHit(arr.x, arr.y)
        if (state.score >= HITS_TO_WIN) {
          state.won = true
          callbacks.onWin()
        }
      }
    })

    draw()
    rafId = requestAnimationFrame(loop)
  }

  function draw() {
    const width = w()
    const height = h()
    ctx.clearRect(0, 0, width, height)

    const lx = width / 2
    const ay = height - ALEX_SIZE - ALEX_BOTTOM_PAD
    const ly = ay

    const ax = lx - ALEX_SIZE / 2
    if (alexImg) {
      ctx.save()
      const r = 14
      ctx.beginPath()
      ctx.moveTo(ax + r, ay)
      ctx.lineTo(ax + ALEX_SIZE - r, ay)
      ctx.quadraticCurveTo(ax + ALEX_SIZE, ay, ax + ALEX_SIZE, ay + r)
      ctx.lineTo(ax + ALEX_SIZE, ay + ALEX_SIZE - r)
      ctx.quadraticCurveTo(ax + ALEX_SIZE, ay + ALEX_SIZE, ax + ALEX_SIZE - r, ay + ALEX_SIZE)
      ctx.lineTo(ax + r, ay + ALEX_SIZE)
      ctx.quadraticCurveTo(ax, ay + ALEX_SIZE, ax, ay + ALEX_SIZE - r)
      ctx.lineTo(ax, ay + r)
      ctx.quadraticCurveTo(ax, ay, ax + r, ay)
      ctx.closePath()
      ctx.clip()
      ctx.drawImage(alexImg, ax, ay, ALEX_SIZE, ALEX_SIZE)
      ctx.restore()
    } else {
      ctx.fillStyle = '#ffb6c1'
      ctx.beginPath()
      ctx.arc(lx, ay + ALEX_SIZE / 2, ALEX_SIZE / 2, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.save()
    ctx.translate(lx, ly)
    ctx.rotate((launcherAngle * Math.PI) / 180)
    ctx.fillStyle = '#8b4513'
    ctx.fillRect(-4, -40, 8, 40)
    drawHeart(ctx, 0, -52, 14, '#ff3b6b')
    ctx.restore()

    if (faceImg) {
      ctx.save()
      const r = 14
      const x = faceX
      const y = effectiveFaceY
      ctx.beginPath()
      ctx.moveTo(x + r, y)
      ctx.lineTo(x + FACE_SIZE - r, y)
      ctx.quadraticCurveTo(x + FACE_SIZE, y, x + FACE_SIZE, y + r)
      ctx.lineTo(x + FACE_SIZE, y + FACE_SIZE - r)
      ctx.quadraticCurveTo(x + FACE_SIZE, y + FACE_SIZE, x + FACE_SIZE - r, y + FACE_SIZE)
      ctx.lineTo(x + r, y + FACE_SIZE)
      ctx.quadraticCurveTo(x, y + FACE_SIZE, x, y + FACE_SIZE - r)
      ctx.lineTo(x, y + r)
      ctx.quadraticCurveTo(x, y, x + r, y)
      ctx.closePath()
      ctx.clip()
      ctx.drawImage(faceImg, faceX, effectiveFaceY, FACE_SIZE, FACE_SIZE)
      ctx.restore()
    } else {
      ctx.fillStyle = '#ffb6c1'
      ctx.beginPath()
      ctx.arc(faceX + FACE_SIZE / 2, effectiveFaceY + FACE_SIZE / 2, FACE_SIZE / 2, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#c71585'
      ctx.lineWidth = 2
      ctx.stroke()
    }

    arrows.forEach((arr) => {
      if (!arr.active) return
      ctx.save()
      ctx.translate(arr.x, arr.y)
      const angle = Math.atan2(arr.vy, arr.vx)
      ctx.rotate(angle)
      ctx.fillStyle = '#8b4513'
      ctx.fillRect(0, -2, 24, 4)
      drawHeart(ctx, 24, 0, 8, '#ff3b6b')
      ctx.restore()
    })

    ctx.fillStyle = 'rgba(0,0,0,0.6)'
    ctx.font = 'bold 18px Georgia'
    ctx.fillText(`Hearts: ${state.score}/${HITS_TO_WIN}`, 12, 28)
    ctx.fillText(`Time: ${Math.ceil(state.timeLeft)}s`, 12, 52)
  }

  function setAngle(angle: number) {
    launcherAngle = Math.max(-85, Math.min(85, angle))
  }

  return {
    start() {
      state = { score: 0, timeLeft: GAME_DURATION_SEC, won: false, timeUp: false }
      arrows.length = 0
      faceImgLoaded.then((img) => { faceImg = img; spawnFace() })
      alexImgLoaded.then((img) => { alexImg = img })
      running = true
      startTime = performance.now()
      rafId = requestAnimationFrame(loop)
    },
    stop() {
      running = false
      if (rafId) cancelAnimationFrame(rafId)
    },
    getState,
    setLauncherAngle: setAngle,
    fire: shoot,
  }
}

export function cupidPointerMove(canvas: HTMLCanvasElement, clientX: number): number {
  const rect = canvas.getBoundingClientRect()
  const x = clientX - rect.left
  const scaleX = canvas.width / rect.width
  const cx = x * scaleX
  const lx = canvas.width / 2
  const ly = canvas.height - ALEX_SIZE - ALEX_BOTTOM_PAD
  const angle = Math.atan2(cx - lx, ly - canvas.height * 0.5)
  return Math.max(-85, Math.min(85, (angle * 180) / Math.PI))
}
