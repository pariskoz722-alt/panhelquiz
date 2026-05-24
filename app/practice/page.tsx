'use client'
import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import { supabase } from '../lib/supabase'
import { pickQuestions, subjectMeta, type Question } from '../lib/questions'
import { explanations } from '../lib/explanations'
import { soundCorrect, soundWrong, soundCountdown, soundGo, soundComplete, soundsEnabled, setSoundsEnabled } from '../lib/sounds'
import NotificationBell from '../components/NotificationBell'

const QUESTION_COUNT = 10
const TIME_PER_Q = 15

const AI_ACCURACY: Record<number, number> = { 1: 0.42, 2: 0.65, 3: 0.83 }
const GRADE_LABELS: Record<number, string> = { 1: "Α΄ Λυκείου", 2: "Β΄ Λυκείου", 3: "Γ΄ Λυκείου" }
const AI_NAMES: Record<number, string> = { 1: "AI Νέος", 2: "AI Μέσος", 3: "AI Έμπειρος" }

export default function Practice() {
  const { dark, toggleDark } = useTheme()
  const [profile, setProfile] = useState<any>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [soundOn, setSoundOn] = useState(true)
  useEffect(() => { setSoundOn(soundsEnabled()) }, [])

  // Config
  const [subject, setSubject] = useState('math')
  const [mode, setMode] = useState<'solo' | 'ai'>('solo')
  const [grade, setGrade] = useState(2)

  // Game state
  const [screen, setScreen] = useState<'select' | 'countdown' | 'game' | 'results'>('select')
  const [countdown, setCountdown] = useState(3)
  const [questions, setQuestions] = useState<Question[]>([])
  const [cur, setCur] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | 'timeout' | null>(null)
  const [timeLeft, setTimeLeft] = useState(TIME_PER_Q)
  const [score, setScore] = useState(0)
  const [aiScore, setAiScore] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [aiCorrectCount, setAiCorrectCount] = useState(0)
  const [wrongAnswers, setWrongAnswers] = useState<{ q: string; correct: string; chosen: string }[]>([])

  const c = {
    bg: dark ? '#0A0E14' : '#f9fafb',
    navBg: dark ? 'rgba(10,14,20,0.95)' : 'white',
    navBorder: dark ? 'rgba(29,158,117,0.2)' : '#e5e7eb',
    text: dark ? '#fff' : '#111',
    textSub: dark ? 'rgba(255,255,255,0.5)' : '#666',
    textMuted: dark ? 'rgba(255,255,255,0.35)' : '#888',
    card: dark ? 'rgba(255,255,255,0.04)' : 'white',
    cardBorder: dark ? 'rgba(255,255,255,0.08)' : '#e5e7eb',
    btnBorder: dark ? 'rgba(255,255,255,0.12)' : '#e5e7eb',
    selectedBg: dark ? 'rgba(29,158,117,0.15)' : '#E1F5EE',
    ansBg: dark ? 'rgba(255,255,255,0.05)' : 'white',
    ansBorder: dark ? 'rgba(255,255,255,0.12)' : '#e5e7eb',
    tagBg: dark ? 'rgba(255,255,255,0.08)' : '#f3f4f6',
    progressBg: dark ? 'rgba(255,255,255,0.08)' : '#e5e7eb',
  }

  const timerPct = timeLeft / TIME_PER_Q
  const timerColor = timeLeft <= 5 ? '#E24B4A' : '#1D9E75'
  const circumference = 125.6
  const subMeta = subjectMeta[subject]
  const curQ = questions[cur]
  const pct = questions.length ? Math.round((correctCount / questions.length) * 100) : 0
  const won = mode === 'ai' ? score > aiScore : false
  const lost = mode === 'ai' ? score < aiScore : false

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { window.location.href = '/login'; return }
      supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => setProfile(data))
    })
  }, [])

  useEffect(() => {
    if (screen !== 'countdown') return
    if (countdown === 0) { soundGo(); const t = setTimeout(() => setScreen('game'), 400); return () => clearTimeout(t) }
    soundCountdown()
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
    setCur(0); setSelected(null); setFeedback(null); setTimeLeft(TIME_PER_Q)
    setScore(0); setAiScore(0); setCorrectCount(0); setAiCorrectCount(0); setWrongAnswers([])
    setCountdown(3); setScreen('countdown')
  }

  function handleAnswer(index: number) {
    if (selected !== null || screen !== 'game') return
    const q = questions[cur]
    const isCorrect = index === q.correct
    const bonus = Math.max(timeLeft, 0) * 5

    // AI answer simulation
    const aiGetsIt = mode === 'ai' && Math.random() < AI_ACCURACY[grade]
    const aiTimeBonus = Math.floor(Math.random() * 8) * 5

    setSelected(index)
    setFeedback(index === -1 ? 'timeout' : isCorrect ? 'correct' : 'wrong')
    if (index === -1 || !isCorrect) soundWrong(); else soundCorrect()

    // Compute new values locally so closures (setTimeout) see the correct result
    const newScore = isCorrect ? score + 100 + bonus : score
    const newCorrect = isCorrect ? correctCount + 1 : correctCount
    const newAiScore = (mode === 'ai' && aiGetsIt) ? aiScore + 100 + aiTimeBonus : aiScore

    if (isCorrect) { setScore(newScore); setCorrectCount(newCorrect) }
    else if (index !== -1) {
      setWrongAnswers(w => [...w, { q: q.q, correct: q.answers[q.correct], chosen: q.answers[index] }])
    } else {
      setWrongAnswers(w => [...w, { q: q.q, correct: q.answers[q.correct], chosen: '(χρόνος τέλος)' }])
    }

    if (mode === 'ai' && aiGetsIt) {
      setAiScore(newAiScore)
      setAiCorrectCount(c => c + 1)
    }

    setTimeout(() => {
      if (cur + 1 < questions.length) {
        setCur(c => c + 1); setSelected(null); setFeedback(null); setTimeLeft(TIME_PER_Q)
      } else {
        // Use locally-computed values — React state hasn't flushed yet at this point
        const wonNow = mode === 'ai' ? newScore > newAiScore : newCorrect / questions.length >= 0.6
        soundComplete(wonNow)
        setScreen('results')
      }
    }, 1100)
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
        .sel-btn { transition: all 0.2s; cursor: pointer; font-family: inherit; }
        .sel-btn:hover { transform: translateY(-2px); }
        .practice-nav-links { display: flex !important; }
        .practice-hamburger { display: none !important; }
        @media (max-width: 640px) {
          .practice-nav-links { display: none !important; }
          .practice-hamburger { display: flex !important; }
        }
        @media (max-width: 600px) {
          .answers-grid { grid-template-columns: 1fr !important; }
          .subj-grid { grid-template-columns: 1fr 1fr !important; }
          .grade-row { flex-direction: column !important; }
        }
      `}</style>

      <main style={{ minHeight: '100vh', background: c.bg, color: c.text, transition: 'background 0.3s ease' }}>

        {/* Navbar — only on select */}
        {screen === 'select' && (
          <>
            <nav style={{ background: c.navBg, backdropFilter: 'blur(10px)', borderBottom: `1px solid ${c.navBorder}`, padding: '0 16px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: c.text }}>Panhel<span style={{ color: '#1D9E75' }}>Quiz</span></div>
              <div className="practice-nav-links" style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                {([['Dashboard', '/dashboard'], ['Παίξε', '/lobby'], ['Εξάσκηση', '/practice'], ['Leaderboard', '/leaderboard']] as [string,string][]).map(([n, href]) => (
                  <a key={n} href={href} style={{ padding: '6px 8px', borderRadius: 8, fontSize: 12, fontWeight: 500, color: n === 'Εξάσκηση' ? '#0F6E56' : c.textSub, background: n === 'Εξάσκηση' ? 'rgba(29,158,117,0.12)' : 'transparent', textDecoration: 'none' }}>{n}</a>
                ))}
                <button onClick={toggleDark} style={{ marginLeft: 4, padding: '6px 10px', borderRadius: 20, border: `1px solid ${c.cardBorder}`, background: dark ? 'rgba(255,255,255,0.08)' : '#f3f4f6', color: c.text, fontSize: 15, cursor: 'pointer' }}>
                  {dark ? '☀️' : '🌙'}
                </button>
                <button onClick={() => { const n = !soundOn; setSoundOn(n); setSoundsEnabled(n) }} style={{ padding: '6px 10px', borderRadius: 20, border: `1px solid ${c.cardBorder}`, background: dark ? 'rgba(255,255,255,0.08)' : '#f3f4f6', color: c.text, fontSize: 15, cursor: 'pointer' }} title={soundOn ? 'Σβήσε ήχους' : 'Άνοιξε ήχους'}>
                  {soundOn ? '🔊' : '🔇'}
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {/* Hamburger — mobile only */}
                <button className="practice-hamburger" onClick={() => setMenuOpen(o => !o)} style={{ display: 'none', flexDirection: 'column', gap: 5, padding: '7px 8px', background: 'none', border: `1px solid ${c.cardBorder}`, borderRadius: 8, cursor: 'pointer' }}>
                  <span style={{ display: 'block', width: 20, height: 2, background: c.text, borderRadius: 2, transition: 'all 0.25s', transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
                  <span style={{ display: 'block', width: 20, height: 2, background: c.text, borderRadius: 2, transition: 'all 0.25s', opacity: menuOpen ? 0 : 1 }} />
                  <span style={{ display: 'block', width: 20, height: 2, background: c.text, borderRadius: 2, transition: 'all 0.25s', transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
                </button>
                <NotificationBell />
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#1D9E75', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>
                  {profile?.username?.[0]?.toUpperCase() || 'Π'}
                </div>
              </div>
            </nav>
            {/* Mobile dropdown */}
            {menuOpen && (
              <div style={{ position: 'fixed', top: 56, left: 0, right: 0, zIndex: 99, background: c.navBg, backdropFilter: 'blur(10px)', borderBottom: `1px solid ${c.navBorder}`, padding: '12px 16px 16px', display: 'flex', flexDirection: 'column', gap: 4, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
                {([['Dashboard', '/dashboard'], ['Παίξε', '/lobby'], ['Εξάσκηση', '/practice'], ['Leaderboard', '/leaderboard']] as [string,string][]).map(([n, href]) => (
                  <a key={n} href={href} style={{ padding: '12px 16px', borderRadius: 10, fontSize: 15, fontWeight: 600, color: n === 'Εξάσκηση' ? '#1D9E75' : c.text, background: n === 'Εξάσκηση' ? 'rgba(29,158,117,0.1)' : 'transparent', textDecoration: 'none' }}>{n}</a>
                ))}
                <div style={{ marginTop: 8, paddingTop: 12, borderTop: `1px solid ${c.cardBorder}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 14, color: c.textSub }}>Εμφάνιση</span>
                  <button onClick={toggleDark} style={{ padding: '6px 14px', borderRadius: 20, border: `1px solid ${c.cardBorder}`, background: dark ? 'rgba(255,255,255,0.08)' : '#f3f4f6', color: c.text, fontSize: 15, cursor: 'pointer' }}>{dark ? '☀️' : '🌙'}</button>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── SELECT ── */}
        {screen === 'select' && (
          <div style={{ maxWidth: 520, margin: '0 auto', padding: '32px 16px' }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4, color: c.text }}>Εξάσκηση</h1>
            <p style={{ fontSize: 14, color: c.textSub, marginBottom: 28 }}>Διάλεξε μάθημα, τρόπο και δυσκολία.</p>

            {/* Subject */}
            <div style={{ fontSize: 11, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Μάθημα</div>
            <div className="subj-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 24 }}>
              {Object.entries(subjectMeta).map(([id, meta]) => (
                <button key={id} className="sel-btn" onClick={() => setSubject(id)} style={{
                  padding: '12px 14px', borderRadius: 12, border: `2px solid ${subject === id ? '#1D9E75' : c.btnBorder}`,
                  background: subject === id ? c.selectedBg : c.card, display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <span style={{ fontSize: 20, color: meta.color }}>{meta.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: subject === id ? '#1D9E75' : c.text }}>{meta.name}</span>
                </button>
              ))}
            </div>

            {/* Mode */}
            <div style={{ fontSize: 11, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Τρόπος</div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
              {([
                { id: 'solo', icon: '🎯', title: 'Solo', desc: 'Μόνο εσύ, χωρίς αντίπαλο.' },
                { id: 'ai',   icon: '🤖', title: 'vs AI', desc: 'Παίξε εναντίον AI bot.' },
              ] as { id: 'solo'|'ai'; icon: string; title: string; desc: string }[]).map(m => (
                <button key={m.id} className="sel-btn" onClick={() => setMode(m.id)} style={{
                  flex: 1, padding: '14px', borderRadius: 14,
                  border: `2px solid ${mode === m.id ? '#1D9E75' : c.btnBorder}`,
                  background: mode === m.id ? c.selectedBg : c.card, textAlign: 'left',
                }}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{m.icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: mode === m.id ? '#1D9E75' : c.text, marginBottom: 2 }}>{m.title}</div>
                  <div style={{ fontSize: 12, color: c.textSub }}>{m.desc}</div>
                </button>
              ))}
            </div>

            {/* Grade / Difficulty */}
            <div style={{ fontSize: 11, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
              {mode === 'ai' ? 'Δυσκολία AI' : 'Τάξη'}
            </div>
            <div className="grade-row" style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
              {([1, 2, 3] as (1|2|3)[]).map(g => (
                <button key={g} className="sel-btn" onClick={() => setGrade(g)} style={{
                  flex: 1, padding: '14px 8px', borderRadius: 14, textAlign: 'center',
                  border: `2px solid ${grade === g ? '#1D9E75' : c.btnBorder}`,
                  background: grade === g ? c.selectedBg : c.card,
                }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: grade === g ? '#1D9E75' : c.text, marginBottom: 2 }}>
                    {['Α΄', 'Β΄', 'Γ΄'][g - 1]}
                  </div>
                  <div style={{ fontSize: 11, color: c.textMuted }}>Λυκείου</div>
                  {mode === 'ai' && (
                    <div style={{ marginTop: 6, fontSize: 10, fontWeight: 700, color: grade === g ? '#1D9E75' : c.textMuted }}>
                      {['Εύκολο', 'Μέσο', 'Δύσκολο'][g - 1]}
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Summary chip */}
            <div style={{ background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
              {[
                ['📚', `${QUESTION_COUNT} ερωτήσεις`],
                ['⏱', `${TIME_PER_Q}δλ/ερώτηση`],
                mode === 'ai' ? ['🤖', AI_NAMES[grade]] : ['🎯', 'Solo'],
                ['🏫', GRADE_LABELS[grade]],
              ].map(([icon, label]) => (
                <span key={String(label)} style={{ fontSize: 13, color: c.textSub }}>{icon} {label}</span>
              ))}
            </div>

            <button onClick={startPractice} style={{
              width: '100%', padding: '16px', background: 'linear-gradient(135deg, #1D9E75, #0F6E56)',
              color: 'white', border: 'none', borderRadius: 14, fontSize: 17, fontWeight: 800,
              cursor: 'pointer', boxShadow: '0 6px 20px rgba(29,158,117,0.35)', fontFamily: 'inherit',
            }}>
              ▶ Ξεκίνα εξάσκηση
            </button>
          </div>
        )}

        {/* ── COUNTDOWN ── */}
        {screen === 'countdown' && (
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 20 }}>
            <div style={{ position: 'absolute', top: 16, right: 16 }}>
              <button onClick={toggleDark} style={{ padding: '6px 12px', borderRadius: 20, border: `1px solid ${c.cardBorder}`, background: dark ? 'rgba(255,255,255,0.08)' : '#f3f4f6', color: c.text, fontSize: 16, cursor: 'pointer' }}>
                {dark ? '☀️' : '🌙'}
              </button>
            </div>

            <div style={{ background: '#E1F5EE', color: '#0F6E56', fontSize: 12, fontWeight: 700, padding: '4px 14px', borderRadius: 20, marginBottom: 32 }}>
              {mode === 'ai' ? `vs ${AI_NAMES[grade]}` : 'Εξάσκηση Solo'} · {GRADE_LABELS[grade]}
            </div>

            {mode === 'ai' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 36 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#1D9E75', color: 'white', fontSize: 20, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                    {profile?.username?.[0]?.toUpperCase() || 'Π'}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: c.text }}>{profile?.username || 'Εσύ'}</div>
                  <div style={{ fontSize: 12, color: c.textSub }}>ELO {profile?.elo || 1200}</div>
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: c.textMuted }}>VS</div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: dark ? '#374151' : '#e5e7eb', color: dark ? 'white' : '#374151', fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', border: '3px solid #6b7280' }}>🤖</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: c.text }}>{AI_NAMES[grade]}</div>
                  <div style={{ fontSize: 12, color: c.textSub }}>{['Εύκολο', 'Μέσο', 'Δύσκολο'][grade - 1]}</div>
                </div>
              </div>
            ) : (
              <div style={{ marginBottom: 36, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#1D9E75', color: 'white', fontSize: 24, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {profile?.username?.[0]?.toUpperCase() || 'Π'}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: c.text }}>{profile?.username || 'Εσύ'}</div>
              </div>
            )}

            <div className="countdown-num" key={countdown}>{countdown || 'GO!'}</div>
            <div style={{ fontSize: 16, color: c.textSub, marginTop: 12 }}>Ετοιμαστείτε!</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
              {[`${subMeta.icon} ${subMeta.name}`, `${QUESTION_COUNT} ερωτήσεις`, `${TIME_PER_Q}δλ/ερώτηση`, GRADE_LABELS[grade]].map(t => (
                <div key={t} style={{ background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 600, color: c.textSub }}>{t}</div>
              ))}
            </div>
          </div>
        )}

        {/* ── GAME ── */}
        {screen === 'game' && curQ && (
          <>
            {/* Scorebar */}
            <div style={{ background: c.navBg, borderBottom: `1px solid ${c.navBorder}`, padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* Left: player */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1D9E75', color: 'white', fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {profile?.username?.[0]?.toUpperCase() || 'Π'}
                </div>
                <div>
                  <div style={{ fontSize: 12, color: c.textSub }}>Εσύ</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#1D9E75' }}>{score}</div>
                </div>
              </div>

              {/* Center: circular timer */}
              <div style={{ position: 'relative', width: 52, height: 52 }}>
                <svg width="52" height="52" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="26" cy="26" r="20" fill="none" stroke={c.progressBg} strokeWidth="4"/>
                  <circle cx="26" cy="26" r="20" fill="none" stroke={timerColor} strokeWidth="4"
                    strokeDasharray={circumference} strokeDashoffset={circumference * (1 - timerPct)}
                    strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.9s linear, stroke 0.3s' }}/>
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 900, color: timerColor }}>{timeLeft}</div>
              </div>

              {/* Right: AI or subject info */}
              {mode === 'ai' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'flex-end' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12, color: c.textSub }}>{AI_NAMES[grade]}</div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: '#6b7280' }}>{aiScore}</div>
                  </div>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: dark ? '#374151' : '#e5e7eb', color: dark ? 'white' : '#374151', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🤖</div>
                </div>
              ) : (
                <div style={{ flex: 1, textAlign: 'right' }}>
                  <div style={{ fontSize: 12, color: c.textSub }}>{subMeta.icon} {subMeta.name}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: c.textMuted }}>{cur + 1} / {questions.length}</div>
                </div>
              )}
            </div>

            {/* Progress bar */}
            <div style={{ height: 3, background: c.progressBg }}>
              <div style={{ height: '100%', width: `${(cur / questions.length) * 100}%`, background: 'linear-gradient(90deg, #1D9E75, #0F6E56)', transition: 'width 0.4s' }} />
            </div>

            {/* Question */}
            <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ background: c.tagBg, borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 700, color: c.textSub }}>Ερώτηση {cur + 1}/{questions.length}</span>
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
              {feedback && explanations[subject]?.[curQ.q] && (
                <div style={{ marginTop: 8, padding: '10px 14px', borderRadius: 10, background: dark ? 'rgba(255,255,255,0.04)' : '#f0faf6', border: `1px solid ${dark ? 'rgba(29,158,117,0.2)' : '#c6e8d8'}`, fontSize: 13, color: c.textSub, lineHeight: 1.5, animation: 'slideUp 0.3s ease' }}>
                  💡 {explanations[subject][curQ.q]}
                </div>
              )}
            </div>
          </>
        )}

        {/* ── RESULTS ── */}
        {screen === 'results' && (
          <div style={{ maxWidth: 480, margin: '0 auto', padding: '40px 20px 60px' }}>
            <div style={{ textAlign: 'center' }}>
              <div className="result-icon">
                {mode === 'ai' ? (won ? '🏆' : lost ? '😤' : '🤝') : pct >= 80 ? '🏆' : pct >= 60 ? '💪' : '📖'}
              </div>
              <h2 style={{ fontSize: 28, fontWeight: 900, color: c.text, margin: '12px 0 4px' }}>
                {mode === 'ai'
                  ? (won ? 'Νίκησες!' : lost ? 'Ηττήθηκες!' : 'Ισοπαλία!')
                  : (pct >= 80 ? 'Εξαιρετικό!' : pct >= 60 ? 'Καλή δουλειά!' : 'Συνέχισε!')}
              </h2>
              <p style={{ fontSize: 14, color: c.textSub, marginBottom: 28 }}>
                {subMeta.icon} {subMeta.name} · {GRADE_LABELS[grade]} · {correctCount}/{questions.length} σωστές
              </p>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 20 }}>
                {(mode === 'ai' ? [
                  { label: profile?.username || 'Εσύ', pts: score, correct: correctCount, color: '#1D9E75', bg: dark ? 'rgba(29,158,117,0.15)' : '#E1F5EE' },
                  { label: AI_NAMES[grade], pts: aiScore, correct: aiCorrectCount, color: '#6b7280', bg: dark ? 'rgba(107,114,128,0.15)' : '#f3f4f6' },
                ] : [
                  { label: 'Σκορ', pts: score, correct: correctCount, color: '#1D9E75', bg: dark ? 'rgba(29,158,117,0.15)' : '#E1F5EE' },
                  { label: 'Ποσοστό', pts: pct, correct: null, color: pct >= 60 ? '#1D9E75' : '#E24B4A', bg: dark ? 'rgba(255,255,255,0.04)' : '#f9fafb', suffix: '%' },
                ]).map((p: any) => (
                  <div key={p.label} style={{ flex: 1, background: p.bg, border: `1px solid ${p.color}33`, borderRadius: 16, padding: '20px 12px' }}>
                    <div style={{ fontSize: 13, color: c.textSub, marginBottom: 6 }}>{p.label}</div>
                    <div style={{ fontSize: 34, fontWeight: 900, color: p.color }}>{p.pts}{p.suffix || ''}</div>
                    {p.correct !== null && <div style={{ fontSize: 12, color: c.textMuted, marginTop: 4 }}>{p.correct}/{questions.length} σωστά</div>}
                  </div>
                ))}
              </div>

              {mode === 'ai' && (
                <div style={{ background: won ? (dark ? 'rgba(29,158,117,0.15)' : '#E1F5EE') : lost ? (dark ? 'rgba(226,75,74,0.1)' : '#FCEBEB') : c.card, border: `1px solid ${won ? '#5DCAA5' : lost ? '#F09595' : c.cardBorder}`, borderRadius: 12, padding: '12px 20px', marginBottom: 20, fontSize: 14, fontWeight: 600, color: won ? '#0F6E56' : lost ? '#A32D2D' : c.textSub }}>
                  {won ? `Κέρδισες τον ${AI_NAMES[grade]}! Δοκίμασε δυσκολότερο επίπεδο 💪` : lost ? `Ο ${AI_NAMES[grade]} σε κέρδισε. Μελέτησε τα λάθη σου!` : 'Ισοπαλία! Πολύ κοντά!'}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
                <button onClick={startPractice} style={{ flex: 1, maxWidth: 160, padding: '14px', background: 'linear-gradient(135deg, #1D9E75, #0F6E56)', color: 'white', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>
                  ↺ Ξανά
                </button>
                <button onClick={() => setScreen('select')} style={{ padding: '14px 16px', background: c.card, color: c.text, border: `1px solid ${c.cardBorder}`, borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Αλλαγές
                </button>
                <a href="/lobby" style={{ padding: '14px 16px', background: c.card, color: c.textSub, border: `1px solid ${c.cardBorder}`, borderRadius: 12, fontSize: 14, textDecoration: 'none', fontWeight: 500, display: 'inline-flex', alignItems: 'center' }}>
                  ⚔️ 1v1
                </a>
              </div>
            </div>

            {/* Wrong answers */}
            {wrongAnswers.length > 0 && (
              <div style={{ background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: 16, padding: '20px' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: c.text, marginBottom: 14 }}>📋 Λάθη σου — μελέτησέ τα</div>
                {wrongAnswers.map((w, i) => (
                  <div key={i} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: i < wrongAnswers.length - 1 ? `1px solid ${c.cardBorder}` : 'none' }}>
                    <div style={{ fontSize: 13, color: c.text, fontWeight: 600, marginBottom: 6 }}>{w.q}</div>
                    <div style={{ fontSize: 12, color: '#E24B4A' }}>Απάντησες: {w.chosen}</div>
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
