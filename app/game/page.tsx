'use client'
import { useState, useEffect, useRef } from 'react'
import { useTheme } from '../context/ThemeContext'
import { supabase } from '../lib/supabase'
import { useToast } from '../components/Toast'
import { pickQuestions } from '../lib/questions'
import { getRank } from '../lib/ranks'

const QUICK_REACTIONS = ['👏', '🔥', '😤', '🤝', '💪', '😂']

interface ChatMessage {
  id: string
  player_id: string
  username: string
  message: string
  created_at: string
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
  const [questions, setQuestions] = useState<{ q: string; answers: string[]; correct: number }[]>([])
  const [wrongAnswers, setWrongAnswers] = useState<{ q: string; correct: string; chosen: string }[]>([])
  const [rematchSent, setRematchSent] = useState(false)

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatExpired, setChatExpired] = useState(false)
  const [chatTimeLeft, setChatTimeLeft] = useState(300) // 5 λεπτά
  const chatBottomRef = useRef<HTMLDivElement>(null)
  const currentRoomRef = useRef<any>(null)
  const myProfileRef = useRef<any>(null)
  const oppProfileRef = useRef<any>(null)
  const isPlayer1Ref = useRef(false)
  const gameChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  const { dark, toggleDark } = useTheme()
  const { addToast } = useToast()

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
    chatBg: dark ? 'rgba(255,255,255,0.03)' : '#f3f4f6',
    chatInputBg: dark ? 'rgba(255,255,255,0.06)' : 'white',
    myMsgBg: dark ? 'rgba(29,158,117,0.25)' : '#E1F5EE',
    oppMsgBg: dark ? 'rgba(255,255,255,0.08)' : 'white',
  }

  useEffect(() => {
    loadGame()
    return () => {
      if (gameChannelRef.current) supabase.removeChannel(gameChannelRef.current)
    }
  }, [])

  async function loadGame() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/login'; return }

    const params = new URLSearchParams(window.location.search)
    const roomId = params.get('room')
    if (!roomId) { window.location.href = '/lobby'; return }

    const { data: roomData } = await supabase
      .from('game_rooms')
      .select('*, player1:profiles!game_rooms_player1_id_fkey(id, username, elo, wins, losses), player2:profiles!game_rooms_player2_id_fkey(id, username, elo, wins, losses)')
      .eq('id', roomId)
      .single()

    if (!roomData) { window.location.href = '/lobby'; return }

    setRoom(roomData)
    currentRoomRef.current = roomData
    const p1 = roomData.player1_id === user.id
    setIsPlayer1(p1)
    isPlayer1Ref.current = p1
    const me = p1 ? roomData.player1 : roomData.player2
    const opp = p1 ? roomData.player2 : roomData.player1
    setMyProfile(me)
    myProfileRef.current = me
    setOppProfile(opp)
    oppProfileRef.current = opp

    const { data: allQuestions } = await supabase
      .from('questions')
      .select('*')
      .eq('subject', roomData.subject)

    const shuffled = (allQuestions || []).sort(() => Math.random() - 0.5).slice(0, 5)
    if (shuffled.length > 0) {
      setQuestions(shuffled.map(q => ({ q: q.question, answers: q.answers, correct: q.correct_index })))
    } else {
      setQuestions(pickQuestions(roomData.subject))
    }

    gameChannelRef.current = supabase
      .channel(`game-${roomId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'game_rooms', filter: `id=eq.${roomId}` }, (payload) => {
        const newRoom = payload.new
        const oppScore = p1 ? newRoom.score_p2 : newRoom.score_p1
        setScoreOpp(oppScore)
        // Estimate opponent's correct answers (min 100pts, max 175pts per correct answer)
        setOppCorrect(Math.min(5, Math.round(oppScore / 125)))
        if (newRoom.status === 'finished') setPhase('results')
      })
      .subscribe()
  }

  // Chat realtime subscription
  useEffect(() => {
    if (phase !== 'results' || !currentRoomRef.current) return

    const roomId = currentRoomRef.current.id

    // Load existing messages
    supabase
      .from('chat_messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })
      .then(({ data }) => { if (data) setChatMessages(data) })

    // Subscribe to new messages
    const channel = supabase
      .channel(`chat-${roomId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `room_id=eq.${roomId}` }, (payload) => {
        setChatMessages(prev => [...prev, payload.new as ChatMessage])
      })
      .subscribe()

    // 5 λεπτά countdown
    const timer = setInterval(() => {
      setChatTimeLeft(prev => {
        if (prev <= 1) { setChatExpired(true); clearInterval(timer); return 0 }
        return prev - 1
      })
    }, 1000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(timer)
    }
  }, [phase])

  // Auto-scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  async function sendMessage(text: string) {
    if (!text.trim() || chatExpired || !currentRoomRef.current || !myProfileRef.current) return
    const { error } = await supabase.from('chat_messages').insert({
      room_id: currentRoomRef.current.id,
      player_id: myProfileRef.current.id,
      username: myProfileRef.current.username,
      message: text.trim(),
    })
    if (error) console.error('Chat insert error:', error)
    else setChatInput('')
  }

  function handleChatKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(chatInput)
    }
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
    if (!currentRoomRef.current) return
    const field = isPlayer1 ? 'score_p1' : 'score_p2'
    await supabase.from('game_rooms').update({ [field]: newScore }).eq('id', currentRoomRef.current.id)
  }

  async function finishGame(finalScoreYou: number, finalScoreOpp: number) {
    if (!currentRoomRef.current || !myProfileRef.current) return
    const iWon = finalScoreYou > finalScoreOpp
    const eloChange = iWon ? 18 : -14
    const me = myProfileRef.current
    const opp = oppProfileRef.current  // use ref, not stale state closure
    const newElo = me.elo + eloChange

    await supabase.from('game_rooms').update({ status: 'finished' }).eq('id', currentRoomRef.current.id)
    await supabase.from('profiles').update({
      elo: newElo,
      wins: iWon ? me.wins + 1 : me.wins,
      losses: iWon ? me.losses : me.losses + 1,
    }).eq('id', me.id)
    // Only player1 inserts the games record — prevents duplicate rows from both tabs
    if (isPlayer1Ref.current) {
      await supabase.from('games').insert({
        player1_id: currentRoomRef.current.player1_id,
        player2_id: currentRoomRef.current.player2_id,
        winner_id: iWon ? me.id : opp?.id,
        subject: currentRoomRef.current.subject,
        score_p1: finalScoreYou,
        score_p2: finalScoreOpp,
        elo_change: Math.abs(eloChange),
      })
    }

    // Game result toast + notification
    const oppName = opp?.username || 'Αντίπαλος'
    addToast({
      type: iWon ? 'win' : 'loss',
      title: iWon ? 'Νίκη! 🏆' : 'Ήττα',
      message: `vs ${oppName} · ${iWon ? '+' : ''}${eloChange} ELO`,
      duration: 5500,
    })
    await supabase.from('notifications').insert({
      user_id: me.id,
      type: 'game_result',
      title: iWon ? `Νίκη vs ${oppName}` : `Ήττα vs ${oppName}`,
      message: `${finalScoreYou}–${finalScoreOpp} · ${iWon ? '+' : ''}${eloChange} ELO → ${newElo}`,
      data: { won: iWon, eloChange, newElo, opponent: oppName },
    })

    // ELO milestone notification
    const milestones = [1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000]
    const crossed = milestones.find(m => me.elo < m && newElo >= m)
    if (crossed) {
      addToast({ type: 'success', title: `Milestone: ${crossed} ELO! 🎉`, duration: 6000 })
      await supabase.from('notifications').insert({
        user_id: me.id,
        type: 'rank_milestone',
        title: `Έφτασες τα ${crossed} ELO!`,
        message: 'Συγχαρητήρια! Συνέχισε να ανεβαίνεις.',
        data: { milestone: crossed },
      })
    }
  }

  async function startRematch() {
    const me = myProfileRef.current
    const opp = oppProfileRef.current
    const room = currentRoomRef.current
    if (!me || !opp || !room) return
    setRematchSent(true)
    const { data: newRoom } = await supabase
      .from('game_rooms')
      .insert({ player1_id: me.id, player2_id: opp.id, subject: room.subject, mode: room.mode || 'casual', status: 'ready' })
      .select().single()
    if (!newRoom) { setRematchSent(false); return }
    await supabase.from('notifications').insert({
      user_id: opp.id, type: 'rematch',
      title: `⚔️ Rematch από ${me.username}!`,
      message: `Πάτησε εδώ για να παίξεις → ${subjects_name_map[room.subject] || room.subject}`,
      data: { room_id: newRoom.id },
    })
    window.location.href = `/game?room=${newRoom.id}`
  }

  async function shareResult() {
    const won = scoreYou > scoreOpp
    const eloChange = won ? '+18' : scoreYou < scoreOpp ? '−14' : '±0'
    const oppName = oppProfileRef.current?.username || 'Αντίπαλος'
    const subjectName = subjects_name_map[room?.subject] || room?.subject || 'Quiz'
    const text = `${won ? '🏆 Νίκη' : scoreYou < scoreOpp ? '😤 Ήττα' : '🤝 Ισοπαλία'} στο PanhelQuiz!\nvs ${oppName} · ${subjectName}\n${scoreYou}–${scoreOpp} · ${eloChange} ELO\n\npanhelquiz.vercel.app`
    try {
      if (navigator.share) {
        await navigator.share({ title: 'PanhelQuiz', text })
      } else {
        await navigator.clipboard.writeText(text)
        addToast({ type: 'success', title: 'Αντιγράφηκε!', message: 'Κοινοποίησε το αποτέλεσμά σου.' })
      }
    } catch {}
  }

  function pick(i: number) {
    if (selected !== null || phase !== 'game') return
    setSelected(i)
    const correct = questions[cur].correct
    const isCorrect = i === correct
    const pts = isCorrect ? Math.round(100 + time * 5) : 0
    const newScore = scoreYou + pts
    if (isCorrect) { setScoreYou(newScore); setYouCorrect(c => c + 1); updateRoomScore(newScore) }
    setFeedback(isCorrect ? 'correct' : 'wrong')
    if (!isCorrect) {
      setWrongAnswers(w => [...w, { q: questions[cur].q, correct: questions[cur].answers[questions[cur].correct], chosen: questions[cur].answers[i] }])
    }
    setTimeout(() => nextQ(newScore), 1600)
  }

  function handleTimeout() {
    setSelected(-1)
    setFeedback('timeout')
    setWrongAnswers(w => [...w, { q: questions[cur].q, correct: questions[cur].answers[questions[cur].correct], chosen: '(χρόνος τέλος)' }])
    setTimeout(() => nextQ(scoreYou), 1600)
  }

  function nextQ(currentScore: number) {
    if (cur + 1 >= questions.length) { setPhase('results'); finishGame(currentScore, scoreOpp); return }
    setCur(c => c + 1); setSelected(null); setFeedback(null); setTime(15)
  }

  const timerPct = time / 15
  const timerColor = time <= 5 ? '#E24B4A' : '#1D9E75'
  const circumference = 125.6

  const chatMinutes = Math.floor(chatTimeLeft / 60)
  const chatSeconds = chatTimeLeft % 60

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
        .chat-msg { animation: msgIn 0.25s ease; }
        @keyframes msgIn { from{transform:translateY(6px);opacity:0} to{transform:translateY(0);opacity:1} }
        .reaction-btn:hover { transform: scale(1.25); }
        .reaction-btn { transition: transform 0.15s; cursor: pointer; background: none; border: none; font-size: 22px; padding: 4px; }
        .send-btn:hover { background: #0F6E56 !important; }
        .send-btn { transition: background 0.15s; }
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
              {(() => {
                const myRank = getRank(myProfile?.elo || 1200)
                const oppRank = getRank(oppProfile?.elo || 1200)
                return (
                  <>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#1D9E75', color: 'white', fontSize: 20, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                        {myProfile?.username?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: c.text }}>{myProfile?.username || 'Εσύ'}</div>
                      <div style={{ fontSize: 11, color: c.textSub }}>ELO {myProfile?.elo || 1200}</div>
                      <div style={{ marginTop: 4, fontSize: 11, fontWeight: 700, color: myRank.color }}>{myRank.icon} {myRank.name}</div>
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: c.textMuted }}>VS</div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#E6F1FB', color: '#185FA5', fontSize: 20, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', border: '3px solid #378ADD' }}>
                        {oppProfile?.username?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: c.text }}>{oppProfile?.username || 'Αντίπαλος'}</div>
                      <div style={{ fontSize: 11, color: c.textSub }}>ELO {oppProfile?.elo || 1200}</div>
                      <div style={{ marginTop: 4, fontSize: 11, fontWeight: 700, color: oppRank.color }}>{oppRank.icon} {oppRank.name}</div>
                    </div>
                  </>
                )
              })()}
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
              {questions[cur] ? (
                <>
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
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0', color: c.textSub }}>Φόρτωση ερωτήσεων...</div>
              )}
            </div>
          </>
        )}

        {/* RESULTS */}
        {phase === 'results' && (
          <div style={{ maxWidth: 480, margin: '0 auto', padding: '40px 20px 60px' }}>
            <div style={{ textAlign: 'center' }}>
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
              <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                <button onClick={startRematch} disabled={rematchSent} style={{ flex: 1, padding: '13px', background: rematchSent ? c.card : 'linear-gradient(135deg, #1D9E75, #0F6E56)', color: rematchSent ? c.textSub : 'white', border: rematchSent ? `1px solid ${c.cardBorder}` : 'none', borderRadius: 12, fontSize: 15, fontWeight: 800, cursor: rematchSent ? 'default' : 'pointer', fontFamily: 'inherit' }}>
                  {rematchSent ? '✓ Αποστάλθηκε!' : '⚔️ Rematch'}
                </button>
                <button onClick={shareResult} style={{ padding: '13px 16px', background: c.card, color: c.text, border: `1px solid ${c.cardBorder}`, borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                  📤
                </button>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 24 }}>
                <a href="/lobby" style={{ flex: 1, padding: '13px', background: c.card, color: c.text, border: `1px solid ${c.cardBorder}`, borderRadius: 12, fontSize: 14, fontWeight: 600, textDecoration: 'none', textAlign: 'center' }}>▶ Νέα παρτίδα</a>
                <a href="/dashboard" style={{ padding: '13px 16px', background: c.card, color: c.textSub, border: `1px solid ${c.cardBorder}`, borderRadius: 12, fontSize: 14, textDecoration: 'none', fontWeight: 500 }}>Dashboard</a>
              </div>
            </div>

            {/* Wrong answers review */}
            {wrongAnswers.length > 0 && (
              <div style={{ background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: 16, padding: '20px', marginBottom: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: c.text, marginBottom: 14 }}>📋 Τα λάθη σου — μελέτησέ τα</div>
                {wrongAnswers.map((w, i) => (
                  <div key={i} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: i < wrongAnswers.length - 1 ? `1px solid ${c.cardBorder}` : 'none' }}>
                    <div style={{ fontSize: 13, color: c.text, fontWeight: 600, marginBottom: 6 }}>{w.q}</div>
                    <div style={{ fontSize: 12, color: '#E24B4A' }}>Απάντησες: {w.chosen}</div>
                    <div style={{ fontSize: 12, color: '#1D9E75', fontWeight: 700 }}>Σωστό: {w.correct}</div>
                  </div>
                ))}
              </div>
            )}

            {/* POST-GAME CHAT */}
            <div style={{ background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: 20, overflow: 'hidden' }}>
              {/* Chat header */}
              <div style={{ padding: '14px 16px', borderBottom: `1px solid ${c.cardBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16 }}>💬</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: c.text }}>Post-game chat</span>
                </div>
                {!chatExpired ? (
                  <span style={{ fontSize: 12, color: c.textMuted, background: c.tagBg, padding: '3px 10px', borderRadius: 20 }}>
                    {chatMinutes}:{chatSeconds.toString().padStart(2, '0')}
                  </span>
                ) : (
                  <span style={{ fontSize: 12, color: '#E24B4A', background: dark ? 'rgba(226,75,74,0.1)' : '#FCEBEB', padding: '3px 10px', borderRadius: 20 }}>Έληξε</span>
                )}
              </div>

              {/* Quick reactions */}
              {!chatExpired && (
                <div style={{ padding: '10px 16px', borderBottom: `1px solid ${c.cardBorder}`, display: 'flex', gap: 4 }}>
                  {QUICK_REACTIONS.map(emoji => (
                    <button key={emoji} className="reaction-btn" onClick={() => sendMessage(emoji)}>{emoji}</button>
                  ))}
                </div>
              )}

              {/* Messages */}
              <div style={{ height: 220, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8, background: c.chatBg }}>
                {chatMessages.length === 0 && (
                  <div style={{ textAlign: 'center', color: c.textMuted, fontSize: 13, marginTop: 'auto', marginBottom: 'auto' }}>
                    Πες gg! 👋
                  </div>
                )}
                {chatMessages.map(msg => {
                  const isMe = msg.player_id === myProfileRef.current?.id
                  return (
                    <div key={msg.id} className="chat-msg" style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                      <div style={{ fontSize: 11, color: c.textMuted, marginBottom: 3, paddingLeft: isMe ? 0 : 4, paddingRight: isMe ? 4 : 0 }}>
                        {msg.username}
                      </div>
                      <div style={{ background: isMe ? c.myMsgBg : c.oppMsgBg, border: `1px solid ${isMe ? '#1D9E7533' : c.cardBorder}`, borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px', padding: '8px 12px', maxWidth: '75%', fontSize: 14, color: c.text, wordBreak: 'break-word' }}>
                        {msg.message}
                      </div>
                    </div>
                  )
                })}
                <div ref={chatBottomRef} />
              </div>

              {/* Input */}
              {!chatExpired ? (
                <div style={{ padding: '12px 16px', display: 'flex', gap: 8, borderTop: `1px solid ${c.cardBorder}` }}>
                  <input
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={handleChatKey}
                    placeholder="Γράψε κάτι..."
                    maxLength={200}
                    style={{ flex: 1, padding: '10px 14px', borderRadius: 12, border: `1px solid ${c.cardBorder}`, background: c.chatInputBg, color: c.text, fontSize: 14, fontFamily: 'inherit', outline: 'none' }}
                  />
                  <button
                    className="send-btn"
                    onClick={() => sendMessage(chatInput)}
                    disabled={!chatInput.trim()}
                    style={{ padding: '10px 16px', background: '#1D9E75', color: 'white', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: chatInput.trim() ? 'pointer' : 'not-allowed', opacity: chatInput.trim() ? 1 : 0.5 }}
                  >
                    ↑
                  </button>
                </div>
              ) : (
                <div style={{ padding: '14px 16px', textAlign: 'center', fontSize: 13, color: c.textMuted }}>
                  Το chat έκλεισε. Καλή συνέχεια! 🎯
                </div>
              )}
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

const subjects_name_map: Record<string, string> = {
  math: 'Μαθηματικά', physics: 'Φυσική', chemistry: 'Χημεία',
  history: 'Ιστορία', biology: 'Βιολογία', lit: 'Έκθεση'
}