'use client';

import { useState, useEffect } from 'react';import { useTheme } from '../context/ThemeContext'

const SUBJECTS = ['Όλα', 'Μαθηματικά', 'Φυσική', 'Χημεία', 'Βιολογία', 'Ιστορία', 'Έκθεση', 'Λογοτεχνία'];
const CLASSES = ['Όλες', "Α' Λυκείου", "Β' Λυκείου", "Γ' Λυκείου"];

const mockData = [
  { rank: 1, username: 'alexis_k', elo: 2340, wins: 87, losses: 12, winRate: 88, subject: 'Μαθηματικά', avatar: 'Α', badge: '🏆' },
  { rank: 2, username: 'maria_p', elo: 2210, wins: 74, losses: 18, winRate: 80, subject: 'Βιολογία', avatar: 'Μ', badge: '🥈' },
  { rank: 3, username: 'nikos_s', elo: 2180, wins: 69, losses: 21, winRate: 77, subject: 'Φυσική', avatar: 'Ν', badge: '🥉' },
  { rank: 4, username: 'elena_d', elo: 2050, wins: 62, losses: 25, winRate: 71, subject: 'Χημεία', avatar: 'Ε', badge: null },
  { rank: 5, username: 'giannis_m', elo: 1980, wins: 58, losses: 29, winRate: 67, subject: 'Ιστορία', avatar: 'Γ', badge: null },
  { rank: 6, username: 'sofia_t', elo: 1920, wins: 54, losses: 32, winRate: 63, subject: 'Έκθεση', avatar: 'Σ', badge: null },
  { rank: 7, username: 'kostas_v', elo: 1870, wins: 49, losses: 35, winRate: 58, subject: 'Μαθηματικά', avatar: 'Κ', badge: null },
  { rank: 8, username: 'anna_l', elo: 1820, wins: 45, losses: 38, winRate: 54, subject: 'Λογοτεχνία', avatar: 'Α', badge: null },
  { rank: 9, username: 'petros_g', elo: 1790, wins: 43, losses: 40, winRate: 52, subject: 'Φυσική', avatar: 'Π', badge: null },
  { rank: 10, username: 'dimitra_r', elo: 1750, wins: 40, losses: 42, winRate: 49, subject: 'Βιολογία', avatar: 'Δ', badge: null },
];

export default function LeaderboardPage() {
  const [selectedSubject, setSelectedSubject] = useState('Όλα');
  const [selectedClass, setSelectedClass] = useState('Όλες');
  const [visible, setVisible] = useState(false);
  const [rowsVisible, setRowsVisible] = useState<boolean[]>([]);
  const { dark, toggleDark } = useTheme()

  const c = {
    bg: dark ? '#0A0E14' : '#f9fafb',
    bg2: dark ? '#0D1A15' : '#ffffff',
    card: dark ? 'rgba(255,255,255,0.03)' : '#ffffff',
    cardBorder: dark ? 'rgba(255,255,255,0.08)' : '#e5e7eb',
    text: dark ? '#ffffff' : '#111827',
    textSub: dark ? 'rgba(255,255,255,0.5)' : '#6b7280',
    textMuted: dark ? 'rgba(255,255,255,0.35)' : '#9ca3af',
    navBg: dark ? 'rgba(10,14,20,0.85)' : 'rgba(255,255,255,0.85)',
    navBorder: dark ? 'rgba(29,158,117,0.2)' : '#e5e7eb',
    filterActive: dark ? 'rgba(29,158,117,0.2)' : 'rgba(29,158,117,0.1)',
    filterBorder: dark ? 'rgba(255,255,255,0.1)' : '#e5e7eb',
    rowHover: dark ? 'rgba(29,158,117,0.08)' : 'rgba(29,158,117,0.04)',
    rowBorder: dark ? 'rgba(255,255,255,0.04)' : '#f3f4f6',
    yourRankBg: dark ? 'rgba(29,158,117,0.08)' : 'rgba(29,158,117,0.06)',
  };

  useEffect(() => {
    setTimeout(() => setVisible(true), 50);
    mockData.forEach((_, i) => {
      setTimeout(() => {
        setRowsVisible(prev => { const next = [...prev]; next[i] = true; return next; });
      }, 300 + i * 80);
    });
  }, []);

  const top3 = mockData.slice(0, 3);
  const rest = mockData.slice(3);

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
        .toggle-btn:hover { opacity: 0.8; }
        .podium-card { transition: transform 0.25s ease; }
        .podium-card:hover { transform: translateY(-6px) scale(1.02); }
      `}</style>

      {/* Navbar */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        backdropFilter: 'blur(10px)',
        background: c.navBg,
        borderBottom: `1px solid ${c.navBorder}`,
        padding: '0 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 60,
      }}>
        <a href="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: '#1D9E75' }}>
            Panhe<span style={{ color: c.text }}>Quiz</span>
          </span>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Lobby', href: '/lobby' },
            { label: 'Leaderboard', href: '/leaderboard', active: true },
            { label: 'Profile', href: '/profile' },
          ].map(link => (
            <a key={link.href} href={link.href} style={{
              textDecoration: 'none', padding: '6px 14px', borderRadius: 8,
              fontSize: 14, fontWeight: link.active ? 700 : 500,
              color: link.active ? '#1D9E75' : c.textSub,
              background: link.active ? 'rgba(29,158,117,0.12)' : 'transparent',
              border: link.active ? '1px solid rgba(29,158,117,0.3)' : '1px solid transparent',
            }}>{link.label}</a>
          ))}
          {/* Dark/Light Toggle */}
          <button className="toggle-btn" onClick={toggleDark} style={{
            marginLeft: 8, padding: '6px 12px', borderRadius: 20,
            border: `1px solid ${c.cardBorder}`,
            background: dark ? 'rgba(255,255,255,0.08)' : '#f3f4f6',
            color: c.text, fontSize: 16, cursor: 'pointer',
          }}>
            {dark ? '☀️' : '🌙'}
          </button>
        </div>
      </nav>

      <div style={{
        minHeight: '100vh',
        background: dark ? 'linear-gradient(135deg, #0A0E14 0%, #0D1A15 50%, #0A0E14 100%)' : '#f9fafb',
        paddingTop: 80, paddingBottom: 60, color: c.text,
        transition: 'background 0.3s ease, color 0.3s ease',
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 20px' }}>

          {/* Header */}
          <div style={{
            textAlign: 'center', marginBottom: 40,
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.6s ease',
          }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🏆</div>
            <h1 style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 900, margin: '0 0 10px', color: '#1D9E75' }}>
              Εθνική Κατάταξη
            </h1>
            <p style={{ color: c.textSub, fontSize: 16, margin: 0 }}>
              Οι κορυφαίοι μαθητές της Ελλάδας
            </p>
          </div>

          {/* Filters */}
          <div style={{ opacity: visible ? 1 : 0, transition: 'all 0.6s ease 0.15s', marginBottom: 36 }}>
            <div style={{ fontSize: 12, color: c.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Μάθημα</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
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
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
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

          {/* Podium */}
          <div style={{
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            gap: 16, flexWrap: 'wrap', marginBottom: 40,
            opacity: visible ? 1 : 0, transition: 'all 0.6s ease 0.25s',
          }}>
            <PodiumCard player={top3[1]} podiumHeight={110} delay={0.35} dark={dark} c={c} />
            <PodiumCard player={top3[0]} podiumHeight={150} delay={0.2} isFirst dark={dark} c={c} />
            <PodiumCard player={top3[2]} podiumHeight={80} delay={0.5} dark={dark} c={c} />
          </div>

          {/* Table */}
          <div style={{
            background: c.card, border: `1px solid ${c.cardBorder}`,
            borderRadius: 16, overflow: 'hidden',
            boxShadow: dark ? 'none' : '0 1px 4px rgba(0,0,0,0.06)',
          }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '60px 1fr 120px 120px 80px',
              padding: '14px 20px', borderBottom: `1px solid ${c.cardBorder}`,
              fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1,
              color: c.textMuted,
            }}>
              <span>#</span><span>Παίκτης</span>
              <span style={{ textAlign: 'center' }}>ELO</span>
              <span style={{ textAlign: 'center' }}>Win Rate</span>
              <span style={{ textAlign: 'center' }}>Νίκες</span>
            </div>

            {rest.map((player, i) => (
              <div key={player.username} className="row-hover" style={{
                display: 'grid', gridTemplateColumns: '60px 1fr 120px 120px 80px',
                padding: '16px 20px',
                borderBottom: i < rest.length - 1 ? `1px solid ${c.rowBorder}` : 'none',
                alignItems: 'center',
                opacity: rowsVisible[i + 3] ? 1 : 0,
                transform: rowsVisible[i + 3] ? 'translateX(0)' : 'translateX(-16px)',
                transition: 'opacity 0.4s ease, transform 0.4s ease',
                background: 'transparent',
              }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: c.textMuted }}>{player.rank}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #1D9E75, #0D6B4F)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 15, fontWeight: 800, color: '#fff', flexShrink: 0,
                  }}>{player.avatar}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: c.text }}>{player.username}</div>
                    <div style={{ fontSize: 12, color: c.textSub }}>{player.subject}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'center', fontSize: 16, fontWeight: 800, color: '#1D9E75' }}>{player.elo}</div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: player.winRate >= 70 ? '#1D9E75' : player.winRate >= 50 ? c.text : '#ef4444' }}>
                    {player.winRate}%
                  </span>
                </div>
                <div style={{ textAlign: 'center', fontSize: 14, fontWeight: 700, color: c.textSub }}>{player.wins}W</div>
              </div>
            ))}
          </div>

          {/* Your rank */}
          <div style={{
            marginTop: 20, padding: '16px 20px', borderRadius: 12,
            border: '1.5px solid rgba(29,158,117,0.4)', background: c.yourRankBg,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
            opacity: visible ? 1 : 0, transition: 'opacity 0.6s ease 1.2s',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 38, height: 38, borderRadius: '50%',
                background: 'linear-gradient(135deg, #1D9E75, #0D6B4F)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 15, fontWeight: 800, color: '#fff',
                animation: 'pulse-ring 2s infinite',
              }}>Ε</div>
              <div>
                <div style={{ fontSize: 12, color: '#1D9E75', fontWeight: 700 }}>Η θέση σου</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: c.text }}>εσύ · #47</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 24 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#1D9E75' }}>1,420</div>
                <div style={{ fontSize: 11, color: c.textMuted }}>ELO</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: c.text }}>61%</div>
                <div style={{ fontSize: 11, color: c.textMuted }}>Win Rate</div>
              </div>
            </div>
            <a href="/lobby" style={{
              textDecoration: 'none', padding: '10px 20px', borderRadius: 10,
              background: 'linear-gradient(135deg, #1D9E75, #15705A)',
              color: '#fff', fontSize: 14, fontWeight: 700,
              boxShadow: '0 4px 16px rgba(29,158,117,0.3)',
            }}>Παίξε τώρα →</a>
          </div>

        </div>
      </div>
    </>
  );
}

function PodiumCard({ player, podiumHeight, delay, isFirst, dark, c }: {
  player: typeof mockData[0];
  podiumHeight: number;
  delay: number;
  isFirst?: boolean;
  dark: boolean;
  c: Record<string, string>;
}) {
  const colors: Record<number, { bg: string; shadow: string; blockBg: string; blockBorder: string }> = {
    1: { bg: 'linear-gradient(135deg, #FFD700, #FFA500)', shadow: 'rgba(255,215,0,0.5)', blockBg: 'rgba(255,215,0,0.1)', blockBorder: 'rgba(255,215,0,0.3)' },
    2: { bg: 'linear-gradient(135deg, #C0C0C0, #A8A8A8)', shadow: 'rgba(192,192,192,0.3)', blockBg: 'rgba(192,192,192,0.08)', blockBorder: 'rgba(192,192,192,0.2)' },
    3: { bg: 'linear-gradient(135deg, #CD7F32, #A0522D)', shadow: 'rgba(205,127,50,0.3)', blockBg: 'rgba(205,127,50,0.08)', blockBorder: 'rgba(205,127,50,0.2)' },
  };
  const col = colors[player.rank];

  return (
    <div className="podium-card" style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      animation: `fadeInUp 0.6s ease ${delay}s both`,
      width: isFirst ? 160 : 130,
    }}>
      <div style={{
        width: isFirst ? 72 : 56, height: isFirst ? 72 : 56, borderRadius: '50%',
        background: col.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: isFirst ? 28 : 22, fontWeight: 900, color: '#fff', marginBottom: 8,
        boxShadow: `0 0 ${isFirst ? 24 : 16}px ${col.shadow}`,
      }}>{player.badge}</div>
      <div style={{ fontSize: isFirst ? 15 : 13, fontWeight: 800, marginBottom: 2, textAlign: 'center', color: c.text }}>{player.username}</div>
      <div style={{ fontSize: isFirst ? 20 : 16, fontWeight: 900, color: '#1D9E75', marginBottom: 10 }}>{player.elo}</div>
      <div style={{
        width: '100%', height: podiumHeight,
        background: col.blockBg,
        border: `1px solid ${col.blockBorder}`,
        borderRadius: '8px 8px 0 0',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: 28, fontWeight: 900, color: dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)' }}>{player.rank}</span>
      </div>
    </div>
  );
}