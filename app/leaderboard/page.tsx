'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../lib/supabase';

const SUBJECTS = ['Όλα', 'Μαθηματικά', 'Φυσική', 'Χημεία', 'Βιολογία', 'Ιστορία', 'Έκθεση'];
const CLASSES = ['Όλες', "Α' Λυκείου", "Β' Λυκείου", "Γ' Λυκείου"];

export default function LeaderboardPage() {
  const [selectedSubject, setSelectedSubject] = useState('Όλα');
  const [selectedClass, setSelectedClass] = useState('Όλες');
  const [visible, setVisible] = useState(false);
  const [players, setPlayers] = useState<any[]>([]);
  const [myProfile, setMyProfile] = useState<any>(null);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const { dark, toggleDark } = useTheme();

  const c = {
    bg: dark ? '#0A0E14' : '#f9fafb',
    card: dark ? 'rgba(255,255,255,0.03)' : '#ffffff',
    cardBorder: dark ? 'rgba(255,255,255,0.08)' : '#e5e7eb',
    text: dark ? '#ffffff' : '#111827',
    textSub: dark ? 'rgba(255,255,255,0.5)' : '#6b7280',
    textMuted: dark ? 'rgba(255,255,255,0.35)' : '#9ca3af',
    navBg: dark ? 'rgba(10,14,20,0.85)' : 'rgba(255,255,255,0.85)',
    navBorder: dark ? 'rgba(29,158,117,0.2)' : '#e5e7eb',
    filterActive: dark ? 'rgba(29,158,117,0.2)' : 'rgba(29,158,117,0.1)',
    filterBorder: dark ? 'rgba(255,255,255,0.1)' : '#e5e7eb',
    rowBorder: dark ? 'rgba(255,255,255,0.04)' : '#f3f4f6',
    yourRankBg: dark ? 'rgba(29,158,117,0.08)' : 'rgba(29,158,117,0.06)',
  };

  useEffect(() => {
    setTimeout(() => setVisible(true), 50);
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    const { data: allPlayers } = await supabase
      .from('profiles')
      .select('id, username, elo, wins, losses, grade')
      .order('elo', { ascending: false })
      .limit(20);

    if (allPlayers) {
      setPlayers(allPlayers);
      if (user) {
        const rank = allPlayers.findIndex(p => p.id === user.id) + 1;
        setMyRank(rank > 0 ? rank : null);
        const me = allPlayers.find(p => p.id === user.id);
        setMyProfile(me);
        if (!me) {
          const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
          setMyProfile(profile);
        }
      }
    }
    setLoading(false);
  }

  const top3 = players.slice(0, 3);
  const rest = players.slice(3);

  const winRate = (p: any) => Math.round((p.wins / Math.max(p.wins + p.losses, 1)) * 100);

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(29,158,117,0.4); }
          70% { box-shadow: 0 0 0 12px rgba(29,158,117,0); }
          100% { box-shadow: 0 0 0 0 rgba(29,158,117,0); }
        }
        .row-hover { transition: background 0.18s ease, transform 0.18s ease; cursor: pointer; }
        .row-hover:hover { transform: translateX(4px); }
        .filter-btn { transition: all 0.18s ease; cursor: pointer; white-space: nowrap; }
        .toggle-btn { transition: all 0.2s ease; cursor: pointer; }
        .podium-card { transition: transform 0.25s ease; }
        .podium-card:hover { transform: translateY(-6px) scale(1.02); }
        .leaderboard-nav-links::-webkit-scrollbar,
        .filter-scroll::-webkit-scrollbar {
          display: none;
        }
        .leaderboard-nav-links,
        .filter-scroll {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @media (max-width: 640px) {
          .leaderboard-nav {
            padding: 0 12px !important;
            gap: 10px;
          }
          .leaderboard-logo {
            font-size: 18px !important;
            flex: 0 0 auto;
          }
          .leaderboard-nav-links {
            flex: 1 1 auto;
            overflow-x: auto;
            justify-content: flex-start !important;
            gap: 6px !important;
            min-width: 0;
          }
          .leaderboard-nav-link {
            padding: 6px 10px !important;
            font-size: 13px !important;
            flex: 0 0 auto;
          }
          .leaderboard-theme-toggle {
            margin-left: 2px !important;
            padding: 6px 9px !important;
            flex: 0 0 auto;
          }
          .leaderboard-page {
            padding-top: 78px !important;
          }
          .leaderboard-container {
            padding: 0 16px !important;
          }
          .leaderboard-header {
            margin-bottom: 30px !important;
          }
          .filter-scroll {
            flex-wrap: nowrap !important;
            overflow-x: auto;
            padding-bottom: 4px;
            margin-left: -16px;
            margin-right: -16px;
            padding-left: 16px;
            padding-right: 16px;
          }
          .leaderboard-podium {
            flex-wrap: nowrap !important;
            overflow-x: auto;
            justify-content: flex-start !important;
            padding: 4px 16px 0;
            margin-left: -16px;
            margin-right: -16px;
          }
          .leaderboard-table-card {
            overflow-x: auto !important;
          }
          .leaderboard-table-header,
          .leaderboard-table-row {
            min-width: 620px;
          }
        }
      `}</style>

      <nav className="leaderboard-nav" style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        backdropFilter: 'blur(10px)', background: c.navBg,
        borderBottom: `1px solid ${c.navBorder}`,
        padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60,
      }}>
        <a href="/" style={{ textDecoration: 'none' }}>
          <span className="leaderboard-logo" style={{ fontSize: 20, fontWeight: 800, color: '#1D9E75' }}>
            Panhe<span style={{ color: c.text }}>Quiz</span>
          </span>
        </a>
        <div className="leaderboard-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Lobby', href: '/lobby' },
            { label: 'Leaderboard', href: '/leaderboard', active: true },
            { label: 'Profile', href: '/profile' },
          ].map(link => (
            <a key={link.href} href={link.href} className="leaderboard-nav-link" style={{
              textDecoration: 'none', padding: '6px 14px', borderRadius: 8,
              fontSize: 14, fontWeight: link.active ? 700 : 500,
              color: link.active ? '#1D9E75' : c.textSub,
              background: link.active ? 'rgba(29,158,117,0.12)' : 'transparent',
              border: link.active ? '1px solid rgba(29,158,117,0.3)' : '1px solid transparent',
            }}>{link.label}</a>
          ))}
          <button className="toggle-btn leaderboard-theme-toggle" onClick={toggleDark} style={{
            marginLeft: 8, padding: '6px 12px', borderRadius: 20,
            border: `1px solid ${c.cardBorder}`,
            background: dark ? 'rgba(255,255,255,0.08)' : '#f3f4f6',
            color: c.text, fontSize: 16, cursor: 'pointer',
          }}>{dark ? '☀️' : '🌙'}</button>
        </div>
      </nav>

      <div className="leaderboard-page" style={{
        minHeight: '100vh',
        background: dark ? 'linear-gradient(135deg, #0A0E14 0%, #0D1A15 50%, #0A0E14 100%)' : '#f9fafb',
        paddingTop: 80, paddingBottom: 60, color: c.text,
        transition: 'background 0.3s ease',
      }}>
        <div className="leaderboard-container" style={{ maxWidth: 900, margin: '0 auto', padding: '0 20px' }}>

          {/* Header */}
          <div className="leaderboard-header" style={{ textAlign: 'center', marginBottom: 40, opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s ease' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🏆</div>
            <h1 style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 900, margin: '0 0 10px', color: '#1D9E75' }}>Εθνική Κατάταξη</h1>
            <p style={{ color: c.textSub, fontSize: 16, margin: 0 }}>Οι κορυφαίοι μαθητές της Ελλάδας</p>
          </div>

          {/* Filters */}
          <div style={{ opacity: visible ? 1 : 0, transition: 'all 0.6s ease 0.15s', marginBottom: 36 }}>
            <div style={{ fontSize: 12, color: c.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Μάθημα</div>
            <div className="filter-scroll" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
              {SUBJECTS.map(s => (
                <button key={s} className="filter-btn" onClick={() => setSelectedSubject(s)} style={{
                  padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                  border: selectedSubject === s ? '1.5px solid #1D9E75' : `1.5px solid ${c.filterBorder}`,
                  background: selectedSubject === s ? c.filterActive : dark ? 'rgba(255,255,255,0.04)' : '#fff',
                  color: selectedSubject === s ? '#1D9E75' : c.textSub,
                }}>{s}</button>
              ))}
            </div>
            <div style={{ fontSize: 12, color: c.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Τάξη</div>
            <div className="filter-scroll" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {CLASSES.map(cl => (
                <button key={cl} className="filter-btn" onClick={() => setSelectedClass(cl)} style={{
                  padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                  border: selectedClass === cl ? '1.5px solid #1D9E75' : `1.5px solid ${c.filterBorder}`,
                  background: selectedClass === cl ? c.filterActive : dark ? 'rgba(255,255,255,0.04)' : '#fff',
                  color: selectedClass === cl ? '#1D9E75' : c.textSub,
                }}>{cl}</button>
              ))}
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: c.textSub }}>Φόρτωση...</div>
          ) : (
            <>
              {/* Podium */}
              {top3.length === 3 && (
                <div className="leaderboard-podium" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 40, opacity: visible ? 1 : 0, transition: 'all 0.6s ease 0.25s' }}>
                  <PodiumCard player={top3[1]} rank={2} podiumHeight={110} delay={0.35} dark={dark} c={c} />
                  <PodiumCard player={top3[0]} rank={1} podiumHeight={150} delay={0.2} isFirst dark={dark} c={c} />
                  <PodiumCard player={top3[2]} rank={3} podiumHeight={80} delay={0.5} dark={dark} c={c} />
                </div>
              )}

              {/* Table */}
              {rest.length > 0 && (
                <div className="leaderboard-table-card" style={{ background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: dark ? 'none' : '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 20 }}>
                  <div className="leaderboard-table-header" style={{ display: 'grid', gridTemplateColumns: '60px 1fr 120px 100px 80px', padding: '14px 20px', borderBottom: `1px solid ${c.cardBorder}`, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: c.textMuted }}>
                    <span>#</span><span>Παίκτης</span>
                    <span style={{ textAlign: 'center' }}>ELO</span>
                    <span style={{ textAlign: 'center' }}>Win Rate</span>
                    <span style={{ textAlign: 'center' }}>Νίκες</span>
                  </div>
                  {rest.map((player, i) => (
                    <div key={player.id} className="row-hover leaderboard-table-row" style={{
                      display: 'grid', gridTemplateColumns: '60px 1fr 120px 100px 80px',
                      padding: '16px 20px',
                      borderBottom: i < rest.length - 1 ? `1px solid ${c.rowBorder}` : 'none',
                      alignItems: 'center', background: 'transparent',
                    }}>
                      <span style={{ fontSize: 18, fontWeight: 800, color: c.textMuted }}>{i + 4}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, #1D9E75, #0D6B4F)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                          {player.username?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: c.text }}>{player.username}</div>
                          <div style={{ fontSize: 12, color: c.textSub }}>{["Α'", "Β'", "Γ'"][player.grade - 1]} Λυκείου</div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'center', fontSize: 16, fontWeight: 800, color: '#1D9E75' }}>{player.elo}</div>
                      <div style={{ textAlign: 'center', fontSize: 13, fontWeight: 700, color: winRate(player) >= 50 ? '#1D9E75' : '#ef4444' }}>{winRate(player)}%</div>
                      <div style={{ textAlign: 'center', fontSize: 14, fontWeight: 700, color: c.textSub }}>{player.wins}W</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Your rank */}
              {myProfile && (
                <div style={{
                  padding: '16px 20px', borderRadius: 12,
                  border: '1.5px solid rgba(29,158,117,0.4)', background: c.yourRankBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
                  opacity: visible ? 1 : 0, transition: 'opacity 0.6s ease 1.2s',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, #1D9E75, #0D6B4F)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, color: '#fff', animation: 'pulse-ring 2s infinite' }}>
                      {myProfile.username?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: '#1D9E75', fontWeight: 700 }}>Η θέση σου</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: c.text }}>{myProfile.username} · #{myRank || '?'}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 24 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 20, fontWeight: 900, color: '#1D9E75' }}>{myProfile.elo}</div>
                      <div style={{ fontSize: 11, color: c.textMuted }}>ELO</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 20, fontWeight: 900, color: c.text }}>{winRate(myProfile)}%</div>
                      <div style={{ fontSize: 11, color: c.textMuted }}>Win Rate</div>
                    </div>
                  </div>
                  <a href="/lobby" style={{ textDecoration: 'none', padding: '10px 20px', borderRadius: 10, background: 'linear-gradient(135deg, #1D9E75, #15705A)', color: '#fff', fontSize: 14, fontWeight: 700, boxShadow: '0 4px 16px rgba(29,158,117,0.3)' }}>Παίξε τώρα →</a>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

function PodiumCard({ player, rank, podiumHeight, delay, isFirst, dark, c }: {
  player: any; rank: number; podiumHeight: number; delay: number; isFirst?: boolean; dark: boolean; c: Record<string, string>;
}) {
  const badges: Record<number, string> = { 1: '🏆', 2: '🥈', 3: '🥉' };
  const colors: Record<number, { bg: string; shadow: string; blockBg: string; blockBorder: string }> = {
    1: { bg: 'linear-gradient(135deg, #FFD700, #FFA500)', shadow: 'rgba(255,215,0,0.5)', blockBg: 'rgba(255,215,0,0.1)', blockBorder: 'rgba(255,215,0,0.3)' },
    2: { bg: 'linear-gradient(135deg, #C0C0C0, #A8A8A8)', shadow: 'rgba(192,192,192,0.3)', blockBg: 'rgba(192,192,192,0.08)', blockBorder: 'rgba(192,192,192,0.2)' },
    3: { bg: 'linear-gradient(135deg, #CD7F32, #A0522D)', shadow: 'rgba(205,127,50,0.3)', blockBg: 'rgba(205,127,50,0.08)', blockBorder: 'rgba(205,127,50,0.2)' },
  };
  const col = colors[rank];
  const winRate = Math.round((player.wins / Math.max(player.wins + player.losses, 1)) * 100);

  return (
    <div className="podium-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', animation: `fadeInUp 0.6s ease ${delay}s both`, width: isFirst ? 160 : 130 }}>
      <div style={{ width: isFirst ? 72 : 56, height: isFirst ? 72 : 56, borderRadius: '50%', background: col.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isFirst ? 28 : 22, fontWeight: 900, color: '#fff', marginBottom: 8, boxShadow: `0 0 ${isFirst ? 24 : 16}px ${col.shadow}` }}>
        {badges[rank]}
      </div>
      <div style={{ fontSize: isFirst ? 15 : 13, fontWeight: 800, marginBottom: 2, textAlign: 'center', color: c.text }}>{player.username}</div>
      <div style={{ fontSize: isFirst ? 20 : 16, fontWeight: 900, color: '#1D9E75', marginBottom: 4 }}>{player.elo}</div>
      <div style={{ fontSize: 11, color: c.textSub, marginBottom: 10 }}>{winRate}% WR</div>
      <div style={{ width: '100%', height: podiumHeight, background: col.blockBg, border: `1px solid ${col.blockBorder}`, borderRadius: '8px 8px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 28, fontWeight: 900, color: dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)' }}>{rank}</span>
      </div>
    </div>
  );
}