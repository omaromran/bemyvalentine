import { useState } from 'react'

const SPOTIFY_TRACK_ID = '3S0OXQeoh0w6AY8WQVckRW'
const EMBED_URL = `https://open.spotify.com/embed/track/${SPOTIFY_TRACK_ID}?utm_source=generator&theme=0`

export function MusicPlayer() {
  const [open, setOpen] = useState(false)

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 40,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 8,
      }}
    >
      {open && (
        <div
          className="card"
          style={{
            padding: 0,
            overflow: 'hidden',
            width: 300,
            maxWidth: 'calc(100vw - 2rem)',
            boxShadow: '0 8px 32px rgba(122,0,25,0.4)',
          }}
        >
          <div
            style={{
              padding: '8px 12px',
              background: 'linear-gradient(135deg, #7a0019 0%, #ff3b6b 100%)',
              color: '#fff',
              fontWeight: 700,
              fontSize: 14,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>{"🎵 I'm Yours — Jason Mraz"}</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{
                background: 'rgba(255,255,255,0.25)',
                border: 'none',
                borderRadius: 8,
                color: '#fff',
                padding: '4px 10px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              −
            </button>
          </div>
          <iframe
            title={"Jason Mraz - I'm Yours"}
            src={EMBED_URL}
            width="100%"
            height="152"
            style={{ border: 'none', display: 'block' }}
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          />
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="card"
        style={{
          padding: '10px 16px',
          fontWeight: 700,
          fontSize: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          boxShadow: '0 4px 20px rgba(122,0,25,0.35)',
        }}
      >
        <span>{open ? '🎵 Close' : "🎵 I'm Yours"}</span>
      </button>
    </div>
  )
}