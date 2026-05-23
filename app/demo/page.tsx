'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

type DemoQuestion = {
  q: string
  subject: string
  answers: string[]
  correct: number
}

const questions: DemoQuestion[] = [
  {
    subject: 'Μαθηματικά',
    q: 'Ποιο είναι το παράγωγο του f(x) = x³ + 2x;',
    answers: ['3x² + 2', '3x² − 2', 'x² + 2', '3x + 2'],
    correct: 0,
  },
  {
    subject: 'Μαθηματικά',
    q: 'Πόσο κάνει 2² + 3²;',
    answers: ['10', '11', '12', '13'],
    correct: 3,
  },
  {
    subject: 'Νεοελληνική Γλώσσα',
    q: 'Ποια λέξη είναι συνώνυμη του «σημαντικός»;',
    answers: ['Ασήμαντος', 'Ουσιώδης', 'Τυχαίος', 'Αδιάφορος'],
    correct: 1,
  },
  {
    subject: 'Χημεία',
    q: 'Το H₂O είναι:',
    answers: ['Οξυγόνο', 'Υδρογόνο', 'Νερό', 'Άζωτο'],
    correct: 2,
  },
  {
    subject: 'Ιστορία',
    q: 'Η Ελληνική Επανάσταση ξεκίνησε το:',
    answers: ['1821', '1830', '1940', '1453'],
    correct: 0,
  },
]

const opponentAnswers = [1, 3, 1, 0, 0]

export default function DemoPage() {
  const [dark, setDark] = useState(true)
  const [phase, setPhase] = useState<'countdown' | 'game' | 'results'>('countdown')
  const [countdown, setCountdown] = useState(3)
  const [current, setCurrent] = useState(0)
  const [score, setScore] = useState(0)
  const [opponentScore, setOpponentScore] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [timeLeft, setTimeLeft] = useState(15)

  useEffect(() => {
    const savedTheme = window.localStorage.getItem('panhelquiz-theme')
    const legacyDarkMode = window.localStorage.getItem('darkMode')

    if (savedTheme === 'light') {
      setDark(false)
    } else if (savedTheme === 'dark') {
      setDark(true)
    } else if (legacyDarkMode === 'false') {
      setDark(false)
    } else if (legacyDarkMode === 'true') {
      setDark(true)
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem('panhelquiz-theme', dark ? 'dark' : 'light')
    window.localStorage.setItem('darkMode', String(dark))
  }, [dark])

  const question = questions[current]
  const progress = ((current + 1) / questions.length) * 100
  const c = useMemo(() => ({
    bg: dark ? '#0A0E14' : '#f5f7fb',
    bg2: dark ? '#0D1A15' : '#ffffff',
    card: dark ? 'rgba(255,255,255,0.06)' : '#ffffff',
    cardStrong: dark ? 'rgba(255,255,255,0.09)' : '#f8fafc',
    border: dark ? 'rgba(255,255,255,0.12)' : '#e5e7eb',
    text: dark ? '#ffffff' : '#111827',
    sub: dark ? 'rgba(255,255,255,0.66)' : '#6b7280',
    muted: dark ? 'rgba(255,255,255,0.42)' : '#9ca3af',
    nav: dark ? 'rgba(10,14,20,0.78)' : 'rgba(255,255,255,0.82)',
    shadow: dark ? '0 22px 70px rgba(0,0,0,0.35)' : '0 22px 70px rgba(15,23,42,0.11)',
  }), [dark])

  useEffect(() => {
    if (phase !== 'countdown') return

    if (countdown === 0) {
      const start = window.setTimeout(() => setPhase('game'), 450)
      return () => window.clearTimeout(start)
    }

    const timer = window.setTimeout(() => setCountdown(countdown - 1), 850)
    return () => window.clearTimeout(timer)
  }, [countdown, phase])

  useEffect(() => {
    if (phase !== 'game' || selected !== null) return

    if (timeLeft === 0) {
      chooseAnswer(-1)
      return
    }

    const timer = window.setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [phase, selected, timeLeft])

  function chooseAnswer(index: number) {
    if (selected !== null || phase !== 'game') return

    const isCorrect = index === question.correct
    const opponentCorrect = opponentAnswers[current] === question.correct
    const timeBonus = Math.max(timeLeft, 0) * 5

    setSelected(index)
    setFeedback(isCorrect ? 'correct' : 'wrong')

    if (isCorrect) setScore(prev => prev + 100 + timeBonus)
    if (opponentCorrect) setOpponentScore(prev => prev + 100 + Math.max(3, timeLeft - 2) * 5)

    window.setTimeout(() => {
      if (current + 1 < questions.length) {
        setCurrent(prev => prev + 1)
        setSelected(null)
        setFeedback(null)
        setTimeLeft(15)
      } else {
        setPhase('results')
      }
    }, 1050)
  }

  function restartDemo() {
    setPhase('countdown')
    setCountdown(3)
    setCurrent(0)
    setScore(0)
    setOpponentScore(0)
    setSelected(null)
    setFeedback(null)
    setTimeLeft(15)
  }

  return (
    <main style={{
      minHeight: '100vh',
      background: dark
        ? 'radial-gradient(circle at top left, rgba(29,158,117,0.18), transparent 32%), linear-gradient(135deg, #0A0E14 0%, #0D1A15 50%, #0A0E14 100%)'
        : 'radial-gradient(circle at top left, rgba(29,158,117,0.12), transparent 30%), #f5f7fb',
      color: c.text,
      fontFamily: 'system-ui, sans-serif',
      transition: 'background 0.25s ease, color 0.25s ease',
    }}>
      <style>{`
        @keyframes countPulse {
          0% { transform: scale(0.86); opacity: 0.35; }
          50% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes correctPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.035); }
          100% { transform: scale(1); }
        }
        @keyframes wrongShake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-7px); }
          75% { transform: translateX(7px); }
        }
        @keyframes bounceResult {
          0% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-8px) scale(1.08); }
          100% { transform: translateY(0) scale(1); }
        }
        .demo-answer { transition: all 0.18s ease; }
        .demo-answer:hover { transform: translateY(-2px); }
        .demo-correct { animation: correctPulse 0.45s ease; }
        .demo-wrong { animation: wrongShake 0.38s ease; }
        .demo-card { animation: slideIn 0.35s ease; }
        .demo-toggle { transition: all 0.2s ease; }
        .demo-toggle:hover { transform: translateY(-1px); }
        @media (max-width: 640px) {
          .demo-nav { padding: 0 14px !important; }
          .demo-shell { padding: 84px 14px 26px !important; }
          .demo-grid { grid-template-columns: 1fr !important; }
          .demo-question { font-size: 23px !important; }
          .demo-score-card { padding: 14px !important; }
        }
      `}</style>

      <nav className="demo-nav" style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 20,
        height: 62, padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        backdropFilter: 'blur(14px)', background: c.nav, borderBottom: `1px solid ${c.border}`,
      }}>
        <Link href="/" style={{ textDecoration: 'none', fontSize: 20, fontWeight: 900, color: '#1D9E75' }}>
          Panhel<span style={{ color: c.text }}>Quiz</span>
        </Link>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link href="/login" style={{ color: c.sub, textDecoration: 'none', fontSize: 14, fontWeight: 700 }}>Login</Link>
          <button
            className="demo-toggle"
            onClick={() => setDark(prev => !prev)}
            style={{
              border: `1px solid ${c.border}`,
              background: c.card,
              color: c.text,
              borderRadius: 999,
              padding: '8px 12px',
              fontSize: 16,
              cursor: 'pointer',
            }}
          >
            {dark ? '☀️' : '🌙'}
          </button>
        </div>
      </nav>

      <section className="demo-shell" style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '92px 20px 34px',
      }}>
        {phase === 'countdown' && (
          <div className="demo-card" style={{ textAlign: 'center' }}>
            <div style={{ color: c.sub, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 20 }}>
              Demo Battle ξεκινάει
            </div>
            <div style={{
              width: 150,
              height: 150,
              borderRadius: '50%',
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #1D9E75, #0D6B4F)',
              color: 'white',
              fontSize: 72,
              fontWeight: 900,
              boxShadow: '0 20px 60px rgba(29,158,117,0.35)',
              animation: 'countPulse 0.85s ease',
            }} key={countdown}>
              {countdown || 'GO'}
            </div>
          </div>
        )}

        {phase === 'game' && (
          <div className="demo-card" style={{ width: '100%', maxWidth: 980 }} key={current}>
            <div className="demo-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
              <div className="demo-score-card" style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 18, padding: 18, boxShadow: c.shadow }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 12, color: c.muted, fontWeight: 800, textTransform: 'uppercase' }}>Εσύ</div>
                    <div style={{ fontSize: 24, fontWeight: 900 }}>{score}</div>
                  </div>
                  <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#1D9E75', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900 }}>P</div>
                </div>
              </div>
              <div className="demo-score-card" style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 18, padding: 18, boxShadow: c.shadow }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 12, color: c.muted, fontWeight: 800, textTransform: 'uppercase' }}>AI αντίπαλος</div>
                    <div style={{ fontSize: 24, fontWeight: 900 }}>{opponentScore}</div>
                  </div>
                  <div style={{ width: 42, height: 42, borderRadius: '50%', background: dark ? '#374151' : '#d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', color: dark ? 'white' : '#111827', fontWeight: 900 }}>AI</div>
                </div>
              </div>
            </div>

            <div style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 24, padding: 24, boxShadow: c.shadow }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{ color: '#1D9E75', fontWeight: 900 }}>
                  {question.subject} • Ερώτηση {current + 1}/{questions.length}
                </div>
                <div style={{ color: timeLeft <= 5 ? '#ef4444' : c.text, fontWeight: 900 }}>
                  ⏱ {timeLeft}s
                </div>
              </div>

              <div style={{ height: 8, background: dark ? 'rgba(255,255,255,0.08)' : '#e5e7eb', borderRadius: 999, overflow: 'hidden', marginBottom: 24 }}>
                <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #1D9E75, #22c55e)', transition: 'width 0.25s ease' }} />
              </div>

              <h1 className="demo-question" style={{ fontSize: 32, lineHeight: 1.18, margin: '0 0 24px', color: c.text }}>
                {question.q}
              </h1>

              <div style={{ display: 'grid', gap: 12 }}>
                {question.answers.map((answer, index) => {
                  const isCorrect = index === question.correct
                  const isSelected = selected === index
                  const showCorrect = selected !== null && isCorrect
                  const showWrong = selected !== null && isSelected && !isCorrect

                  return (
                    <button
                      key={answer}
                      className={`demo-answer ${showCorrect ? 'demo-correct' : ''} ${showWrong ? 'demo-wrong' : ''}`}
                      onClick={() => chooseAnswer(index)}
                      style={{
                        padding: '16px 18px',
                        borderRadius: 16,
                        border: showCorrect ? '1.5px solid #1D9E75' : showWrong ? '1.5px solid #ef4444' : `1px solid ${c.border}`,
                        background: showCorrect ? '#1D9E75' : showWrong ? '#ef4444' : c.cardStrong,
                        color: showCorrect || showWrong ? 'white' : c.text,
                        fontSize: 16,
                        fontWeight: 800,
                        cursor: selected === null ? 'pointer' : 'default',
                        textAlign: 'left',
                      }}
                    >
                      <span style={{ opacity: 0.65, marginRight: 10 }}>{String.fromCharCode(65 + index)}.</span>
                      {answer}
                    </button>
                  )
                })}
              </div>

              {feedback && (
                <div style={{
                  marginTop: 18,
                  padding: '13px 16px',
                  borderRadius: 14,
                  background: feedback === 'correct' ? 'rgba(29,158,117,0.14)' : 'rgba(239,68,68,0.13)',
                  color: feedback === 'correct' ? '#1D9E75' : '#ef4444',
                  fontWeight: 900,
                  animation: 'slideIn 0.22s ease',
                }}>
                  {feedback === 'correct' ? 'Σωστό! + bonus χρόνου' : `Λάθος. Σωστή απάντηση: ${question.answers[question.correct]}`}
                </div>
              )}
            </div>
          </div>
        )}

        {phase === 'results' && (
          <div className="demo-card" style={{
            width: '100%',
            maxWidth: 660,
            background: c.card,
            border: `1px solid ${c.border}`,
            borderRadius: 26,
            padding: 30,
            textAlign: 'center',
            boxShadow: c.shadow,
          }}>
            <div style={{ fontSize: 58, marginBottom: 12, animation: 'bounceResult 0.8s ease' }}>
              {score >= opponentScore ? '🏆' : '🔥'}
            </div>
            <h1 style={{ fontSize: 34, margin: '0 0 10px' }}>
              {score >= opponentScore ? 'Κέρδισες το demo battle!' : 'Κοντά ήσουν!'}
            </h1>
            <p style={{ color: c.sub, fontSize: 16, marginBottom: 22 }}>
              Τελικό σκορ: <strong style={{ color: c.text }}>{score}</strong> - <strong style={{ color: c.text }}>{opponentScore}</strong>. Με λογαριασμό κρατάς ELO, στατιστικά και θέση στο leaderboard.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={restartDemo}
                style={{
                  background: '#1D9E75',
                  color: 'white',
                  border: 'none',
                  padding: '13px 20px',
                  borderRadius: 12,
                  fontWeight: 900,
                  cursor: 'pointer',
                }}
              >
                Ξαναπαίξε demo
              </button>
              <Link href="/login" style={{ background: dark ? 'white' : '#111827', color: dark ? '#0A0E14' : 'white', padding: '13px 20px', borderRadius: 12, fontWeight: 900, textDecoration: 'none' }}>
                Φτιάξε λογαριασμό
              </Link>
              <Link href="/" style={{ color: c.sub, padding: '13px 0', textDecoration: 'none', fontWeight: 800 }}>
                Πίσω αρχική
              </Link>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}