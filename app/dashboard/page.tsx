'use client'
import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import { supabase } from '../lib/supabase'

export default function Dashboard() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { dark, toggleDark } = useTheme()
  const [profile, setProfile] = useState<any>(null)
  const [recentGames, setRecentGames] = useState<any[]>([])
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
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
            { label: 'Leaderboard', href: '/leaderboard' },
            { label: 'Profile', href: '/profile' },
          ].map(link => (
            <a key={link.href} href={link.href} style={{ padding: '6px 12px', borderRadius: 8, fontSize: 13, fontWeight: 500, color: link.active ? '#0F6E56' : c.textSub, background: link.active ? 'rgba(29,158,117,0.12)' : 'transparent', textDecoration: 'none' }}>{link.label}</a>
          ))}
          <button className="toggle-btn" onClick={toggleDark} style={{ marginLeft: 4, padding: '6px 10px', borderRadius: 20, border: `1px solid ${c.cardBorder}`, background: dark ? 'rgba(255,255,255,0.08)' : '#f3f4f6', color: c.text, fontSize: 15, cursor: 'pointer' }}>
            {dark ? '☀️' : '🌙'}
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
            {[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Παίξε', href: '/lobby' }, { label: 'Leaderboard', href: '/leaderboard' }, { label: 'Profile', href: '/profile' }].map(link => (
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

          {/* Stats */}
          <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
            {[
              { label: 'ELO', val: profile?.elo || 1200, sub: 'Βαθμολογία σου', color: '#1D9E75' },
              { label: 'Παρτίδες', val: (profile?.wins || 0) + (profile?.losses || 0), sub: `${profile?.wins || 0} νίκες · ${profile?.losses || 0} ήττες`, color: '#185FA5' },
              { label: 'Νίκες %', val: `${winRate}%`, sub: 'Win rate', color: '#534AB7' },
              { label: 'Τάξη', val: gradeLabel, sub: 'Λυκείου', color: '#BA7517' },
            ].map(s => (
              <div key={s.label} className="stat-card" style={{ background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: 12, padding: '14px 16px' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: c.textMuted, textTransform: 'uppercase', marginBottom: 6 }}>{s.label}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.val}</div>
                <div style={{ fontSize: 11, color: c.textMuted, marginTop: 2 }}>{s.sub}</div>
              </div>
            ))}
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
                      <div style={{ fontSize: 11, color: c.textSub }}>{g.subject} · {myScore}-{oppScore}</div>
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