'use client'
import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import { supabase } from '../lib/supabase'
import NotificationBell from '../components/NotificationBell'
import { subjectMeta } from '../lib/questions'
import { getRank } from '../lib/ranks'

export default function Dashboard() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { dark, toggleDark } = useTheme()
  const [profile, setProfile] = useState<any>(null)
  const [recentGames, setRecentGames] = useState<any[]>([])
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [subjectStats, setSubjectStats] = useState<Record<string, { wins: number; losses: number }>>({})
  const [eloHistory, setEloHistory] = useState<number[]>([])
  const [streak, setStreak] = useState<{ count: number; playedToday: boolean }>({ count: 0, playedToday: false })
  const [dailyDone, setDailyDone] = useState<{ score: number; correct: number } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
    // Check daily challenge completion (localStorage, client-only)
    const today = new Date().toISOString().split('T')[0]
    const saved = localStorage.getItem(`daily-${today}`)
    if (saved) {
      try { setDailyDone(JSON.parse(saved)) } catch {}
    }
  }, [])

  async function loadData() {
    setLoading(true)
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/login'; return }

    // Get profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    setProfile(profileData)

    // Get leaderboard (top 5 + current user)
    const { data: topPlayers } = await supabase
      .from('profiles')
      .select('id, username, elo')
      .order('elo', { ascending: false })
      .limit(5)
    setLeaderboard(topPlayers || [])

    // Get recent games
    const { data: games } = await supabase
      .from('games')
      .select('*, player1:profiles!games_player1_id_fkey(username), player2:profiles!games_player2_id_fkey(username)')
      .or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
      .limit(4)
    setRecentGames(games || [])

    // All games — used for subject stats + ELO chart + streak
    const { data: allGames } = await supabase
      .from('games')
      .select('subject, winner_id, player1_id, player2_id, elo_change, created_at')
      .or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`)
      .order('created_at', { ascending: true })

    // Subject stats
    const stats: Record<string, { wins: number; losses: number }> = {}
    for (const g of allGames || []) {
      if (!g.subject) continue
      if (!stats[g.subject]) stats[g.subject] = { wins: 0, losses: 0 }
      if (g.winner_id === user.id) stats[g.subject].wins++
      else stats[g.subject].losses++
    }
    setSubjectStats(stats)

    // ELO history — reconstruct backwards from current ELO
    const finished = (allGames || []).filter(g => g.winner_id !== null)
    if (finished.length > 0 && profileData) {
      let elo = profileData.elo
      const points: number[] = [elo]
      for (let i = finished.length - 1; i >= 0; i--) {
        const g = finished[i]
        const change = g.elo_change ?? (g.winner_id === user.id ? 18 : 14)
        elo = g.winner_id === user.id ? elo - change : elo + change
        points.unshift(elo)
      }
      setEloHistory(points.slice(-30)) // last 30 data points
    } else if (profileData) {
      setEloHistory([profileData.elo])
    }

    // Streak — consecutive days with at least 1 game
    const daySet = new Set<string>()
    for (const g of allGames || []) {
      daySet.add(new Date(g.created_at).toISOString().split('T')[0])
    }
    const today = new Date().toISOString().split('T')[0]
    const playedToday = daySet.has(today)
    let streakCount = 0
    const cursor = new Date()
    if (!playedToday) cursor.setDate(cursor.getDate() - 1)
    while (daySet.has(cursor.toISOString().split('T')[0])) {
      streakCount++
      cursor.setDate(cursor.getDate() - 1)
    }
    setStreak({ count: streakCount, playedToday })

    setLoading(false)
  }

  const c = {
    bg: dark ? '#0A0E14' : '#f9fafb',
    navBg: dark ? 'rgba(10,14,20,0.95)' : 'white',
    navBorder: dark ? 'rgba(29,158,117,0.2)' : '#e5e7eb',
    text: dark ? '#fff' : '#111',
    textSub: dark ? 'rgba(255,255,255,0.6)' : '#666',
    textMuted: dark ? 'rgba(255,255,255,0.35)' : '#888',
    card: dark ? 'rgba(255,255,255,0.04)' : 'white',
    cardBorder: dark ? 'rgba(255,255,255,0.08)' : '#e5e7eb',
    rowBorder: dark ? 'rgba(255,255,255,0.06)' : '#f3f4f6',
    streakBg: dark ? 'rgba(239,159,39,0.15)' : '#FAEEDA',
    streakBorder: dark ? 'rgba(239,159,39,0.3)' : '#EF9F27',
    meBg: dark ? 'rgba(29,158,117,0.15)' : '#E1F5EE',
    winBg: dark ? 'rgba(29,158,117,0.15)' : '#E1F5EE',
    lossBg: dark ? 'rgba(163,45,45,0.15)' : '#FCEBEB',
  }

  const winRate = profile ? Math.round((profile.wins / Math.max(profile.wins + profile.losses, 1)) * 100) : 0
  const gradeLabel = profile ? ["Α΄", "Β΄", "Γ΄"][profile.grade - 1] || "Β΄" : "Β΄"

  return (
    <main style={{ minHeight: '100vh', background: c.bg, fontFamily: 'sans-serif', transition: 'background 0.3s ease', color: c.text }}>
      <style>{`
        @media (max-width: 640px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .subject-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .main-grid { grid-template-columns: 1fr !important; }
          .welcome-row { flex-direction: column !important; align-items: flex-start !important; gap: 12px !important; }
          .new-game-btn { width: 100% !important; text-align: center !important; }
          .nav-links { display: none !important; }
          .hamburger { display: flex !important; }
        }
        .hamburger { display: none; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; padding: 6px; }
        .hamburger span { display: block; width: 20px; height: 2px; border-radius: 2px; transition: all 0.2s; }
        .stat-card { transition: transform 0.15s ease, box-shadow 0.15s ease; }
        .stat-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
        .toggle-btn { transition: all 0.2s; cursor: pointer; }
        .toggle-btn:hover { opacity: 0.8; }
      `}</style>

      {/* Navbar */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: c.navBg, borderBottom: `1px solid ${c.navBorder}`, padding: '0 20px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', backdropFilter: 'blur(10px)' }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: c.text }}>Panhel<span style={{ color: '#1D9E75' }}>Quiz</span></div>
        <div className="nav-links" style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {[
            { label: 'Dashboard', href: '/dashboard', active: true },
            { label: 'Παίξε', href: '/lobby' },
            { label: 'Εξάσκηση', href: '/practice' },
            { label: 'Leaderboard', href: '/leaderboard' },
            { label: 'Profile', href: '/profile' },
          ].map(link => (
            <a key={link.href} href={link.href} style={{ padding: '6px 12px', borderRadius: 8, fontSize: 13, fontWeight: 500, color: link.active ? '#0F6E56' : c.textSub, background: link.active ? 'rgba(29,158,117,0.12)' : 'transparent', textDecoration: 'none' }}>{link.label}</a>
          ))}
          <button className="toggle-btn" onClick={toggleDark} style={{ marginLeft: 4, padding: '6px 10px', borderRadius: 20, border: `1px solid ${c.cardBorder}`, background: dark ? 'rgba(255,255,255,0.08)' : '#f3f4f6', color: c.text, fontSize: 15, cursor: 'pointer' }}>
            {dark ? '☀️' : '🌙'}
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <NotificationBell />
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1D9E75', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>
            {profile?.username?.slice(0, 2).toUpperCase() || 'ΜΠ'}
          </div>
          <button className="hamburger" onClick={() => setMenuOpen(v => !v)}>
            <span style={{ background: c.text, transform: menuOpen ? 'rotate(45deg) translateY(7px)' : 'none' }} />
            <span style={{ background: c.text, opacity: menuOpen ? 0 : 1 }} />
            <span style={{ background: c.text, transform: menuOpen ? 'rotate(-45deg) translateY(-7px)' : 'none' }} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <>
          <div style={{ position: 'fixed', top: 52, left: 0, right: 0, zIndex: 99, background: c.navBg, borderBottom: `1px solid ${c.navBorder}`, padding: '8px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Παίξε', href: '/lobby' }, { label: 'Εξάσκηση', href: '/practice' }, { label: 'Leaderboard', href: '/leaderboard' }, { label: 'Profile', href: '/profile' }].map(link => (
              <a key={link.href} href={link.href} style={{ padding: '12px 16px', borderRadius: 8, fontSize: 15, fontWeight: 600, color: c.text, textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>{link.label}</a>
            ))}
            <button onClick={toggleDark} style={{ padding: '12px 16px', borderRadius: 8, fontSize: 15, fontWeight: 600, background: 'none', border: 'none', color: c.text, cursor: 'pointer', textAlign: 'left' }}>
              {dark ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>
          </div>
          <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 98, background: 'rgba(0,0,0,0.2)' }} />
        </>
      )}

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
          <div style={{ fontSize: 16, color: c.textSub }}>Φόρτωση...</div>
        </div>
      ) : (
        <div style={{ padding: '20px 20px', maxWidth: 1100, margin: '0 auto' }}>

          {/* Welcome */}
          <div className="welcome-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12 }}>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 4px', color: c.text }}>
                Καλημέρα, {profile?.username || 'Παίκτη'}! 👋
              </h1>
              <p style={{ fontSize: 13, color: c.textSub, margin: 0 }}>
                {gradeLabel} Λυκείου · ELO: {profile?.elo || 1200} · {profile?.wins || 0} νίκες
              </p>
            </div>
            <a href="/lobby" className="new-game-btn" style={{ background: '#1D9E75', color: 'white', padding: '10px 20px', borderRadius: 12, fontSize: 14, fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 12px rgba(29,158,117,0.3)', whiteSpace: 'nowrap' }}>▶ Νέα παρτίδα</a>
          </div>

          {/* Streak banner */}
          {streak.count > 0 && (
            <div style={{ background: streak.playedToday ? (dark ? 'rgba(239,159,39,0.15)' : '#FAEEDA') : (dark ? 'rgba(255,255,255,0.04)' : '#f9fafb'), border: `1px solid ${streak.playedToday ? (dark ? 'rgba(239,159,39,0.35)' : '#EF9F27') : c.cardBorder}`, borderRadius: 12, padding: '12px 16px', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 24 }}>🔥</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: streak.playedToday ? '#BA7517' : c.text }}>{streak.count} {streak.count === 1 ? 'μέρα' : 'μέρες'} streak!</div>
                  <div style={{ fontSize: 12, color: c.textSub }}>{streak.playedToday ? 'Έπαιξες σήμερα. Συνέχισε αύριο!' : 'Παίξε σήμερα για να διατηρήσεις το streak!'}</div>
                </div>
              </div>
              {!streak.playedToday && (
                <a href="/lobby" style={{ background: '#1D9E75', color: 'white', padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}>Παίξε τώρα</a>
              )}
            </div>
          )}

          {/* Daily challenge card */}
          <div style={{ background: dailyDone ? (dark ? 'rgba(29,158,117,0.1)' : '#E1F5EE') : c.card, border: `1px solid ${dailyDone ? '#5DCAA5' : c.cardBorder}`, borderRadius: 12, padding: '12px 16px', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 22 }}>📅</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: dailyDone ? '#0F6E56' : c.text }}>Ημερήσια Πρόκληση</div>
                <div style={{ fontSize: 12, color: c.textSub }}>
                  {dailyDone
                    ? `✓ Σήμερα: ${dailyDone.correct}/10 σωστές · ${dailyDone.score} πόντοι`
                    : 'Νέα πρόκληση — ίδιες ερωτήσεις για όλους!'}
                </div>
              </div>
            </div>
            <a href="/daily" style={{ flexShrink: 0, background: dailyDone ? 'transparent' : '#1D9E75', color: dailyDone ? '#1D9E75' : 'white', padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: 'none', border: dailyDone ? '1px solid #5DCAA5' : 'none', whiteSpace: 'nowrap' }}>
              {dailyDone ? 'Δες →' : 'Παίξε →'}
            </a>
          </div>

          {/* Stats */}
          <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
            {[
              { label: 'ELO', val: profile?.elo || 1200, sub: (() => { const r = getRank(profile?.elo || 1200); return `${r.icon} ${r.name}` })(), color: '#1D9E75' },
              { label: 'Παρτίδες', val: (profile?.wins || 0) + (profile?.losses || 0), sub: `${profile?.wins || 0} νίκες · ${profile?.losses || 0} ήττες`, color: '#185FA5' },
              { label: 'Νίκες %', val: `${winRate}%`, sub: 'Win rate', color: '#534AB7' },
              { label: streak.count > 0 ? `${streak.count}🔥` : gradeLabel, val: streak.count > 0 ? (streak.playedToday ? '🔥 Active' : '⚠️ Κίνδυνος') : 'Λυκείου', sub: streak.count > 0 ? `${streak.count} ${streak.count === 1 ? 'ημέρα' : 'ημέρες'} streak` : gradeLabel + ' Λυκείου', color: streak.count > 0 ? '#BA7517' : '#BA7517' },
            ].map(s => (
              <div key={s.label} className="stat-card" style={{ background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: 12, padding: '14px 16px' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: c.textMuted, textTransform: 'uppercase', marginBottom: 6 }}>{s.label}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.val}</div>
                <div style={{ fontSize: 11, color: c.textMuted, marginTop: 2 }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* ELO History Chart */}
          {eloHistory.length > 1 && (() => {
            const W = 500, H = 110, PX = 6, PY = 14
            const minE = Math.min(...eloHistory)
            const maxE = Math.max(...eloHistory)
            const pad = (maxE - minE) * 0.12 || 10
            const lo = minE - pad, hi = maxE + pad
            const span = hi - lo
            const n = eloHistory.length
            const toX = (i: number) => PX + (i / Math.max(n - 1, 1)) * (W - PX * 2)
            const toY = (e: number) => H - PY - ((e - lo) / span) * (H - PY * 2)
            const pts = eloHistory.map((e, i) => ({ x: toX(i), y: toY(e) }))
            // Smooth catmull-rom bezier path
            const makePath = () => {
              if (pts.length < 2) return ''
              let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`
              for (let i = 0; i < pts.length - 1; i++) {
                const p0 = pts[Math.max(i - 1, 0)]
                const p1 = pts[i]
                const p2 = pts[i + 1]
                const p3 = pts[Math.min(i + 2, pts.length - 1)]
                const cp1x = p1.x + (p2.x - p0.x) / 5
                const cp1y = p1.y + (p2.y - p0.y) / 5
                const cp2x = p2.x - (p3.x - p1.x) / 5
                const cp2y = p2.y - (p3.y - p1.y) / 5
                d += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`
              }
              return d
            }
            const linePath = makePath()
            const last = pts[pts.length - 1]
            const trend = eloHistory[eloHistory.length - 1] - eloHistory[0]
            const trendUp = trend >= 0
            const fillPath = `${linePath} L ${last.x.toFixed(1)},${H} L ${pts[0].x.toFixed(1)},${H} Z`
            return (
              <div style={{ background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: 16, padding: '18px 20px', marginBottom: 16 }}>
                <style>{`
                  @keyframes eloPulse { 0%,100%{r:6;opacity:.6} 50%{r:10;opacity:.15} }
                  .elo-pulse { animation: eloPulse 2s ease-in-out infinite; transform-origin: center; }
                `}</style>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: c.text }}>Ιστορικό ELO</div>
                    <div style={{ fontSize: 11, color: c.textMuted, marginTop: 2 }}>τελευταίες {n - 1} παρτίδες</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 26, fontWeight: 900, color: '#1D9E75', lineHeight: 1 }}>{eloHistory[eloHistory.length - 1]}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: trendUp ? '#1D9E75' : '#ef4444', marginTop: 3 }}>
                      {trendUp ? '▲ +' : '▼ '}{trend} ELO
                    </div>
                  </div>
                </div>
                {/* SVG chart */}
                <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="120" preserveAspectRatio="none" style={{ display: 'block', overflow: 'visible' }}>
                  <defs>
                    <linearGradient id="eloAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1D9E75" stopOpacity="0.28" />
                      <stop offset="75%" stopColor="#1D9E75" stopOpacity="0.04" />
                      <stop offset="100%" stopColor="#1D9E75" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="eloLineGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#0F6E56" />
                      <stop offset="100%" stopColor="#22C691" />
                    </linearGradient>
                    <filter id="eloGlow" x="-20%" y="-80%" width="140%" height="260%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                    </filter>
                  </defs>
                  {/* Subtle grid lines */}
                  {[0.25, 0.5, 0.75].map((f, i) => (
                    <line key={i} x1={PX} y1={PY + f * (H - PY * 2)} x2={W - PX} y2={PY + f * (H - PY * 2)}
                      stroke={dark ? 'rgba(255,255,255,0.045)' : 'rgba(0,0,0,0.045)'} strokeWidth="1" />
                  ))}
                  {/* Area fill */}
                  <path d={fillPath} fill="url(#eloAreaGrad)" />
                  {/* Glow line (blurred duplicate) */}
                  <path d={linePath} fill="none" stroke="#1D9E75" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" opacity="0.18" />
                  {/* Main gradient line */}
                  <path d={linePath} fill="none" stroke="url(#eloLineGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" filter="url(#eloGlow)" />
                  {/* Pulse ring */}
                  <circle className="elo-pulse" cx={last.x} cy={last.y} r="6" fill="#1D9E75" opacity="0.4" />
                  {/* End dot */}
                  <circle cx={last.x} cy={last.y} r="4.5" fill="#1D9E75" stroke={dark ? '#151C24' : 'white'} strokeWidth="2.5" />
                </svg>
                {/* Min / max labels */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, padding: '0 2px' }}>
                  <span style={{ fontSize: 11, color: c.textMuted }}>min {minE}</span>
                  <span style={{ fontSize: 11, color: c.textMuted }}>max {maxE}</span>
                </div>
              </div>
            )
          })()}

          {/* Per-subject stats */}
          <div style={{ background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: c.text }}>📊 Στατιστικά ανά μάθημα</div>
              <a href="/practice" style={{ fontSize: 12, fontWeight: 700, color: '#1D9E75', textDecoration: 'none' }}>Εξάσκηση →</a>
            </div>
            <div className="subject-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {Object.entries(subjectMeta).map(([id, meta]) => {
                const s = subjectStats[id]
                const total = s ? s.wins + s.losses : 0
                const wr = total > 0 ? Math.round((s.wins / total) * 100) : null
                return (
                  <div key={id} style={{ background: dark ? 'rgba(255,255,255,0.03)' : '#f9fafb', border: `1px solid ${c.cardBorder}`, borderRadius: 10, padding: '10px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <span style={{ fontSize: 14, color: meta.color }}>{meta.icon}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: c.text }}>{meta.name}</span>
                    </div>
                    {total === 0 ? (
                      <div style={{ fontSize: 11, color: c.textMuted }}>Δεν έχεις παίξει</div>
                    ) : (
                      <>
                        <div style={{ fontSize: 10, color: c.textMuted, marginBottom: 4 }}>{s.wins}Ν · {s.losses}Η · {total} παρτίδες</div>
                        <div style={{ height: 4, background: dark ? 'rgba(255,255,255,0.08)' : '#e5e7eb', borderRadius: 99, overflow: 'hidden' }}>
                          <div style={{ width: `${wr}%`, height: '100%', background: wr !== null && wr >= 50 ? '#1D9E75' : '#ef4444', borderRadius: 99 }} />
                        </div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: wr !== null && wr >= 50 ? '#1D9E75' : '#ef4444', marginTop: 4 }}>{wr}%</div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Leaderboard + Recent */}
          <div className="main-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
            <div style={{ background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: c.text, marginBottom: 14 }}>🏆 Leaderboard</div>
              {leaderboard.length === 0 ? (
                <div style={{ fontSize: 13, color: c.textSub, textAlign: 'center', padding: '20px 0' }}>Δεν υπάρχουν δεδομένα ακόμα</div>
              ) : leaderboard.map((p, i) => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: `1px solid ${c.rowBorder}` }}>
                  <div style={{ fontSize: 12, fontWeight: 800, width: 20, color: i === 0 ? '#BA7517' : i === 1 ? '#888' : i === 2 ? '#993C1D' : c.textMuted }}>{i + 1}</div>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#1D9E75', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                    {p.username?.slice(0, 2).toUpperCase() || '??'}
                  </div>
                  <div style={{ flex: 1, fontSize: 13, fontWeight: 500, color: c.text }}>{p.username || 'Άγνωστος'}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: c.textSub }}>{p.elo}</div>
                </div>
              ))}
            </div>

            <div style={{ background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: c.text, marginBottom: 14 }}>📋 Πρόσφατες παρτίδες</div>
              {recentGames.length === 0 ? (
                <div style={{ fontSize: 13, color: c.textSub, textAlign: 'center', padding: '20px 0' }}>
                  Δεν έχεις παίξει ακόμα!<br/>
                  <a href="/lobby" style={{ color: '#1D9E75', fontWeight: 700 }}>Παίξε τώρα →</a>
                </div>
              ) : recentGames.map((g, i) => {
                const isP1 = g.player1_id === profile?.id
                const opp = isP1 ? g.player2?.username : g.player1?.username
                const won = g.winner_id === profile?.id
                const myScore = isP1 ? g.score_p1 : g.score_p2
                const oppScore = isP1 ? g.score_p2 : g.score_p1
                return (
                  <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: `1px solid ${c.rowBorder}` }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: won ? c.winBg : c.lossBg, color: won ? '#0F6E56' : '#A32D2D', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0 }}>
                      {won ? 'Ν' : 'Η'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: c.text }}>vs {opp || 'Άγνωστος'}</div>
                      <div style={{ fontSize: 11, color: c.textSub }}>{subjectMeta[g.subject]?.icon} {subjectMeta[g.subject]?.name || g.subject} · {myScore}-{oppScore}</div>
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: won ? '#1D9E75' : '#A32D2D', flexShrink: 0 }}>
                      {won ? '+' : '-'}{g.elo_change} ELO
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      )}
    </main>
  )
}