/**
 * Lightweight audio: pop on hit, sparkle on level complete.
 * Uses Web Audio API for low latency. No external files — procedural beeps.
 */

let audioCtx: AudioContext | null = null
let enabled = true

export function setAudioEnabled(on: boolean) {
  enabled = on
}

export function isAudioEnabled(): boolean {
  return enabled
}

function getCtx(): AudioContext | null {
  if (!enabled) return null
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    } catch {
      return null
    }
  }
  return audioCtx
}

/** Cute "pop" on hit (e.g. arrow hit, kiss hit) */
export function playPop() {
  const ctx = getCtx()
  if (!ctx) return
  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.frequency.setValueAtTime(880, now)
  osc.frequency.exponentialRampToValueAtTime(440, now + 0.08)
  osc.type = 'sine'
  gain.gain.setValueAtTime(0.15, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12)
  osc.start(now)
  osc.stop(now + 0.12)
}

/** Sparkle when level completes */
export function playSparkle() {
  const ctx = getCtx()
  if (!ctx) return
  const now = ctx.currentTime
  const notes = [523.25, 659.25, 783.99, 1046.5]
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.setValueAtTime(freq, now)
    osc.type = 'sine'
    const t = now + i * 0.08
    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(0.12, t + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25)
    osc.start(t)
    osc.stop(t + 0.25)
  })
}
