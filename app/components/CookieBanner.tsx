'use client'
import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)
  const { dark } = useTheme()

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) setTimeout(() => setVisible(true), 1000)
  }, [])

  function accept() {
    localStorage.setItem('cookie-consent', 'accepted')
    setVisible(false)
  }

  function decline() {
    localStorage.setItem('cookie-consent', 'declined')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed', bottom: 'max(20px, calc(env(safe-area-inset-bottom) + 12px))', left: 20, right: 20, zIndex: 9999,
      maxWidth: 520, margin: '0 auto',
      background: dark ? '#1a1a2e' : '#fff',
      border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : '#e5e7eb'}`,
      borderRadius: 16, padding: '20px 24px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
      animation: 'slideUp 0.4s ease',
    }}>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <span style={{ fontSize: 24 }}>🍪</span>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: dark ? '#fff' : '#111', marginBottom: 4 }}>
            Χρησιμοποιούμε cookies
          </div>
          <div style={{ fontSize: 13, color: dark ? 'rgba(255,255,255,0.6)' : '#666', lineHeight: 1.5 }}>
            Χρησιμοποιούμε απαραίτητα cookies για τη λειτουργία της πλατφόρμας και analytics για να βελτιώνουμε την εμπειρία σου. Δες την{' '}
            <a href="/privacy" style={{ color: '#1D9E75', fontWeight: 600 }}>Πολιτική Απορρήτου</a> μας.
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button onClick={decline} style={{
          padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
          background: 'transparent', border: `1px solid ${dark ? 'rgba(255,255,255,0.2)' : '#e5e7eb'}`,
          color: dark ? 'rgba(255,255,255,0.6)' : '#666', fontSize: 13, fontWeight: 600,
        }}>Απόρριψη</button>
        <button onClick={accept} style={{
          padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
          background: 'linear-gradient(135deg, #1D9E75, #0F6E56)',
          border: 'none', color: '#fff', fontSize: 13, fontWeight: 700,
          boxShadow: '0 4px 12px rgba(29,158,117,0.3)',
        }}>Αποδοχή</button>
      </div>
    </div>
  )
}