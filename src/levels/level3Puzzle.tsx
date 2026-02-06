/**
 * Game 3: Word Puzzle — "WOULD YOU BE MY VALENTINE?"
 * Letter tiles in tray, drag to slots. Hint (max 3), auto-uppercase, snap.
 */

import { useCallback, useEffect, useState } from 'react'
import { playSparkle } from '../utils/audio'

const PHRASE = 'WOULD YOU BE MY VALENTINE?'
const MAX_HINTS = 3

function getTrayLetters(): string[] {
  const letters = PHRASE.replace(/\s/g, '')
  const arr = letters.split('')
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function getSlots(): { char: string; index: number }[] {
  return PHRASE.split('').map((char, index) => ({ char: char === ' ' ? ' ' : '', index }))
}

export interface Level3PuzzleProps {
  onWin: () => void
  soundEnabled: boolean
}

export function Level3Puzzle({ onWin, soundEnabled }: Level3PuzzleProps) {
  const [slots, setSlots] = useState<{ char: string; index: number }[]>(() => getSlots())
  const [tray, setTray] = useState<string[]>(() => getTrayLetters())
  const [hintsUsed, setHintsUsed] = useState(0)
  const [dragged, setDragged] = useState<{ from: 'tray'; index: number } | { from: 'slot'; index: number } | null>(null)
  const [won, setWon] = useState(false)

  // Run win check after state updates (checkWin in setTimeout was using stale slots/tray)
  useEffect(() => {
    const correct = PHRASE.split('').every((c, i) => slots[i]?.char === c)
    const trayEmpty = tray.every((c) => c === '')
    if (correct && trayEmpty && !won) {
      setWon(true)
      if (soundEnabled) playSparkle()
      onWin()
    }
  }, [slots, tray, won, onWin, soundEnabled])

  const putInSlot = useCallback(
    (slotIndex: number, char: string) => {
      if (PHRASE[slotIndex] === ' ') return
      setSlots((prev) => {
        const next = prev.map((s, i) =>
          i === slotIndex ? { ...s, char: char.toUpperCase() } : s
        )
        return next
      })
      if (dragged?.from === 'tray') {
        setTray((prev) => prev.map((c, i) => (i === dragged.index ? '' : c)))
      } else if (dragged?.from === 'slot') {
        setSlots((prev) => prev.map((s, i) => (i === dragged.index ? { ...s, char: '' } : s)))
      }
      setDragged(null)
    },
    [dragged]
  )

  const returnToTray = useCallback((slotIndex: number, char: string) => {
    setTray((prev) => [...prev.filter((c) => c !== ''), char])
    setSlots((prev) => prev.map((s, i) => (i === slotIndex ? { ...s, char: '' } : s)))
    setDragged(null)
  }, [])

  const useHint = useCallback(() => {
    if (hintsUsed >= MAX_HINTS) return
    const emptySlots = slots
      .map((s, i) => ({ ...s, i }))
      .filter((s) => s.char === '' && PHRASE[s.index] !== ' ')
    if (emptySlots.length === 0) return
    const target = emptySlots[Math.floor(Math.random() * emptySlots.length)]
    const correctChar = PHRASE[target.index]
    const inTray = tray.indexOf(correctChar)
    if (inTray === -1) return
    setSlots((prev) => prev.map((s, i) => (i === target.index ? { ...s, char: correctChar } : s)))
    setTray((prev) => prev.map((c, i) => (i === inTray ? '' : c)))
    setHintsUsed((h) => h + 1)
  }, [hintsUsed, slots, tray])

  const handleSlotDrop = useCallback(
    (e: React.DragEvent, slotIndex: number) => {
      e.preventDefault()
      const char = e.dataTransfer.getData('text/plain')
      if (char && PHRASE[slotIndex] !== ' ') putInSlot(slotIndex, char)
      setDragged(null)
    },
    [putInSlot]
  )

  const handleTrayDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      if (dragged?.from === 'slot' && dragged.index < slots.length) {
        const c = slots[dragged.index].char
        if (c) returnToTray(dragged.index, c)
      }
      setDragged(null)
    },
    [dragged, slots, returnToTray]
  )

  if (won) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
        <p style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>You did it! 💖</p>
      </div>
    )
  }

  return (
    <div className="card" style={{ maxWidth: 520, margin: '0 auto' }}>
      <p style={{ marginBottom: '1rem', fontWeight: 700, color: '#7a0019' }}>
        Guess the phrase — drag letters into place
      </p>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 4,
          justifyContent: 'center',
          minHeight: 52,
          marginBottom: '1rem',
          padding: '0.5rem',
          background: 'rgba(255,182,193,0.3)',
          borderRadius: 12,
        }}
        onDragOver={(e) => e.preventDefault()}
      >
        {slots.map((s, i) => (
          <span
            key={i}
            onDragOver={(e) => {
              e.preventDefault()
              e.dataTransfer.dropEffect = 'move'
            }}
            onDrop={(e) => handleSlotDrop(e, i)}
            draggable={s.char !== ' ' && s.char !== ''}
            onDragStart={(e) => {
              if (s.char && s.char !== ' ') {
                e.dataTransfer.setData('text/plain', s.char)
                e.dataTransfer.effectAllowed = 'move'
                setDragged({ from: 'slot', index: i })
              }
            }}
            onDragEnd={() => setDragged(null)}
            style={{
              display: 'inline-block',
              width: PHRASE[i] === ' ' ? 12 : 28,
              height: 36,
              lineHeight: '36px',
              textAlign: 'center',
              fontWeight: 700,
              fontSize: 18,
              background: PHRASE[i] === ' ' ? 'transparent' : slots[i].char ? '#ffb6c1' : '#fff',
              border: PHRASE[i] === ' ' ? 'none' : '2px solid #e63950',
              borderRadius: 6,
              cursor: s.char ? 'grab' : 'default',
            }}
          >
            {PHRASE[i] === ' ' ? ' ' : slots[i].char || '?'}
          </span>
        ))}
      </div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          justifyContent: 'center',
          minHeight: 48,
          padding: '0.5rem',
          background: 'rgba(255,255,255,0.8)',
          borderRadius: 12,
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleTrayDrop}
      >
        {tray.map(
          (c, i) =>
            c && (
              <span
                key={`${i}-${c}`}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', c)
                  e.dataTransfer.effectAllowed = 'move'
                  setDragged({ from: 'tray', index: i })
                }}
                onDragEnd={() => setDragged(null)}
                style={{
                  width: 32,
                  height: 40,
                  lineHeight: '40px',
                  textAlign: 'center',
                  fontWeight: 700,
                  fontSize: 20,
                  background: 'linear-gradient(180deg, #ff6b8a 0%, #e63950 100%)',
                  color: '#fff',
                  borderRadius: 8,
                  cursor: 'grab',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                }}
              >
                {c}
              </span>
            )
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: '1rem' }}>
        <button
          type="button"
          className="btn"
          onClick={useHint}
          disabled={hintsUsed >= MAX_HINTS}
          style={{ opacity: hintsUsed >= MAX_HINTS ? 0.6 : 1 }}
        >
          Hint ({MAX_HINTS - hintsUsed} left)
        </button>
      </div>
    </div>
  )
}
