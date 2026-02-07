/**
 * Game 2: Beach Kisses — shoot kisses to head popping up from the sand.
 * Difficulty constants at top.
 */

const HITS_TO_WIN = 8
const GAME_DURATION_SEC = 20
const HEAD_VISIBLE_MIN_MS = 950
const HEAD_VISIBLE_MAX_MS = 1350
const HEAD_SIZE = 64
const SAND_HEIGHT_RATIO = 1 / 3
const KISS_SPEED = 450
const COMBO_DECAY_MS = 1500

const HER_IMG = '/images/omar.jpg'
const ALEX_IMG = '/images/alex.jpeg'
const ALEX_SIZE = 52

export interface KissesCallbacks {
  onHit: (x: number, y: number, combo: number) => void
  onWin: () => void
  onTimeUp: () => void
}

export interface KissesState {
  hits: number
  combo: number
  timeLeft: number
  won: boolean
  timeUp: boolean
}

export function createKissesLoop(
  canvas: HTMLCanvasElement,
  callbacks: KissesCallbacks
): { start: () => void; stop: () => void; getState: () => KissesState; fire: (clientX: number, clientY: number) => void } {
  const ctx = canvas.getContext('2d')!
  let rafId = 0
  let running = false
  let startTime = 0
  let state: KissesState = { hits: 0, combo: 0, timeLeft: GAME_DURATION_SEC, won: false, timeUp: false }
  let lastHitTime = 0

  let headX = 0
  let headY = 0
  let headVisible = false
  let headHideAt = 0
  let headImg: HTMLImageElement | null = null
  let alexImg: HTMLImageElement | null = null
  const headImgLoaded = new Promise<HTMLImageElement | null>((resolve) => {
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

  const kisses: { x: number; y: number; vx: number; vy: number; active: boolean }[] = []
  const floatTexts: { x: number; y: number; t: number }[] = []
  const FLOAT_TEXT_DURATION = 900

  const w = () => canvas.width
  const h = () => canvas.height
  const sandTop = () => h() * (1 - SAND_HEIGHT_RATIO)

  function getState() {
    return { ...state }
  }

  function spawnHead() {
    if (!running || state.won || state.timeUp) return
    headX = HEAD_SIZE / 2 + Math.random() * (w() - HEAD_SIZE * 2)
    headY = sandTop() - HEAD_SIZE - 10 + Math.random() * 20
    headVisible = true
    const visibleMs = HEAD_VISIBLE_MIN_MS + Math.random() * (HEAD_VISIBLE_MAX_MS - HEAD_VISIBLE_MIN_MS)
    headHideAt = performance.now() + visibleMs
  }

  function hitTest(kx: number, ky: number): boolean {
    if (!headVisible) return false
    const cx = headX + HEAD_SIZE / 2
    const cy = headY + HEAD_SIZE / 2
    const r = HEAD_SIZE / 2
    const dx = kx - cx
    const dy = ky - cy
    return dx * dx + dy * dy <= r * r
  }

  function fire(clientX: number, clientY: number) {
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const fromX = w() / 2
    const fromY = h() - 60
    const toX = (clientX - rect.left) * scaleX
    const toY = (clientY - rect.top) * scaleY
    const dx = toX - fromX
    const dy = toY - fromY
    const len = Math.sqrt(dx * dx + dy * dy) || 1
    const vx = (dx / len) * (KISS_SPEED / 60)
    const vy = (dy / len) * (KISS_SPEED / 60)
    kisses.push({ x: fromX, y: fromY, vx, vy, active: true })
  }

  function drawKiss(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.font = '32px serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('💋', x, y)
  }

  function loop(now: number) {
    if (!running) return
    const elapsed = (now - startTime) / 1000
    state.timeLeft = Math.max(0, GAME_DURATION_SEC - elapsed)

    if (state.timeUp || state.won) {
      draw(now)
      rafId = requestAnimationFrame(loop)
      return
    }

    if (state.timeLeft <= 0) {
      state.timeUp = true
      callbacks.onTimeUp()
      draw(now)
      rafId = requestAnimationFrame(loop)
      return
    }

    if (headVisible && now >= headHideAt) {
      headVisible = false
      setTimeout(spawnHead, 200 + Math.random() * 400)
    }
    if (now - lastHitTime > COMBO_DECAY_MS) state.combo = 0

    kisses.forEach((k) => {
      if (!k.active) return
      k.x += k.vx
      k.y += k.vy
      if (k.y < -30 || k.x < -30 || k.x > w() + 30 || k.y > h() + 30) {
        k.active = false
        return
      }
      if (hitTest(k.x, k.y)) {
        k.active = false
        floatTexts.push({ x: k.x, y: k.y, t: now })
        lastHitTime = now
        state.combo++
        state.hits++
        callbacks.onHit(k.x, k.y, state.combo)
        if (state.hits >= HITS_TO_WIN) {
          state.won = true
          callbacks.onWin()
        }
        headVisible = false
        setTimeout(spawnHead, 250 + Math.random() * 350)
      }
    })

    draw(now)
    rafId = requestAnimationFrame(loop)
  }

  let spawnScheduled = false
  function scheduleSpawn() {
    if (spawnScheduled) return
    spawnScheduled = true
    setTimeout(() => {
      spawnHead()
      spawnScheduled = false
    }, 400 + Math.random() * 300)
  }

  function draw(now: number) {
    const width = w()
    const height = h()
    const st = sandTop()
    ctx.clearRect(0, 0, width, height)

    const skyGrad = ctx.createLinearGradient(0, 0, 0, st)
    skyGrad.addColorStop(0, '#87ceeb')
    skyGrad.addColorStop(1, '#e0f4ff')
    ctx.fillStyle = skyGrad
    ctx.fillRect(0, 0, width, st)

    const sandGrad = ctx.createLinearGradient(0, st, 0, height)
    sandGrad.addColorStop(0, '#debc87')
    sandGrad.addColorStop(0.5, '#c9a86c')
    sandGrad.addColorStop(1, '#b8956a')
    ctx.fillStyle = sandGrad
    ctx.fillRect(0, st, width, height - st)

    for (let i = 0; i < 8; i++) {
      const sx = (width * (i + 0.5)) / 8 + (i % 2 === 0 ? 5 : -5)
      const sy = st + 20 + (i % 3) * 25
      ctx.fillStyle = '#ffb6c1'
      ctx.beginPath()
      ctx.arc(sx, sy, 6, 0, Math.PI * 2)
      ctx.fill()
    }

    const blasterX = width / 2
    const blasterY = height - 60
    const alexX = blasterX - ALEX_SIZE / 2
    const alexY = blasterY - ALEX_SIZE + 6
    if (alexImg) {
      ctx.save()
      const r = 12
      ctx.beginPath()
      ctx.moveTo(alexX + r, alexY)
      ctx.lineTo(alexX + ALEX_SIZE - r, alexY)
      ctx.quadraticCurveTo(alexX + ALEX_SIZE, alexY, alexX + ALEX_SIZE, alexY + r)
      ctx.lineTo(alexX + ALEX_SIZE, alexY + ALEX_SIZE - r)
      ctx.quadraticCurveTo(alexX + ALEX_SIZE, alexY + ALEX_SIZE, alexX + ALEX_SIZE - r, alexY + ALEX_SIZE)
      ctx.lineTo(alexX + r, alexY + ALEX_SIZE)
      ctx.quadraticCurveTo(alexX, alexY + ALEX_SIZE, alexX, alexY + ALEX_SIZE - r)
      ctx.lineTo(alexX, alexY + r)
      ctx.quadraticCurveTo(alexX, alexY, alexX + r, alexY)
      ctx.closePath()
      ctx.clip()
      ctx.drawImage(alexImg, alexX, alexY, ALEX_SIZE, ALEX_SIZE)
      ctx.restore()
    } else {
      ctx.fillStyle = '#ffb6c1'
      ctx.beginPath()
      ctx.arc(blasterX, blasterY - ALEX_SIZE / 2, ALEX_SIZE / 2, 0, Math.PI * 2)
      ctx.fill()
    }

    if (headVisible && headImg) {
      ctx.save()
      const r = 12
      const x = headX
      const y = headY
      ctx.beginPath()
      ctx.moveTo(x + r, y)
      ctx.lineTo(x + HEAD_SIZE - r, y)
      ctx.quadraticCurveTo(x + HEAD_SIZE, y, x + HEAD_SIZE, y + r)
      ctx.lineTo(x + HEAD_SIZE, y + HEAD_SIZE - r)
      ctx.quadraticCurveTo(x + HEAD_SIZE, y + HEAD_SIZE, x + HEAD_SIZE - r, y + HEAD_SIZE)
      ctx.lineTo(x + r, y + HEAD_SIZE)
      ctx.quadraticCurveTo(x, y + HEAD_SIZE, x, y + HEAD_SIZE - r)
      ctx.lineTo(x, y + r)
      ctx.quadraticCurveTo(x, y, x + r, y)
      ctx.closePath()
      ctx.clip()
      ctx.drawImage(headImg, headX, headY, HEAD_SIZE, HEAD_SIZE)
      ctx.restore()
    } else if (headVisible) {
      ctx.fillStyle = '#ffb6c1'
      ctx.beginPath()
      ctx.arc(headX + HEAD_SIZE / 2, headY + HEAD_SIZE / 2, HEAD_SIZE / 2, 0, Math.PI * 2)
      ctx.fill()
    }

    kisses.forEach((k) => {
      if (!k.active) return
      drawKiss(ctx, k.x, k.y)
    })

    const toRemove: number[] = []
    floatTexts.forEach((ft, i) => {
      const age = now - ft.t
      if (age > FLOAT_TEXT_DURATION) {
        toRemove.push(i)
        return
      }
      const alpha = 1 - age / FLOAT_TEXT_DURATION
      const y = ft.y - age * 0.08
      ctx.save()
      ctx.globalAlpha = alpha
      ctx.font = 'bold 20px Georgia'
      ctx.textAlign = 'center'
      ctx.fillStyle = '#c71585'
      ctx.fillText('mwah!', ft.x, y)
      ctx.restore()
    })
    toRemove.reverse().forEach((i) => floatTexts.splice(i, 1))

    ctx.fillStyle = 'rgba(0,0,0,0.65)'
    ctx.font = 'bold 16px Georgia'
    ctx.fillText(`Kisses: ${state.hits}/${HITS_TO_WIN}`, 12, 26)
    ctx.fillText(`Combo: x${state.combo}`, 12, 48)
    ctx.fillText(`Time: ${Math.ceil(state.timeLeft)}s`, 12, 70)
  }

  return {
    start() {
      state = { hits: 0, combo: 0, timeLeft: GAME_DURATION_SEC, won: false, timeUp: false }
      kisses.length = 0
      headVisible = false
      headImgLoaded.then((img) => { headImg = img })
      alexImgLoaded.then((img) => { alexImg = img })
      running = true
      startTime = performance.now()
      scheduleSpawn()
      rafId = requestAnimationFrame(loop)
    },
    stop() {
      running = false
      if (rafId) cancelAnimationFrame(rafId)
    },
    getState,
    fire,
  }
}
