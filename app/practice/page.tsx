'use client'
import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import { supabase } from '../lib/supabase'
import { pickQuestions, subjectMeta, type Question } from '../lib/questions'
import NotificationBell from '../components/NotificationBell'

const QUESTION_COUNT = 10
const TIME_PER_Q = 15

export default function Practice() {
  const { dark, toggleDark } = useTheme()
  const [profile, setProfile] = useState<any>(null)
  const [subject, setSubject] = useState('math')
  const [screen, setScreen] = useState<'select' | 'countdown' | 'game' | 'results'>('select')
  const [countdown, setCountdown] = useState(3)
  const [questions, setQuestions] = useState<Question[]>([])
  const [cur, setCur] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | 'timeout' | null>(null)
  const [timeLeft, setTimeLeft] = useState(TIME_PER_Q)
  const [score, setScore] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [wrongAnswers, setWrongAnswers] = useState<{ q: string; correct: string; chosen: string }[]>([])

  const c = {
    bg: dark ? '#0A0E14' : '#f9fafb',
    navBg: dark ? 'rgba(10,14,20,0.95)' : 'rgba(255,255,255,0.95)',
    navBorder: dark ? 'rgba(29,158,117,0.2)' : '#e5e7eb',
    text: dark ? '#fff' : '#111',
    textSub: dark ? 'rgba(255,255,255,0.5)' : '#666',
    textMuted: dark ? 'rgba(255,255,255,0.35)' : '#888',
    card: dark ? 'rgba(255,255,255,0.04)' : 'white',
    cardBorder: dark ? 'rgba(255,255,255,0.08)' : '#e5e7eb',
    btnBorder: dark ? 'rgba(255,255,255,0.12)' : '#e5e7eb',
    selectedBg: dark ? 'rgba(29,158,117,0.15)' : '#E1F5EE',
    ansBg: dark ? 'rgba(255,255,255,0.05)' : 'white',
    progressBg: dark ? 'rgba(255,255,255,0.08)' : '#e5e7eb',
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { window.location.href = '/login'; return }
      supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => setProfile(data))
    })
  }, [])

  useEffect(() => {
    if (screen !== 'countdown') return
    if (countdown === 0) {
      const t = setTimeout(() => setScreen('game'), 400)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 900)
    return () => clearTimeout(t)
  }, [countdown, screen])

  useEffect(() => {
    if (screen !== 'game' || selected !== null) return
    if (timeLeft === 0) { handleAnswer(-1); return }
    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000)
    return () => clearTimeout(t)
  }, [screen, selected, timeLeft])

  function startPractice() {
    const qs = pickQuestions(subject, QUESTION_COUNT)
    setQuestions(qs)
    setCur(0)
    setSelected(null)
    setFeedback(null)
    setTimeLeft(TIME_PER_Q)
    setScore(0)
    setCorrectCount(0)
    setWrongAnswers([])
    setCountdown(3)
    setScreen('countdown')
  }

  function handleAnswer(index: number) {
    if (selected !== null || screen !== 'game') return
    const q = questions[cur]
    const isCorrect = index === q.correct
    const bonus = Math.max(timeLeft, 0) * 5
    setSelected(index)
    if (index === -1) {
      setFeedback('timeout')
    } else {
      setFeedback(isCorrect ? 'correct' : 'wrong')
    }
    if (isCorrect) {
      setScore(s => s + 100 + bonus)
      setCorrectCount(c => c + 1)
    } else if (index !== -1) {
      setWrongAnswers(w => [...w, {
        q: q.q,
        correct: q.answers[q.correct],
        chosen: q.answers[index] ?? '—',
      }])
    } else {
      setWrongAnswers(w => [...w, { q: q.q, correct: q.answers[q.correct], chosen: '(χρόνος τέλος)' }])
    }
    setTimeout(() => {
      if (cur + 1 < questions.length) {
        setCur(c => c + 1)
        setSelected(null)
        setFeedback(null)
        setTimeLeft(TIME_PER_Q)
      } else {
        setScreen('results')
      }
    }, 1100)
  }

  const pct = questions.length ? Math.round((correctCount / questions.length) * 100) : 0
  const subMeta = subjectMeta[subject]
  const curQ = questions[cur]

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        .ans-btn { transition: all 0.15s ease; cursor: pointer; font-family: inherit; }
        .ans-btn:hover:not(:disabled) { transform: translateY(-2px); }
        .subj-btn { transition: all 0.2s; cursor: pointer; font-family: inherit; }
        .subj-btn:hover { transform: translateY(-2px); }
        @keyframes countPop {
          0% { transform: scale(0.7); opacity: 0; }
          60% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .slide-in { animation: slideIn 0.3s ease; }
        @media (max-width: 600px) {
          .subj-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>

      <main style={{ minHeight: '100vh', background: c.bg, color: c.text, transition: 'background 0.3s ease' }}>
        {/* Navbar */}
        <nav style={{ background: c.navBg, backdropFilter: 'blur(10px)', borderBottom: `1px solid ${c.navBorder}`, padding: '0 16px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: c.text }}>Panhel<span style={{ color: '#1D9E75' }}>Quiz</span></div>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            {[['Dashboard', '/dashboard'], ['Παίξε', '/lobby'], ['Εξάσκηση', '/practice'], ['Leaderboard', '/leaderboard']].map(([n, href]) => (
              <a key={n} href={href} style={{ padding: '6px 8px', borderRadius: 8, fontSize: 12, fontWeight: 500, color: n === 'Εξάσκηση' ? '#0F6E56' : c.textSub, background: n === 'Εξάσκηση' ? 'rgba(29,158,117,0.12)' : 'transparent', textDecoration: 'none' }}>{n}</a>
            ))}
            <button onClick={toggleDark} style={{ marginLeft: 4, padding: '6px 10px', borderRadius: 20, border: `1px solid ${c.cardBorder}`, background: dark ? 'rgba(255,255,255,0.08)' : '#f3f4f6', color: c.text, fontSize: 15, cursor: 'pointer' }}>
              {dark ? '☀️' : '🌙'}
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <NotificationBell />
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#1D9E75', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>
              {profile?.username?.[0]?.toUpperCase() || 'Π'}
            </div>
          </div>
        </nav>

        {/* SELECT SUBJECT */}
        {screen === 'select' && (
          <div style={{ maxWidth: 520, margin: '0 auto', padding: '32px 16px' }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4, color: c.text }}>Εξάσκηση Solo</h1>
            <p style={{ fontSize: 14, color: c.textSub, marginBottom: 28 }}>{QUESTION_COUNT} ερωτήσεις · {TIME_PER_Q}δλ ανά ερώτηση · χωρίς αντίπαλο</p>

            <div style={{ fontSize: 11, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Διάλεξε μάθημα</div>
            <div className="subj-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 32 }}>
              {Object.entries(subjectMeta).map(([id, meta]) => (
                <button key={id} className="subj-btn" onClick={() => setSubject(id)} style={{
                  padding: '14px 16px', borderRadius: 14, border: `2px solid ${subject === id ? '#1D9E75' : c.btnBorder}`,
                  background: subject === id ? c.selectedBg : c.card, display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <span style={{ fontSize: 22, color: meta.color }}>{meta.icon}</span>
                  <div style={{ fontSize: 14, fontWeight: 600, color: subject === id ? '#1D9E75' : c.text, textAlign: 'left' }}>{meta.name}</div>
                </button>
              ))}
            </div>

            <div style={{ background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: 12, padding: '14px 18px', marginBottom: 24, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              {[['📚', `${QUESTION_COUNT} ερωτήσεις`], ['⏱', `${TIME_PER_Q}δλ/ερώτηση`], ['🎯', 'Χωρίς ELO αλλαγή']].map(([icon, label]) => (
                <span key={label} style={{ fontSize: 13, color: c.textSub }}>{icon} {label}</span>
              ))}
            </div>

            <button onClick={startPractice} style={{
              width: '100%', padding: '16px', background: 'linear-gradient(135deg, #1D9E75, #0F6E56)',
              color: 'white', border: 'none', borderRadius: 14, fontSize: 17, fontWeight: 800,
              cursor: 'pointer', boxShadow: '0 6px 20px rgba(29,158,117,0.35)',
            }}>
              ▶ Ξεκίνα εξάσκηση
            </button>
          </div>
        )}

        {/* COUNTDOWN */}
        {screen === 'countdown' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', flexDirection: 'column', gap: 20 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: c.textSub }}>
              {subMeta.icon} {subMeta.name} · {QUESTION_COUNT} ερωτήσεις
            </div>
            <div key={countdown} style={{
              width: 140, height: 140, borderRadius: '50%',
              background: 'linear-gradient(135deg, #1D9E75, #0D6B4F)',
              color: 'white', fontSize: 68, fontWeight: 900,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 20px 60px rgba(29,158,117,0.35)',
              animation: 'countPop 0.9s ease',
            }}>
              {countdown || 'GO'}
            </div>
          </div>
        )}

        {/* GAME */}
        {screen === 'game' && curQ && (
          <div className="slide-in" key={cur} style={{ maxWidth: 640, margin: '0 auto', padding: '28px 16px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1D9E75' }}>
                {subMeta.icon} {subMeta.name} · {cur + 1}/{questions.length}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 13, color: c.textSub }}>Σκορ: <strong style={{ color: c.text }}>{score}</strong></span>
                <div style={{
                  width: 42, height: 42, borderRadius: '50%',
                  background: timeLeft <= 5 ? 'rgba(239,68,68,0.15)' : 'rgba(29,158,117,0.15)',
                  border: `2px solid ${timeLeft <= 5 ? '#ef4444' : '#1D9E75'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 800, color: timeLeft <= 5 ? '#ef4444' : '#1D9E75',
                }}>
                  {timeLeft}
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ height: 6, background: c.progressBg, borderRadius: 99, overflow: 'hidden', marginBottom: 20 }}>
              <div style={{ width: `${((cur) / questions.length) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #1D9E75, #22c55e)', transition: 'width 0.3s ease' }} />
            </div>

            {/* Question card */}
            <div style={{ background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: 20, padding: '24px 20px', marginBottom: 16, boxShadow: dark ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 32px rgba(0,0,0,0.08)' }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: c.text, lineHeight: 1.4, marginBottom: 24 }}>
                {curQ.q}
              </div>

              <div style={{ display: 'grid', gap: 10 }}>
                {curQ.answers.map((ans, i) => {
                  const isCorrect = i === curQ.correct
                  const isSelected = selected === i
                  const showCorrect = selected !== null && isCorrect
                  const showWrong = selected !== null && isSelected && !isCorrect
                  return (
                    <button
                      key={ans}
                      className="ans-btn"
                      disabled={selected !== null}
                      onClick={() => handleAnswer(i)}
                      style={{
                        padding: '14px 16px', borderRadius: 12, textAlign: 'left', fontSize: 15, fontWeight: 600,
                        border: showCorrect ? '1.5px solid #1D9E75' : showWrong ? '1.5px solid #ef4444' : `1px solid ${c.cardBorder}`,
                        background: showCorrect ? '#1D9E75' : showWrong ? '#ef4444' : c.ansBg,
                        color: showCorrect || showWrong ? 'white' : c.text,
                      }}
                    >
                      <span style={{ opacity: 0.55, marginRight: 10 }}>{String.fromCharCode(65 + i)}.</span>
                      {ans}
                    </button>
                  )
                })}
              </div>
            </div>

            {feedback && (
              <div style={{
                padding: '12px 16px', borderRadius: 12,
                background: feedback === 'correct' ? 'rgba(29,158,117,0.12)' : 'rgba(239,68,68,0.12)',
                color: feedback === 'correct' ? '#1D9E75' : '#ef4444',
                fontWeight: 700, fontSize: 14,
                animation: 'slideIn 0.2s ease',
              }}>
                {feedback === 'correct' ? `✓ Σωστό! +${100 + timeLeft * 5} πόντοι` : feedback === 'timeout' ? `⏱ Χρόνος τέλος! Σωστό: ${curQ.answers[curQ.correct]}` : `✗ Λάθος! Σωστό: ${curQ.answers[curQ.correct]}`}
              </div>
            )}
          </div>
        )}

        {/* RESULTS */}
        {screen === 'results' && (
          <div style={{ maxWidth: 580, margin: '0 auto', padding: '32px 16px' }}>
            <div style={{ background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: 20, padding: '28px 24px', marginBottom: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 52, marginBottom: 12 }}>
                {pct >= 80 ? '🏆' : pct >= 60 ? '💪' : '📖'}
              </div>
              <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 8, color: c.text }}>
                {pct >= 80 ? 'Εξαιρετικό!' : pct >= 60 ? 'Καλή δουλειά!' : 'Συνέχισε την εξάσκηση!'}
              </h1>
              <p style={{ fontSize: 15, color: c.textSub, marginBottom: 24 }}>
                {subMeta.icon} {subMeta.name} · {correctCount}/{questions.length} σωστές
              </p>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
                {[
                  { label: 'Σκορ', val: score, color: '#1D9E75' },
                  { label: 'Σωστές', val: `${correctCount}/${questions.length}`, color: '#378ADD' },
                  { label: 'Ποσοστό', val: `${pct}%`, color: pct >= 60 ? '#1D9E75' : '#ef4444' },
                ].map(s => (
                  <div key={s.label} style={{ flex: 1, minWidth: 90, background: dark ? 'rgba(255,255,255,0.04)' : '#f9fafb', border: `1px solid ${c.cardBorder}`, borderRadius: 12, padding: '12px 8px' }}>
                    <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.val}</div>
                    <div style={{ fontSize: 11, color: c.textMuted }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={startPractice} style={{
                  padding: '12px 22px', background: 'linear-gradient(135deg, #1D9E75, #0F6E56)',
                  color: 'white', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 800, cursor: 'pointer',
                }}>
                  ↺ Ξανά
                </button>
                <button onClick={() => setScreen('select')} style={{
                  padding: '12px 22px', background: 'transparent',
                  color: c.text, border: `1.5px solid ${c.cardBorder}`, borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer',
                }}>
                  Αλλαγή μαθήματος
                </button>
                <a href="/lobby" style={{
                  padding: '12px 22px', background: dark ? 'rgba(255,255,255,0.08)' : '#f3f4f6',
                  color: c.text, border: `1px solid ${c.cardBorder}`, borderRadius: 12, fontSize: 14, fontWeight: 700, textDecoration: 'none', display: 'inline-block',
                }}>
                  ⚔️ 1v1 Ranked
                </a>
              </div>
            </div>

            {/* Wrong answers review */}
            {wrongAnswers.length > 0 && (
              <div style={{ background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: 16, padding: '20px' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: c.text, marginBottom: 14 }}>📋 Λάθη σου — μελέτησέ τα</div>
                {wrongAnswers.map((w, i) => (
                  <div key={i} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: i < wrongAnswers.length - 1 ? `1px solid ${c.cardBorder}` : 'none' }}>
                    <div style={{ fontSize: 13, color: c.text, fontWeight: 600, marginBottom: 6 }}>{w.q}</div>
                    <div style={{ fontSize: 12, color: '#ef4444' }}>Απάντησες: {w.chosen}</div>
                    <div style={{ fontSize: 12, color: '#1D9E75', fontWeight: 700 }}>Σωστό: {w.correct}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </>
  )
}
