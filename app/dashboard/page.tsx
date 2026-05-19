'use client'
import { useState } from 'react'

const recentGames = [
  { opp: 'Αλέξης Κ.', subject: 'Μαθηματικά', result: 'win', score: '420-310', elo: '+18', time: 'πριν 12λ' },
  { opp: 'Σοφία Λ.', subject: 'Φυσική', result: 'win', score: '380-290', elo: '+15', time: 'πριν 1ω' },
  { opp: 'Νίκος Σ.', subject: 'Μαθηματικά', result: 'loss', score: '240-500', elo: '-22', time: 'πριν 2ω' },
  { opp: 'Ελένη Τ.', subject: 'Χημεία', result: 'win', score: '460-320', elo: '+12', time: 'χθες' },
]

const leaderboard = [
  { name: 'Αλέξης Κ.', elo: 1512, rank: 1 },
  { name: 'Νίκος Σ.', elo: 1489, rank: 2 },
  { name: 'Ελένη Τ.', elo: 1401, rank: 3 },
  { name: 'Εσύ', elo: 1347, rank: 12, isMe: true },
  { name: 'Κώστας Μ.', elo: 1341, rank: 13 },
]

const subjects = [
  { name: 'Μαθηματικά', pct: 72, color: '#1D9E75' },
  { name: 'Φυσική', pct: 61, color: '#378ADD' },
  { name: 'Χημεία', pct: 58, color: '#D85A30' },
  { name: 'Ιστορία', pct: 68, color: '#7F77DD' },
  { name: 'Βιολογία', pct: 55, color: '#639922' },
]

export default function Dashboard() {
  return (
    <main style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: 'sans-serif' }}>
      
      {/* Navbar */}
      <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '0 24px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 18, fontWeight: 800 }}>Panhel<span style={{ color: '#1D9E75' }}>Quiz</span></div>
        <div style={{ display: 'flex', gap: 4 }}>
          {['Dashboard', 'Παίξε', 'Leaderboard'].map((n, i) => (
            <a key={n} href={i === 1 ? '/lobby' : '#'} style={{ padding: '6px 12px', borderRadius: 8, fontSize: 13, fontWeight: 500, color: i === 0 ? '#0F6E56' : '#666', background: i === 0 ? '#E1F5EE' : 'transparent', textDecoration: 'none' }}>{n}</a>
          ))}
        </div>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1D9E75', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>ΜΠ</div>
      </div>

      <div style={{ padding: '20px 24px' }}>
        
        {/* Welcome */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111', marginBottom: 2 }}>Καλημέρα, Μαρία! 👋</h1>
            <p style={{ fontSize: 13, color: '#666' }}>Β΄ Λυκείου · ELO: 1.347 · #12 στα Μαθηματικά</p>
          </div>
          <a href="/lobby" style={{ background: '#1D9E75', color: 'white', padding: '10px 20px', borderRadius: 12, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>▶ Νέα παρτίδα</a>
        </div>

        {/* Streak */}
        <div style={{ background: '#FAEEDA', border: '1px solid #EF9F27', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <span style={{ fontSize: 22 }}>🔥</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#633806' }}>Σερί νικών!</div>
            <div style={{ fontSize: 12, color: '#854F0B' }}>Κέρδισες τις τελευταίες 5 παρτίδες. Συνέχισε!</div>
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#BA7517' }}>5 <span style={{ fontSize: 13, fontWeight: 500, color: '#854F0B' }}>σερί</span></div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
          {[
            { label: 'ELO', val: '1.347', sub: '+42 αυτή την εβδομάδα', color: '#1D9E75' },
            { label: 'Παρτίδες', val: '134', sub: '87 νίκες · 47 ήττες', color: '#185FA5' },
            { label: 'Νίκες %', val: '64%', sub: '+3% τον μήνα', color: '#534AB7' },
            { label: 'Κατάταξη', val: '#12', sub: 'από 4.820 μαθητές', color: '#BA7517' },
          ].map(s => (
            <div key={s.label} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#666', textTransform: 'uppercase', marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          
          {/* Leaderboard */}
          <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#111', marginBottom: 14 }}>🏆 Leaderboard — Μαθηματικά Β΄</div>
            {leaderboard.map(p => (
              <div key={p.rank} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: '1px solid #f3f4f6', background: p.isMe ? '#E1F5EE' : 'transparent', borderRadius: p.isMe ? 8 : 0, paddingLeft: p.isMe ? 8 : 0 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: p.rank === 1 ? '#BA7517' : p.rank === 2 ? '#888' : p.rank === 3 ? '#993C1D' : '#666', width: 20 }}>{p.rank}</div>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: p.isMe ? '#1D9E75' : '#e5e7eb', color: p.isMe ? 'white' : '#666', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>{p.name.slice(0,2)}</div>
                <div style={{ flex: 1, fontSize: 13, fontWeight: p.isMe ? 700 : 500, color: p.isMe ? '#0F6E56' : '#111' }}>{p.name}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#666' }}>{p.elo}</div>
              </div>
            ))}
          </div>

          {/* Recent games */}
          <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#111', marginBottom: 14 }}>📋 Πρόσφατες παρτίδες</div>
            {recentGames.map((g, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: g.result === 'win' ? '#E1F5EE' : '#FCEBEB', color: g.result === 'win' ? '#0F6E56' : '#A32D2D', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800 }}>{g.result === 'win' ? 'Ν' : 'Η'}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#111' }}>vs {g.opp}</div>
                  <div style={{ fontSize: 11, color: '#888' }}>{g.subject} · {g.score} · {g.time}</div>
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: g.result === 'win' ? '#1D9E75' : '#A32D2D' }}>{g.elo} ELO</div>
              </div>
            ))}
          </div>
        </div>

        {/* Subjects */}
        <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#111', marginBottom: 14 }}>📚 Επίδοση ανά μάθημα</div>
          {subjects.map(s => (
            <div key={s.name} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#111' }}>{s.name}</span>
                <span style={{ fontSize: 12, color: '#666' }}>{s.pct}% νίκες</span>
              </div>
              <div style={{ height: 5, background: '#f3f4f6', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${s.pct}%`, background: s.color, borderRadius: 3 }}></div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  )
}