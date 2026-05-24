'use client'
import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import { supabase } from '../lib/supabase'
import NotificationBell from '../components/NotificationBell'
import { getRank } from '../lib/ranks'
import { subjectMeta } from '../lib/questions'
import { soundsEnabled, setSoundsEnabled } from '../lib/sounds'

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'stats' | 'history' | 'settings'>('stats')
  const [visible, setVisible] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [saved, setSaved] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [recentGames, setRecentGames] = useState<any[]>([])
  const [username, setUsername] = useState('')
  const [selectedClass, setSelectedClass] = useState(2)
  const [loading, setLoading] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [extras, setExtras] = useState({ subjectsPlayed: 0, streak: 0, perfectDaily: false })
  const [eloHistory, setEloHistory] = useState<number[]>([])
  const [hasMoreGames, setHasMoreGames] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [gamesOffset, setGamesOffset] = useState(0)
  const [soundOn, setSoundOn] = useState(true)
  const [avatar, setAvatar] = useState('')
  const [subjectStats, setSubjectStats] = useState<Record<string, { played: number; wins: number }>>({})
  useEffect(() => { setSoundOn(soundsEnabled()); try { setAvatar(localStorage.getItem('avatar') || '') } catch {} }, [])
  const PAGE_SIZE = 10
  const { dark, toggleDark } = useTheme()

  const c = {
    bg: dark ? 'linear-gradient(135deg, #0A0E14 0%, #0D1A15 50%, #0A0E14 100%)' : '#f9fafb',
    card: dark ? 'rgba(255,255,255,0.03)' : '#ffffff',
    cardBorder: dark ? 'rgba(255,255,255,0.08)' : '#e5e7eb',
    text: dark ? '#ffffff' : '#111827',
    textSub: dark ? 'rgba(255,255,255,0.5)' : '#6b7280',
    textMuted: dark ? 'rgba(255,255,255,0.35)' : '#9ca3af',
    navBg: dark ? 'rgba(10,14,20,0.85)' : 'rgba(255,255,255,0.85)',
    navBorder: dark ? 'rgba(29,158,117,0.2)' : '#e5e7eb',
    rowBorder: dark ? 'rgba(255,255,255,0.04)' : '#f3f4f6',
    inputBg: dark ? 'rgba(255,255,255,0.06)' : '#f9fafb',
    inputBorder: dark ? 'rgba(255,255,255,0.12)' : '#e5e7eb',
    tabBg: dark ? 'rgba(255,255,255,0.03)' : '#ffffff',
    tabBorder: dark ? 'rgba(255,255,255,0.08)' : '#e5e7eb',
    tabActive: dark ? 'rgba(29,158,117,0.2)' : 'rgba(29,158,117,0.1)',
  }

  useEffect(() => {
    setTimeout(() => setVisible(true), 50)
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/login'; return }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileData) {
      setProfile(profileData)
      setUsername(profileData.username || '')
      setSelectedClass(profileData.grade || 2)
    }

    const { data: games } = await supabase
      .from('games')
      .select('*, player1:profiles!games_player1_id_fkey(username), player2:profiles!games_player2_id_fkey(username)')
      .or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
      .limit(PAGE_SIZE + 1)
    const gameSlice = (games || []).slice(0, PAGE_SIZE)
    setRecentGames(gameSlice)
    setHasMoreGames((games || []).length > PAGE_SIZE)
    setGamesOffset(PAGE_SIZE)

    // All games — achievements + ELO history
    const { data: allGames } = await supabase
      .from('games')
      .select('subject, created_at, winner_id, elo_change')
      .or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`)
      .order('created_at', { ascending: true })

    const sStats: Record<string, { played: number; wins: number }> = {}
    for (const g of (allGames || [])) {
      if (!g.subject) continue
      if (!sStats[g.subject]) sStats[g.subject] = { played: 0, wins: 0 }
      sStats[g.subject].played++
      if (g.winner_id === user.id) sStats[g.subject].wins++
    }
    setSubjectStats(sStats)

    const subjectsSet = new Set((allGames || []).map(g => g.subject).filter(Boolean))
    const daySet = new Set((allGames || []).map(g => new Date(g.created_at).toISOString().split('T')[0]))
    const today = new Date().toISOString().split('T')[0]
    let streakCount = 0
    const cursor = new Date()
    if (!daySet.has(today)) cursor.setDate(cursor.getDate() - 1)
    while (daySet.has(cursor.toISOString().split('T')[0])) { streakCount++; cursor.setDate(cursor.getDate() - 1) }

    const todayKey = `daily-${today}`
    let perfectDaily = false
    try {
      const saved = localStorage.getItem(todayKey) || localStorage.getItem(Object.keys(localStorage).find(k => k.startsWith('daily-')) || '')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.correct === 10) perfectDaily = true
      }
    } catch {}

    setExtras({ subjectsPlayed: subjectsSet.size, streak: streakCount, perfectDaily })

    // ELO history
    const finished = (allGames || []).filter(g => g.winner_id !== null)
    if (finished.length > 0 && profileData) {
      let elo = profileData.elo
      const pts: number[] = [elo]
      for (let i = finished.length - 1; i >= 0; i--) {
        const g = finished[i]
        const ch = g.elo_change ?? (g.winner_id === user.id ? 18 : 14)
        elo = g.winner_id === user.id ? elo - ch : elo + ch
        pts.unshift(elo)
      }
      setEloHistory(pts.slice(-30))
    } else if (profileData) {
      setEloHistory([profileData.elo])
    }
    setLoading(false)
  }

  async function loadMoreGames() {
    setLoadingMore(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoadingMore(false); return }
    const { data } = await supabase
      .from('games')
      .select('*, player1:profiles!games_player1_id_fkey(username), player2:profiles!games_player2_id_fkey(username)')
      .or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
      .range(gamesOffset, gamesOffset + PAGE_SIZE)
    const more = data || []
    setRecentGames(prev => [...prev, ...more.slice(0, PAGE_SIZE)])
    setHasMoreGames(more.length > PAGE_SIZE)
    setGamesOffset(o => o + PAGE_SIZE)
    setLoadingMore(false)
  }

  async function handleSave() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('profiles').update({ username, grade: selectedClass }).eq('id', user.id)
    setSaved(true)
    setEditMode(false)
    setTimeout(() => setSaved(false), 2000)
    loadData()
  }

  async function handleDeleteAccount() {
    setDeleting(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setDeleting(false); return }

    // Delete profile data
    await supabase.from('profiles').delete().eq('id', user.id)
    
    // Sign out
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const winRate = profile ? Math.round((profile.wins / Math.max(profile.wins + profile.losses, 1)) * 100) : 0
  const gradeLabel = profile ? ["Α'", "Β'", "Γ'"][profile.grade - 1] || "Β'" : "Β'"

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(29,158,117,0.5); }
          70% { box-shadow: 0 0 0 14px rgba(29,158,117,0); }
          100% { box-shadow: 0 0 0 0 rgba(29,158,117,0); }
        }
        .tab-btn { transition: all 0.2s ease; cursor: pointer; }
        .stat-card { transition: transform 0.2s ease; }
        .stat-card:hover { transform: translateY(-3px); }
        .achievement { transition: all 0.2s ease; }
        .achievement:hover { transform: scale(1.04); }
        .input-field { border-radius: 10px; color: inherit; padding: 10px 14px; font-size: 15px; width: 100%; outline: none; box-sizing: border-box; }
        .input-field:focus { border-color: #1D9E75; }
        .toggle-btn { transition: all 0.2s ease; cursor: pointer; }
        .profile-nav-links { display: flex !important; }
        .profile-hamburger { display: none !important; }
        @media (max-width: 640px) {
          .profile-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .profile-nav-links { display: none !important; }
          .profile-hamburger { display: flex !important; }
        }
      `}</style>

      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, backdropFilter: 'blur(10px)', background: c.navBg, borderBottom: `1px solid ${c.navBorder}`, padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
        <a href="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: '#1D9E75' }}>Panhel<span style={{ color: c.text }}>Quiz</span></span>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Desktop links */}
          <div className="profile-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Lobby', href: '/lobby' },
              { label: 'Leaderboard', href: '/leaderboard' },
              { label: 'Profile', href: '/profile', active: true },
            ].map(link => (
              <a key={link.href} href={link.href} style={{ textDecoration: 'none', padding: '6px 14px', borderRadius: 8, fontSize: 14, fontWeight: link.active ? 700 : 500, color: link.active ? '#1D9E75' : c.textSub, background: link.active ? 'rgba(29,158,117,0.12)' : 'transparent', border: link.active ? '1px solid rgba(29,158,117,0.3)' : '1px solid transparent' }}>{link.label}</a>
            ))}
          </div>
          {/* Always visible */}
          <NotificationBell />
          <button className="toggle-btn" onClick={toggleDark} style={{ marginLeft: 4, padding: '6px 12px', borderRadius: 20, border: `1px solid ${c.cardBorder}`, background: dark ? 'rgba(255,255,255,0.08)' : '#f3f4f6', color: c.text, fontSize: 16, cursor: 'pointer' }}>{dark ? '☀️' : '🌙'}</button>
          {/* Hamburger — mobile only */}
          <button className="profile-hamburger" onClick={() => setMenuOpen(o => !o)} style={{ display: 'none', flexDirection: 'column', gap: 5, padding: '7px 8px', background: 'none', border: `1px solid ${c.cardBorder}`, borderRadius: 8, cursor: 'pointer' }}>
            <span style={{ display: 'block', width: 20, height: 2, background: c.text, borderRadius: 2, transition: 'all 0.25s', transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
            <span style={{ display: 'block', width: 20, height: 2, background: c.text, borderRadius: 2, transition: 'all 0.25s', opacity: menuOpen ? 0 : 1 }} />
            <span style={{ display: 'block', width: 20, height: 2, background: c.text, borderRadius: 2, transition: 'all 0.25s', transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div style={{ position: 'fixed', top: 60, left: 0, right: 0, zIndex: 99, background: c.navBg, backdropFilter: 'blur(10px)', borderBottom: `1px solid ${c.navBorder}`, padding: '12px 16px 16px', display: 'flex', flexDirection: 'column', gap: 4, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
          {[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Lobby', href: '/lobby' },
            { label: 'Leaderboard', href: '/leaderboard' },
            { label: 'Profile', href: '/profile', active: true },
          ].map(link => (
            <a key={link.href} href={link.href} style={{ padding: '12px 16px', borderRadius: 10, fontSize: 15, fontWeight: link.active ? 700 : 500, color: link.active ? '#1D9E75' : c.text, background: link.active ? 'rgba(29,158,117,0.1)' : 'transparent', textDecoration: 'none' }}>{link.label}</a>
          ))}
        </div>
      )}

      <div style={{ minHeight: '100vh', background: c.bg, paddingTop: 80, paddingBottom: 60, color: c.text, transition: 'background 0.3s ease' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 20px' }}>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: c.textSub }}>Φόρτωση...</div>
          ) : (
            <>
              {/* Hero */}
              <div style={{ background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: 20, padding: 32, marginBottom: 24, opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s ease', boxShadow: dark ? 'none' : '0 1px 4px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
                  <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #1D9E75, #0D6B4F)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: avatar ? 40 : 32, fontWeight: 900, color: '#fff', flexShrink: 0, animation: 'pulse-ring 3s infinite' }}>
                    {avatar || profile?.username?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div style={{ flex: 1 }}>
                    {(() => {
                      const rank = getRank(profile?.elo || 1200)
                      return (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: c.text }}>{profile?.username || 'Χρήστης'}</h1>
                          <span style={{ padding: '3px 10px', borderRadius: 20, background: rank.bg, border: `1px solid ${rank.border}`, fontSize: 12, fontWeight: 700, color: rank.color }}>{rank.icon} {rank.name}</span>
                          <span style={{ padding: '3px 10px', borderRadius: 20, background: 'rgba(29,158,117,0.1)', border: '1px solid rgba(29,158,117,0.3)', fontSize: 12, fontWeight: 700, color: '#1D9E75' }}>{gradeLabel} Λυκείου</span>
                        </div>
                      )
                    })()}
                    <div style={{ fontSize: 14, color: c.textSub, marginBottom: 12 }}>
                      Μέλος από {new Date(profile?.created_at).toLocaleDateString('el-GR', { month: 'long', year: 'numeric' })}
                    </div>
                    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                      {[
                        { label: 'ELO', value: profile?.elo || 1200, color: '#1D9E75' },
                        { label: 'Νίκες', value: profile?.wins || 0, color: c.text },
                        { label: 'Win Rate', value: `${winRate}%`, color: c.text },
                        { label: 'Παρτίδες', value: (profile?.wins || 0) + (profile?.losses || 0), color: c.textSub },
                      ].map(s => (
                        <div key={s.label}>
                          <div style={{ fontSize: 20, fontWeight: 900, color: s.color }}>{s.value}</div>
                          <div style={{ fontSize: 11, color: c.textMuted, textTransform: 'uppercase', letterSpacing: 1 }}>{s.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <a href="/lobby" style={{ textDecoration: 'none', padding: '12px 24px', borderRadius: 12, background: 'linear-gradient(135deg, #1D9E75, #15705A)', color: '#fff', fontSize: 15, fontWeight: 800, boxShadow: '0 4px 20px rgba(29,158,117,0.3)' }}>⚡ Παίξε τώρα</a>
                </div>
              </div>

              {/* Tabs */}
              <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: c.tabBg, border: `1px solid ${c.tabBorder}`, borderRadius: 12, padding: 4, boxShadow: dark ? 'none' : '0 1px 4px rgba(0,0,0,0.06)' }}>
                {(['stats', 'history', 'settings'] as const).map(tab => (
                  <button key={tab} className="tab-btn" onClick={() => setActiveTab(tab)} style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700, background: activeTab === tab ? c.tabActive : 'transparent', color: activeTab === tab ? '#1D9E75' : c.textSub }}>
                    {tab === 'stats' ? '📊 Στατιστικά' : tab === 'history' ? '📜 Ιστορικό' : '⚙️ Ρυθμίσεις'}
                  </button>
                ))}
              </div>

              {/* Stats */}
              {activeTab === 'stats' && (() => {
                const ACHIEVEMENTS = [
                  { icon: '🏆', name: 'Πρώτη Νίκη',       desc: 'Κέρδισε 1 παρτίδα',           unlocked: (profile?.wins || 0) >= 1 },
                  { icon: '⚡', name: 'Πρώτη Δεκάδα',      desc: '10 παρτίδες',                   unlocked: (profile?.wins || 0) + (profile?.losses || 0) >= 10 },
                  { icon: '🎖️', name: 'Αδάμαστος',          desc: '50 παρτίδες',                   unlocked: (profile?.wins || 0) + (profile?.losses || 0) >= 50 },
                  { icon: '💪', name: 'Win Machine',         desc: 'Win rate ≥ 65% (min 10 παρτ.)', unlocked: (() => { const t = (profile?.wins||0)+(profile?.losses||0); return t >= 10 && Math.round((profile?.wins||0)/t*100) >= 65 })() },
                  { icon: '🥇', name: 'Gold Rank',           desc: 'Φτάσε τα 1300 ELO',            unlocked: (profile?.elo || 1200) >= 1300 },
                  { icon: '🔷', name: 'Platinum',            desc: 'Φτάσε τα 1500 ELO',            unlocked: (profile?.elo || 1200) >= 1500 },
                  { icon: '💎', name: 'Diamond',             desc: 'Φτάσε τα 1700 ELO',            unlocked: (profile?.elo || 1200) >= 1700 },
                  { icon: '📚', name: 'Πολυμαθής',           desc: 'Παίξε και στα 6 μαθήματα',     unlocked: extras.subjectsPlayed >= 6 },
                  { icon: '🔥', name: 'Unstoppable',          desc: '7 μέρες streak',               unlocked: extras.streak >= 7 },
                  { icon: '🎯', name: 'Τέλεια Ημερήσια',     desc: '10/10 στην ημερήσια πρόκληση', unlocked: extras.perfectDaily },
                ]
                const unlockedCount = ACHIEVEMENTS.filter(a => a.unlocked).length
                return (
                  <div>
                    <div className="profile-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
                      {[
                        { label: 'Νίκες', value: profile?.wins || 0, icon: '🏆', color: '#1D9E75' },
                        { label: 'Ήττες', value: profile?.losses || 0, icon: '💔', color: '#ef4444' },
                        { label: 'Win Rate', value: `${winRate}%`, icon: '📈', color: '#1D9E75' },
                        { label: 'ELO', value: profile?.elo || 1200, icon: '⭐', color: '#f59e0b' },
                      ].map(s => (
                        <div key={s.label} className="stat-card" style={{ padding: '20px 16px', background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: 14, textAlign: 'center', boxShadow: dark ? 'none' : '0 1px 4px rgba(0,0,0,0.06)' }}>
                          <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
                          <div style={{ fontSize: 26, fontWeight: 900, color: s.color }}>{s.value}</div>
                          <div style={{ fontSize: 12, color: c.textMuted, marginTop: 4 }}>{s.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* ELO Chart */}
                    {eloHistory.length > 1 && (() => {
                      const W = 500, H = 100, PX = 6, PY = 12
                      const minE = Math.min(...eloHistory), maxE = Math.max(...eloHistory)
                      const pad = (maxE - minE) * 0.12 || 10
                      const lo = minE - pad, hi = maxE + pad, span = hi - lo, n = eloHistory.length
                      const toX = (i: number) => PX + (i / Math.max(n - 1, 1)) * (W - PX * 2)
                      const toY = (e: number) => H - PY - ((e - lo) / span) * (H - PY * 2)
                      const pts = eloHistory.map((e, i) => ({ x: toX(i), y: toY(e) }))
                      let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`
                      for (let i = 0; i < pts.length - 1; i++) {
                        const p0 = pts[Math.max(i-1,0)], p1 = pts[i], p2 = pts[i+1], p3 = pts[Math.min(i+2,pts.length-1)]
                        d += ` C ${(p1.x+(p2.x-p0.x)/5).toFixed(1)},${(p1.y+(p2.y-p0.y)/5).toFixed(1)} ${(p2.x-(p3.x-p1.x)/5).toFixed(1)},${(p2.y-(p3.y-p1.y)/5).toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`
                      }
                      const last = pts[pts.length - 1]
                      const trend = eloHistory[eloHistory.length - 1] - eloHistory[0]
                      return (
                        <div style={{ background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: 16, padding: '16px 18px', marginBottom: 14 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: c.text }}>📈 Ιστορικό ELO</div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: 20, fontWeight: 900, color: '#1D9E75' }}>{eloHistory[eloHistory.length - 1]}</div>
                              <div style={{ fontSize: 11, fontWeight: 700, color: trend >= 0 ? '#1D9E75' : '#ef4444' }}>{trend >= 0 ? '▲ +' : '▼ '}{trend}</div>
                            </div>
                          </div>
                          <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="90" preserveAspectRatio="none" style={{ display: 'block' }}>
                            <defs>
                              <linearGradient id="pEloGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#1D9E75" stopOpacity="0.25"/>
                                <stop offset="100%" stopColor="#1D9E75" stopOpacity="0"/>
                              </linearGradient>
                            </defs>
                            <path d={`${d} L ${last.x.toFixed(1)},${H} L ${pts[0].x.toFixed(1)},${H} Z`} fill="url(#pEloGrad)"/>
                            <path d={d} fill="none" stroke="#1D9E75" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx={last.x} cy={last.y} r="4" fill="#1D9E75" stroke={dark ? '#0A0E14' : 'white'} strokeWidth="2"/>
                          </svg>
                        </div>
                      )
                    })()}

                    {/* Subject win rates */}
                    {Object.keys(subjectStats).length > 0 && (
                      <div style={{ background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: 16, padding: '16px 20px', marginBottom: 14 }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: c.text, marginBottom: 14 }}>📚 Win Rate ανά μάθημα</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {Object.entries(subjectStats).sort((a, b) => b[1].played - a[1].played).map(([subj, data]) => {
                            const wr = Math.round(data.wins / Math.max(data.played, 1) * 100)
                            const meta = subjectMeta[subj]
                            return (
                              <div key={subj}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                                  <span style={{ fontSize: 13, fontWeight: 600, color: c.text }}>{meta?.icon} {meta?.name || subj}</span>
                                  <span style={{ fontSize: 13, fontWeight: 800, color: wr >= 50 ? '#1D9E75' : '#ef4444' }}>{wr}% <span style={{ fontSize: 11, color: c.textMuted, fontWeight: 500 }}>({data.played} αγ.)</span></span>
                                </div>
                                <div style={{ height: 6, borderRadius: 6, background: dark ? 'rgba(255,255,255,0.08)' : '#e5e7eb', overflow: 'hidden' }}>
                                  <div style={{ height: '100%', borderRadius: 6, width: `${wr}%`, background: wr >= 50 ? 'linear-gradient(90deg, #1D9E75, #22c55e)' : 'linear-gradient(90deg, #ef4444, #f87171)', transition: 'width 0.6s ease' }} />
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Achievements */}
                    <div style={{ background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: 16, padding: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: c.text }}>🎖️ Achievements</div>
                        <div style={{ fontSize: 12, color: c.textSub, background: c.tabBg, border: `1px solid ${c.tabBorder}`, borderRadius: 20, padding: '3px 10px' }}>{unlockedCount}/{ACHIEVEMENTS.length}</div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                        {ACHIEVEMENTS.map(a => (
                          <div key={a.name} className="achievement" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12, background: a.unlocked ? (dark ? 'rgba(29,158,117,0.1)' : '#f0faf6') : (dark ? 'rgba(255,255,255,0.03)' : '#f9fafb'), border: `1px solid ${a.unlocked ? 'rgba(29,158,117,0.3)' : c.cardBorder}`, opacity: a.unlocked ? 1 : 0.55 }}>
                            <div style={{ fontSize: 24, filter: a.unlocked ? 'none' : 'grayscale(1)', flexShrink: 0 }}>{a.icon}</div>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: 13, fontWeight: 700, color: a.unlocked ? (dark ? '#fff' : '#111') : c.textSub, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.name}</div>
                              <div style={{ fontSize: 11, color: c.textMuted }}>{a.desc}</div>
                            </div>
                            {a.unlocked && <div style={{ marginLeft: 'auto', flexShrink: 0, color: '#1D9E75', fontSize: 14 }}>✓</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })()}

              {/* History */}
              {activeTab === 'history' && (
                <div style={{ background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: 16, overflow: 'hidden' }}>
                  {recentGames.length === 0 ? (
                    <div style={{ padding: '40px 20px', textAlign: 'center', color: c.textSub }}>
                      Δεν έχεις παίξει ακόμα! <a href="/lobby" style={{ color: '#1D9E75', fontWeight: 700 }}>Παίξε τώρα →</a>
                    </div>
                  ) : (
                    <>
                      <div style={{ overflowX: 'auto' }}>
                        {recentGames.map((game, i) => {
                          const isP1 = game.player1_id === profile?.id
                          const opp = isP1 ? game.player2?.username : game.player1?.username
                          const won = game.winner_id === profile?.id
                          return (
                            <div key={game.id} style={{ display: 'grid', gridTemplateColumns: '1fr 90px 110px 70px', minWidth: 380, padding: '16px 20px', borderBottom: i < recentGames.length - 1 ? `1px solid ${c.rowBorder}` : 'none', alignItems: 'center' }}>
                              <div>
                                <div style={{ fontSize: 14, fontWeight: 700, color: c.text }}>{opp || 'Άγνωστος'}</div>
                                <div style={{ fontSize: 12, color: c.textSub }}>{new Date(game.created_at).toLocaleDateString('el-GR')}</div>
                              </div>
                              <div style={{ textAlign: 'center' }}>
                                <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 800, background: won ? 'rgba(29,158,117,0.1)' : 'rgba(239,68,68,0.1)', color: won ? '#1D9E75' : '#ef4444' }}>{won ? 'Νίκη' : 'Ήττα'}</span>
                              </div>
                              <div style={{ textAlign: 'center', fontSize: 13, color: c.textSub }}>{subjectMeta[game.subject]?.icon} {subjectMeta[game.subject]?.name || game.subject}</div>
                              <div style={{ textAlign: 'right', fontSize: 15, fontWeight: 800, color: won ? '#1D9E75' : '#ef4444' }}>{won ? '+' : '-'}{game.elo_change}</div>
                            </div>
                          )
                        })}
                      </div>
                      {hasMoreGames && (
                        <div style={{ padding: '14px 20px', textAlign: 'center', borderTop: `1px solid ${c.rowBorder}` }}>
                          <button onClick={loadMoreGames} disabled={loadingMore} style={{ padding: '9px 24px', borderRadius: 10, background: 'transparent', border: `1px solid ${c.cardBorder}`, color: c.textSub, fontSize: 13, fontWeight: 600, cursor: loadingMore ? 'default' : 'pointer', fontFamily: 'inherit' }}>
                            {loadingMore ? 'Φόρτωση...' : 'Φόρτωση περισσότερων'}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Settings */}
              {activeTab === 'settings' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: 16, padding: 24, boxShadow: dark ? 'none' : '0 1px 4px rgba(0,0,0,0.06)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: c.text }}>👤 Λογαριασμός</h3>
                      {!editMode ? (
                        <button onClick={() => setEditMode(true)} style={{ padding: '8px 16px', borderRadius: 8, background: 'rgba(29,158,117,0.1)', border: '1px solid rgba(29,158,117,0.3)', color: '#1D9E75', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Επεξεργασία</button>
                      ) : (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => setEditMode(false)} style={{ padding: '8px 16px', borderRadius: 8, background: 'transparent', border: `1px solid ${c.cardBorder}`, color: c.textSub, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Ακύρωση</button>
                          <button onClick={handleSave} style={{ padding: '8px 16px', borderRadius: 8, background: 'linear-gradient(135deg, #1D9E75, #15705A)', border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Αποθήκευση</button>
                        </div>
                      )}
                    </div>
                    {saved && <div style={{ padding: '12px 16px', borderRadius: 10, marginBottom: 16, background: 'rgba(29,158,117,0.1)', border: '1px solid rgba(29,158,117,0.3)', color: '#1D9E75', fontSize: 14, fontWeight: 700 }}>✅ Αποθηκεύτηκε!</div>}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 12, color: c.textMuted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Username</label>
                        <input className="input-field" value={username} onChange={e => setUsername(e.target.value)} disabled={!editMode} style={{ background: c.inputBg, border: `1.5px solid ${c.inputBorder}`, opacity: editMode ? 1 : 0.7, color: c.text }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 12, color: c.textMuted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Τάξη</label>
                        <div style={{ display: 'flex', gap: 8 }}>
                          {[1, 2, 3].map(g => (
                            <button key={g} onClick={() => editMode && setSelectedClass(g)} style={{ flex: 1, padding: '12px 6px', borderRadius: 10, cursor: editMode ? 'pointer' : 'default', border: `2px solid ${selectedClass === g ? '#1D9E75' : c.inputBorder}`, background: selectedClass === g ? 'rgba(29,158,117,0.1)' : c.inputBg, fontFamily: 'inherit', textAlign: 'center', opacity: editMode ? 1 : 0.7 }}>
                              <div style={{ fontSize: 18, fontWeight: 800, color: selectedClass === g ? '#1D9E75' : c.text }}>{["Α'", "Β'", "Γ'"][g - 1]}</div>
                              <div style={{ fontSize: 11, color: c.textSub }}>Λυκείου</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Avatar picker */}
                  {(() => {
                    const AVATAR_OPTIONS = ['🦁','🐯','🦊','🐺','🦅','🦋','⚡','🔥','❄️','🌊','🌟','💫','🏆','🎯','📚','🎓','🧠','👑','🦄','🎮']
                    return (
                      <div style={{ background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: 16, padding: 24 }}>
                        <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 800, color: c.text }}>😊 Avatar</h3>
                        <p style={{ fontSize: 13, color: c.textSub, margin: '0 0 14px' }}>Διάλεξε ένα emoji ως avatar σου</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                          {AVATAR_OPTIONS.map(e => (
                            <button key={e} onClick={() => { setAvatar(e); try { localStorage.setItem('avatar', e) } catch {} }} style={{ width: 46, height: 46, borderRadius: 10, fontSize: 22, cursor: 'pointer', border: `2px solid ${avatar === e ? '#1D9E75' : c.inputBorder}`, background: avatar === e ? 'rgba(29,158,117,0.12)' : c.inputBg, fontFamily: 'inherit', transition: 'all 0.15s ease' }}>
                              {e}
                            </button>
                          ))}
                        </div>
                        {avatar && (
                          <button onClick={() => { setAvatar(''); try { localStorage.removeItem('avatar') } catch {} }} style={{ padding: '6px 14px', borderRadius: 8, background: 'transparent', border: `1px solid ${c.cardBorder}`, color: c.textSub, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                            ✕ Αφαίρεση avatar
                          </button>
                        )}
                      </div>
                    )
                  })()}

                  {/* Ήχοι */}
                  <div style={{ background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: 16, padding: 24 }}>
                    <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 800, color: c.text }}>🔊 Προτιμήσεις</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: c.text }}>Ήχοι παιχνιδιού</div>
                        <div style={{ fontSize: 12, color: c.textSub, marginTop: 2 }}>Ήχοι σωστής/λάθος απάντησης</div>
                      </div>
                      <button onClick={() => { const n = !soundOn; setSoundOn(n); setSoundsEnabled(n) }} style={{ padding: '8px 18px', borderRadius: 20, border: `1px solid ${soundOn ? 'rgba(29,158,117,0.4)' : c.cardBorder}`, background: soundOn ? 'rgba(29,158,117,0.12)' : 'transparent', color: soundOn ? '#1D9E75' : c.textSub, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                        {soundOn ? '🔊 Ενεργοί' : '🔇 Ανενεργοί'}
                      </button>
                    </div>
                  </div>

                  {/* Αποσύνδεση */}
                  <div style={{ background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: 16, padding: 24 }}>
                    <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 800, color: c.text }}>🚪 Αποσύνδεση</h3>
                    <button onClick={async () => { await supabase.auth.signOut(); window.location.href = '/login' }} style={{ padding: '10px 20px', borderRadius: 10, background: 'transparent', border: `1px solid ${c.cardBorder}`, color: c.textSub, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                      Αποσύνδεση
                    </button>
                  </div>

                  {/* Διαγραφή λογαριασμού */}
                  <div style={{ background: dark ? 'rgba(239,68,68,0.04)' : '#fff5f5', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 16, padding: 24 }}>
                    <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 800, color: '#ef4444' }}>⚠️ Διαγραφή Λογαριασμού</h3>
                    <p style={{ fontSize: 13, color: c.textSub, marginBottom: 16 }}>Η διαγραφή είναι μόνιμη. Όλα τα δεδομένα σου (στατιστικά, ιστορικό) θα διαγραφούν οριστικά.</p>

                    {!deleteConfirm ? (
                      <button onClick={() => setDeleteConfirm(true)} style={{ padding: '10px 20px', borderRadius: 10, background: 'transparent', border: '1px solid rgba(239,68,68,0.35)', color: '#ef4444', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                        🗑️ Διαγραφή λογαριασμού
                      </button>
                    ) : (
                      <div style={{ background: dark ? 'rgba(239,68,68,0.1)' : '#fff', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: 16 }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: '#ef4444', marginBottom: 12 }}>
                          Είσαι σίγουρος; Αυτή η ενέργεια δεν μπορεί να αναιρεθεί!
                        </p>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => setDeleteConfirm(false)} style={{ padding: '10px 20px', borderRadius: 10, background: 'transparent', border: `1px solid ${c.cardBorder}`, color: c.textSub, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                            Ακύρωση
                          </button>
                          <button onClick={handleDeleteAccount} disabled={deleting} style={{ padding: '10px 20px', borderRadius: 10, background: '#ef4444', border: 'none', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: deleting ? 0.6 : 1 }}>
                            {deleting ? 'Διαγραφή...' : 'Ναι, διέγραψε τον λογαριασμό μου'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}