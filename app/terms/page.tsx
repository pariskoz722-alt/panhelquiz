'use client';
import { useTheme } from '../context/ThemeContext';

export default function TermsPage() {
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
            <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8, color: c.text }}>Όροι Χρήσης</h1>
            <p style={{ fontSize: 14, color: '#1D9E75', fontWeight: 600, marginBottom: 32 }}>Τελευταία ενημέρωση: Μάιος 2025</p>
            {[
              { title: '1. Αποδοχή Όρων', content: 'Χρησιμοποιώντας την υπηρεσία PanhelQuiz αποδέχεστε πλήρως τους παρόντες Όρους Χρήσης. Αν δεν συμφωνείτε, παρακαλούμε να μην χρησιμοποιείτε την υπηρεσία.' },
              { title: '2. Ηλικιακή Απαίτηση', content: 'Η υπηρεσία απευθύνεται σε χρήστες 15 ετών και άνω. Εγγραφόμενοι δηλώνετε ότι είστε τουλάχιστον 15 ετών. Αν είστε κάτω των 15, χρειάζεστε γονική συναίνεση.' },
              { title: '3. Λογαριασμός Χρήστη', content: 'Είστε υπεύθυνοι για την ασφάλεια του λογαριασμού σας. Απαγορεύεται η κοινοποίηση κωδικών, η δημιουργία πολλαπλών λογαριασμών και η χρήση ψευδών στοιχείων.' },
              { title: '4. Κανόνες Συμπεριφοράς', content: 'Απαγορεύεται: η χρήση cheats ή bots, η παρενόχληση άλλων χρηστών, η διαδικτυακή βία, η δημοσίευση ανάρμοστου περιεχομένου και οποιαδήποτε παράνομη χρήση.' },
              { title: '5. Πνευματική Ιδιοκτησία', content: 'Όλο το περιεχόμενο της PanhelQuiz (κώδικας, ερωτήσεις, σχεδιασμός) προστατεύεται από πνευματικά δικαιώματα. Απαγορεύεται η αντιγραφή χωρίς άδεια.' },
              { title: '6. Δωρεάν Υπηρεσία', content: 'Η βασική υπηρεσία παρέχεται δωρεάν. Διατηρούμε το δικαίωμα να εισάγουμε premium χαρακτηριστικά στο μέλλον με προηγούμενη ειδοποίηση.' },
              { title: '7. Διακοπή Υπηρεσίας', content: 'Διατηρούμε το δικαίωμα να αναστείλουμε ή τερματίσουμε λογαριασμούς που παραβιάζουν τους Όρους Χρήσης, χωρίς προηγούμενη ειδοποίηση.' },
              { title: '8. Αποποίηση Ευθύνης', content: 'Η PanhelQuiz παρέχεται "ως έχει". Δεν εγγυόμαστε αδιάλειπτη λειτουργία ή ακρίβεια των ερωτήσεων. Δεν φέρουμε ευθύνη για ζημίες από τη χρήση της υπηρεσίας.' },
              { title: '9. Τροποποιήσεις', content: 'Διατηρούμε το δικαίωμα να τροποποιούμε τους Όρους Χρήσης. Θα ειδοποιούμε για σημαντικές αλλαγές μέσω email ή ανακοίνωσης στην πλατφόρμα.' },
              { title: '10. Εφαρμοστέο Δίκαιο', content: 'Οι παρόντες Όροι διέπονται από το Ελληνικό Δίκαιο και το Δίκαιο της ΕΕ. Για οποιαδήποτε διαφορά αρμόδια είναι τα δικαστήρια της Αθήνας.' },
            ].map((s, i) => (
              <div key={i} style={{ marginBottom: 28 }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1D9E75', marginBottom: 10 }}>{s.title}</h2>
                <p style={{ fontSize: 15, color: c.textSub, lineHeight: 1.7 }}>{s.content}</p>
              </div>
            ))}
            <div style={{ marginTop: 40, padding: '20px', borderRadius: 12, background: dark ? 'rgba(29,158,117,0.1)' : 'rgba(29,158,117,0.05)', border: '1px solid rgba(29,158,117,0.2)' }}>
              <p style={{ fontSize: 13, color: c.textSub, margin: 0 }}>Επικοινωνία: terms@panhelquiz.gr · © 2025 PanhelQuiz</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
