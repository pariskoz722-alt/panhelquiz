'use client'
import { useState, useEffect, useCallback } from 'react'
import { useTheme } from '../context/ThemeContext'
import { supabase } from '../lib/supabase'

const questionsBySubject: Record<string, { q: string; answers: string[]; correct: number }[]> = {
  math: [
    { q: "Ποιο είναι το παράγωγο του f(x) = x³ + 2x;", answers: ["3x² + 2", "3x² − 2", "x² + 2", "3x + 2"], correct: 0 },
    { q: "Αν log₂(x) = 5, τότε x =", answers: ["10", "32", "25", "16"], correct: 1 },
    { q: "Λύσε: 2x² − 8 = 0. Ποια η θετική λύση;", answers: ["x = 4", "x = 2", "x = √2", "x = 2√2"], correct: 1 },
    { q: "Αν sin(θ) = 0.5, τότε θ =", answers: ["30°", "45°", "60°", "90°"], correct: 0 },
    { q: "Ποιος ο τύπος εμβαδού κύκλου;", answers: ["2πr", "πr²", "πr³/3", "2πr²"], correct: 1 },
  ],
  physics: [
    { q: "Ποια η μονάδα μέτρησης της δύναμης;", answers: ["Joule", "Newton", "Watt", "Pascal"], correct: 1 },
    { q: "Ποια η ταχύτητα του φωτός στο κενό;", answers: ["3×10⁸ m/s", "3×10⁶ m/s", "3×10⁵ m/s", "3×10¹⁰ m/s"], correct: 0 },
    { q: "F = ma είναι ο νόμος του;", answers: ["Ohm", "Newton", "Einstein", "Faraday"], correct: 1 },
    { q: "Ποια η μονάδα ενέργειας;", answers: ["Newton", "Pascal", "Joule", "Watt"], correct: 2 },
    { q: "Τι μετράει το αμπερόμετρο;", answers: ["Τάση", "Αντίσταση", "Ισχύ", "Ένταση ρεύματος"], correct: 3 },
  ],
  chemistry: [
    { q: "Ποιος ο ατομικός αριθμός του Οξυγόνου;", answers: ["6", "7", "8", "9"], correct: 2 },
    { q: "Χημικός τύπος νερού;", answers: ["H₂O₂", "HO", "H₂O", "H₃O"], correct: 2 },
    { q: "Τι είναι το pH = 7;", answers: ["Όξινο", "Βασικό", "Ουδέτερο", "Αλκαλικό"], correct: 2 },
    { q: "Χημικό σύμβολο χρυσού;", answers: ["Go", "Gl", "Gd", "Au"], correct: 3 },
    { q: "Πόσα στοιχεία έχει ο περιοδικός πίνακας;", answers: ["108", "112", "118", "124"], correct: 2 },
  ],
  history: [
    { q: "Πότε ξεκίνησε ο Β' Παγκόσμιος Πόλεμος;", answers: ["1937", "1938", "1939", "1940"], correct: 2 },
    { q: "Ποιος ήταν ο πρώτος Πρόεδρος των ΗΠΑ;", answers: ["Lincoln", "Washington", "Jefferson", "Adams"], correct: 1 },
    { q: "Πότε έγινε η Γαλλική Επανάσταση;", answers: ["1776", "1789", "1799", "1815"], correct: 1 },
    { q: "Ποιος κατέκτησε την Κωνσταντινούπολη το 1453;", answers: ["Σελίμ Α'", "Βαγιαζήτ", "Μωάμεθ Β'", "Σουλεϊμάν"], correct: 2 },
    { q: "Πότε έγινε η Ελληνική Επανάσταση;", answers: ["1814", "1821", "1827", "1830"], correct: 1 },
  ],
  biology: [
    { q: "Ποιο οργανίδιο είναι η 'δύναμη' του κυττάρου;", answers: ["Πυρήνας", "Ριβόσωμα", "Μιτοχόνδριο", "Γολγιανό"], correct: 2 },
    { q: "Πόσα ζεύγη χρωμοσωμάτων έχει ο άνθρωπος;", answers: ["22", "23", "24", "46"], correct: 1 },
    { q: "Τι κωδικοποιεί το DNA;", answers: ["Λίπη", "Πρωτεΐνες", "Υδατάνθρακες", "Βιταμίνες"], correct: 1 },
    { q: "Ποια η διαδικασία σύνθεσης τροφής στα φυτά;", answers: ["Αναπνοή", "Μεταβολισμός", "Φωτοσύνθεση", "Ζύμωση"], correct: 2 },
    { q: "Ποιο είναι το μεγαλύτερο κύτταρο;", answers: ["Νευρώνας", "Ωάριο", "Ερυθροκύτταρο", "Μυϊκό κύτταρο"], correct: 1 },
  ],
  lit: [
    { q: "Ποιος έγραψε την Οδύσσεια;", answers: ["Σοφοκλής", "Ευριπίδης", "Όμηρος", "Αισχύλος"], correct: 2 },
    { q: "Ποιο είδος λόγου είναι η Ιλιάδα;", answers: ["Λυρική ποίηση", "Έπος", "Τραγωδία", "Κωμωδία"], correct: 1 },
    { q: "Τι είναι το χιαστί σχήμα;", answers: ["Επανάληψη", "Αντίθεση", "Σχήμα διάταξης", "Μεταφορά"], correct: 2 },
    { q: "Ποιος είναι ο κεντρικός ήρωας της Οδύσσειας;", answers: ["Αχιλλέας", "Αγαμέμνονας", "Οδυσσέας", "Τηλέμαχος"], correct: 2 },
    { q: "Τι είναι η μεταφορά;", answers: ["Σύγκριση με το 'σαν'", "Μεταφορική χρήση λέξης", "Επανάληψη", "Ειρωνεία"], correct: 1 },
  ],
}

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
  const [room, setRoom] = useState<any>(null)
  const [myProfile, setMyProfile] = useState<any>(null)
  const [oppProfile, setOppProfile] = useState<any>(null)
  const [isPlayer1, setIsPlayer1] = useState(false)
  const [questions, setQuestions] = useState(questionsBySubject.math)
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
    loadGame()
  }, [])

  async function loadGame() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/login'; return }

    const params = new URLSearchParams(window.location.search)
    const roomId = params.get('room')

    if (!roomId) { window.location.href = '/lobby'; return }

    const { data: roomData } = await supabase
      .from('game_rooms')
      .select('*, player1:profiles!game_rooms_player1_id_fkey(id, username, elo), player2:profiles!game_rooms_player2_id_fkey(id, username, elo)')
      .eq('id', roomId)
      .single()

    if (!roomData) { window.location.href = '/lobby'; return }

    setRoom(roomData)
    const p1 = roomData.player1_id === user.id
    setIsPlayer1(p1)
    setMyProfile(p1 ? roomData.player1 : roomData.player2)
    setOppProfile(p1 ? roomData.player2 : roomData.player1)
    const { data: allQuestions } = await supabase
  .from('questions')
  .select('*')
  .eq('subject', roomData.subject)

const shuffled = (allQuestions || [])
  .sort(() => Math.random() - 0.5)
  .slice(0, 5)

const dbQuestions = shuffled

if (dbQuestions && dbQuestions.length > 0) {
  setQuestions(dbQuestions.map(q => ({
    q: q.question,
    answers: q.answers,
    correct: q.correct_index,
  })))
} else {
  setQuestions(questionsBySubject[roomData.subject] || questionsBySubject.math)
}

    // Subscribe to room score updates
    supabase
      .channel(`game-${roomId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'game_rooms',
        filter: `id=eq.${roomId}`,
      }, (payload) => {
        const newRoom = payload.new
const oppScore = p1 ? newRoom.score_p2 : newRoom.score_p1
setScoreOpp(oppScore)
setOppCorrect(Math.round(oppScore / 120))
if (newRoom.status === 'finished') {
  setPhase('results')
}
      })
      .subscribe()
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

  async function updateRoomScore(newScore: number) {
    if (!room) return
    const field = isPlayer1 ? 'score_p1' : 'score_p2'
    await supabase
      .from('game_rooms')
      .update({ [field]: newScore })
      .eq('id', room.id)
  }

  async function finishGame(finalScoreYou: number, finalScoreOpp: number) {
    if (!room || !myProfile) return
    const iWon = finalScoreYou > finalScoreOpp
    const eloChange = iWon ? 18 : -14

    await supabase.from('game_rooms').update({ status: 'finished' }).eq('id', room.id)
    await supabase.from('profiles').update({
      elo: myProfile.elo + eloChange,
      wins: iWon ? myProfile.wins + 1 : myProfile.wins,
      losses: iWon ? myProfile.losses : myProfile.losses + 1,
    }).eq('id', myProfile.id)

    await supabase.from('games').insert({
      player1_id: room.player1_id,
      player2_id: room.player2_id,
      winner_id: iWon ? myProfile.id : oppProfile?.id,
      subject: room.subject,
      score_p1: isPlayer1 ? finalScoreYou : finalScoreOpp,
      score_p2: isPlayer1 ? finalScoreOpp : finalScoreYou,
      elo_change: Math.abs(eloChange),
    })
  }

  function pick(i: number) {
    if (selected !== null || phase !== 'game') return
    setSelected(i)
    const correct = questions[cur].correct
    const isCorrect = i === correct
    const pts = isCorrect ? Math.round(100 + time * 5) : 0
    const newScore = scoreYou + pts
    if (isCorrect) {
      setScoreYou(newScore)
      setYouCorrect(c => c + 1)
      updateRoomScore(newScore)
    }
    setFeedback(isCorrect ? 'correct' : 'wrong')
    setTimeout(() => nextQ(newScore), 1600)
  }

  function handleTimeout() {
    setSelected(-1)
    setFeedback('timeout')
    setTimeout(() => nextQ(scoreYou), 1600)
  }

  function nextQ(currentScore: number) {
    if (cur + 1 >= questions.length) {
      setPhase('results')
      finishGame(currentScore, scoreOpp)
      return
    }
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
          transition: all 0.15s; width: 100%; display: flex; align-items: center; gap: 10px;
        }
        .ans-btn:hover:not(:disabled) { border-color: #1D9E75 !important; transform: translateY(-2px); }
        .ans-btn.correct { border-color: #1D9E75 !important; background: #E1F5EE !important; color: #0F6E56 !important; animation: correctPulse 0.4s ease; }
        .ans-btn.wrong { border-color: #E24B4A !important; background: #FCEBEB !important; color: #A32D2D !important; animation: shake 0.4s ease; }
        @keyframes correctPulse { 0%{transform:scale(1)} 50%{transform:scale(1.03)} 100%{transform:scale(1)} }
        @keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }
        .feedback-bar { border-radius: 12px; padding: 12px 16px; font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 8px; animation: slideUp 0.3s ease; }
        @keyframes slideUp { from{transform:translateY(10px);opacity:0} to{transform:translateY(0);opacity:1} }
        .countdown-num { font-size: 96px; font-weight: 900; color: #1D9E75; animation: countPulse 1s ease infinite; }
        @keyframes countPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.1)} }
        .q-text-anim { animation: fadeSlide 0.4s ease; }
        @keyframes fadeSlide { from{transform:translateY(8px);opacity:0} to{transform:translateY(0);opacity:1} }
        .result-icon { font-size: 56px; animation: bounceIn 0.5s cubic-bezier(0.34,1.56,0.64,1); }
        @keyframes bounceIn { from{transform:scale(0)} to{transform:scale(1)} }
        .toggle-btn { transition: all 0.2s; cursor: pointer; }
        @media (max-width: 600px) { .answers-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      <main style={{ minHeight: '100vh', background: c.bg, fontFamily: 'inherit', transition: 'background 0.3s ease', color: c.text }}>

        {/* COUNTDOWN */}
        {phase === 'countdown' && (
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 20 }}>
            <div style={{ position: 'absolute', top: 16, right: 16 }}>
              <button className="toggle-btn" onClick={toggleDark} style={{ padding: '6px 12px', borderRadius: 20, border: `1px solid ${c.cardBorder}`, background: dark ? 'rgba(255,255,255,0.08)' : '#f3f4f6', color: c.text, fontSize: 16, cursor: 'pointer' }}>
                {dark ? '☀️' : '🌙'}
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 40 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#1D9E75', color: 'white', fontSize: 20, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                  {myProfile?.username?.[0]?.toUpperCase() || '?'}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: c.text }}>{myProfile?.username || 'Εσύ'}</div>
                <div style={{ fontSize: 12, color: c.textSub }}>ELO {myProfile?.elo || 1200}</div>
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: c.textMuted }}>VS</div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#E6F1FB', color: '#185FA5', fontSize: 20, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', border: '3px solid #378ADD' }}>
                  {oppProfile?.username?.[0]?.toUpperCase() || '?'}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: c.text }}>{oppProfile?.username || 'Αντίπαλος'}</div>
                <div style={{ fontSize: 12, color: c.textSub }}>ELO {oppProfile?.elo || 1200}</div>
              </div>
            </div>
            <div className="countdown-num">{countdown === 0 ? 'GO!' : countdown}</div>
            <div style={{ fontSize: 16, color: c.textSub, marginTop: 12 }}>Ετοιμαστείτε!</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
              {[`${subjects_map[room?.subject] || '∑'} ${room?.subject || 'Μαθηματικά'}`, '5 ερωτήσεις', '15δλ/ερώτηση', room?.mode === 'ranked' ? 'Ranked' : 'Casual'].map(t => (
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
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1D9E75', color: 'white', fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {myProfile?.username?.[0]?.toUpperCase() || '?'}
                </div>
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
                  <div style={{ fontSize: 12, color: c.textSub }}>{oppProfile?.username || 'Αντίπαλος'}</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#185FA5' }}>{scoreOpp}</div>
                </div>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#E6F1FB', color: '#185FA5', fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {oppProfile?.username?.[0]?.toUpperCase() || '?'}
                </div>
              </div>
            </div>

            <div style={{ height: 3, background: c.progressBg }}>
              <div style={{ height: '100%', width: `${(cur / questions.length) * 100}%`, background: 'linear-gradient(90deg, #1D9E75, #0F6E56)', transition: 'width 0.4s' }} />
            </div>

            <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ background: c.tagBg, borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 700, color: c.textSub }}>Ερώτηση {cur + 1}/{questions.length}</span>
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
                  {feedback === 'correct' ? `✓ Σωστό! +${100 + time * 5} πόντοι` : feedback === 'wrong' ? `✗ Λάθος! Σωστό: ${questions[cur].answers[questions[cur].correct]}` : `⏱ Τέλος χρόνου! Σωστό: ${questions[cur].answers[questions[cur].correct]}`}
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
              {scoreYou > scoreOpp ? 'Φοβερή παρτίδα!' : 'Επόμενη φορά!'}
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 20 }}>
              {[
                { label: myProfile?.username || 'Εσύ', pts: scoreYou, correct: youCorrect, color: '#1D9E75', bg: dark ? 'rgba(29,158,117,0.15)' : '#E1F5EE' },
                { label: oppProfile?.username || 'Αντίπαλος', pts: scoreOpp, correct: oppCorrect, color: '#185FA5', bg: dark ? 'rgba(24,95,165,0.15)' : '#E6F1FB' }
              ].map(p => (
                <div key={p.label} style={{ flex: 1, maxWidth: 160, background: p.bg, border: `1px solid ${p.color}33`, borderRadius: 16, padding: '20px 16px' }}>
                  <div style={{ fontSize: 13, color: c.textSub, marginBottom: 6 }}>{p.label}</div>
                  <div style={{ fontSize: 36, fontWeight: 900, color: p.color }}>{p.pts}</div>
                  <div style={{ fontSize: 12, color: c.textMuted, marginTop: 4 }}>{p.correct}/5 σωστά</div>
                </div>
              ))}
            </div>
            <div style={{ background: scoreYou >= scoreOpp ? (dark ? 'rgba(29,158,117,0.15)' : '#E1F5EE') : (dark ? 'rgba(163,45,45,0.15)' : '#FCEBEB'), border: `1px solid ${scoreYou >= scoreOpp ? '#5DCAA5' : '#F09595'}`, borderRadius: 12, padding: '12px 20px', marginBottom: 24, fontSize: 15, fontWeight: 700, color: scoreYou >= scoreOpp ? '#0F6E56' : '#A32D2D' }}>
              {scoreYou > scoreOpp ? '📈 +18 ELO' : scoreYou < scoreOpp ? '📉 -14 ELO' : '➡️ ±0 ELO'}
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <a href="/lobby" style={{ flex: 1, padding: '14px', background: 'linear-gradient(135deg, #1D9E75, #0F6E56)', color: 'white', borderRadius: 12, fontSize: 15, fontWeight: 800, textDecoration: 'none', textAlign: 'center' }}>▶ Νέα παρτίδα</a>
              <a href="/dashboard" style={{ padding: '14px 20px', background: c.card, color: c.textSub, border: `1px solid ${c.cardBorder}`, borderRadius: 12, fontSize: 15, textDecoration: 'none', fontWeight: 500 }}>Dashboard</a>
            </div>
          </div>
        )}
      </main>
    </>
  )
}

const subjects_map: Record<string, string> = {
  math: '∑', physics: '⚛', chemistry: '⚗',
  history: '📜', biology: '🧬', lit: '✍'
}