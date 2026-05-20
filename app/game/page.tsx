'use client'
import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'

const questions = [
  { q: "Ποιο είναι το παράγωγο του f(x) = x³ + 2x;", answers: ["3x² + 2", "3x² − 2", "x² + 2", "3x + 2"], correct: 0 },
  { q: "Αν log₂(x) = 5, τότε x =", answers: ["10", "32", "25", "16"], correct: 1 },
  { q: "Λύσε: 2x² − 8 = 0. Ποια η θετική λύση;", answers: ["x = 4", "x = 2", "x = √2", "x = 2√2"], correct: 1 },
  { q: "Αν sin(θ) = 0.5, τότε θ =", answers: ["30°", "45°", "60°", "90°"], correct: 0 },
  { q: "Ποιος ο τύπος εμβαδού κύκλου;", answers: ["2πr", "πr²", "πr³/3", "2πr²"], correct: 1 },
]

export default function Game() {
  const [phase, setPhase] = useState<'countdown' | 'game' | 'results'>('countdown')
  const [countdown, setCountdown] = useState(3)
  const [cur, setCur] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [time, setTime] = useState(15)
  const [scoreYou, setScoreYou] = useState(0)
  const [scoreOpp, setScoreOpp] = useState(0)
  const [youCorrect, setYouCorrect] = useState(0)
  const [oppCorrect, setOppCorrect] = useState(0)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | 'timeout' | null>(null)
  const { dark, toggleDark } = useTheme()

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
    if (phase !== 'countdown') return
    if (countdown <= 0) { setPhase('game'); return }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [phase, countdown])

  useEffect(() => {
    if (phase !== 'game' || selected !== null) return
    if (time <= 0) { handleTimeout(); return }
    const t = setTimeout(() => setTime(t => t - 1), 1000)
    return () => clearTimeout(t)
  }, [phase, time, selected])

  function pick(i: number) {
    if (selected !== null || phase !== 'game') return
    setSelected(i)
    const correct = questions[cur].correct
    const isCorrect = i === correct
    const pts = isCorrect ? Math.round(100 + time * 5) : 0
    if (isCorrect) { setScoreYou(s => s + pts); setYouCorrect(c => c + 1) }
    setFeedback(isCorrect ? 'correct' : 'wrong')
    oppAnswer()
    setTimeout(nextQ, 1600)
  }

  function handleTimeout() {
    setSelected(-1)
    setFeedback('timeout')
    oppAnswer()
    setTimeout(nextQ, 1600)
  }

  function oppAnswer() {
    if (Math.random() > 0.38) {
      setScoreOpp(s => s + Math.round(80 + Math.random() * 80))
      setOppCorrect(c => c + 1)
    }
  }

  function nextQ() {
    if (cur + 1 >= questions.length) { setPhase('results'); return }
    setCur(c => c + 1)
    setSelected(null)
    setFeedback(null)
    setTime(15)
  }

  const timerPct = time / 15
  const timerColor = time <= 5 ? '#E24B4A' : '#1D9E75'
  const circumference = 125.6

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        .ans-btn {
          padding: 16px 14px; border-radius: 14px; cursor: pointer; text-align: left;
          font-family: inherit; font-size: 15px; font-weight: 500;
          transition: all 0.15s; width: 100%;
          display: flex; align-items: center; gap: 10px;
        }
        .ans-btn:hover:not(:disabled) { border-color: #1D9E75 !important; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
        .ans-btn.correct { border-color: #1D9E75 !important; background: #E1F5EE !important; color: #0F6E56 !important; animation: correctPulse 0.4s ease; }
        .ans-btn.wrong { border-color: #E24B4A !important; background: #FCEBEB !important; color: #A32D2D !important; animation: shake 0.4s ease; }
        @keyframes correctPulse { 0%{transform:scale(1)} 50%{transform:scale(1.03)} 100%{transform:scale(1)} }
        @keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }
        .feedback-bar { border-radius: 12px; padding: 12px 16px; font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 8px; animation: slideUp 0.3s ease; }
        @keyframes slideUp { from{transform:translateY(10px);opacity:0} to{transform:translateY(0);opacity:1} }
        .countdown-num { font-size: 96px; font-weight: 900; color: #1D9E75; animation: countPulse 1s ease infinite; letter-spacing: -4px; }
        @keyframes countPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.1)} }
        .q-text-anim { animation: fadeSlide 0.4s ease; }
        @keyframes fadeSlide { from{transform:translateY(8px);opacity:0} to{transform:translateY(0);opacity:1} }
        .result-icon { font-size: 56px; animation: bounceIn 0.5s cubic-bezier(0.34,1.56,0.64,1); }
        @keyframes bounceIn { from{transform:scale(0)} to{transform:scale(1)} }
        .toggle-btn { transition: all 0.2s; cursor: pointer; }
        .toggle-btn:hover { opacity: 0.8; }
        @media (max-width: 600px) {
          .answers-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <main style={{ minHeight: '100vh', background: c.bg, fontFamily: 'inherit', transition: 'background 0.3s ease', color: c.text }}>

        {/* COUNTDOWN */}
        {phase === 'countdown' && (
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 20 }}>
            {/* Toggle */}
            <div style={{ position: 'absolute', top: 16, right: 16 }}>
              <button className="toggle-btn" onClick={toggleDark} style={{ padding: '6px 12px', borderRadius: 20, border: `1px solid ${c.cardBorder}`, background: dark ? 'rgba(255,255,255,0.08)' : '#f3f4f6', color: c.text, fontSize: 16, cursor: 'pointer' }}>
                {dark ? '☀️' : '🌙'}
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 40 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#1D9E75', color: 'white', fontSize: 20, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', border: '3px solid #0F6E56' }}>ΜΠ</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: c.text }}>Εσύ</div>
                <div style={{ fontSize: 12, color: c.textSub }}>ELO 1.347</div>
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: c.textMuted }}>VS</div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#E6F1FB', color: '#185FA5', fontSize: 20, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', border: '3px solid #378ADD' }}>ΑΚ</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: c.text }}>Αλέξης Κ.</div>
                <div style={{ fontSize: 12, color: c.textSub }}>ELO 1.312</div>
              </div>
            </div>
            <div className="countdown-num">{countdown === 0 ? 'GO!' : countdown}</div>
            <div style={{ fontSize: 16, color: c.textSub, marginTop: 12 }}>Ετοιμαστείτε!</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
              {['∑ Μαθηματικά', '5 ερωτήσεις', '15δλ/ερώτηση', 'Ranked'].map(t => (
                <div key={t} style={{ background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 600, color: c.textSub }}>{t}</div>
              ))}
            </div>
          </div>
        )}

        {/* GAME */}
        {phase === 'game' && (
          <>
            <div style={{ background: c.navBg, borderBottom: `1px solid ${c.navBorder}`, padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1D9E75', color: 'white', fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>ΜΠ</div>
                <div>
                  <div style={{ fontSize: 12, color: c.textSub }}>Εσύ</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#1D9E75' }}>{scoreYou}</div>
                </div>
              </div>
              <div style={{ position: 'relative', width: 52, height: 52 }}>
                <svg width="52" height="52" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="26" cy="26" r="20" fill="none" stroke={c.progressBg} strokeWidth="4"/>
                  <circle cx="26" cy="26" r="20" fill="none" stroke={timerColor} strokeWidth="4"
                    strokeDasharray={circumference} strokeDashoffset={circumference * (1 - timerPct)}
                    strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.9s linear, stroke 0.3s' }}/>
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 900, color: timerColor }}>{time}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'flex-end' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, color: c.textSub }}>Αλέξης</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#185FA5' }}>{scoreOpp}</div>
                </div>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#E6F1FB', color: '#185FA5', fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>ΑΚ</div>
              </div>
            </div>

            <div style={{ height: 3, background: c.progressBg }}>
              <div style={{ height: '100%', width: `${(cur / questions.length) * 100}%`, background: 'linear-gradient(90deg, #1D9E75, #0F6E56)', transition: 'width 0.4s' }} />
            </div>

            <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ background: c.tagBg, borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 700, color: c.textSub }}>Ερώτηση {cur + 1}/5</span>
                <span style={{ background: 'rgba(29,158,117,0.1)', borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 700, color: '#1D9E75' }}>∑ Μαθηματικά</span>
              </div>

              <div className="q-text-anim" key={cur} style={{ fontSize: 20, fontWeight: 700, color: c.text, lineHeight: 1.4, marginBottom: 20 }}>
                {questions[cur].q}
              </div>

              <div className="answers-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                {questions[cur].answers.map((a, i) => {
                  const correct = questions[cur].correct
                  let cls = 'ans-btn'
                  if (selected !== null) {
                    if (i === correct) cls += ' correct'
                    else if (i === selected) cls += ' wrong'
                  }
                  return (
                    <button key={i} className={cls} onClick={() => pick(i)} disabled={selected !== null}
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
                  {feedback === 'correct' ? '✓ Σωστό! +' + (100 + time * 5) + ' πόντοι' : feedback === 'wrong' ? '✗ Λάθος! Σωστό: ' + questions[cur].answers[questions[cur].correct] : '⏱ Τέλος χρόνου! Σωστό: ' + questions[cur].answers[questions[cur].correct]}
                </div>
              )}
            </div>
          </>
        )}

        {/* RESULTS */}
        {phase === 'results' && (
          <div style={{ maxWidth: 480, margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
            <div className="result-icon">{scoreYou > scoreOpp ? '🏆' : scoreYou < scoreOpp ? '😤' : '🤝'}</div>
            <h2 style={{ fontSize: 28, fontWeight: 900, color: c.text, margin: '12px 0 4px' }}>
              {scoreYou > scoreOpp ? 'Νίκησες!' : scoreYou < scoreOpp ? 'Ηττήθηκες!' : 'Ισοπαλία!'}
            </h2>
            <p style={{ fontSize: 14, color: c.textSub, marginBottom: 28 }}>
              {scoreYou > scoreOpp ? 'Φοβερή παρτίδα! Συνέχισε έτσι!' : 'Μην τα παρατάς — επόμενη φορά!'}
            </p>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 20 }}>
              {[
                { label: 'Εσύ', pts: scoreYou, correct: youCorrect, color: '#1D9E75', bg: dark ? 'rgba(29,158,117,0.15)' : '#E1F5EE' },
                { label: 'Αλέξης', pts: scoreOpp, correct: oppCorrect, color: '#185FA5', bg: dark ? 'rgba(24,95,165,0.15)' : '#E6F1FB' }
              ].map(p => (
                <div key={p.label} style={{ flex: 1, maxWidth: 160, background: p.bg, border: `1px solid ${p.color}33`, borderRadius: 16, padding: '20px 16px' }}>
                  <div style={{ fontSize: 13, color: c.textSub, marginBottom: 6 }}>{p.label}</div>
                  <div style={{ fontSize: 36, fontWeight: 900, color: p.color, letterSpacing: -1 }}>{p.pts}</div>
                  <div style={{ fontSize: 12, color: c.textMuted, marginTop: 4 }}>{p.correct}/5 σωστά</div>
                </div>
              ))}
            </div>

            <div style={{ background: scoreYou >= scoreOpp ? (dark ? 'rgba(29,158,117,0.15)' : '#E1F5EE') : (dark ? 'rgba(163,45,45,0.15)' : '#FCEBEB'), border: `1px solid ${scoreYou >= scoreOpp ? '#5DCAA5' : '#F09595'}`, borderRadius: 12, padding: '12px 20px', marginBottom: 24, fontSize: 15, fontWeight: 700, color: scoreYou >= scoreOpp ? '#0F6E56' : '#A32D2D', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {scoreYou > scoreOpp ? '📈 +18 ELO · Νέο σύνολο: 1.365' : scoreYou < scoreOpp ? '📉 -14 ELO · Νέο σύνολο: 1.333' : '➡️ ±0 ELO · Σύνολο: 1.347'}
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <a href="/lobby" style={{ flex: 1, padding: '14px', background: 'linear-gradient(135deg, #1D9E75, #0F6E56)', color: 'white', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 800, cursor: 'pointer', textDecoration: 'none', textAlign: 'center', boxShadow: '0 4px 16px rgba(29,158,117,0.35)' }}>▶ Νέα παρτίδα</a>
              <a href="/dashboard" style={{ padding: '14px 20px', background: c.card, color: c.textSub, border: `1px solid ${c.cardBorder}`, borderRadius: 12, fontSize: 15, cursor: 'pointer', textDecoration: 'none', fontWeight: 500 }}>Dashboard</a>
            </div>
          </div>
        )}
      </main>
    </>
  )
}