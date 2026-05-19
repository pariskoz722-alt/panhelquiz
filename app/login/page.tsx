'use client'
import { useState } from 'react'

export default function Login() {
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [grade, setGrade] = useState(2)
  const [showPw, setShowPw] = useState(false)

  return (
    <main style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', padding: '20px' }}>
      <div style={{ display: 'flex', width: '100%', maxWidth: 800, background: 'white', borderRadius: 16, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
        
        {/* Αριστερά */}
        <div style={{ flex: 1, background: '#0F6E56', padding: '40px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'white' }}>Panhel<span style={{ color: '#9FE1CB' }}>Quiz</span></div>
          <div>
            <div style={{ fontSize: 26, fontWeight: 800, color: 'white', lineHeight: 1.2, marginBottom: 14 }}>Η γνώση<br/>είναι <span style={{ color: '#9FE1CB' }}>όπλο.</span></div>
            <div style={{ fontSize: 14, color: '#5DCAA5', marginBottom: 24 }}>Παίξε, μάθε, ανέβα. Μαζί με χιλιάδες μαθητές που προετοιμάζονται για τις Πανελλήνιες.</div>
            {['1v1 quiz battles σε πραγματικό χρόνο', 'Matchmaking ανά τάξη λυκείου', 'Εθνικό leaderboard ανά μάθημα', 'Δωρεάν για πάντα'].map(t => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 13, color: '#9FE1CB' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#9FE1CB', flexShrink: 0 }}></div>
                {t}
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12, color: '#5DCAA5' }}>© 2025 PanhelQuiz</div>
        </div>

        {/* Δεξιά */}
        <div style={{ flex: 1, padding: '40px 32px' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', marginBottom: 24 }}>
            {(['login', 'register'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                flex: 1, padding: '10px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                background: 'none', border: 'none', fontFamily: 'inherit',
                color: tab === t ? '#1D9E75' : '#666',
                borderBottom: tab === t ? '2px solid #1D9E75' : '2px solid transparent',
              }}>{t === 'login' ? 'Σύνδεση' : 'Εγγραφή'}</button>
            ))}
          </div>

          {tab === 'login' ? (
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4, color: '#111' }}>Καλώς ήρθες πίσω!</h2>
              <p style={{ fontSize: 13, color: '#666', marginBottom: 20 }}>Σύνδεσε τον λογαριασμό σου.</p>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 4 }}>EMAIL</label>
              <input type="email" placeholder="maria@example.com" style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, marginBottom: 14, fontFamily: 'inherit', fontSize: 14, color: '#111' }} />
              <label style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 4 }}>ΚΩΔΙΚΟΣ</label>
              <div style={{ position: 'relative', marginBottom: 6 }}>
                <input type={showPw ? 'text' : 'password'} placeholder="••••••••" style={{ width: '100%', padding: '10px 40px 10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontFamily: 'inherit', fontSize: 14, color: '#111' }} />
                <button onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>{showPw ? '🙈' : '👁'}</button>
              </div>
              <div style={{ textAlign: 'right', fontSize: 12, color: '#1D9E75', marginBottom: 20, cursor: 'pointer' }}>Ξέχασες τον κωδικό;</div>
              <a href="/dashboard" style={{ display: 'block', width: '100%', padding: '13px', background: '#1D9E75', color: 'white', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer', textAlign: 'center', textDecoration: 'none' }}>Σύνδεση</a>
              <div style={{ textAlign: 'center', fontSize: 13, color: '#666', marginTop: 16 }}>Δεν έχεις λογαριασμό; <span onClick={() => setTab('register')} style={{ color: '#1D9E75', fontWeight: 600, cursor: 'pointer' }}>Εγγραφή</span></div>
            </div>
          ) : (
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4, color: '#111' }}>Δημιούργησε λογαριασμό</h2>
              <p style={{ fontSize: 13, color: '#666', marginBottom: 20 }}>Δωρεάν. Χωρίς πιστωτική κάρτα.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 4 }}>ΟΝΟΜΑ</label>
                  <input placeholder="Μαρία" style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontFamily: 'inherit', fontSize: 14, color: '#111' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 4 }}>ΕΠΩΝΥΜΟ</label>
                  <input placeholder="Παπαδοπούλου" style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontFamily: 'inherit', fontSize: 14, color: '#111' }} />
                </div>
              </div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 4 }}>EMAIL</label>
              <input type="email" placeholder="maria@example.com" style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, marginBottom: 14, fontFamily: 'inherit', fontSize: 14, color: '#111' }} />
              <label style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 4 }}>ΚΩΔΙΚΟΣ</label>
              <input type="password" placeholder="••••••••" style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, marginBottom: 14, fontFamily: 'inherit', fontSize: 14, color: '#111' }} />
              <label style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 8 }}>ΤΑΞΗ</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 20 }}>
                {[1,2,3].map(g => (
                  <button key={g} onClick={() => setGrade(g)} style={{
                    padding: '10px 6px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit',
                    border: grade === g ? '2px solid #1D9E75' : '2px solid #e5e7eb',
                    background: grade === g ? '#E1F5EE' : 'white',
                    fontWeight: 800, fontSize: 16, color: '#111'
                  }}>{['Α΄','Β΄','Γ΄'][g-1]}<div style={{ fontSize: 11, fontWeight: 400, color: '#666' }}>Λυκείου</div></button>
                ))}
              </div>
              <a href="/dashboard" style={{ display: 'block', width: '100%', padding: '13px', background: '#1D9E75', color: 'white', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer', textAlign: 'center', textDecoration: 'none' }}>Δημιουργία λογαριασμού</a>
              <div style={{ textAlign: 'center', fontSize: 13, color: '#666', marginTop: 16 }}>Έχεις ήδη λογαριασμό; <span onClick={() => setTab('login')} style={{ color: '#1D9E75', fontWeight: 600, cursor: 'pointer' }}>Σύνδεση</span></div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}