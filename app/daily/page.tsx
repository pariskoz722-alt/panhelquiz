'use client'
import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import { supabase } from '../lib/supabase'
import { questionsBySubject, subjectMeta, type Question } from '../lib/questions'

const QUESTION_COUNT = 10
const TIME_PER_Q = 15

// mulberry32 seeded PRNG — same seed → same sequence every time
function seededRng(seed: number) {
  let s = seed
  return function () {
    s = (s + 0x6D2B79F5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

type DailyQ = Question & { subject: string }

function buildDailyChallenge() {
  const now = new Date()
  const dateStr = now.toISOString().split('T')[0]
  const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate()
  const rng = seededRng(seed)

  // Pool: every question from every subject
  const all: DailyQ[] = []
  for (const s of Object.keys(questionsBySubject)) {
    for (const q of questionsBySubject[s]) {
      all.push({ ...q, subject: s })
    }
  }

  // Fisher-Yates with seeded RNG
  const shuffled = [...all]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  return { questions: shuffled.slice(0, QUESTION_COUNT), dateStr }
}

export default function Daily() {
  const { dark, toggleDark } = useTheme()
  const [profile, setProfile] = useState<any>(null)
  const [screen, setScreen] = useState<'intro' | 'countdown' | 'game' | 'results'>('intro')
  const [countdown, setCountdown] = useState(3)
  const [questions, setQuestions] = useState<DailyQ[]>([])
  const [dateStr, setDateStr] = useState('')
  const [cur, setCur] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | 'timeout' | null>(null)
  const [timeLeft, setTimeLeft] = useState(TIME_PER_Q)
  const [score, setScore] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [alreadyDone, setAlreadyDone] = useState<{ score: number; correct: number } | null>(null)
  const [shared, setShared] = useState(false)

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

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { window.location.href = '/login'; return }
      supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => setProfile(data))
    })
    const { questions: qs, dateStr: ds } = buildDailyChallenge()
    setQuestions(qs)
    setDateStr(ds)
    const saved = localStorage.getItem(`daily-${ds}`)
    if (saved) {
      try { setAlreadyDone(JSON.parse(saved)) } catch {}
    }
  }, [])

  // Countdown
  useEffect(() => {
    if (screen !== 'countdown') return
    if (countdown === 0) { const t = setTimeout(() => setScreen('game'), 400); return () => clearTimeout(t) }
    const t = setTimeout(() => setCountdown(n => n - 1), 900)
    return () => clearTimeout(t)
  }, [countdown, screen])

  // Timer
  useEffect(() => {
    if (screen !== 'game' || selected !== null) return
    if (timeLeft === 0) { handleAnswer(-1); return }
    const t = setTimeout(() => setTimeLeft(n => n - 1), 1000)
    return () => clearTimeout(t)
  }, [screen, selected, timeLeft])

  function startChallenge() {
    setCur(0); setSelected(null); setFeedback(null); setTimeLeft(TIME_PER_Q)
    setScore(0); setCorrectCount(0); setShared(false)
    setCountdown(3); setScreen('countdown')
  }

  function handleAnswer(index: number) {
    if (selected !== null || screen !== 'game') return
    const q = questions[cur]
    const isCorrect = index === q.correct
    const bonus = Math.max(timeLeft, 0) * 5
    const newScore = isCorrect ? score + 100 + bonus : score
    const newCorrect = isCorrect ? correctCount + 1 : correctCount

    setSelected(index)
    setFeedback(index === -1 ? 'timeout' : isCorrect ? 'correct' : 'wrong')
    if (isCorrect) { setScore(newScore); setCorrectCount(newCorrect) }

    const isLast = cur + 1 >= questions.length
    setTimeout(() => {
      if (!isLast) {
        setCur(c => c + 1); setSelected(null); setFeedback(null); setTimeLeft(TIME_PER_Q)
      } else {
        const result = { score: newScore, correct: newCorrect }
        localStorage.setItem(`daily-${dateStr}`, JSON.stringify(result))
        setAlreadyDone(result)
        setScreen('results')
      }
    }, 1100)
  }

  async function shareScore(sc: number, correct: number) {
    const pct = Math.round((correct / QUESTION_COUNT) * 100)
    const stars = correct >= 9 ? '🌟🌟🌟' : correct >= 7 ? '⭐⭐' : '⭐'
    const label = dateStr ? new Date(dateStr + 'T12:00:00').toLocaleDateString('el-GR', { day: 'numeric', month: 'long' }) : dateStr
    const text = `${stars} Ημερήσια Πρόκληση PanhelQuiz — ${label}\n${correct}/${QUESTION_COUNT} σωστές · ${pct}% · ${sc} πόντοι\n\npanhelquiz.vercel.app/daily`
    try {
      if (navigator.share) {
        await navigator.share({ title: 'PanhelQuiz Daily', text })
      } else {
        await navigator.clipboard.writeText(text)
      }
    } catch {}
    setShared(true)
  }

  const curQ = questions[cur]
  const timerPct = timeLeft / TIME_PER_Q
  const timerColor = timeLeft <= 5 ? '#E24B4A' : '#1D9E75'
  const circumference = 125.6
  const finalPct = alreadyDone ? Math.round((alreadyDone.correct / QUESTION_COUNT) * 100) : 0
  const todayLabel = dateStr
    ? new Date(dateStr + 'T12:00:00').toLocaleDateString('el-GR', { weekday: 'long', day: 'numeric', month: 'long' })
    : ''

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

      <main style={{ minHeight: '100vh', background: c.bg, color: c.text, transition: 'background 0.3s ease' }}>

        {/* Nav — visible on intro + results */}
        {(screen === 'intro' || screen === 'results') && (
          <nav style={{ background: c.navBg, backdropFilter: 'blur(10px)', borderBottom: `1px solid ${c.navBorder}`, padding: '0 16px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: c.text }}>Panhel<span style={{ color: '#1D9E75' }}>Quiz</span></div>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              {([['Dashboard', '/dashboard'], ['Παίξε', '/lobby'], ['Εξάσκηση', '/practice']] as [string, string][]).map(([n, href]) => (
                <a key={n} href={href} style={{ padding: '6px 8px', borderRadius: 8, fontSize: 12, fontWeight: 500, color: c.textSub, textDecoration: 'none' }}>{n}</a>
              ))}
              <button onClick={toggleDark} style={{ marginLeft: 4, padding: '6px 10px', borderRadius: 20, border: `1px solid ${c.cardBorder}`, background: dark ? 'rgba(255,255,255,0.08)' : '#f3f4f6', color: c.text, fontSize: 15, cursor: 'pointer' }}>
                {dark ? '☀️' : '🌙'}
              </button>
            </div>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#1D9E75', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>
              {profile?.username?.[0]?.toUpperCase() || 'Π'}
            </div>
          </nav>
        )}

        {/* ── INTRO ── */}
        {screen === 'intro' && (
          <div style={{ maxWidth: 480, margin: '0 auto', padding: '36px 20px 60px' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📅</div>
              <h1 style={{ fontSize: 26, fontWeight: 900, color: c.text, marginBottom: 6 }}>Ημερήσια Πρόκληση</h1>
              <p style={{ fontSize: 14, color: c.textSub, textTransform: 'capitalize' }}>{todayLabel}</p>
            </div>

            {alreadyDone ? (
              /* Already completed today */
              <>
                <div style={{ background: dark ? 'rgba(29,158,117,0.12)' : '#E1F5EE', border: '1px solid #5DCAA5', borderRadius: 20, padding: '28px 24px', textAlign: 'center', marginBottom: 20 }}>
                  <div style={{ fontSize: 44, marginBottom: 12 }}>
                    {alreadyDone.correct >= 9 ? '🏆' : alreadyDone.correct >= 7 ? '💪' : alreadyDone.correct >= 5 ? '👍' : '📖'}
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#0F6E56', marginBottom: 4 }}>
                    {alreadyDone.correct}/{QUESTION_COUNT} σωστές
                  </div>
                  <div style={{ fontSize: 14, color: '#1D9E75', fontWeight: 600 }}>{finalPct}% · {alreadyDone.score} πόντοι</div>
                  {/* Dot grid */}
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', marginTop: 16 }}>
                    {Array.from({ length: QUESTION_COUNT }).map((_, i) => (
                      <div key={i} style={{ width: 28, height: 28, borderRadius: '50%', background: i < alreadyDone!.correct ? '#1D9E75' : (dark ? 'rgba(255,255,255,0.1)' : '#e5e7eb'), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
                        {i < alreadyDone!.correct ? '✓' : ''}
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => shareScore(alreadyDone.score, alreadyDone.correct)}
                  style={{ width: '100%', padding: '14px', background: shared ? (dark ? 'rgba(29,158,117,0.2)' : '#E1F5EE') : 'linear-gradient(135deg, #1D9E75, #0F6E56)', color: shared ? '#0F6E56' : 'white', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 12 }}>
                  {shared ? '✓ Αντιγράφηκε!' : '📤 Κοινοποίηση αποτελέσματος'}
                </button>
                <p style={{ textAlign: 'center', fontSize: 13, color: c.textMuted }}>Επίστρεψε αύριο για νέα πρόκληση!</p>
                <a href="/dashboard" style={{ display: 'block', textAlign: 'center', marginTop: 16, fontSize: 13, color: '#1D9E75', fontWeight: 600, textDecoration: 'none' }}>← Dashboard</a>
              </>
            ) : (
              /* Not yet played */
              <>
                <div style={{ background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: 16, padding: '20px', marginBottom: 24 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: c.text, marginBottom: 14 }}>📋 Πληροφορίες</div>
                  {[
                    ['❓', `${QUESTION_COUNT} ερωτήσεις από όλα τα μαθήματα`],
                    ['⏱', `${TIME_PER_Q} δευτερόλεπτα ανά ερώτηση`],
                    ['🔁', 'Ίδιες ερωτήσεις για όλους σήμερα'],
                    ['📅', 'Μια νέα πρόκληση κάθε ημέρα'],
                  ].map(([icon, text]) => (
                    <div key={String(text)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: `1px solid ${c.cardBorder}`, fontSize: 13, color: c.textSub }}>
                      <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
                      {text}
                    </div>
                  ))}
                </div>
                {/* Subject badges */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 28 }}>
                  {Object.values(subjectMeta).map(m => (
                    <span key={m.name} style={{ background: c.tagBg, border: `1px solid ${c.cardBorder}`, borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 600, color: c.textSub }}>
                      {m.icon} {m.name}
                    </span>
                  ))}
                </div>
                <button onClick={startChallenge} style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg, #1D9E75, #0F6E56)', color: 'white', border: 'none', borderRadius: 14, fontSize: 17, fontWeight: 800, cursor: 'pointer', boxShadow: '0 6px 20px rgba(29,158,117,0.35)', fontFamily: 'inherit' }}>
                  ▶ Ξεκίνα πρόκληση
                </button>
                <a href="/dashboard" style={{ display: 'block', textAlign: 'center', marginTop: 16, fontSize: 13, color: c.textMuted, textDecoration: 'none' }}>← Dashboard</a>
              </>
            )}
          </div>
        )}

        {/* ── COUNTDOWN ── */}
        {screen === 'countdown' && (
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 20 }}>
            <div style={{ background: '#E1F5EE', color: '#0F6E56', fontSize: 12, fontWeight: 700, padding: '4px 14px', borderRadius: 20, marginBottom: 28 }}>
              📅 Ημερήσια Πρόκληση · {QUESTION_COUNT} ερωτήσεις
            </div>
            <div className="countdown-num" key={countdown}>{countdown || 'GO!'}</div>
            <div style={{ fontSize: 16, color: c.textSub, marginTop: 12 }}>Ετοιμαστείτε!</div>
          </div>
        )}

        {/* ── GAME ── */}
        {screen === 'game' && curQ && (
          <>
            {/* Scorebar */}
            <div style={{ background: c.navBg, borderBottom: `1px solid ${c.navBorder}`, padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1D9E75', color: 'white', fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {profile?.username?.[0]?.toUpperCase() || 'Π'}
                </div>
                <div>
                  <div style={{ fontSize: 12, color: c.textSub }}>Σκορ</div>
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
              <div style={{ flex: 1, textAlign: 'right' }}>
                <div style={{ fontSize: 12, color: c.textSub }}>📅 Ημερήσια</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: c.textMuted }}>{cur + 1} / {questions.length}</div>
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ height: 3, background: c.progressBg }}>
              <div style={{ height: '100%', width: `${(cur / questions.length) * 100}%`, background: 'linear-gradient(90deg, #1D9E75, #0F6E56)', transition: 'width 0.4s' }} />
            </div>

            {/* Question */}
            <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ background: c.tagBg, borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 700, color: c.textSub }}>Ερώτηση {cur + 1}/{questions.length}</span>
                <span style={{ background: dark ? 'rgba(255,255,255,0.06)' : '#f0f0f0', borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 600, color: curQ.subject ? (subjectMeta[curQ.subject]?.color || c.textSub) : c.textSub }}>
                  {subjectMeta[curQ.subject]?.icon} {subjectMeta[curQ.subject]?.name}
                </span>
              </div>

              <div className="q-text-anim" key={cur} style={{ fontSize: 20, fontWeight: 700, color: c.text, lineHeight: 1.4, marginBottom: 20 }}>
                {curQ.q}
              </div>

              <div className="answers-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                {curQ.answers.map((a, i) => {
                  const isCorrect = i === curQ.correct
                  let cls = 'ans-btn'
                  if (selected !== null) {
                    if (isCorrect) cls += ' correct'
                    else if (i === selected) cls += ' wrong'
                  }
                  return (
                    <button key={i} className={cls} onClick={() => handleAnswer(i)} disabled={selected !== null}
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
                  {feedback === 'correct' ? `✓ Σωστό! +${100 + timeLeft * 5} πόντοι` : feedback === 'wrong' ? `✗ Λάθος! Σωστό: ${curQ.answers[curQ.correct]}` : `⏱ Τέλος χρόνου! Σωστό: ${curQ.answers[curQ.correct]}`}
                </div>
              )}
            </div>
          </>
        )}

        {/* ── RESULTS ── */}
        {screen === 'results' && alreadyDone && (
          <div style={{ maxWidth: 480, margin: '0 auto', padding: '40px 20px 60px' }}>
            <div style={{ textAlign: 'center' }}>
              <div className="result-icon">
                {alreadyDone.correct >= 9 ? '🏆' : alreadyDone.correct >= 7 ? '💪' : alreadyDone.correct >= 5 ? '👍' : '📖'}
              </div>
              <h2 style={{ fontSize: 28, fontWeight: 900, color: c.text, margin: '12px 0 4px' }}>
                {alreadyDone.correct >= 9 ? 'Εξαιρετικό!' : alreadyDone.correct >= 7 ? 'Καλή δουλειά!' : alreadyDone.correct >= 5 ? 'Όχι άσχημα!' : 'Συνέχισε!'}
              </h2>
              <p style={{ fontSize: 14, color: c.textSub, marginBottom: 28 }}>📅 {todayLabel}</p>

              {/* Score card */}
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 20 }}>
                <div style={{ flex: 1, background: dark ? 'rgba(29,158,117,0.15)' : '#E1F5EE', border: '1px solid #5DCAA533', borderRadius: 16, padding: '20px 12px' }}>
                  <div style={{ fontSize: 13, color: c.textSub, marginBottom: 6 }}>Σωστές</div>
                  <div style={{ fontSize: 40, fontWeight: 900, color: '#1D9E75' }}>{alreadyDone.correct}/{QUESTION_COUNT}</div>
                </div>
                <div style={{ flex: 1, background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: 16, padding: '20px 12px' }}>
                  <div style={{ fontSize: 13, color: c.textSub, marginBottom: 6 }}>Πόντοι</div>
                  <div style={{ fontSize: 40, fontWeight: 900, color: c.text }}>{alreadyDone.score}</div>
                </div>
              </div>

              {/* Dot grid */}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 24 }}>
                {Array.from({ length: QUESTION_COUNT }).map((_, i) => (
                  <div key={i} style={{ width: 32, height: 32, borderRadius: '50%', background: i < alreadyDone!.correct ? '#1D9E75' : (dark ? 'rgba(255,255,255,0.1)' : '#e5e7eb'), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, color: 'white', fontWeight: 700, transition: 'background 0.3s' }}>
                    {i < alreadyDone!.correct ? '✓' : ''}
                  </div>
                ))}
              </div>

              {/* Share */}
              <button
                onClick={() => shareScore(alreadyDone!.score, alreadyDone!.correct)}
                style={{ width: '100%', padding: '14px', background: shared ? (dark ? 'rgba(29,158,117,0.2)' : '#E1F5EE') : 'linear-gradient(135deg, #1D9E75, #0F6E56)', color: shared ? '#0F6E56' : 'white', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 12 }}>
                {shared ? '✓ Αντιγράφηκε!' : '📤 Κοινοποίηση αποτελέσματος'}
              </button>

              <div style={{ display: 'flex', gap: 10 }}>
                <a href="/dashboard" style={{ flex: 1, padding: '14px', background: c.card, color: c.text, border: `1px solid ${c.cardBorder}`, borderRadius: 12, fontSize: 14, fontWeight: 600, textDecoration: 'none', textAlign: 'center', display: 'block' }}>
                  Dashboard
                </a>
                <a href="/practice" style={{ flex: 1, padding: '14px', background: c.card, color: c.textSub, border: `1px solid ${c.cardBorder}`, borderRadius: 12, fontSize: 14, fontWeight: 500, textDecoration: 'none', textAlign: 'center', display: 'block' }}>
                  Εξάσκηση
                </a>
              </div>

              <p style={{ marginTop: 20, fontSize: 13, color: c.textMuted }}>Επίστρεψε αύριο για νέα πρόκληση!</p>
            </div>
          </div>
        )}
      </main>
    </>
  )
}
