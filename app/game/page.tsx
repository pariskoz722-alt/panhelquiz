'use client'
import { useState, useEffect } from 'react'

const questions = [
  { q: "Ποιο είναι το παράγωγο του f(x) = x³ + 2x;", answers: ["3x² + 2", "3x² − 2", "x² + 2", "3x + 2"], correct: 0 },
  { q: "Αν log₂(x) = 5, τότε x =", answers: ["10", "32", "25", "16"], correct: 1 },
  { q: "Λύσε: 2x² − 8 = 0. Ποια η θετική λύση;", answers: ["x = 4", "x = 2", "x = √2", "x = 2√2"], correct: 1 },
  { q: "Αν sin(θ) = 0.5, τότε θ =", answers: ["30°", "45°", "60°", "90°"], correct: 0 },
  { q: "Ποιος ο τύπος εμβαδού κύκλου;", answers: ["2πr", "πr²", "πr³/3", "2πr²"], correct: 1 },
]

export default function Game() {
  const [cur, setCur] = useState(0)
  const [score, setScore] = useState(0)
  const [oppScore, setOppScore] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [time, setTime] = useState(15)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (done || selected !== null) return
    if (time <= 0) { next(); return }
    const t = setTimeout(() => setTime(t => t - 1), 1000)
    return () => clearTimeout(t)
  }, [time, selected, done])

  function pick(i: number) {
    if (selected !== null) return
    setSelected(i)
    if (i === questions[cur].correct) setScore(s => s + 100 + time * 5)
    setOppScore(s => s + (Math.random() > 0.4 ? Math.round(80 + Math.random() * 80) : 0))
    setTimeout(next, 1500)
  }

  function next() {
    if (cur + 1 >= questions.length) { setDone(true); return }
    setCur(c => c + 1)
    setSelected(null)
    setTime(15)
  }

  if (done) return (
    <main style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 52 }}>{score > oppScore ? '🏆' : score < oppScore ? '😤' : '🤝'}</div>
        <h2 style={{ fontSize: 28, fontWeight: 900, margin: '12px 0 4px', color: '#111' }}>{score > oppScore ? 'Νίκησες!' : score < oppScore ? 'Ηττήθηκες!' : 'Ισοπαλία!'}</h2>
        <p style={{ color: '#666', marginBottom: 24 }}>Εσύ: {score} — Αντίπαλος: {oppScore}</p>
        <a href="/lobby" style={{ background: '#1D9E75', color: 'white', padding: '14px 32px', borderRadius: 12, fontWeight: 800, textDecoration: 'none', fontSize: 16 }}>Νέα παρτίδα</a>
      </div>
    </main>
  )

  const q = questions[cur]
  return (
    <main style={{ minHeight: '100vh', background: '#f9fafb', padding: '24px 20px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 560, margin: '0 auto 24px' }}>
        <div style={{ fontWeight: 800, fontSize: 20, color: '#1D9E75' }}>{score}</div>
        <div style={{ width: 44, height: 44, borderRadius: '50%', border: '3px solid #1D9E75', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 16, color: time <= 5 ? '#E24B4A' : '#111' }}>{time}</div>
        <div style={{ fontWeight: 800, fontSize: 20, color: '#378ADD' }}>{oppScore}</div>
      </div>

      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <p style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>Ερώτηση {cur + 1}/5</p>
        <p style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, color: '#111', lineHeight: 1.4 }}>{q.q}</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {q.answers.map((a, i) => (
            <button key={i} onClick={() => pick(i)} disabled={selected !== null} style={{
              padding: '16px', borderRadius: 12, cursor: 'pointer', textAlign: 'left',
              fontSize: 14, fontWeight: 600, color: '#111',
              border: selected === null ? '2px solid #e5e7eb' :
                i === q.correct ? '2px solid #1D9E75' :
                i === selected ? '2px solid #E24B4A' : '2px solid #e5e7eb',
              background: selected === null ? 'white' :
                i === q.correct ? '#E1F5EE' :
                i === selected ? '#FCEBEB' : 'white',
            }}>{a}</button>
          ))}
        </div>
      </div>
    </main>
  )
}