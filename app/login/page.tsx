'use client'
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useTheme } from '../context/ThemeContext'

export default function Login() {
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [grade, setGrade] = useState(2)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [ageConfirmed, setAgeConfirmed] = useState(false)
  const { dark, toggleDark } = useTheme()

  const c = {
    bg: dark ? '#0A0E14' : '#f9fafb',
    card: dark ? '#111827' : 'white',
    cardBorder: dark ? 'rgba(255,255,255,0.08)' : '#e5e7eb',
    text: dark ? '#fff' : '#111',
    textSub: dark ? 'rgba(255,255,255,0.5)' : '#666',
    inputBg: dark ? 'rgba(255,255,255,0.06)' : 'white',
    inputBorder: dark ? 'rgba(255,255,255,0.12)' : '#e5e7eb',
    tabBorder: dark ? 'rgba(255,255,255,0.08)' : '#e5e7eb',
  }

  async function handleLogin() {
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError('Λάθος email ή κωδικός.')
    else window.location.href = '/dashboard'
    setLoading(false)
  }

  async function handleRegister() {
    setLoading(true); setError('')
    if (!ageConfirmed) {
      setError('Πρέπει να επιβεβαιώσεις ότι είσαι 15+ ετών και να αποδεχτείς τους Όρους Χρήσης.')
      setLoading(false)
      return
    }
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
          border-radius: 10px; font-family: inherit;
          font-size: 14px; transition: border-color 0.2s; outline: none;
        }
        .input:focus { border-color: #1D9E75; box-shadow: 0 0 0 3px rgba(29,158,117,0.15); }
        .btn {
          width: 100%; padding: 13px;
          background: linear-gradient(135deg, #1D9E75, #0F6E56);
          color: white; border: none; border-radius: 12px;
          font-family: inherit; font-size: 15px; font-weight: 700;
          cursor: pointer; transition: all 0.2s;
          box-shadow: 0 4px 15px rgba(29,158,117,0.3);
        }
        .btn:hover { transform: translateY(-1px); }
        .btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .toggle-btn { transition: all 0.2s; cursor: pointer; }
        @media (max-width: 700px) {
          .auth-left { display: none !important; }
          .auth-right { border-radius: 16px !important; }
        }
      `}</style>

      <main style={{ minHeight: '100vh', background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, flexDirection: 'column', gap: 16 }}>

        <div style={{ width: '100%', maxWidth: 820, display: 'flex', justifyContent: 'flex-end' }}>
          <button className="toggle-btn" onClick={toggleDark} style={{
            padding: '6px 12px', borderRadius: 20,
            border: `1px solid ${c.cardBorder}`,
            background: dark ? 'rgba(255,255,255,0.08)' : '#f3f4f6',
            color: c.text, fontSize: 16, cursor: 'pointer',
          }}>{dark ? '☀️' : '🌙'}</button>
        </div>

        <div style={{ display: 'flex', width: '100%', maxWidth: 820, background: c.card, borderRadius: 20, overflow: 'hidden', boxShadow: dark ? '0 20px 60px rgba(0,0,0,0.4)' : '0 20px 60px rgba(0,0,0,0.1)', border: `1px solid ${c.cardBorder}` }}>

          {/* Left */}
          <div className="auth-left" style={{ flex: 1, background: 'linear-gradient(160deg, #0F6E56, #1D9E75)', padding: '44px 36px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'white' }}>Panhel<span style={{ color: '#9FE1CB' }}>Quiz</span></div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 900, color: 'white', lineHeight: 1.2, marginBottom: 16 }}>Η γνώση<br />είναι <span style={{ color: '#9FE1CB' }}>όπλο.</span></div>
              <div style={{ fontSize: 14, color: '#5DCAA5', marginBottom: 24, lineHeight: 1.6 }}>Παίξε, μάθε, ανέβα. Μαζί με χιλιάδες μαθητές που προετοιμάζονται για τις Πανελλήνιες.</div>
              {['1v1 quiz battles σε πραγματικό χρόνο', 'Matchmaking ανά τάξη λυκείου', 'Εθνικό leaderboard ανά μάθημα', 'Δωρεάν για πάντα'].map(t => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: 13, color: '#9FE1CB' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#9FE1CB', flexShrink: 0 }} />{t}
                </div>
              ))}
            </div>
            <div style={{ fontSize: 12, color: '#5DCAA5' }}>© 2025 PanhelQuiz</div>
          </div>

          {/* Right */}
          <div className="auth-right" style={{ flex: 1, padding: '40px 36px', background: c.card }}>
            <div style={{ display: 'flex', borderBottom: `1px solid ${c.tabBorder}`, marginBottom: 28 }}>
              {(['login', 'register'] as const).map(t => (
                <button key={t} onClick={() => { setTab(t); setError(''); setSuccess('') }} style={{
                  flex: 1, padding: '10px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  background: 'none', border: 'none', fontFamily: 'inherit',
                  color: tab === t ? '#1D9E75' : c.textSub,
                  borderBottom: tab === t ? '2px solid #1D9E75' : '2px solid transparent',
                }}>{t === 'login' ? 'Σύνδεση' : 'Εγγραφή'}</button>
              ))}
            </div>

            {error && <div style={{ background: dark ? 'rgba(163,45,45,0.2)' : '#FCEBEB', color: '#A32D2D', padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 16 }}>⚠️ {error}</div>}
            {success && <div style={{ background: dark ? 'rgba(29,158,117,0.2)' : '#E1F5EE', color: '#0F6E56', padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 16 }}>✓ {success}</div>}

            {tab === 'login' ? (
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4, color: c.text }}>Καλώς ήρθες πίσω!</h2>
                <p style={{ fontSize: 13, color: c.textSub, marginBottom: 22 }}>Σύνδεσε τον λογαριασμό σου.</p>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: c.textSub, display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Email</label>
                  <input className="input" type="email" autoComplete="email" placeholder="maria@example.com" value={email} onChange={e => setEmail(e.target.value)}
                    style={{ background: c.inputBg, border: `1.5px solid ${c.inputBorder}`, color: c.text }} />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: c.textSub, display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Κωδικός</label>
                  <input className="input" type="password" autoComplete="current-password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
                    style={{ background: c.inputBg, border: `1.5px solid ${c.inputBorder}`, color: c.text }} />
                </div>
                <button className="btn" onClick={handleLogin} disabled={loading}>{loading ? 'Σύνδεση...' : 'Σύνδεση'}</button>
                <div style={{ textAlign: 'center', fontSize: 13, color: c.textSub, marginTop: 16 }}>
                  Δεν έχεις λογαριασμό; <span onClick={() => setTab('register')} style={{ color: '#1D9E75', fontWeight: 600, cursor: 'pointer' }}>Εγγραφή</span>
                </div>
              </div>
            ) : (
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4, color: c.text }}>Δημιούργησε λογαριασμό</h2>
                <p style={{ fontSize: 13, color: c.textSub, marginBottom: 22 }}>Δωρεάν. Χωρίς πιστωτική κάρτα.</p>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: c.textSub, display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Όνομα</label>
                  <input className="input" autoComplete="name" placeholder="Μαρία Παπαδοπούλου" value={name} onChange={e => setName(e.target.value)}
                    style={{ background: c.inputBg, border: `1.5px solid ${c.inputBorder}`, color: c.text }} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: c.textSub, display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Email</label>
                  <input className="input" type="email" autoComplete="email" placeholder="maria@example.com" value={email} onChange={e => setEmail(e.target.value)}
                    style={{ background: c.inputBg, border: `1.5px solid ${c.inputBorder}`, color: c.text }} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: c.textSub, display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Κωδικός</label>
                  <input className="input" type="password" autoComplete="new-password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
                    style={{ background: c.inputBg, border: `1.5px solid ${c.inputBorder}`, color: c.text }} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: c.textSub, display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Τάξη</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[1, 2, 3].map(g => (
                      <button key={g} onClick={() => setGrade(g)} style={{
                        flex: 1, padding: '12px 6px', borderRadius: 10, cursor: 'pointer',
                        border: `2px solid ${grade === g ? '#1D9E75' : c.inputBorder}`,
                        background: grade === g ? 'rgba(29,158,117,0.1)' : c.inputBg,
                        fontFamily: 'inherit', textAlign: 'center',
                      }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: grade === g ? '#1D9E75' : c.text }}>{['Α΄', 'Β΄', 'Γ΄'][g - 1]}</div>
                        <div style={{ fontSize: 11, color: c.textSub }}>Λυκείου</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ηλικιακή επαλήθευση */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={ageConfirmed}
                      onChange={e => setAgeConfirmed(e.target.checked)}
                      style={{ marginTop: 3, width: 16, height: 16, accentColor: '#1D9E75', flexShrink: 0 }}
                    />
                    <span style={{ fontSize: 13, color: c.textSub, lineHeight: 1.5 }}>
                      Επιβεβαιώνω ότι είμαι τουλάχιστον <strong style={{ color: c.text }}>15 ετών</strong> και αποδέχομαι τους{' '}
                      <a href="/terms" style={{ color: '#1D9E75', fontWeight: 600 }}>Όρους Χρήσης</a>{' '}
                      και την{' '}
                      <a href="/privacy" style={{ color: '#1D9E75', fontWeight: 600 }}>Πολιτική Απορρήτου</a>.
                    </span>
                  </label>
                </div>

                <button className="btn" onClick={handleRegister} disabled={loading}>{loading ? 'Δημιουργία...' : 'Δημιουργία λογαριασμού'}</button>
                <div style={{ textAlign: 'center', fontSize: 13, color: c.textSub, marginTop: 16 }}>
                  Έχεις ήδη λογαριασμό; <span onClick={() => setTab('login')} style={{ color: '#1D9E75', fontWeight: 600, cursor: 'pointer' }}>Σύνδεση</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}