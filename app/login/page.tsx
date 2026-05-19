'use client'
import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [grade, setGrade] = useState(2)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleLogin() {
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError('Λάθος email ή κωδικός.')
    else window.location.href = '/dashboard'
    setLoading(false)
  }

  async function handleRegister() {
    setLoading(true); setError('')
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { name, grade } }
    })
    if (error) setError(error.message)
    else setSuccess('Έλεγξε το email σου για επιβεβαίωση!')
    setLoading(false)
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        .input {
          width: 100%; padding: 11px 14px;
          border: 1.5px solid #e5e7eb; border-radius: 10px;
          font-family: inherit; font-size: 14px; color: #111;
          background: white; transition: border-color 0.2s;
          outline: none;
        }
        .input:focus { border-color: #1D9E75; box-shadow: 0 0 0 3px #E1F5EE; }
        .btn {
          width: 100%; padding: 13px; background: linear-gradient(135deg, #1D9E75, #0F6E56);
          color: white; border: none; border-radius: 12px;
          font-family: inherit; font-size: 15px; font-weight: 700;
          cursor: pointer; transition: all 0.2s;
          box-shadow: 0 4px 15px rgba(29,158,117,0.3);
        }
        .btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(29,158,117,0.4); }
        .btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .grade-btn {
          flex: 1; padding: 12px 6px; border-radius: 10px; cursor: pointer;
          border: 2px solid #e5e7eb; background: white; font-family: inherit;
          transition: all 0.15s; text-align: center;
        }
        .grade-btn.selected { border-color: #1D9E75; background: #E1F5EE; }
        @media (max-width: 700px) {
          .auth-left { display: none !important; }
          .auth-right { border-radius: 16px !important; }
        }
      `}</style>

      <main style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ display: 'flex', width: '100%', maxWidth: 820, background: 'white', borderRadius: 20, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>

          {/* Left */}
          <div className="auth-left" style={{ flex: 1, background: 'linear-gradient(160deg, #0F6E56, #1D9E75)', padding: '44px 36px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'white' }}>Panhel<span style={{ color: '#9FE1CB' }}>Quiz</span></div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 900, color: 'white', lineHeight: 1.2, marginBottom: 16 }}>Η γνώση<br/>είναι <span style={{ color: '#9FE1CB' }}>όπλο.</span></div>
              <div style={{ fontSize: 14, color: '#5DCAA5', marginBottom: 24, lineHeight: 1.6 }}>Παίξε, μάθε, ανέβα. Μαζί με χιλιάδες μαθητές που προετοιμάζονται για τις Πανελλήνιες.</div>
              {['1v1 quiz battles σε πραγματικό χρόνο', 'Matchmaking ανά τάξη λυκείου', 'Εθνικό leaderboard ανά μάθημα', 'Δωρεάν για πάντα'].map(t => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: 13, color: '#9FE1CB' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#9FE1CB', flexShrink: 0 }}></div>{t}
                </div>
              ))}
            </div>
            <div style={{ fontSize: 12, color: '#5DCAA5' }}>© 2025 PanhelQuiz</div>
          </div>

          {/* Right */}
          <div style={{ flex: 1, padding: '40px 36px' }}>
            <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', marginBottom: 28 }}>
              {(['login', 'register'] as const).map(t => (
                <button key={t} onClick={() => { setTab(t); setError(''); setSuccess('') }} style={{
                  flex: 1, padding: '10px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  background: 'none', border: 'none', fontFamily: 'inherit',
                  color: tab === t ? '#1D9E75' : '#666',
                  borderBottom: tab === t ? '2px solid #1D9E75' : '2px solid transparent',
                }}>{t === 'login' ? 'Σύνδεση' : 'Εγγραφή'}</button>
              ))}
            </div>

            {error && <div style={{ background: '#FCEBEB', color: '#A32D2D', padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 16 }}>⚠️ {error}</div>}
            {success && <div style={{ background: '#E1F5EE', color: '#0F6E56', padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 16 }}>✓ {success}</div>}

            {tab === 'login' ? (
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4, color: '#111' }}>Καλώς ήρθες πίσω!</h2>
                <p style={{ fontSize: 13, color: '#666', marginBottom: 22 }}>Σύνδεσε τον λογαριασμό σου.</p>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Email</label>
                  <input className="input" type="email" placeholder="maria@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Κωδικός</label>
                  <input className="input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
                </div>
                <button className="btn" onClick={handleLogin} disabled={loading}>{loading ? 'Σύνδεση...' : 'Σύνδεση'}</button>
                <div style={{ textAlign: 'center', fontSize: 13, color: '#666', marginTop: 16 }}>Δεν έχεις λογαριασμό; <span onClick={() => setTab('register')} style={{ color: '#1D9E75', fontWeight: 600, cursor: 'pointer' }}>Εγγραφή</span></div>
              </div>
            ) : (
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4, color: '#111' }}>Δημιούργησε λογαριασμό</h2>
                <p style={{ fontSize: 13, color: '#666', marginBottom: 22 }}>Δωρεάν. Χωρίς πιστωτική κάρτα.</p>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Όνομα</label>
                  <input className="input" placeholder="Μαρία Παπαδοπούλου" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Email</label>
                  <input className="input" type="email" placeholder="maria@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Κωδικός</label>
                  <input className="input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
                </div>
                <div style={{ marginBottom: 22 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Τάξη</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[1,2,3].map(g => (
                      <button key={g} className={`grade-btn${grade===g?' selected':''}`} onClick={() => setGrade(g)}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: grade===g ? '#0F6E56' : '#111' }}>{['Α΄','Β΄','Γ΄'][g-1]}</div>
                        <div style={{ fontSize: 11, color: '#888' }}>Λυκείου</div>
                      </button>
                    ))}
                  </div>
                </div>
                <button className="btn" onClick={handleRegister} disabled={loading}>{loading ? 'Δημιουργία...' : 'Δημιουργία λογαριασμού'}</button>
                <div style={{ textAlign: 'center', fontSize: 13, color: '#666', marginTop: 16 }}>Έχεις ήδη λογαριασμό; <span onClick={() => setTab('login')} style={{ color: '#1D9E75', fontWeight: 600, cursor: 'pointer' }}>Σύνδεση</span></div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}