'use client'
import { useState } from 'react'

const subjects = [
  { id: 'math', name: 'Μαθηματικά', icon: '∑' },
  { id: 'physics', name: 'Φυσική', icon: '⚛' },
  { id: 'history', name: 'Ιστορία', icon: '📜' },
  { id: 'chemistry', name: 'Χημεία', icon: '⚗' },
  { id: 'biology', name: 'Βιολογία', icon: '🧬' },
  { id: 'lit', name: 'Έκθεση', icon: '✍' },
]

export default function Lobby() {
  const [grade, setGrade] = useState(2)
  const [subject, setSubject] = useState('math')

  return (
    <main style={{ minHeight: '100vh', background: '#f9fafb', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 32, textAlign: 'center' }}>
        Panhel<span style={{ color: '#1D9E75' }}>Quiz</span>
      </h1>

      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <p style={{ fontWeight: 700, marginBottom: 12 }}>Τάξη</p>
        <div style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
          {[1, 2, 3].map(g => (
            <button key={g} onClick={() => setGrade(g)} style={{
              flex: 1, padding: '16px 8px', borderRadius: 12, cursor: 'pointer',
              border: grade === g ? '2px solid #1D9E75' : '2px solid #e5e7eb',
              background: grade === g ? '#E1F5EE' : 'white',
              fontWeight: 800, fontSize: 18, color: '#111'
            }}>
              {['Α΄', 'Β΄', 'Γ΄'][g - 1]}
              <div style={{ fontSize: 12, fontWeight: 400, color: '#666' }}>Λυκείου</div>
            </button>
          ))}
        </div>

        <p style={{ fontWeight: 700, marginBottom: 12 }}>Μάθημα</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 28 }}>
          {subjects.map(s => (
            <button key={s.id} onClick={() => setSubject(s.id)} style={{
              padding: '14px', borderRadius: 12, cursor: 'pointer', textAlign: 'left',
              border: subject === s.id ? '2px solid #1D9E75' : '2px solid #e5e7eb',
              background: subject === s.id ? '#E1F5EE' : 'white',
              fontWeight: 600, fontSize: 14, color: '#111'
            }}>
              {s.icon} {s.name}
            </button>
          ))}
        </div>

        <a href="/game" style={{
          display: 'block', width: '100%', padding: '16px',
          background: '#1D9E75', color: 'white', textDecoration: 'none',
          borderRadius: 12, fontSize: 16, fontWeight: 800,
          textAlign: 'center'
        }}>
          Εύρεση αντιπάλου →
        </a>
      </div>
    </main>
  )
}