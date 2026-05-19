export default function Home() {
  return (
    <main style={{
      fontFamily: 'sans-serif',
      minHeight: '100vh',
      background: '#f9fafb',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '40px 20px'
    }}>
      <h1 style={{ fontSize: 40, fontWeight: 900, letterSpacing: -1, marginBottom: 12 }}>
        Panhel<span style={{ color: '#1D9E75' }}>Quiz</span>
      </h1>
      <p style={{ fontSize: 18, color: '#666', marginBottom: 32 }}>
        Διαβάζεις. Διασκεδάζεις. Κερδίζεις.
      </p>
      <a href="/lobby" style={{
        background: '#1D9E75', color: 'white',
        padding: '14px 32px', borderRadius: 12,
        fontSize: 16, fontWeight: 700, textDecoration: 'none'
      }}>
        Παίξε τώρα →
      </a>
    </main>
  )
}