'use client';

import { useState, useEffect } from 'react';

const mockStats = {
  username: 'alex_student',
  email: 'alex@example.com',
  elo: 1420,
  rank: 47,
  wins: 38,
  losses: 24,
  winRate: 61,
  streak: 4,
  totalGames: 62,
  joinedDate: 'Σεπτέμβριος 2024',
  class: "Γ' Λυκείου",
  subjectStats: [
    { name: 'Μαθηματικά', elo: 1580, wins: 15, losses: 6, winRate: 71 },
    { name: 'Φυσική', elo: 1390, wins: 10, losses: 8, winRate: 56 },
    { name: 'Χημεία', elo: 1320, wins: 8, losses: 6, winRate: 57 },
    { name: 'Βιολογία', elo: 1420, wins: 5, losses: 4, winRate: 55 },
  ],
  recentGames: [
    { opponent: 'nikos_s', result: 'win', elo: +18, subject: 'Μαθηματικά', time: '2 ώρες πριν' },
    { opponent: 'maria_p', result: 'loss', elo: -12, subject: 'Φυσική', time: '5 ώρες πριν' },
    { opponent: 'kostas_v', result: 'win', elo: +15, subject: 'Μαθηματικά', time: 'Χθες' },
    { opponent: 'sofia_t', result: 'win', elo: +20, subject: 'Χημεία', time: 'Χθες' },
    { opponent: 'petros_g', result: 'loss', elo: -10, subject: 'Βιολογία', time: '2 μέρες πριν' },
  ],
  achievements: [
    { icon: '🔥', title: 'Hot Streak', desc: '5 νίκες στη σειρά', earned: true },
    { icon: '🏆', title: 'Top 50', desc: 'Εθνική κατάταξη', earned: true },
    { icon: '⚡', title: 'Speed Demon', desc: 'Απάντησε σε <3s', earned: true },
    { icon: '🎯', title: 'Perfect Score', desc: '10/10 σερί', earned: false },
    { icon: '💎', title: 'Diamond', desc: 'ELO 2000+', earned: false },
    { icon: '🌟', title: 'Legend', desc: '100 νίκες', earned: false },
  ],
};

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'stats' | 'history' | 'settings'>('stats');
  const [visible, setVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [username, setUsername] = useState(mockStats.username);
  const [selectedClass, setSelectedClass] = useState(mockStats.class);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 50);
  }, []);

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
        .input-field {
          background: rgba(255,255,255,0.06);
          border: 1.5px solid rgba(255,255,255,0.12);
          border-radius: 10px;
          color: #fff;
          padding: 10px 14px;
          font-size: 15px;
          width: 100%;
          outline: none;
          box-sizing: border-box;
        }
        .input-field:focus { border-color: #1D9E75; }
        select.input-field option { background: #0D1A15; }
      `}</style>

      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        backdropFilter: 'blur(10px)',
        background: 'rgba(10,14,20,0.85)',
        borderBottom: '1px solid rgba(29,158,117,0.2)',
        padding: '0 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 60,
      }}>
        <a href="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: '#1D9E75' }}>
            Panhe<span style={{ color: '#fff' }}>Quiz</span>
          </span>
        </a>
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Lobby', href: '/lobby' },
            { label: 'Leaderboard', href: '/leaderboard' },
            { label: 'Profile', href: '/profile', active: true },
          ].map(link => (
            <a key={link.href} href={link.href} style={{
              textDecoration: 'none', padding: '6px 14px', borderRadius: 8,
              fontSize: 14, fontWeight: link.active ? 700 : 500,
              color: link.active ? '#1D9E75' : 'rgba(255,255,255,0.7)',
              background: link.active ? 'rgba(29,158,117,0.12)' : 'transparent',
              border: link.active ? '1px solid rgba(29,158,117,0.3)' : '1px solid transparent',
            }}>{link.label}</a>
          ))}
        </div>
      </nav>

      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0A0E14 0%, #0D1A15 50%, #0A0E14 100%)',
        paddingTop: 80, paddingBottom: 60, color: '#fff',
      }}>
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 20px' }}>

          {/* Hero */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 20, padding: 32, marginBottom: 24,
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.6s ease',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: 'linear-gradient(135deg, #1D9E75, #0D6B4F)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 32, fontWeight: 900, color: '#fff', flexShrink: 0,
                animation: 'pulse-ring 3s infinite',
              }}>
                {mockStats.username[0].toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                  <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900 }}>{mockStats.username}</h1>
                  <span style={{
                    padding: '3px 10px', borderRadius: 20,
                    background: 'rgba(29,158,117,0.2)', border: '1px solid rgba(29,158,117,0.4)',
                    fontSize: 12, fontWeight: 700, color: '#4ECBA1',
                  }}>🔥 {mockStats.streak} σερί</span>
                </div>
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 12 }}>
                  {mockStats.class} · Μέλος από {mockStats.joinedDate}
                </div>
                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                  {[
                    { label: 'ELO', value: mockStats.elo, color: '#4ECBA1' },
                    { label: 'Κατάταξη', value: `#${mockStats.rank}`, color: '#fff' },
                    { label: 'Win Rate', value: `${mockStats.winRate}%`, color: '#fff' },
                    { label: 'Παρτίδες', value: mockStats.totalGames, color: 'rgba(255,255,255,0.7)' },
                  ].map(s => (
                    <div key={s.label}>
                      <div style={{ fontSize: 20, fontWeight: 900, color: s.color }}>{s.value}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              <a href="/lobby" style={{
                textDecoration: 'none', padding: '12px 24px', borderRadius: 12,
                background: 'linear-gradient(135deg, #1D9E75, #15705A)',
                color: '#fff', fontSize: 15, fontWeight: 800,
                boxShadow: '0 4px 20px rgba(29,158,117,0.35)',
              }}>⚡ Παίξε τώρα</a>
            </div>
          </div>

          {/* Tabs */}
          <div style={{
            display: 'flex', gap: 4, marginBottom: 24,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 12, padding: 4,
            opacity: visible ? 1 : 0, transition: 'opacity 0.6s ease 0.2s',
          }}>
            {(['stats', 'history', 'settings'] as const).map(tab => (
              <button key={tab} className="tab-btn" onClick={() => setActiveTab(tab)} style={{
                flex: 1, padding: '10px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontSize: 14, fontWeight: 700,
                background: activeTab === tab ? 'rgba(29,158,117,0.2)' : 'transparent',
                color: activeTab === tab ? '#4ECBA1' : 'rgba(255,255,255,0.45)',
              }}>
                {tab === 'stats' ? '📊 Στατιστικά' : tab === 'history' ? '📜 Ιστορικό' : '⚙️ Ρυθμίσεις'}
              </button>
            ))}
          </div>

          {/* Stats */}
          {activeTab === 'stats' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
                {[
                  { label: 'Νίκες', value: mockStats.wins, icon: '🏆', color: '#4ECBA1' },
                  { label: 'Ήττες', value: mockStats.losses, icon: '💔', color: '#FF6B6B' },
                  { label: 'Win Rate', value: `${mockStats.winRate}%`, icon: '📈', color: '#4ECBA1' },
                  { label: 'Streak', value: `${mockStats.streak}🔥`, icon: '', color: '#FFD700' },
                ].map(s => (
                  <div key={s.label} className="stat-card" style={{
                    padding: '20px 16px', background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
                    <div style={{ fontSize: 26, fontWeight: 900, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24, marginBottom: 24 }}>
                <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 800 }}>📚 Επίδοση ανά Μάθημα</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {mockStats.subjectStats.map((s, i) => (
                    <div key={s.name} style={{ animation: `slideIn 0.4s ease ${i * 0.1}s both` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 14, fontWeight: 700 }}>{s.name}</span>
                        <div style={{ display: 'flex', gap: 16 }}>
                          <span style={{ fontSize: 13, color: '#4ECBA1', fontWeight: 700 }}>{s.elo} ELO</span>
                          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{s.winRate}% WR</span>
                        </div>
                      </div>
                      <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${s.winRate}%`, background: '#1D9E75', borderRadius: 3 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24 }}>
                <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 800 }}>🎖️ Επιτεύγματα</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  {mockStats.achievements.map((a, i) => (
                    <div key={a.title} className="achievement" style={{
                      padding: '16px 12px', borderRadius: 12, textAlign: 'center',
                      background: a.earned ? 'rgba(29,158,117,0.1)' : 'rgba(255,255,255,0.02)',
                      border: a.earned ? '1px solid rgba(29,158,117,0.3)' : '1px solid rgba(255,255,255,0.06)',
                      opacity: a.earned ? 1 : 0.4,
                      animation: `fadeInUp 0.4s ease ${i * 0.08}s both`,
                    }}>
                      <div style={{ fontSize: 28, marginBottom: 6 }}>{a.icon}</div>
                      <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 4 }}>{a.title}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{a.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* History */}
          {activeTab === 'history' && (
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden' }}>
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 100px 120px 80px',
                padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)',
                fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1,
                color: 'rgba(255,255,255,0.35)',
              }}>
                <span>Αντίπαλος</span>
                <span style={{ textAlign: 'center' }}>Αποτέλεσμα</span>
                <span style={{ textAlign: 'center' }}>Μάθημα</span>
                <span style={{ textAlign: 'right' }}>ELO</span>
              </div>
              {mockStats.recentGames.map((game, i) => (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: '1fr 100px 120px 80px',
                  padding: '16px 20px',
                  borderBottom: i < mockStats.recentGames.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  alignItems: 'center',
                  animation: `slideIn 0.4s ease ${i * 0.1}s both`,
                }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{game.opponent}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{game.time}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <span style={{
                      padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 800,
                      background: game.result === 'win' ? 'rgba(29,158,117,0.2)' : 'rgba(255,107,107,0.15)',
                      color: game.result === 'win' ? '#4ECBA1' : '#FF6B6B',
                    }}>
                      {game.result === 'win' ? 'Νίκη' : 'Ήττα'}
                    </span>
                  </div>
                  <div style={{ textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{game.subject}</div>
                  <div style={{ textAlign: 'right', fontSize: 15, fontWeight: 800, color: game.elo > 0 ? '#4ECBA1' : '#FF6B6B' }}>
                    {game.elo > 0 ? '+' : ''}{game.elo}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Settings */}
          {activeTab === 'settings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>👤 Λογαριασμός</h3>
                  {!editMode ? (
                    <button onClick={() => setEditMode(true)} style={{
                      padding: '8px 16px', borderRadius: 8,
                      background: 'rgba(29,158,117,0.15)', border: '1px solid rgba(29,158,117,0.3)',
                      color: '#4ECBA1', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                    }}>Επεξεργασία</button>
                  ) : (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => setEditMode(false)} style={{
                        padding: '8px 16px', borderRadius: 8,
                        background: 'transparent', border: '1px solid rgba(255,255,255,0.15)',
                        color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                      }}>Ακύρωση</button>
                      <button onClick={() => { setSaved(true); setEditMode(false); setTimeout(() => setSaved(false), 2000); }} style={{
                        padding: '8px 16px', borderRadius: 8,
                        background: 'linear-gradient(135deg, #1D9E75, #15705A)',
                        border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                      }}>Αποθήκευση</button>
                    </div>
                  )}
                </div>
                {saved && (
                  <div style={{
                    padding: '12px 16px', borderRadius: 10, marginBottom: 16,
                    background: 'rgba(29,158,117,0.15)', border: '1px solid rgba(29,158,117,0.3)',
                    color: '#4ECBA1', fontSize: 14, fontWeight: 700,
                  }}>✅ Αποθηκεύτηκε!</div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Username</label>
                    <input className="input-field" value={username} onChange={e => setUsername(e.target.value)} disabled={!editMode} style={{ opacity: editMode ? 1 : 0.6 }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Email</label>
                    <input className="input-field" value={mockStats.email} disabled style={{ opacity: 0.5 }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Τάξη</label>
                    <select className="input-field" value={selectedClass} onChange={e => setSelectedClass(e.target.value)} disabled={!editMode} style={{ opacity: editMode ? 1 : 0.6 }}>
                      {["Α' Λυκείου", "Β' Λυκείου", "Γ' Λυκείου"].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div style={{ background: 'rgba(255,107,107,0.04)', border: '1px solid rgba(255,107,107,0.15)', borderRadius: 16, padding: 24 }}>
                <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 800, color: 'rgba(255,107,107,0.8)' }}>⚠️ Επικίνδυνη Ζώνη</h3>
                <button onClick={() => { window.location.href = '/login'; }} style={{
                  padding: '10px 20px', borderRadius: 10,
                  background: 'transparent', border: '1px solid rgba(255,107,107,0.35)',
                  color: '#FF6B6B', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                }}>🚪 Αποσύνδεση</button>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}