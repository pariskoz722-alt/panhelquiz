'use client'
import { useEffect, useRef } from 'react'

export default function Home() {
  useEffect(() => {
    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault()
        const id = a.getAttribute('href')?.slice(1)
        document.getElementById(id || '')?.scrollIntoView({ behavior: 'smooth' })
      })
    })

    // Fade in on scroll
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible')
        }
      })
    }, { threshold: 0.1 })
    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        
        .fade-in { opacity: 0; transform: translateY(30px); transition: all 0.7s ease; }
        .fade-in.visible { opacity: 1; transform: translateY(0); }
        .fade-in.delay-1 { transition-delay: 0.1s; }
        .fade-in.delay-2 { transition-delay: 0.2s; }
        .fade-in.delay-3 { transition-delay: 0.3s; }
        .fade-in.delay-4 { transition-delay: 0.4s; }
        .fade-in.delay-5 { transition-delay: 0.5s; }

        .nav-link { font-size: 14px; color: #666; text-decoration: none; transition: color 0.2s; }
        .nav-link:hover { color: #1D9E75; }

        .btn-primary {
          background: #1D9E75; color: white; padding: 14px 28px;
          border-radius: 12px; font-size: 16px; font-weight: 700;
          text-decoration: none; display: inline-block;
          transition: all 0.2s; transform: translateY(0);
          box-shadow: 0 4px 15px rgba(29,158,117,0.3);
        }
        .btn-primary:hover { background: #0F6E56; transform: translateY(-2px); box-shadow: 0 8px 25px rgba(29,158,117,0.4); }

        .btn-secondary {
          background: white; color: #111; padding: 14px 28px;
          border-radius: 12px; font-size: 16px; font-weight: 500;
          text-decoration: none; display: inline-block;
          border: 1.5px solid #e5e7eb; transition: all 0.2s;
        }
        .btn-secondary:hover { border-color: #1D9E75; color: #1D9E75; transform: translateY(-2px); }

        .feature-card {
          background: white; border: 1px solid #e5e7eb; border-radius: 16px;
          padding: 24px; transition: all 0.3s;
        }
        .feature-card:hover { transform: translateY(-6px); box-shadow: 0 12px 40px rgba(0,0,0,0.1); border-color: #1D9E75; }

        .stat-card { transition: all 0.3s; }
        .stat-card:hover { transform: scale(1.05); }

        /* 3D floating card */
        .hero-card {
          background: white; border-radius: 20px; padding: 20px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.15);
          animation: float 3s ease-in-out infinite;
          border: 1px solid #e5e7eb;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(-2deg); }
          50% { transform: translateY(-12px) rotate(2deg); }
        }
        .hero-card-2 {
          animation: float2 3.5s ease-in-out infinite;
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(-6px) rotate(2deg); }
          50% { transform: translateY(6px) rotate(-1deg); }
        }

        .step-num {
          width: 48px; height: 48px; border-radius: 50%;
          background: linear-gradient(135deg, #1D9E75, #0F6E56);
          color: white; font-size: 18px; font-weight: 900;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 14px;
          box-shadow: 0 6px 20px rgba(29,158,117,0.35);
        }

        /* Mobile */
        @media (max-width: 768px) {
          .hero-grid { flex-direction: column !important; }
          .hero-visual { display: none !important; }
          .features-grid { grid-template-columns: 1fr !important; }
          .stats-row { flex-wrap: wrap; }
          .steps-row { flex-direction: column !important; gap: 24px !important; }
          .nav-links-desktop { display: none !important; }
          .nav-mobile-btn { display: flex !important; }
          .cta-section { margin: 0 16px 32px !important; }
          h1 { font-size: 32px !important; }
          .hero-section { padding: 48px 20px 40px !important; }
        }

        .pulse {
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }

        .gradient-text {
          background: linear-gradient(135deg, #1D9E75, #0F8060);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .nav-cta {
          background: #1D9E75; color: white; padding: 8px 18px;
          border-radius: 8px; font-size: 14px; font-weight: 600;
          text-decoration: none; transition: all 0.2s;
        }
        .nav-cta:hover { background: #0F6E56; transform: translateY(-1px); }

        .subject-pill {
          border: 1.5px solid #e5e7eb; border-radius: 10px;
          padding: 10px 14px; display: flex; align-items: center;
          gap: 8px; font-size: 13px; font-weight: 500;
          transition: all 0.2s; background: white;
        }
        .subject-pill:hover { border-color: #1D9E75; background: #E1F5EE; color: #0F6E56; transform: scale(1.03); }
      `}</style>

      <main style={{ minHeight: '100vh', background: '#f9fafb' }}>

        {/* Navbar */}
        <nav style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #e5e7eb', padding: '0 32px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
          <div style={{ fontSize: 20, fontWeight: 800 }}>Panhel<span className="gradient-text">Quiz</span></div>
          <div className="nav-links-desktop" style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
            <a href="#how" className="nav-link">Πώς λειτουργεί</a>
            <a href="#subjects" className="nav-link">Μαθήματα</a>
            <a href="#features" className="nav-link">Features</a>
            <a href="/login" className="nav-link">Σύνδεση</a>
            <a href="/login" className="nav-cta">Εγγραφή</a>
          </div>
        </nav>

        {/* Hero */}
        <div className="hero-section" style={{ padding: '72px 32px 56px', maxWidth: 1100, margin: '0 auto' }}>
          <div className="hero-grid" style={{ display: 'flex', alignItems: 'center', gap: 48 }}>
            
            {/* Left */}
            <div style={{ flex: 1 }}>
              <div className="fade-in" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#E1F5EE', color: '#0F6E56', fontSize: 12, fontWeight: 700, padding: '5px 14px', borderRadius: 20, marginBottom: 24 }}>
                <span className="pulse" style={{ width: 6, height: 6, borderRadius: '50%', background: '#1D9E75', display: 'inline-block' }}></span>
                318 μαθητές online τώρα
              </div>
              <h1 className="fade-in delay-1" style={{ fontSize: 48, fontWeight: 900, letterSpacing: -2, lineHeight: 1.1, marginBottom: 20, color: '#111' }}>
                Διάβασε λιγότερο.<br/><span className="gradient-text">Μάθε περισσότερο.</span>
              </h1>
              <p className="fade-in delay-2" style={{ fontSize: 18, color: '#666', lineHeight: 1.7, marginBottom: 32 }}>
                Παίξε 1v1 quiz με συμμαθητές σου στα μαθήματα των Πανελληνίων. Ανέβα στη βαθμολογία και μάθε χωρίς να το καταλαβαίνεις.
              </p>
              <div className="fade-in delay-3" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <a href="/login" className="btn-primary">▶ Παίξε τώρα — δωρεάν</a>
                <a href="#how" className="btn-secondary">Πώς λειτουργεί ↓</a>
              </div>
              <div className="fade-in delay-4" style={{ marginTop: 24, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                {['✓ Δωρεάν για πάντα', '✓ Χωρίς εγγραφή πιστωτικής', '✓ Mobile-friendly'].map(t => (
                  <span key={t} style={{ fontSize: 13, color: '#666' }}>{t}</span>
                ))}
              </div>
            </div>

            {/* Right — 3D floating cards */}
            <div className="hero-visual" style={{ flex: 1, position: 'relative', height: 340, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ position: 'relative', width: 300, height: 300 }}>
                {/* Main card */}
                <div className="hero-card" style={{ position: 'absolute', top: 20, left: 20, width: 260 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>⚔️ 1v1 Battle</div>
                    <div style={{ background: '#E1F5EE', color: '#0F6E56', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>LIVE</div>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#111', marginBottom: 14, lineHeight: 1.4 }}>Ποιο είναι το παράγωγο του f(x) = x³ + 2x;</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    {['3x² + 2', '3x² − 2', 'x² + 2', '3x + 2'].map((a, i) => (
                      <div key={a} style={{ padding: '8px 10px', background: i === 0 ? '#E1F5EE' : '#f9fafb', border: `1px solid ${i === 0 ? '#1D9E75' : '#e5e7eb'}`, borderRadius: 8, fontSize: 12, fontWeight: 500, color: i === 0 ? '#0F6E56' : '#111' }}>{a}</div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: 12, color: '#888' }}>
                    <span>⏱ 8 δλ</span>
                    <span style={{ color: '#1D9E75', fontWeight: 700 }}>+125 ELO</span>
                  </div>
                </div>

                {/* Score card */}
                <div className="hero-card hero-card-2" style={{ position: 'absolute', bottom: 0, right: -20, width: 160, padding: 16 }}>
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>🏆 Κατάταξη</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: '#1D9E75' }}>#12</div>
                  <div style={{ fontSize: 12, color: '#888' }}>από 4.820 μαθητές</div>
                  <div style={{ marginTop: 8, fontSize: 12, fontWeight: 700, color: '#1D9E75' }}>▲ +42 ELO εβδομάδα</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-row" style={{ display: 'flex', justifyContent: 'center', borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb', background: 'white', marginBottom: 64 }}>
          {[['12.400+', 'Μαθητές'], ['850+', 'Ερωτήσεις'], ['6', 'Μαθήματα'], ['3', 'Τάξεις']].map(([num, label], i) => (
            <div key={label} className={`stat-card fade-in delay-${i+1}`} style={{ flex: 1, maxWidth: 200, padding: '24px 16px', textAlign: 'center', borderRight: i < 3 ? '1px solid #e5e7eb' : 'none' }}>
              <div style={{ fontSize: 30, fontWeight: 900, color: '#1D9E75', letterSpacing: -1 }}>{num}</div>
              <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div id="features" style={{ padding: '0 32px 64px', maxWidth: 1000, margin: '0 auto' }}>
          <h2 className="fade-in" style={{ textAlign: 'center', fontSize: 32, fontWeight: 800, letterSpacing: -0.5, marginBottom: 8, color: '#111' }}>Γιατί PanhelQuiz;</h2>
          <p className="fade-in" style={{ textAlign: 'center', fontSize: 16, color: '#666', marginBottom: 40 }}>Δεν είναι απλώς quiz. Είναι ο πιο έξυπνος τρόπος να ετοιμαστείς.</p>
          <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              { icon: '⚔️', title: '1v1 real-time battles', desc: 'Παίξε κατά μέτωπο με άλλους μαθητές της ίδιας τάξης σου.', delay: 'delay-1' },
              { icon: '📈', title: 'Σύστημα ELO', desc: 'Ανέβα ή κατέβα στη βαθμολογία. Το matchmaking βρίσκει ισάξιους αντιπάλους.', delay: 'delay-2' },
              { icon: '⏱', title: 'Χρονόμετρο πίεσης', desc: '15 δευτερόλεπτα ανά ερώτηση. Γρήγορη σκέψη, σαν τις αληθινές εξετάσεις.', delay: 'delay-3' },
              { icon: '👥', title: 'Matchmaking ανά τάξη', desc: 'Α΄, Β΄, Γ΄ Λυκείου — παίζεις με μαθητές του ίδιου επιπέδου.', delay: 'delay-1' },
              { icon: '🏆', title: 'Leaderboard', desc: 'Εθνική κατάταξη ανά μάθημα. Ποιος είναι ο καλύτερος;', delay: 'delay-2' },
              { icon: '📱', title: 'Mobile-first', desc: 'Παίξε από το κινητό σου, οποιαδήποτε ώρα, οπουδήποτε.', delay: 'delay-3' },
            ].map(f => (
              <div key={f.title} className={`feature-card fade-in ${f.delay}`}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 8 }}>{f.title}</div>
                <div style={{ fontSize: 14, color: '#666', lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div id="how" style={{ background: 'white', padding: '64px 32px', marginBottom: 64 }}>
          <h2 className="fade-in" style={{ textAlign: 'center', fontSize: 32, fontWeight: 800, marginBottom: 8, color: '#111' }}>Πώς λειτουργεί</h2>
          <p className="fade-in" style={{ textAlign: 'center', fontSize: 16, color: '#666', marginBottom: 48 }}>Τρία βήματα και είσαι μέσα.</p>
          <div className="steps-row" style={{ display: 'flex', gap: 32, maxWidth: 700, margin: '0 auto', justifyContent: 'center' }}>
            {[
              { num: '1', title: 'Εγγραφή', desc: 'Δημιούργησε λογαριασμό, διάλεξε τάξη και μάθημα.', delay: 'delay-1' },
              { num: '2', title: 'Matchmaking', desc: 'Το σύστημα βρίσκει αντίπαλο του ίδιου επιπέδου μέσα σε δευτερόλεπτα.', delay: 'delay-2' },
              { num: '3', title: 'Παίξε & Ανέβα', desc: 'Απάντησε 5 ερωτήσεις, κέρδισε πόντους ELO, ανέβα στο leaderboard.', delay: 'delay-3' },
            ].map(s => (
              <div key={s.num} className={`fade-in ${s.delay}`} style={{ flex: 1, textAlign: 'center' }}>
                <div className="step-num">{s.num}</div>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: '#111' }}>{s.title}</div>
                <div style={{ fontSize: 14, color: '#666', lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Subjects */}
        <div id="subjects" style={{ padding: '0 32px 64px', maxWidth: 800, margin: '0 auto' }}>
          <h2 className="fade-in" style={{ textAlign: 'center', fontSize: 32, fontWeight: 800, marginBottom: 8, color: '#111' }}>Μαθήματα</h2>
          <p className="fade-in" style={{ textAlign: 'center', fontSize: 16, color: '#666', marginBottom: 32 }}>Καλύπτουμε όλα τα μαθήματα του λυκείου.</p>
          <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {[['∑', 'Μαθηματικά', '#1D9E75'], ['⚛', 'Φυσική', '#378ADD'], ['⚗', 'Χημεία', '#D85A30'], ['📜', 'Ιστορία', '#7F77DD'], ['🧬', 'Βιολογία', '#639922'], ['✍', 'Έκθεση', '#BA7517']].map(([icon, name, color]) => (
              <div key={name} className="subject-pill">
                <span style={{ fontSize: 18, color }}>{icon}</span>
                <span style={{ color: '#111' }}>{name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="cta-section fade-in" style={{ background: 'linear-gradient(135deg, #1D9E75, #0F6E56)', margin: '0 32px 48px', borderRadius: 20, padding: '52px 32px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 30, fontWeight: 900, color: 'white', marginBottom: 8 }}>Έτοιμος να παίξεις;</h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)', marginBottom: 28 }}>Εγγραφή δωρεάν. Χωρίς πιστωτική κάρτα. Χωρίς δικαιολογίες.</p>
          <a href="/login" style={{ background: 'white', color: '#0F6E56', padding: '14px 36px', borderRadius: 12, fontSize: 16, fontWeight: 800, textDecoration: 'none', display: 'inline-block', transition: 'all 0.2s', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>Ξεκίνα τώρα →</a>
        </div>

        {/* Footer */}
        <div style={{ borderTop: '1px solid #e5e7eb', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ fontSize: 16, fontWeight: 800 }}>Panhel<span style={{ color: '#1D9E75' }}>Quiz</span></div>
          <div style={{ fontSize: 13, color: '#888' }}>© 2025 PanhelQuiz · Φτιαγμένο για Έλληνες μαθητές</div>
        </div>

      </main>
    </>
  )
}