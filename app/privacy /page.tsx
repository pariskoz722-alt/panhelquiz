'use client'
import { useTheme } from '../context/ThemeContext'

export default function PrivacyPage() {
  const { dark, toggleDark } = useTheme()

  const c = {
    bg: dark ? '#0A0E14' : '#f9fafb',
    card: dark ? 'rgba(255,255,255,0.03)' : '#fff',
    cardBorder: dark ? 'rgba(255,255,255,0.08)' : '#e5e7eb',
    text: dark ? '#fff' : '#111',
    textSub: dark ? 'rgba(255,255,255,0.6)' : '#444',
    navBg: dark ? 'rgba(10,14,20,0.95)' : 'rgba(255,255,255,0.95)',
    navBorder: dark ? 'rgba(29,158,117,0.2)' : '#e5e7eb',
  }

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        backdropFilter: 'blur(10px)', background: c.navBg,
        borderBottom: `1px solid ${c.navBorder}`,
        padding: '0 24px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', height: 60,
      }}>
        <a href="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: '#1D9E75' }}>
            Panhe<span style={{ color: c.text }}>Quiz</span>
          </span>
        </a>
        <button onClick={toggleDark} style={{
          padding: '6px 12px', borderRadius: 20,
          border: `1px solid ${c.cardBorder}`,
          background: dark ? 'rgba(255,255,255,0.08)' : '#f3f4f6',
          color: c.text, fontSize: 16, cursor: 'pointer',
        }}>{dark ? '☀️' : '🌙'}</button>
      </nav>

      <div style={{ minHeight: '100vh', background: c.bg, paddingTop: 80, paddingBottom: 60, color: c.text }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 20px' }}>
          <div style={{ background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: 20, padding: '40px 48px', boxShadow: dark ? 'none' : '0 1px 4px rgba(0,0,0,0.06)' }}>

            <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8, color: c.text }}>Πολιτική Απορρήτου</h1>
            <p style={{ fontSize: 14, color: '#1D9E75', fontWeight: 600, marginBottom: 32 }}>Τελευταία ενημέρωση: Μάιος 2025</p>

            {[
              {
                title: '1. Εισαγωγή',
                content: 'Η PanhelQuiz ("εμείς", "μας") σέβεται την ιδιωτικότητά σας. Αυτή η Πολιτική Απορρήτου εξηγεί πώς συλλέγουμε, χρησιμοποιούμε και προστατεύουμε τα προσωπικά σας δεδομένα σύμφωνα με τον Γενικό Κανονισμό Προστασίας Δεδομένων (GDPR) της ΕΕ.'
              },
              {
                title: '2. Δεδομένα που Συλλέγουμε',
                content: 'Συλλέγουμε: (α) Στοιχεία λογαριασμού: email, username, τάξη. (β) Δεδομένα παιχνιδιού: αποτελέσματα, ELO, στατιστικά. (γ) Τεχνικά δεδομένα: IP διεύθυνση, τύπος browser, cookies συνεδρίας. Δεν συλλέγουμε ευαίσθητα προσωπικά δεδομένα.'
              },
              {
                title: '3. Νομική Βάση Επεξεργασίας',
                content: 'Επεξεργαζόμαστε τα δεδομένα σας βάσει: (α) Σύμβασης: για την παροχή των υπηρεσιών μας. (β) Συγκατάθεσης: για analytics και non-essential cookies. (γ) Έννομου συμφέροντος: για ασφάλεια και βελτίωση της πλατφόρμας.'
              },
              {
                title: '4. Χρήση Cookies',
                content: 'Χρησιμοποιούμε: (α) Απαραίτητα cookies: για authentication και λειτουργία της πλατφόρμας. (β) Analytics cookies: για κατανόηση της χρήσης (μόνο με συγκατάθεση). Μπορείτε να διαχειριστείτε τα cookies μέσω του banner ή των ρυθμίσεων του browser σας.'
              },
              {
                title: '5. Διαμοιρασμός Δεδομένων',
                content: 'Δεν πωλούμε τα δεδομένα σας. Μοιραζόμαστε δεδομένα μόνο με: Supabase (αποθήκευση δεδομένων, εντός ΕΕ/EEA), Vercel (hosting). Όλοι οι πάροχοι συμμορφώνονται με τον GDPR.'
              },
              {
                title: '6. Δικαιώματά σας (GDPR)',
                content: 'Έχετε δικαίωμα: Πρόσβασης στα δεδομένα σας · Διόρθωσης ανακριβών δεδομένων · Διαγραφής ("δικαίωμα στη λήθη") · Φορητότητας δεδομένων · Εναντίωσης στην επεξεργασία · Ανάκλησης συγκατάθεσης. Επικοινωνήστε μαζί μας στο privacy@panhelquiz.gr.'
              },
              {
                title: '7. Διατήρηση Δεδομένων',
                content: 'Διατηρούμε τα δεδομένα σας όσο ο λογαριασμός σας είναι ενεργός. Μετά τη διαγραφή λογαριασμού, τα δεδομένα διαγράφονται εντός 30 ημερών. Ορισμένα δεδομένα μπορεί να διατηρηθούν για νομικές υποχρεώσεις έως 5 χρόνια.'
              },
              {
                title: '8. Ασφάλεια',
                content: 'Χρησιμοποιούμε κρυπτογράφηση SSL/TLS, Row Level Security στη βάση δεδομένων, και ασφαλή authentication μέσω Supabase Auth. Παρόλα αυτά, καμία μέθοδος μεταφοράς δεδομένων δεν είναι 100% ασφαλής.'
              },
              {
                title: '9. Παιδιά',
                content: 'Η υπηρεσία απευθύνεται σε μαθητές λυκείου (15+ ετών). Δεν συλλέγουμε εν γνώσει μας δεδομένα παιδιών κάτω των 15 ετών. Αν είστε γονέας και πιστεύετε ότι το παιδί σας έχει εγγραφεί, επικοινωνήστε μαζί μας.'
              },
              {
                title: '10. Επικοινωνία',
                content: 'Για ερωτήσεις σχετικά με την Πολιτική Απορρήτου ή για άσκηση των δικαιωμάτων σας: Email: privacy@panhelquiz.gr · Υπεύθυνος Προστασίας Δεδομένων: Paris Koz'
              },
            ].map((section, i) => (
              <div key={i} style={{ marginBottom: 28 }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1D9E75', marginBottom: 10 }}>{section.title}</h2>
                <p style={{ fontSize: 15, color: c.textSub, lineHeight: 1.7 }}>{section.content}</p>
              </div>
            ))}

            <div style={{ marginTop: 40, padding: '20px', borderRadius: 12, background: dark ? 'rgba(29,158,117,0.1)' : 'rgba(29,158,117,0.05)', border: '1px solid rgba(29,158,117,0.2)' }}>
              <p style={{ fontSize: 13, color: c.textSub, margin: 0 }}>
                Με τη χρήση της PanhelQuiz αποδέχεστε αυτή την Πολιτική Απορρήτου. Διατηρούμε το δικαίωμα να την τροποποιούμε — θα σας ειδοποιούμε για σημαντικές αλλαγές.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
