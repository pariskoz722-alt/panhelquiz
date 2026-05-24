'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useTheme } from '../context/ThemeContext'

interface Notification {
  id: string
  type: string
  title: string
  message: string | null
  read: boolean
  created_at: string
  data?: { room_id?: string } | null
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const { dark } = useTheme()

  const unread = notifications.filter(n => !n.read).length

  useEffect(() => {
    // Keep a ref outside the .then() so the cleanup function can reach it
    let channel: ReturnType<typeof supabase.channel> | null = null

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setUserId(user.id)
      fetchNotifications(user.id)

      channel = supabase
        .channel(`notif-bell-${user.id}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        }, payload => {
          setNotifications(prev => [payload.new as Notification, ...prev].slice(0, 30))
        })
        .subscribe()
    })

    // Cleanup runs when component unmounts — the channel ref is reachable here
    return () => { if (channel) supabase.removeChannel(channel) }
  }, [])

  async function fetchNotifications(uid: string) {
    const { data } = await supabase
      .from('notifications')
      .select('id, type, title, message, read, created_at, data')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
      .limit(30)
    if (data) setNotifications(data)
  }

  async function markAllRead() {
    if (!userId) return
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  // Close on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  const c = {
    panel: dark ? '#0D1117' : '#ffffff',
    border: dark ? 'rgba(255,255,255,0.1)' : '#e5e7eb',
    text: dark ? '#fff' : '#111',
    textSub: dark ? 'rgba(255,255,255,0.5)' : '#666',
    rowBorder: dark ? 'rgba(255,255,255,0.05)' : '#f3f4f6',
    unreadBg: dark ? 'rgba(29,158,117,0.07)' : 'rgba(29,158,117,0.05)',
    btnColor: dark ? 'rgba(255,255,255,0.55)' : '#555',
  }

  function typeIcon(type: string) {
    const icons: Record<string, string> = {
      game_result: '🎮',
      match_found: '⚔️',
      rank_milestone: '🏆',
      rematch: '⚔️',
      system: '📢',
    }
    return icons[type] ?? '🔔'
  }

  function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 1) return 'μόλις τώρα'
    if (m < 60) return `${m}λ πριν`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}ω πριν`
    return `${Math.floor(h / 24)}μ πριν`
  }

  function handleOpen() {
    const willOpen = !open
    setOpen(willOpen)
    if (willOpen && unread > 0) markAllRead()
  }

  return (
    <div ref={panelRef} style={{ position: 'relative' }}>
      <button
        onClick={handleOpen}
        aria-label="Ειδοποιήσεις"
        style={{
          position: 'relative',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '6px 8px',
          borderRadius: 8,
          color: c.btnColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unread > 0 && (
          <span style={{
            position: 'absolute',
            top: 2,
            right: 2,
            background: '#E24B4A',
            color: '#fff',
            borderRadius: '50%',
            width: 16,
            height: 16,
            fontSize: 9,
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
          }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          width: 320,
          background: c.panel,
          border: `1px solid ${c.border}`,
          borderRadius: 14,
          boxShadow: '0 16px 48px rgba(0,0,0,0.22)',
          zIndex: 1000,
          overflow: 'hidden',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '14px 16px',
            borderBottom: `1px solid ${c.border}`,
          }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: c.text }}>Ειδοποιήσεις</span>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                style={{ fontSize: 11, color: '#1D9E75', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
              >
                Διαβάστηκαν όλα
              </button>
            )}
          </div>

          <div style={{ maxHeight: 360, overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '28px 16px', textAlign: 'center', color: c.textSub, fontSize: 13 }}>
                Δεν έχεις ειδοποιήσεις ακόμα
              </div>
            ) : notifications.map(n => (
              <div key={n.id}
                onClick={() => { if (n.data?.room_id) window.location.href = `/game?room=${n.data.room_id}` }}
                style={{
                  display: 'flex',
                  gap: 10,
                  alignItems: 'flex-start',
                  padding: '12px 16px',
                  borderBottom: `1px solid ${c.rowBorder}`,
                  background: n.read ? 'transparent' : c.unreadBg,
                  cursor: n.data?.room_id ? 'pointer' : 'default',
                }}>
                <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{typeIcon(n.type)}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: c.text, lineHeight: 1.3 }}>{n.title}</div>
                  {n.message && (
                    <div style={{ fontSize: 12, color: c.textSub, marginTop: 2 }}>{n.message}</div>
                  )}
                  <div style={{ fontSize: 11, color: dark ? 'rgba(255,255,255,0.28)' : '#aaa', marginTop: 4 }}>{timeAgo(n.created_at)}</div>
                </div>
                {!n.read && (
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#1D9E75', flexShrink: 0, marginTop: 5 }} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
