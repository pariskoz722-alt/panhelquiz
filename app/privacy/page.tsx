'use client';
import { useTheme } from '../context/ThemeContext';

export default function PrivacyPage() {
  const { dark, toggleDark } = useTheme();
  const c = {
    bg: dark ? '#0A0E14' : '#f9fafb',
    card: dark ? 'rgba(255,255,255,0.03)' : '#fff',
    cardBorder: dark ? 'rgba(255,255,255,0.08)' : '#e5e7eb',
    text: dark ? '#ffffff' : '#111827',
    textSub: dark ? 'rgba(255,255,255,0.6)' : '#444',
    navBg: dark ? 'rgba(10,14,20,0.95)' : 'rgba(255,255,255,0.95)',
    navBorder: dark ? 'rgba(29,158,117,0.2)' : '#e5e7eb',
  };
  return (
    <>
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, backdropFilter: 'blur(10px)', background: c.navBg, borderBottom: `1px solid ${c.navBorder}`, padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
        <a href="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: '#1D9E75' }}>Panhe<span style={{ color: c.text }}>Quiz</span></span>
        </a>
        <button onClick={toggleDark} style={{ padding: '6px 12px', borderRadius: 20, border: `1px solid ${c.cardBorder}`, background: dark ? 'rgba(255,255,255,0.08)' : '#f3f4f6', color: c.text, fontSize: 16, cursor: 'pointer' }}>{dark ? '☀️' : '🌙'}</button>
      </nav>
      <div style={{ minHeight: '100vh', background: c.bg, paddingTop: 80, paddingBottom: 60, color: c.text }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 20px' }}>
          <div style={{ background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: 20, padding: '40px 48px' }}>
            <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8, color: c.text }}>Πολιτική Απορρήτου</h1>
            <p style={{ fontSize: 14, color: '#1D9E75', fontWeight: 600, marginBottom: 32 }}>Τελευταία ενημέρωση: Μάιος 2025</p>
            {[
              { title: '1. Εισαγωγή', content: 'Η PanhelQuiz σέβεται την ιδιωτικότητά σας. Αυτή η Πολιτική Απορρήτου εξηγεί πώς συλλέγουμε, χρησιμοποιούμε και προστατεύουμε τα προσωπικά σας δεδομένα σύμφωνα με τον GDPR.' },
              { title: '2. Δεδομένα που Συλλέγουμε', content: 'Συλλέγουμε: email, username, τάξη, αποτελέσματα παιχνιδιού, ELO, στατιστικά, IP διεύθυνση, τύπο browser και cookies συνεδρίας. Δεν συλλέγουμε ευαίσθητα προσωπικά δεδομένα.' },
              { title: '3. Νομική Βάση Επεξεργασίας', content: 'Επεξεργαζόμαστε τα δεδομένα σας βάσει σύμβασης για την παροχή υπηρεσιών, συγκατάθεσης για analytics και έννομου συμφέροντος για ασφάλεια.' },
              { title: '4. Χρήση Cookies', content: 'Χρησιμοποιούμε απαραίτητα cookies για authentication και analytics cookies μόνο με συγκατάθεση. Μπορείτε να τα διαχειριστείτε μέσω του banner.' },
              { title: '5. Διαμοιρασμός Δεδομένων', content: 'Δεν πωλούμε τα δεδομένα σας. Μοιραζόμαστε δεδομένα μόνο με Supabase (αποθήκευση, εντός ΕΕ) και Vercel (hosting). Όλοι συμμορφώνονται με τον GDPR.' },
              { title: '6. Δικαιώματά σας (GDPR)', content: 'Έχετε δικαίωμα πρόσβασης, διόρθωσης, διαγραφής, φορητότητας, εναντίωσης και ανάκλησης συγκατάθεσης. Επικοινωνήστε: privacy@panhelquiz.gr' },
              { title: '7. Διατήρηση Δεδομένων', content: 'Διατηρούμε τα δεδομένα σας όσο ο λογαριασμός είναι ενεργός. Μετά τη διαγραφή, τα δεδομένα διαγράφονται εντός 30 ημερών.' },
              { title: '8. Ασφάλεια', content: 'Χρησιμοποιούμε κρυπτογράφηση SSL/TLS, Row Level Security στη βάση δεδομένων και ασφαλή authentication μέσω Supabase Auth.' },
              { title: '9. Παιδιά', content: 'Η υπηρεσία απευθύνεται σε μαθητές 15+ ετών. Δεν συλλέγουμε δεδομένα παιδιών κάτω των 15. Αν είστε γονέας επικοινωνήστε μαζί μας.' },
              { title: '10. Επικοινωνία', content: 'Για ερωτήσεις: privacy@panhelquiz.gr · Υπεύθυνος Προστασίας Δεδομένων: Paris Koz' },
            ].map((s, i) => (
              <div key={i} style={{ marginBottom: 28 }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1D9E75', marginBottom: 10 }}>{s.title}</h2>
                <p style={{ fontSize: 15, color: c.textSub, lineHeight: 1.7 }}>{s.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
