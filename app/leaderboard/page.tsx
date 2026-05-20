'use client';

import { useState, useEffect } from 'react';

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

  useEffect(() => {
    setTimeout(() => setVisible(true), 50);
    mockData.forEach((_, i) => {
      setTimeout(() => {
        setRowsVisible(prev => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
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
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(29,158,117,0.4); }
          70% { box-shadow: 0 0 0 12px rgba(29,158,117,0); }
          100% { box-shadow: 0 0 0 0 rgba(29,158,117,0); }
        }
        .podium-card { transition: transform 0.25s ease, box-shadow 0.25s ease; }
        .podium-card:hover { transform: translateY(-6px) scale(1.02); box-shadow: 0 20px 40px rgba(0,0,0,0.2) !important; }
        .row-hover { transition: background 0.18s ease, transform 0.18s ease; cursor: pointer; }
        .row-hover:hover { background: rgba(29,158,117,0.08) !important; transform: translateX(4px); }
        .filter-btn { transition: all 0.18s ease; cursor: pointer; white-space: nowrap; }
        .filter-btn:hover { background: rgba(29,158,117,0.15) !important; }
        .shimmer-text {
          background: linear-gradient(90deg, #1D9E75, #4ECBA1, #1D9E75);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }
        @media (max-width: 600px) {
          .leaderboard-grid { grid-template-columns: 48px 1fr 80px 60px !important; }
          .col-winrate { display: none !important; }
          .podium-wrap { gap: 8px !important; }
        }
      `}</style>

      {/* Navbar */}
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
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Lobby', href: '/lobby' },
            { label: 'Leaderboard', href: '/leaderboard', active: true },
            { label: 'Profile', href: '/profile' },
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
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 20px' }}>

          {/* Header */}
          <div style={{
            textAlign: 'center', marginBottom: 40,
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.6s ease',
          }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🏆</div>
            <h1 className="shimmer-text" style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 900, margin: '0 0 10px', letterSpacing: '-1px' }}>
              Εθνική Κατάταξη
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 16, margin: 0 }}>
              Οι κορυφαίοι μαθητές της Ελλάδας
            </p>
          </div>

          {/* Filters */}
          <div style={{ opacity: visible ? 1 : 0, transition: 'all 0.6s ease 0.15s', marginBottom: 36 }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Μάθημα</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
              {SUBJECTS.map(s => (
                <button key={s} className="filter-btn" onClick={() => setSelectedSubject(s)} style={{
                  padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                  border: selectedSubject === s ? '1.5px solid #1D9E75' : '1.5px solid rgba(255,255,255,0.1)',
                  background: selectedSubject === s ? 'rgba(29,158,117,0.2)' : 'rgba(255,255,255,0.04)',
                  color: selectedSubject === s ? '#4ECBA1' : 'rgba(255,255,255,0.6)',
                }}>{s}</button>
              ))}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Τάξη</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {CLASSES.map(c => (
                <button key={c} className="filter-btn" onClick={() => setSelectedClass(c)} style={{
                  padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                  border: selectedClass === c ? '1.5px solid #1D9E75' : '1.5px solid rgba(255,255,255,0.1)',
                  background: selectedClass === c ? 'rgba(29,158,117,0.2)' : 'rgba(255,255,255,0.04)',
                  color: selectedClass === c ? '#4ECBA1' : 'rgba(255,255,255,0.6)',
                }}>{c}</button>
              ))}
            </div>
          </div>

          {/* Podium */}
          <div className="podium-wrap" style={{
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            gap: 16, flexWrap: 'wrap', marginBottom: 40,
            opacity: visible ? 1 : 0, transition: 'all 0.6s ease 0.25s',
          }}>
            <PodiumCard player={top3[1]} podiumHeight={110} delay={0.35} />
            <PodiumCard player={top3[0]} podiumHeight={150} delay={0.2} isFirst />
            <PodiumCard player={top3[2]} podiumHeight={80} delay={0.5} />
          </div>

          {/* Table */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden' }}>
            <div className="leaderboard-grid" style={{
              display: 'grid', gridTemplateColumns: '60px 1fr 120px 120px 80px',
              padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)',
              fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1,
              color: 'rgba(255,255,255,0.35)',
            }}>
              <span>#</span><span>Παίκτης</span>
              <span style={{ textAlign: 'center' }}>ELO</span>
              <span className="col-winrate" style={{ textAlign: 'center' }}>Win Rate</span>
              <span style={{ textAlign: 'center' }}>Νίκες</span>
            </div>

            {rest.map((player, i) => (
              <div key={player.username} className="row-hover leaderboard-grid" style={{
                display: 'grid', gridTemplateColumns: '60px 1fr 120px 120px 80px',
                padding: '16px 20px',
                borderBottom: i < rest.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                alignItems: 'center',
                opacity: rowsVisible[i + 3] ? 1 : 0,
                transform: rowsVisible[i + 3] ? 'translateX(0)' : 'translateX(-16px)',
                transition: 'opacity 0.4s ease, transform 0.4s ease',
              }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: 'rgba(255,255,255,0.3)' }}>{player.rank}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #1D9E75, #0D6B4F)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 15, fontWeight: 800, color: '#fff', flexShrink: 0,
                  }}>{player.avatar}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{player.username}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{player.subject}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'center', fontSize: 16, fontWeight: 800, color: '#4ECBA1' }}>{player.elo}</div>
                <div className="col-winrate" style={{ textAlign: 'center' }}>
                  <WinRateBar value={player.winRate} />
                </div>
                <div style={{ textAlign: 'center', fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>{player.wins}W</div>
              </div>
            ))}
          </div>

          {/* Your rank */}
          <div style={{
            marginTop: 20, padding: '16px 20px', borderRadius: 12,
            border: '1.5px solid rgba(29,158,117,0.4)', background: 'rgba(29,158,117,0.08)',
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
                <div style={{ fontSize: 12, color: '#4ECBA1', fontWeight: 700 }}>Η θέση σου</div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>εσύ · #47</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 24 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#4ECBA1' }}>1,420</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>ELO</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 900 }}>61%</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Win Rate</div>
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

function PodiumCard({ player, podiumHeight, delay, isFirst }: {
  player: typeof mockData[0];
  podiumHeight: number;
  delay: number;
  isFirst?: boolean;
}) {
  const colors = {
    1: { bg: 'linear-gradient(135deg, #FFD700, #FFA500)', shadow: 'rgba(255,215,0,0.5)', border: 'rgba(255,215,0,0.3)', blockBg: 'rgba(255,215,0,0.1)' },
    2: { bg: 'linear-gradient(135deg, #C0C0C0, #A8A8A8)', shadow: 'rgba(192,192,192,0.3)', border: 'rgba(192,192,192,0.2)', blockBg: 'rgba(192,192,192,0.08)' },
    3: { bg: 'linear-gradient(135deg, #CD7F32, #A0522D)', shadow: 'rgba(205,127,50,0.3)', border: 'rgba(205,127,50,0.2)', blockBg: 'rgba(205,127,50,0.08)' },
  }[player.rank] ?? { bg: '#333', shadow: 'transparent', border: 'transparent', blockBg: 'transparent' };

  return (
    <div className="podium-card" style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      animation: `fadeInUp 0.6s ease ${delay}s both`,
      width: isFirst ? 160 : 130,
    }}>
      <div style={{
        width: isFirst ? 72 : 56, height: isFirst ? 72 : 56, borderRadius: '50%',
        background: colors.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: isFirst ? 28 : 22, fontWeight: 900, color: '#fff', marginBottom: 8,
        boxShadow: `0 0 ${isFirst ? 24 : 16}px ${colors.shadow}`,
      }}>{player.badge}</div>
      <div style={{ fontSize: isFirst ? 15 : 13, fontWeight: 800, marginBottom: 2, textAlign: 'center' }}>{player.username}</div>
      <div style={{ fontSize: isFirst ? 20 : 16, fontWeight: 900, color: '#4ECBA1', marginBottom: 10 }}>{player.elo}</div>
      <div style={{
        width: '100%', height: podiumHeight,
        background: colors.blockBg,
        border: `1px solid ${colors.border}`,
        borderRadius: '8px 8px 0 0',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: 28, fontWeight: 900, color: 'rgba(255,255,255,0.15)' }}>{player.rank}</span>
      </div>
    </div>
  );
}

function WinRateBar({ value }: { value: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: value >= 70 ? '#4ECBA1' : value >= 50 ? '#fff' : '#FF6B6B' }}>{value}%</span>
      <div style={{ width: 60, height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${value}%`,
          background: value >= 70 ? '#1D9E75' : value >= 50 ? '#4ECBA1' : '#FF6B6B',
          borderRadius: 2,
        }} />
      </div>
    </div>
  );
}