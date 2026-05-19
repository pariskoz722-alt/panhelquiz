export default function Home() {
  return (
    <main style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: 'sans-serif' }}>

      {/* Navbar */}
      <nav style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '0 32px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 20, fontWeight: 800 }}>Panhel<span style={{ color: '#1D9E75' }}>Quiz</span></div>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <a href="#" style={{ fontSize: 14, color: '#666', textDecoration: 'none' }}>Πώς λειτουργεί</a>
          <a href="#" style={{ fontSize: 14, color: '#666', textDecoration: 'none' }}>Μαθήματα</a>
          <a href="/login" style={{ background: '#1D9E75', color: 'white', padding: '8px 18px', borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>Εγγραφή</a>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '72px 20px 56px', maxWidth: 640, margin: '0 auto' }}>
        <div style={{ display: 'inline-block', background: '#E1F5EE', color: '#0F6E56', fontSize: 12, fontWeight: 700, padding: '5px 14px', borderRadius: 20, marginBottom: 24 }}>Για μαθητές λυκείου · Δωρεάν</div>
        <h1 style={{ fontSize: 44, fontWeight: 900, letterSpacing: -2, lineHeight: 1.15, marginBottom: 18, color: '#111' }}>
          Διάβασε λιγότερο.<br/><span style={{ color: '#1D9E75' }}>Μάθε περισσότερο.</span>
        </h1>
        <p style={{ fontSize: 18, color: '#666', lineHeight: 1.6, marginBottom: 32 }}>Παίξε 1v1 quiz με συμμαθητές σου στα μαθήματα των Πανελληνίων. Ανέβα στη βαθμολογία και μάθε χωρίς να το καταλαβαίνεις.</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/login" style={{ background: '#1D9E75', color: 'white', padding: '14px 28px', borderRadius: 12, fontSize: 16, fontWeight: 700, textDecoration: 'none' }}>▶ Παίξε τώρα — δωρεάν</a>
          <a href="#how" style={{ background: 'white', color: '#111', padding: '14px 28px', borderRadius: 12, fontSize: 16, fontWeight: 500, textDecoration: 'none', border: '1px solid #e5e7eb' }}>Δες πώς λειτουργεί</a>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', justifyContent: 'center', borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb', marginBottom: 56 }}>
        {[['12.400+', 'Μαθητές'], ['850+', 'Ερωτήσεις'], ['6', 'Μαθήματα'], ['3', 'Τάξεις']].map(([num, label]) => (
          <div key={label} style={{ flex: 1, maxWidth: 180, padding: '20px 16px', textAlign: 'center', borderRight: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#1D9E75', letterSpacing: -1 }}>{num}</div>
            <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Features */}
      <div style={{ padding: '0 32px 56px', maxWidth: 720, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: 28, fontWeight: 800, letterSpacing: -0.5, marginBottom: 8, color: '#111' }}>Γιατί PanhelQuiz;</h2>
        <p style={{ textAlign: 'center', fontSize: 15, color: '#666', marginBottom: 32 }}>Δεν είναι απλώς quiz. Είναι ο πιο έξυπνος τρόπος να ετοιμαστείς.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {[
            { icon: '⚔️', title: '1v1 real-time battles', desc: 'Παίξε κατά μέτωπο με άλλους μαθητές της ίδιας τάξης σου.' },
            { icon: '📈', title: 'Σύστημα ELO', desc: 'Ανέβα ή κατέβα στη βαθμολογία. Το matchmaking βρίσκει ισάξιους αντιπάλους.' },
            { icon: '⏱', title: 'Χρονόμετρο πίεσης', desc: '15 δευτερόλεπτα ανά ερώτηση. Γρήγορη σκέψη, σαν τις αληθινές εξετάσεις.' },
            { icon: '👥', title: 'Matchmaking ανά τάξη', desc: 'Α΄, Β΄, Γ΄ Λυκείου — παίζεις με μαθητές του ίδιου επιπέδου.' },
            { icon: '🏆', title: 'Leaderboard', desc: 'Εθνική κατάταξη ανά μάθημα. Ποιος είναι ο καλύτερος;' },
            { icon: '📱', title: 'Mobile-first', desc: 'Παίξε από το κινητό σου, οποιαδήποτε ώρα, οπουδήποτε.' },
          ].map(f => (
            <div key={f.title} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 24, marginBottom: 10 }}>{f.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 6 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: '#666', lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div id="how" style={{ background: 'white', padding: '40px 32px', marginBottom: 56 }}>
        <h2 style={{ textAlign: 'center', fontSize: 28, fontWeight: 800, marginBottom: 8, color: '#111' }}>Πώς λειτουργεί</h2>
        <p style={{ textAlign: 'center', fontSize: 15, color: '#666', marginBottom: 32 }}>Τρία βήματα και είσαι μέσα.</p>
        <div style={{ display: 'flex', gap: 0, maxWidth: 600, margin: '0 auto', justifyContent: 'center' }}>
          {[['1', 'Εγγραφή', 'Δημιούργησε λογαριασμό, διάλεξε τάξη και μάθημα.'], ['2', 'Matchmaking', 'Το σύστημα βρίσκει αντίπαλο του ίδιου επιπέδου μέσα σε δευτερόλεπτα.'], ['3', 'Παίξε & Ανέβα', 'Απάντησε 5 ερωτήσεις, κέρδισε πόντους ELO, ανέβα στο leaderboard.']].map(([num, title, desc]) => (
            <div key={num} style={{ flex: 1, textAlign: 'center', padding: '0 16px' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#1D9E75', color: 'white', fontSize: 16, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>{num}</div>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6, color: '#111' }}>{title}</div>
              <div style={{ fontSize: 13, color: '#666', lineHeight: 1.4 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ background: '#E1F5EE', margin: '0 32px 32px', borderRadius: 16, padding: '40px 32px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: '#085041', marginBottom: 8 }}>Έτοιμος να παίξεις;</h2>
        <p style={{ fontSize: 15, color: '#0F6E56', marginBottom: 24 }}>Εγγραφή δωρεάν. Χωρίς πιστωτική κάρτα.</p>
        <a href="/login" style={{ background: '#1D9E75', color: 'white', padding: '14px 36px', borderRadius: 12, fontSize: 16, fontWeight: 800, textDecoration: 'none' }}>Ξεκίνα τώρα</a>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid #e5e7eb', padding: '20px 32px', display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#666' }}>
        <div style={{ fontWeight: 700, color: '#111' }}>Panhel<span style={{ color: '#1D9E75' }}>Quiz</span></div>
        <div>© 2025 PanhelQuiz · Φτιαγμένο για Έλληνες μαθητές</div>
      </div>

    </main>
  )
}