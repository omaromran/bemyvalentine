/**
 * Game 3: Word Puzzle — "WOULD YOU BE MY VALENTINE?"
 * Tap a letter: if it's the next correct letter it goes in place; otherwise "Wrong!" for 0.5s.
 * Mobile-friendly (no drag required).
 */

import { useCallback, useEffect, useState } from 'react'
import { playSparkle } from '../utils/audio'

const PHRASE = 'WOULD YOU BE MY VALENTINE?'
const MAX_HINTS = 3
const WRONG_MESSAGE_DURATION_MS = 500

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
  const [won, setWon] = useState(false)
  const [showWrong, setShowWrong] = useState(false)

  const firstEmptySlotIndex = slots.findIndex((s, i) => s.char === '' && PHRASE[i] !== ' ')

  useEffect(() => {
    const correct = PHRASE.split('').every((c, i) => slots[i]?.char === c)
    const trayEmpty = tray.every((c) => c === '')
    if (correct && trayEmpty && !won) {
      setWon(true)
      if (soundEnabled) playSparkle()
      onWin()
    }
  }, [slots, tray, won, onWin, soundEnabled])

  const placeLetter = useCallback((char: string, trayIndex: number) => {
    if (firstEmptySlotIndex === -1) return
    const expected = PHRASE[firstEmptySlotIndex]
    if (char.toUpperCase() === expected) {
      setSlots((prev) =>
        prev.map((s, i) => (i === firstEmptySlotIndex ? { ...s, char: expected } : s))
      )
      setTray((prev) => prev.map((c, i) => (i === trayIndex ? '' : c)))
    } else {
      setShowWrong(true)
      const t = setTimeout(() => setShowWrong(false), WRONG_MESSAGE_DURATION_MS)
      return () => clearTimeout(t)
    }
  }, [firstEmptySlotIndex])

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

  if (won) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
        <p style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>You did it! 💖</p>
      </div>
    )
  }

  return (
    <div className="card" style={{ maxWidth: 520, margin: '0 auto', position: 'relative' }}>
      <p style={{ marginBottom: '1rem', fontWeight: 700, color: '#7a0019' }}>
        Tap letters in order to spell the phrase
      </p>

      {showWrong && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 20,
            padding: '1rem 1.5rem',
            background: 'rgba(200, 0, 50, 0.95)',
            color: '#fff',
            fontWeight: 800,
            fontSize: '1.5rem',
            borderRadius: 16,
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          }}
        >
          Wrong!
        </div>
      )}

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
      >
        {slots.map((s, i) => (
          <span
            key={i}
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
            }}
          >
            {PHRASE[i] === ' ' ? '\u00A0' : slots[i].char || '?'}
          </span>
        ))}
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 10,
          justifyContent: 'center',
          minHeight: 56,
          padding: '0.75rem',
          background: 'rgba(255,255,255,0.8)',
          borderRadius: 12,
        }}
      >
        {tray.map(
          (c, i) =>
            c && (
              <button
                type="button"
                key={`${i}-${c}`}
                onClick={() => placeLetter(c, i)}
                style={{
                  minWidth: 44,
                  minHeight: 44,
                  width: 44,
                  height: 44,
                  lineHeight: '44px',
                  textAlign: 'center',
                  fontWeight: 700,
                  fontSize: 22,
                  background: 'linear-gradient(180deg, #ff6b8a 0%, #e63950 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                {c}
              </button>
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
