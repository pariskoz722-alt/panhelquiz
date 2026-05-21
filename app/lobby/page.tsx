'use client'
import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import { supabase } from '../lib/supabase'

const subjects = [
  { id: 'math', name: 'Μαθηματικά', icon: '∑', color: '#1D9E75', players: 89 },
  { id: 'physics', name: 'Φυσική', icon: '⚛', color: '#378ADD', players: 54 },
  { id: 'chemistry', name: 'Χημεία', icon: '⚗', color: '#D85A30', players: 31 },
  { id: 'history', name: 'Ιστορία', icon: '📜', color: '#7F77DD', players: 47 },
  { id: 'biology', name: 'Βιολογία', icon: '🧬', color: '#639922', players: 28 },
  { id: 'lit', name: 'Έκθεση', icon: '✍', color: '#BA7517', players: 22 },
]

export default function Lobby() {
  const [grade, setGrade] = useState(2)
  const [subject, setSubject] = useState('math')
  const [mode, setMode] = useState('ranked')
  const [screen, setScreen] = useState<'lobby' | 'matching' | 'found'>('lobby')
  const [dots, setDots] = useState('')
  const [searchTime, setSearchTime] = useState(0)
  const [roomId, setRoomId] = useState<string | null>(null)
  const [opponent, setOpponent] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const { dark, toggleDark } = useTheme()

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
    tagBg: dark ? 'rgba(29,158,117,0.15)' : '#E1F5EE',
  }

  useEffect(() => { loadProfile() }, [])

  useEffect(() => {
    if (screen !== 'matching') return
    const d = setInterval(() => setDots(p => p.length >= 3 ? '' : p + '.'), 400)
    const t = setInterval(() => setSearchTime(p => p + 1), 1000)
    return () => { clearInterval(d); clearInterval(t) }
  }, [screen])

  async function loadProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/login'; return }
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    setProfile(data)
    if (data?.grade) setGrade(data.grade)
  await supabase.rpc('cleanup_old_rooms')}

  async function findMatch() {
    if (!profile) return
    setSearchTime(0)
    setScreen('matching')

    const { data: existingRoom } = await supabase
      .from('game_rooms')
      .select('*, player1:profiles!game_rooms_player1_id_fkey(id, username, elo)')
      .eq('subject', subject)
      .eq('grade', grade)
      .eq('status', 'waiting')
      .neq('player1_id', profile.id)
      .limit(1)
      .single()

    if (existingRoom) {
      const { data: updatedRoom } = await supabase
        .from('game_rooms')
        .update({ player2_id: profile.id, status: 'ready' })
        .eq('id', existingRoom.id)
        .select('*, player1:profiles!game_rooms_player1_id_fkey(id, username, elo)')
        .single()

      if (updatedRoom) {
        setRoomId(updatedRoom.id)
        setOpponent(updatedRoom.player1)
        setScreen('found')
        setTimeout(() => {
          window.location.href = `/game?room=${updatedRoom.id}`
        }, 2000)
      }
    } else {
      const { data: newRoom } = await supabase
        .from('game_rooms')
        .insert({ player1_id: profile.id, subject, grade, mode, status: 'waiting' })
        .select()
        .single()

      if (newRoom) {
        setRoomId(newRoom.id)

        // Polling - check every 1.5s if opponent joined
        const pollInterval = setInterval(async () => {
          const { data: roomCheck } = await supabase
            .from('game_rooms')
            .select('*, player2:profiles!game_rooms_player2_id_fkey(id, username, elo)')
            .eq('id', newRoom.id)
            .single()
          if (roomCheck?.status === 'ready' && roomCheck?.player2_id) {
            clearInterval(pollInterval)
            setOpponent(roomCheck.player2)
            setScreen('found')
            setTimeout(() => {
              window.location.href = `/game?room=${newRoom.id}`
            }, 2000)
          }
        }, 1500)

        // Also try realtime
        supabase
          .channel(`room-${newRoom.id}`)
          .on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'game_rooms',
            filter: `id=eq.${newRoom.id}`,
          }, async (payload) => {
            if (payload.new.status === 'ready' && payload.new.player2_id) {
              clearInterval(pollInterval)
              const { data: opp } = await supabase
                .from('profiles')
                .select('id, username, elo')
                .eq('id', payload.new.player2_id)
                .single()
              setOpponent(opp)
              setScreen('found')
              setTimeout(() => {
                window.location.href = `/game?room=${newRoom.id}`
              }, 2000)
            }
          })
          .subscribe()
      }
    }
  }

  async function cancelMatch() {
    if (roomId) {
      await supabase.from('game_rooms').delete().eq('id', roomId)
      setRoomId(null)
    }
    setScreen('lobby')
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        .grade-btn { flex: 1; padding: 16px 8px; border-radius: 14px; cursor: pointer; font-family: inherit; transition: all 0.2s; text-align: center; }
        .grade-btn:hover { transform: translateY(-2px); }
        .subject-btn { padding: 14px; border-radius: 14px; cursor: pointer; text-align: left; font-family: inherit; transition: all 0.2s; display: flex; align-items: center; gap: 10px; }
        .subject-btn:hover { transform: translateY(-2px); }
        .mode-btn { flex: 1; padding: 16px; border-radius: 14px; cursor: pointer; text-align: left; font-family: inherit; transition: all 0.2s; }
        .play-btn { width: 100%; padding: 16px; background: linear-gradient(135deg, #1D9E75, #0F6E56); color: white; border: none; border-radius: 14px; font-family: inherit; font-size: 17px; font-weight: 800; cursor: pointer; transition: all 0.2s; box-shadow: 0 6px 20px rgba(29,158,117,0.35); }
        .play-btn:hover { transform: translateY(-2px); }
        .searching-dot { width: 10px; height: 10px; border-radius: 50%; background: #1D9E75; animation: bounce 1.2s infinite; }
        .searching-dot:nth-child(2) { animation-delay: 0.2s; }
        .searching-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes bounce { 0%,80%,100%{transform:scale(0.6);opacity:0.4} 40%{transform:scale(1.2);opacity:1} }
        .opp-avatar-appear { animation: popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        @keyframes popIn { from{transform:scale(0);opacity:0} to{transform:scale(1);opacity:1} }
        .toggle-btn { transition: all 0.2s; cursor: pointer; }
        @media (max-width: 600px) {
          .subject-grid { grid-template-columns: 1fr !important; }
          .mode-row { flex-direction: column !important; }
        }
      `}</style>

      <main style={{ minHeight: '100vh', background: c.bg, fontFamily: 'inherit', transition: 'background 0.3s ease', color: c.text }}>

        <nav style={{ background: c.navBg, backdropFilter: 'blur(10px)', borderBottom: `1px solid ${c.navBorder}`, padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: c.text }}>Panhel<span style={{ color: '#1D9E75' }}>Quiz</span></div>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            {[['Dashboard', '/dashboard'], ['Παίξε', '/lobby'], ['Leaderboard', '/leaderboard'], ['Profile', '/profile']].map(([n, href]) => (
              <a key={n} href={href} style={{ padding: '6px 12px', borderRadius: 8, fontSize: 13, fontWeight: 500, color: n === 'Παίξε' ? '#0F6E56' : c.textSub, background: n === 'Παίξε' ? 'rgba(29,158,117,0.12)' : 'transparent', textDecoration: 'none' }}>{n}</a>
            ))}
            <button className="toggle-btn" onClick={toggleDark} style={{ marginLeft: 4, padding: '6px 10px', borderRadius: 20, border: `1px solid ${c.cardBorder}`, background: dark ? 'rgba(255,255,255,0.08)' : '#f3f4f6', color: c.text, fontSize: 15, cursor: 'pointer' }}>
              {dark ? '☀️' : '🌙'}
            </button>
          </div>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1D9E75', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>
            {profile?.username?.[0]?.toUpperCase() || 'Π'}
          </div>
        </nav>

        {screen === 'lobby' && (
          <div style={{ maxWidth: 520, margin: '0 auto', padding: '28px 20px' }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4, color: c.text }}>Νέα παρτίδα</h1>
            <p style={{ fontSize: 14, color: c.textSub, marginBottom: 24 }}>Διάλεξε τάξη και μάθημα για να βρούμε αντίπαλο.</p>

            <div style={{ fontSize: 11, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Τάξη σου</div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
              {[1, 2, 3].map(g => (
                <button key={g} className="grade-btn" onClick={() => setGrade(g)} style={{ border: `2px solid ${grade === g ? '#1D9E75' : c.btnBorder}`, background: grade === g ? c.selectedBg : c.card, color: c.text }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: grade === g ? '#1D9E75' : c.text }}>{['Α΄', 'Β΄', 'Γ΄'][g - 1]}</div>
                  <div style={{ fontSize: 11, color: c.textMuted }}>Λυκείου</div>
                </button>
              ))}
            </div>

            <div style={{ fontSize: 11, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Μάθημα</div>
            <div className="subject-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 24 }}>
              {subjects.map(s => (
                <button key={s.id} className="subject-btn" onClick={() => setSubject(s.id)} style={{ border: `2px solid ${subject === s.id ? '#1D9E75' : c.btnBorder}`, background: subject === s.id ? c.selectedBg : c.card }}>
                  <span style={{ fontSize: 20, color: s.color }}>{s.icon}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: subject === s.id ? '#1D9E75' : c.text }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: '#1D9E75' }}>{s.players} παίκτες τώρα</div>
                  </div>
                </button>
              ))}
            </div>

            <div style={{ fontSize: 11, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Τρόπος</div>
            <div className="mode-row" style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
              {[{ id: 'ranked', icon: '⚔️', title: 'Ranked', desc: 'Κερδίζεις ELO.' }, { id: 'casual', icon: '🎮', title: 'Casual', desc: 'Χωρίς ELO.' }].map(m => (
                <button key={m.id} className="mode-btn" onClick={() => setMode(m.id)} style={{ border: `2px solid ${mode === m.id ? '#1D9E75' : c.btnBorder}`, background: mode === m.id ? c.selectedBg : c.card }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: mode === m.id ? '#1D9E75' : c.text, marginBottom: 4 }}>{m.icon} {m.title}</div>
                  <div style={{ fontSize: 12, color: c.textSub }}>{m.desc}</div>
                </button>
              ))}
            </div>

            <div style={{ background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: 12, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <span style={{ fontSize: 13, color: c.textSub }}>📊 ELO: <strong style={{ color: c.text }}>{profile?.elo || 1200}</strong></span>
              <span style={{ fontSize: 13, color: c.textSub }}>👤 <strong style={{ color: c.text }}>{profile?.username || 'Παίκτης'}</strong></span>
            </div>

            <button className="play-btn" onClick={findMatch}>▶ Εύρεση αντιπάλου</button>
          </div>
        )}

        {screen === 'matching' && (
          <div style={{ maxWidth: 420, margin: '0 auto', padding: '48px 20px', textAlign: 'center' }}>
            <div style={{ background: c.tagBg, color: '#0F6E56', fontSize: 12, fontWeight: 700, padding: '5px 14px', borderRadius: 20, display: 'inline-block', marginBottom: 28 }}>
              ● {['Α΄', 'Β΄', 'Γ΄'][grade - 1]} Λυκείου · {subjects.find(s => s.id === subject)?.name}
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, color: c.text }}>Ψάχνουμε αντίπαλο{dots}</h2>
            <p style={{ fontSize: 14, color: c.textSub, marginBottom: 36 }}>Βρίσκουμε κάποιον με παρόμοιο ELO</p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, marginBottom: 36 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#1D9E75', color: 'white', fontSize: 20, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                  {profile?.username?.[0]?.toUpperCase() || 'Π'}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: c.text }}>{profile?.username || 'Εσύ'}</div>
                <div style={{ fontSize: 12, color: c.textSub }}>ELO {profile?.elo || 1200}</div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: c.textMuted }}>VS</div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: dark ? 'rgba(255,255,255,0.08)' : '#f3f4f6', color: c.textMuted, fontSize: 20, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', border: `3px dashed ${c.btnBorder}` }}>?</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: c.textMuted }}>Αναμονή...</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 32 }}>
              <div className="searching-dot" /><div className="searching-dot" /><div className="searching-dot" />
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 28, flexWrap: 'wrap' }}>
              {[`⏱ ${searchTime}δλ`, '📋 5 ερωτήσεις', '⚡ 15δλ/ερώτηση'].map(t => (
                <div key={t} style={{ background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 600, color: c.textSub }}>{t}</div>
              ))}
            </div>

            <button onClick={cancelMatch} style={{ background: 'transparent', border: `1px solid ${c.btnBorder}`, borderRadius: 10, padding: '10px 24px', fontSize: 14, color: c.textSub, cursor: 'pointer', fontFamily: 'inherit' }}>Ακύρωση</button>
          </div>
        )}

        {screen === 'found' && opponent && (
          <div style={{ maxWidth: 420, margin: '0 auto', padding: '48px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🎯</div>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6, color: c.text }}>Αντίπαλος βρέθηκε!</h2>
            <p style={{ fontSize: 14, color: c.textSub, marginBottom: 36 }}>Μεταφορά στο παιχνίδι σε 2 δευτερόλεπτα...</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, marginBottom: 32 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 70, height: 70, borderRadius: '50%', background: '#1D9E75', color: 'white', fontSize: 22, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', border: '3px solid #0F6E56' }}>
                  {profile?.username?.[0]?.toUpperCase() || 'Π'}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: c.text }}>{profile?.username}</div>
                <div style={{ fontSize: 12, color: c.textSub }}>ELO {profile?.elo}</div>
              </div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#1D9E75' }}>VS</div>
              <div className="opp-avatar-appear" style={{ textAlign: 'center' }}>
                <div style={{ width: 70, height: 70, borderRadius: '50%', background: '#E6F1FB', color: '#185FA5', fontSize: 22, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', border: '3px solid #378ADD' }}>
                  {opponent?.username?.[0]?.toUpperCase() || '?'}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: c.text }}>{opponent?.username}</div>
                <div style={{ fontSize: 12, color: c.textSub }}>ELO {opponent?.elo}</div>
              </div>
            </div>
            <div style={{ background: c.tagBg, border: '1px solid #5DCAA5', borderRadius: 12, padding: '12px 20px', fontSize: 14, fontWeight: 700, color: '#0F6E56' }}>
              ✓ Μεταφορά στο παιχνίδι...
            </div>
          </div>
        )}
      </main>
    </>
  )
}