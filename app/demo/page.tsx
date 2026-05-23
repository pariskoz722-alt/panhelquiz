'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTheme } from '../context/ThemeContext'

type DemoQuestion = {
  q: string
  subject: string
  answers: string[]
  correct: number
}

const questions: DemoQuestion[] = [
  { subject: 'Μαθηματικά', q: 'Ποιο είναι το παράγωγο του f(x) = x³ + 2x;', answers: ['3x² + 2', '3x² − 2', 'x² + 2', '3x + 2'], correct: 0 },
  { subject: 'Νεοελληνική Γλώσσα', q: 'Ποια λέξη είναι συνώνυμη του «σημαντικός»;', answers: ['Ασήμαντος', 'Ουσιώδης', 'Τυχαίος', 'Αδιάφορος'], correct: 1 },
  { subject: 'Χημεία', q: 'Το H₂O είναι:', answers: ['Οξυγόνο', 'Υδρογόνο', 'Νερό', 'Άζωτο'], correct: 2 },
  { subject: 'Ιστορία', q: 'Η Ελληνική Επανάσταση ξεκίνησε το:', answers: ['1814', '1821', '1827', '1830'], correct: 1 },
  { subject: 'Φυσική', q: 'Ποια η μονάδα μέτρησης της δύναμης;', answers: ['Joule', 'Newton', 'Watt', 'Pascal'], correct: 1 },
]

const opponentAnswers = [1, 1, 0, 1, 0]

export default function DemoPage() {
  const { dark, toggleDark } = useTheme()
  const [phase, setPhase] = useState<'countdown' | 'game' | 'results'>('countdown')
  const [countdown, setCountdown] = useState(3)
  const [current, setCurrent] = useState(0)
  const [score, setScore] = useState(0)
  const [opponentScore, setOpponentScore] = useState(0)
  const [youCorrect, setYouCorrect] = useState(0)
  const [oppCorrect, setOppCorrect] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | 'timeout' | null>(null)
  const [timeLeft, setTimeLeft] = useState(15)

  const c = {
    bg: dark ? '#0A0E14' : '#f9fafb',
    navBg: dark ? 'rgba(10,14,20,0.95)' : 'white',
    navBorder: dark ? 'rgba(29,158,117,0.2)' : '#e5e7eb',
    text: dark ? '#fff' : '#111',
    textSub: dark ? 'rgba(255,255,255,0.5)' : '#666',
    textMuted: dark ? 'rgba(255,255,255,0.35)' : '#888',
    card: dark ? 'rgba(255,255,255,0.04)' : 'white',
    cardBorder: dark ? 'rgba(255,255,255,0.08)' : '#e5e7eb',
    ansBg: dark ? 'rgba(255,255,255,0.05)' : 'white',
    ansBorder: dark ? 'rgba(255,255,255,0.12)' : '#e5e7eb',
    tagBg: dark ? 'rgba(255,255,255,0.08)' : '#f3f4f6',
    progressBg: dark ? 'rgba(255,255,255,0.08)' : '#e5e7eb',
  }

  const question = questions[current]
  const timerPct = timeLeft / 15
  const timerColor = timeLeft <= 5 ? '#E24B4A' : '#1D9E75'
  const circumference = 125.6

  useEffect(() => {
    if (phase !== 'countdown') return
    if (countdown === 0) { const t = setTimeout(() => setPhase('game'), 400); return () => clearTimeout(t) }
    const t = setTimeout(() => setCountdown(c => c - 1), 900)
    return () => clearTimeout(t)
  }, [countdown, phase])

  useEffect(() => {
    if (phase !== 'game' || selected !== null) return
    if (timeLeft === 0) { chooseAnswer(-1); return }
    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000)
    return () => clearTimeout(t)
  }, [phase, selected, timeLeft])

  function chooseAnswer(index: number) {
    if (selected !== null || phase !== 'game') return
    const isCorrect = index === question.correct
    const opponentCorrect = opponentAnswers[current] === question.correct
    const timeBonus = Math.max(timeLeft, 0) * 5

    setSelected(index)
    if (index === -1) setFeedback('timeout')
    else setFeedback(isCorrect ? 'correct' : 'wrong')

    const newYouScore = score + (isCorrect ? 100 + timeBonus : 0)
    const newOppScore = opponentScore + (opponentCorrect ? 100 + Math.max(3, timeLeft - 2) * 5 : 0)
    if (isCorrect) { setScore(newYouScore); setYouCorrect(c => c + 1) }
    if (opponentCorrect) { setOpponentScore(newOppScore); setOppCorrect(c => c + 1) }

    setTimeout(() => {
      if (current + 1 < questions.length) {
        setCurrent(c => c + 1); setSelected(null); setFeedback(null); setTimeLeft(15)
      } else {
        setPhase('results')
      }
    }, 1100)
  }

  function restartDemo() {
    setPhase('countdown'); setCountdown(3); setCurrent(0)
    setScore(0); setOpponentScore(0); setYouCorrect(0); setOppCorrect(0)
    setSelected(null); setFeedback(null); setTimeLeft(15)
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        .ans-btn {
          padding: 16px 14px; border-radius: 14px; cursor: pointer; text-align: left;
          font-family: inherit; font-size: 15px; font-weight: 500;
          transition: all 0.15s; width: 100%; display: flex; align-items: center; gap: 10px;
        }
        .ans-btn:hover:not(:disabled) { border-color: #1D9E75 !important; transform: translateY(-2px); }
        .ans-btn.correct { border-color: #1D9E75 !important; background: #E1F5EE !important; color: #0F6E56 !important; animation: correctPulse 0.4s ease; }
        .ans-btn.wrong { border-color: #E24B4A !important; background: #FCEBEB !important; color: #A32D2D !important; animation: shake 0.4s ease; }
        .ans-btn.reveal { border-color: #1D9E75 !important; background: #E1F5EE !important; color: #0F6E56 !important; }
        @keyframes correctPulse { 0%{transform:scale(1)} 50%{transform:scale(1.03)} 100%{transform:scale(1)} }
        @keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }
        .feedback-bar { border-radius: 12px; padding: 12px 16px; font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 8px; animation: slideUp 0.3s ease; }
        @keyframes slideUp { from{transform:translateY(10px);opacity:0} to{transform:translateY(0);opacity:1} }
        .countdown-num { font-size: 96px; font-weight: 900; color: #1D9E75; animation: countPulse 0.9s ease; }
        @keyframes countPulse { 0%{transform:scale(0.7);opacity:0.3} 60%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
        .q-text-anim { animation: fadeSlide 0.35s ease; }
        @keyframes fadeSlide { from{transform:translateY(8px);opacity:0} to{transform:translateY(0);opacity:1} }
        .result-icon { font-size: 56px; animation: bounceIn 0.5s cubic-bezier(0.34,1.56,0.64,1); }
        @keyframes bounceIn { from{transform:scale(0)} to{transform:scale(1)} }
        @media (max-width: 600px) { .answers-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      <main style={{ minHeight: '100vh', background: c.bg, color: c.text, transition: 'background 0.3s ease, color 0.3s ease' }}>

        {/* COUNTDOWN */}
        {phase === 'countdown' && (
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 20 }}>
            <div style={{ position: 'absolute', top: 16, left: 20, fontSize: 18, fontWeight: 800 }}>
              <Link href="/" style={{ textDecoration: 'none', color: '#1D9E75' }}>Panhel<span style={{ color: c.text }}>Quiz</span></Link>
            </div>
            <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 10, alignItems: 'center' }}>
              <Link href="/login" style={{ color: c.textSub, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>Σύνδεση</Link>
              <button onClick={toggleDark} style={{ padding: '6px 12px', borderRadius: 20, border: `1px solid ${c.cardBorder}`, background: dark ? 'rgba(255,255,255,0.08)' : '#f3f4f6', color: c.text, fontSize: 16, cursor: 'pointer' }}>
                {dark ? '☀️' : '🌙'}
              </button>
            </div>

            <div style={{ background: '#E1F5EE', color: '#0F6E56', fontSize: 12, fontWeight: 700, padding: '4px 14px', borderRadius: 20, marginBottom: 32 }}>
              Demo Battle — χωρίς login
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 40 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#1D9E75', color: 'white', fontSize: 20, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>Π</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: c.text }}>Εσύ</div>
                <div style={{ fontSize: 12, color: c.textSub }}>Guest</div>
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: c.textMuted }}>VS</div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: dark ? '#374151' : '#d1d5db', color: dark ? 'white' : '#374151', fontSize: 16, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', border: '3px solid #6b7280' }}>AI</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: c.text }}>AI Bot</div>
                <div style={{ fontSize: 12, color: c.textSub }}>Demo αντίπαλος</div>
              </div>
            </div>

            <div className="countdown-num" key={countdown}>{countdown || 'GO!'}</div>
            <div style={{ fontSize: 16, color: c.textSub, marginTop: 12 }}>Ετοιμαστείτε!</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
              {['📚 Μικτά μαθήματα', '5 ερωτήσεις', '15δλ/ερώτηση', 'Demo'].map(t => (
                <div key={t} style={{ background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 600, color: c.textSub }}>{t}</div>
              ))}
            </div>
          </div>
        )}

        {/* GAME */}
        {phase === 'game' && (
          <>
            {/* Scorebar */}
            <div style={{ background: c.navBg, borderBottom: `1px solid ${c.navBorder}`, padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1D9E75', color: 'white', fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Π</div>
                <div>
                  <div style={{ fontSize: 12, color: c.textSub }}>Εσύ</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#1D9E75' }}>{score}</div>
                </div>
              </div>

              {/* Circular timer */}
              <div style={{ position: 'relative', width: 52, height: 52 }}>
                <svg width="52" height="52" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="26" cy="26" r="20" fill="none" stroke={c.progressBg} strokeWidth="4"/>
                  <circle cx="26" cy="26" r="20" fill="none" stroke={timerColor} strokeWidth="4"
                    strokeDasharray={circumference} strokeDashoffset={circumference * (1 - timerPct)}
                    strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.9s linear, stroke 0.3s' }}/>
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 900, color: timerColor }}>{timeLeft}</div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'flex-end' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, color: c.textSub }}>AI Bot</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#6b7280' }}>{opponentScore}</div>
                </div>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: dark ? '#374151' : '#d1d5db', color: dark ? 'white' : '#374151', fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>AI</div>
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ height: 3, background: c.progressBg }}>
              <div style={{ height: '100%', width: `${(current / questions.length) * 100}%`, background: 'linear-gradient(90deg, #1D9E75, #0F6E56)', transition: 'width 0.4s' }} />
            </div>

            {/* Question */}
            <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ background: c.tagBg, borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 700, color: '#1D9E75' }}>{question.subject}</span>
                <span style={{ background: c.tagBg, borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 700, color: c.textSub }}>Ερώτηση {current + 1}/{questions.length}</span>
              </div>

              <div className="q-text-anim" key={current} style={{ fontSize: 20, fontWeight: 700, color: c.text, lineHeight: 1.4, marginBottom: 20 }}>
                {question.q}
              </div>

              <div className="answers-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                {question.answers.map((a, i) => {
                  const isCorrect = i === question.correct
                  const isSelected = selected === i
                  let cls = 'ans-btn'
                  if (selected !== null) {
                    if (isCorrect) cls += ' correct'
                    else if (isSelected) cls += ' wrong'
                  }
                  return (
                    <button key={i} className={cls} onClick={() => chooseAnswer(i)} disabled={selected !== null}
                      style={{ background: c.ansBg, border: `2px solid ${c.ansBorder}`, color: c.text }}>
                      <div style={{ width: 26, height: 26, borderRadius: '50%', background: c.tagBg, color: c.textSub, fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {['Α', 'Β', 'Γ', 'Δ'][i]}
                      </div>
                      {a}
                    </button>
                  )
                })}
              </div>

              {feedback && (
                <div className="feedback-bar" style={{ background: feedback === 'correct' ? '#E1F5EE' : feedback === 'wrong' ? '#FCEBEB' : '#FAEEDA', color: feedback === 'correct' ? '#0F6E56' : feedback === 'wrong' ? '#A32D2D' : '#633806' }}>
                  {feedback === 'correct' ? `✓ Σωστό! +${100 + timeLeft * 5} πόντοι` : feedback === 'wrong' ? `✗ Λάθος! Σωστό: ${question.answers[question.correct]}` : `⏱ Τέλος χρόνου! Σωστό: ${question.answers[question.correct]}`}
                </div>
              )}
            </div>
          </>
        )}

        {/* RESULTS */}
        {phase === 'results' && (
          <div style={{ maxWidth: 480, margin: '0 auto', padding: '40px 20px 60px' }}>
            <div style={{ textAlign: 'center' }}>
              <div className="result-icon">{score > opponentScore ? '🏆' : score < opponentScore ? '😤' : '🤝'}</div>
              <h2 style={{ fontSize: 28, fontWeight: 900, color: c.text, margin: '12px 0 4px' }}>
                {score > opponentScore ? 'Κέρδισες!' : score < opponentScore ? 'Κοντά ήσουν!' : 'Ισοπαλία!'}
              </h2>
              <p style={{ fontSize: 14, color: c.textSub, marginBottom: 28 }}>
                {score > opponentScore ? 'Φοβερή παρτίδα! Φτιάξε λογαριασμό για να κρατάς ELO.' : 'Με λογαριασμό μπορείς να ανέβεις στο leaderboard!'}
              </p>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 20 }}>
                {[
                  { label: 'Εσύ', pts: score, correct: youCorrect, color: '#1D9E75', bg: dark ? 'rgba(29,158,117,0.15)' : '#E1F5EE' },
                  { label: 'AI Bot', pts: opponentScore, correct: oppCorrect, color: '#6b7280', bg: dark ? 'rgba(107,114,128,0.15)' : '#f3f4f6' },
                ].map(p => (
                  <div key={p.label} style={{ flex: 1, maxWidth: 160, background: p.bg, border: `1px solid ${p.color}33`, borderRadius: 16, padding: '20px 16px' }}>
                    <div style={{ fontSize: 13, color: c.textSub, marginBottom: 6 }}>{p.label}</div>
                    <div style={{ fontSize: 36, fontWeight: 900, color: p.color }}>{p.pts}</div>
                    <div style={{ fontSize: 12, color: c.textMuted, marginTop: 4 }}>{p.correct}/5 σωστά</div>
                  </div>
                ))}
              </div>

              <div style={{ background: dark ? 'rgba(29,158,117,0.1)' : '#E1F5EE', border: '1px solid #5DCAA5', borderRadius: 12, padding: '12px 20px', marginBottom: 24, fontSize: 14, color: '#0F6E56', fontWeight: 600 }}>
                Με λογαριασμό κερδίζεις ELO, ανεβαίνεις στο leaderboard και παίζεις με αληθινούς αντιπάλους!
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
                <Link href="/login" style={{ flex: 1, maxWidth: 200, padding: '14px', background: 'linear-gradient(135deg, #1D9E75, #0F6E56)', color: 'white', borderRadius: 12, fontSize: 15, fontWeight: 800, textDecoration: 'none', textAlign: 'center' }}>
                  Φτιάξε λογαριασμό →
                </Link>
                <button onClick={restartDemo} style={{ padding: '14px 20px', background: c.card, color: c.text, border: `1px solid ${c.cardBorder}`, borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Ξανά
                </button>
              </div>
              <Link href="/" style={{ fontSize: 13, color: c.textMuted, textDecoration: 'none' }}>← Αρχική</Link>
            </div>
          </div>
        )}
      </main>
    </>
  )
}
