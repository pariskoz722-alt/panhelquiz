import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'PanhelQuiz — Quiz Battles για Πανελλήνιες'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0A0E14',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 900, color: 'white', marginBottom: 16, display: 'flex' }}>
          Panhel<span style={{ color: '#1D9E75' }}>Quiz</span>
        </div>
        <div style={{ fontSize: 28, color: 'rgba(255,255,255,0.6)', marginBottom: 40, display: 'flex' }}>
          Quiz Battles για Πανελλήνιες
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          {['∑ Μαθηματικά', '⚛ Φυσική', '⚗ Χημεία', '📜 Ιστορία'].map(s => (
            <div key={s} style={{ background: 'rgba(29,158,117,0.15)', border: '1px solid rgba(29,158,117,0.3)', borderRadius: 12, padding: '10px 20px', color: '#1D9E75', fontSize: 18, display: 'flex' }}>
              {s}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  )
}