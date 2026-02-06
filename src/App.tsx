import { useState } from 'react'
import { HeartParticlesBackground, HeartFireworks } from './components/HeartParticles'
import { GameCanvas } from './components/GameCanvas'
import { MusicPlayer } from './components/MusicPlayer'
import { Level3Puzzle } from './levels/level3Puzzle'
import { playSparkle } from './utils/audio'

type Screen = 'landing' | 'game1' | 'game2' | 'game3' | 'reveal'
type GameStatus = 1 | 2 | 3

function Landing({ onStart }: { onStart: () => void }) {
  return (
    <div className="card" style={{ textAlign: 'center', maxWidth: 420, margin: '2rem auto' }}>
      <h1 style={{ marginBottom: '0.5rem' }}>Hi Alex 💘</h1>
      <p style={{ fontSize: '1.1rem', color: '#4a0a14', marginBottom: '1.5rem' }}>
        I made you something… win all 3 games to reveal the surprise.
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            style={{
              display: 'inline-flex',
              flexDirection: 'column',
              alignItems: 'center',
              fontSize: 12,
              color: '#7a0019',
            }}
          >
            <span style={{ fontSize: 28 }}>🔒</span>
            <span>{i === 1 ? 'Cupids' : i === 2 ? 'Kisses' : 'Letters'}</span>
          </span>
        ))}
      </div>
      <button type="button" className="btn" onClick={onStart} style={{ fontSize: '1.2rem' }}>
        Start the Challenge
      </button>
    </div>
  )
}

function FinalReveal() {
  const [showTextOverlay, setShowTextOverlay] = useState(false)
  const [calendarDownloaded, setCalendarDownloaded] = useState(false)

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Valentine//EN',
    'BEGIN:VEVENT',
    'DTSTART;TZID=America/New_York:20250214T180000',
    'DTEND;TZID=America/New_York:20250214T210000',
    'SUMMARY:Valentine Date with Omar',
    'LOCATION:2340 Bluewater Way\\, Clearwater\\, Florida 33759',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  const downloadIcs = () => {
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'valentine-date.ics'
    a.click()
    URL.revokeObjectURL(a.href)
    setCalendarDownloaded(true)
  }

  return (
    <div style={{ position: 'relative', zIndex: 10, padding: '2rem 1rem' }}>
      <HeartFireworks active />
      <div className="card" style={{ maxWidth: 480, margin: '0 auto 1.5rem', textAlign: 'center' }}>
        <p style={{ fontSize: '1.2rem', marginBottom: '1rem', fontWeight: 700, color: '#7a0019' }}>
          Be My Valentine on Feb 14th at 6 PM - Location: 2340 Bluewater Way, Clearwater, Florida 33759.
        </p>
        <div
          style={{
            margin: '1rem 0',
            borderRadius: 20,
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(122,0,25,0.4), 0 0 40px rgba(255,59,107,0.3)',
          }}
        >
          <img
            src="/images/omarandalex.jpeg"
            alt="Us"
            style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 20 }}
            onError={(e) => {
              const t = e.currentTarget
              t.style.display = 'none'
              const fallback = t.nextElementSibling as HTMLElement
              if (fallback) fallback.style.display = 'block'
            }}
          />
          <div
            style={{
              display: 'none',
              width: '100%',
              aspectRatio: '4/3',
              background: 'linear-gradient(135deg, #ffb6c1, #ff69b4)',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
            }}
          >
            💖
          </div>
        </div>
        <button
          type="button"
          className="btn"
          onClick={() => setShowTextOverlay(true)}
          style={{ marginTop: '1rem', fontSize: '1.2rem' }}
        >
          I'm In 💖
        </button>
        <button
          type="button"
          className="btn"
          onClick={downloadIcs}
          style={{ marginLeft: 8, marginTop: 8, background: 'linear-gradient(180deg,#6b8a7a,#4a6b5a)', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}
        >
          {calendarDownloaded ? 'Added!' : 'Add to Calendar'}
        </button>
      </div>
      {showTextOverlay && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
          onClick={() => setShowTextOverlay(false)}
        >
          <div
            className="card"
            style={{ margin: 16, padding: '2rem', textAlign: 'center' }}
            onClick={(e) => e.stopPropagation()}
          >
            <p style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>
              Text me &ldquo;I'm in 💖&rdquo;
            </p>
            <button type="button" className="btn" onClick={() => setShowTextOverlay(false)}>
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function App() {
  const [screen, setScreen] = useState<Screen>('landing')
  const [soundOn] = useState(true)
  const [gameStatus, setGameStatus] = useState<GameStatus>(1)
  const [winOverlay, setWinOverlay] = useState<1 | 2 | null>(null)

  const handleRestart = () => {
    setScreen('landing')
    setGameStatus(1)
    setWinOverlay(null)
  }

  const handleWin1 = () => {
    if (soundOn) playSparkle()
    setWinOverlay(1)
  }

  const handleWin2 = () => {
    if (soundOn) playSparkle()
    setWinOverlay(2)
  }

  const handleWin3 = () => {
    setScreen('reveal')
  }

  const goToGame2 = () => {
    setGameStatus(2)
    setScreen('game2')
    setWinOverlay(null)
  }

  const goToGame3 = () => {
    setGameStatus(3)
    setScreen('game3')
    setWinOverlay(null)
  }

  return (
    <div style={{ position: 'relative', minHeight: '100%', paddingBottom: 40 }}>
      <HeartParticlesBackground />
      <div style={{ position: 'relative', zIndex: 5, padding: '0.5rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <span className="progress-text">Game {gameStatus}/3</span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {(screen === 'game1' || screen === 'game2' || screen === 'game3') && (
            <button
              type="button"
              onClick={handleRestart}
              style={{
                padding: '0.4rem 0.8rem',
                borderRadius: 999,
                border: '2px solid rgba(255,255,255,0.8)',
                background: 'rgba(255,255,255,0.2)',
                color: '#fff',
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              Restart
            </button>
          )}
        </div>
      </div>

      {screen === 'landing' && (
        <Landing onStart={() => setScreen('game1')} />
      )}

      {screen === 'game1' && (
        <div style={{ padding: '1rem', position: 'relative', zIndex: 5 }}>
          <p style={{ textAlign: 'center', marginBottom: '1rem', color: '#fff', fontWeight: 700, textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
            Throw a heart arrow into my flying face
          </p>
          <GameCanvas
            level={1}
            onWin={handleWin1}
            soundEnabled={soundOn}
          />
        </div>
      )}

      {screen === 'game2' && (
        <div style={{ padding: '1rem', position: 'relative', zIndex: 5 }}>
          <p style={{ textAlign: 'center', marginBottom: '1rem', color: '#fff', fontWeight: 700, textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
            Shoot kisses to my head popping up from the sand
          </p>
          <GameCanvas
            level={2}
            onWin={handleWin2}
            onHitKiss={() => {}}
            soundEnabled={soundOn}
          />
        </div>
      )}

      {screen === 'game3' && (
        <div style={{ padding: '1rem', position: 'relative', zIndex: 5 }}>
          <p style={{ textAlign: 'center', marginBottom: '1rem', color: '#fff', fontWeight: 700, textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
            Guess the phrase by putting characters in play
          </p>
          <Level3Puzzle onWin={handleWin3} soundEnabled={soundOn} />
        </div>
      )}

      {screen === 'reveal' && <FinalReveal />}

      {winOverlay === 1 && (
        <WinOverlay
          visible
          message="You got me 💘"
          buttonText="Next Game"
          onNext={goToGame2}
        />
      )}
      {winOverlay === 2 && (
        <WinOverlay
          visible
          message="Kiss mastery unlocked 😘"
          buttonText="Final Game"
          onNext={goToGame3}
        />
      )}

      <MusicPlayer />
    </div>
  )
}

function WinOverlay({
  visible,
  message,
  buttonText,
  onNext,
}: {
  visible: boolean
  message: string
  buttonText: string
  onNext: () => void
}) {
  if (!visible) return null
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 60,
      }}
    >
      <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
        <p style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{message}</p>
        <button type="button" className="btn" onClick={onNext}>
          {buttonText}
        </button>
      </div>
    </div>
  )
}

export default App
