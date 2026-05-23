'use client'
import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

type ToastType = 'success' | 'error' | 'info' | 'win' | 'loss'

interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

interface ToastContextValue {
  addToast: (toast: Omit<Toast, 'id'>) => void
}

const ToastContext = createContext<ToastContextValue>({ addToast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { ...toast, id }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, toast.duration ?? 4500)
  }, [])

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div style={{
        position: 'fixed',
        top: 70,
        right: 16,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        pointerEvents: 'none',
      }}>
        {toasts.map(t => (
          <ToastItem
            key={t.id}
            toast={t}
            onDismiss={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
          />
        ))}
      </div>
      <style>{`@keyframes toastIn{from{transform:translateX(110%);opacity:0}to{transform:translateX(0);opacity:1}}`}</style>
    </ToastContext.Provider>
  )
}

const STYLES: Record<ToastType, { border: string; icon: string; accent: string }> = {
  success: { border: 'rgba(29,158,117,0.5)',  icon: '✓',  accent: '#1D9E75' },
  win:     { border: 'rgba(29,158,117,0.5)',  icon: '🏆', accent: '#1D9E75' },
  loss:    { border: 'rgba(226,75,74,0.5)',   icon: '💔', accent: '#E24B4A' },
  error:   { border: 'rgba(226,75,74,0.5)',   icon: '✕',  accent: '#E24B4A' },
  info:    { border: 'rgba(56,138,221,0.5)',  icon: 'ℹ',  accent: '#378ADD' },
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const s = STYLES[toast.type]
  return (
    <div
      onClick={onDismiss}
      style={{
        pointerEvents: 'auto',
        background: '#111827',
        border: `1px solid ${s.border}`,
        borderLeft: `4px solid ${s.accent}`,
        borderRadius: 12,
        padding: '12px 16px',
        minWidth: 260,
        maxWidth: 340,
        cursor: 'pointer',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        animation: 'toastIn 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>{s.icon}</span>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{toast.title}</div>
          {toast.message && (
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>{toast.message}</div>
          )}
        </div>
      </div>
    </div>
  )
}
