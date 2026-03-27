import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Bell, Calendar, Syringe, Package, X, AlertCircle } from 'lucide-react'
import type { Notification } from '../types'

const API_URL = import.meta.env.VITE_API_URL as string
const WS_URL = API_URL.replace('http', 'ws')

const ICON_MAP: Record<string, React.ReactNode> = {
  appointment_today: <Calendar size={16} color="#dc2626" />,
  appointment_tomorrow: <Calendar size={16} color="#d97706" />,
  vaccine_reminder: <Syringe size={16} color="#7c3aed" />,
  low_stock: <Package size={16} color="#ea580c" />,
}

const PRIORITY_COLORS: Record<string, { bg: string; dot: string }> = {
  high: { bg: '#fef2f2', dot: '#dc2626' },
  medium: { bg: '#fffbeb', dot: '#d97706' },
  low: { bg: '#f0fdf4', dot: '#16a34a' },
}

const NotificationCenter: React.FC<{ dark?: boolean }> = ({ dark }) => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const wsRef = useRef<WebSocket | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const connectWs = useCallback(() => {
    const ws = new WebSocket(`${WS_URL}/notifications/ws`)

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'initial' || data.type === 'update') {
          setNotifications(data.notifications || [])
        } else if (data.type === 'new') {
          setNotifications(prev => [data.notification, ...prev])
        }
      } catch (e) { console.error('WS parse error', e) }
    }

    ws.onclose = () => {
      // Reconnect after 5 seconds
      setTimeout(connectWs, 5000)
    }

    wsRef.current = ws
  }, [])

  useEffect(() => {
    connectWs()
    return () => { wsRef.current?.close() }
  }, [connectWs])

  // Close panel on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const dismiss = (id: string) => {
    setDismissed(prev => new Set(prev).add(id))
  }

  const visible = notifications.filter(n => !dismissed.has(n.id))
  const highCount = visible.filter(n => n.priority === 'high').length

  const bellColor = dark
    ? (visible.length > 0 ? '#fff' : '#7aaa8a')
    : (visible.length > 0 ? '#0f172a' : '#94a3b8')

  return (
    <div ref={panelRef} style={{ position: 'relative' }}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: '8px',
          position: 'relative', display: 'flex', alignItems: 'center',
        }}
      >
        <Bell size={20} color={bellColor} />
        {visible.length > 0 && (
          <span style={{
            position: 'absolute', top: '2px', right: '2px',
            width: '18px', height: '18px', borderRadius: '50%',
            background: highCount > 0 ? '#dc2626' : '#d97706',
            color: 'white', fontSize: '10px', fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {visible.length > 9 ? '9+' : visible.length}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, width: '380px',
          background: 'white', borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          zIndex: 1000, overflow: 'hidden', maxHeight: '480px', display: 'flex', flexDirection: 'column',
        }}>
          {/* Header */}
          <div style={{
            padding: '16px 18px', borderBottom: '1px solid #f1f5f9',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>Notificaciones</h4>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>
              {visible.length} pendiente{visible.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* List */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {visible.length > 0 ? visible.map(n => {
              const priority = PRIORITY_COLORS[n.priority] || PRIORITY_COLORS.low
              return (
                <div key={n.id} style={{
                  padding: '14px 18px', borderBottom: '1px solid #f8fafc',
                  display: 'flex', gap: '12px', alignItems: 'flex-start',
                  background: priority.bg,
                }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    background: 'white', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', flexShrink: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                  }}>
                    {ICON_MAP[n.type] || <AlertCircle size={16} color="#64748b" />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{
                        width: '6px', height: '6px', borderRadius: '50%',
                        background: priority.dot, flexShrink: 0,
                      }} />
                      <span style={{ fontWeight: 600, fontSize: '13px', color: '#0f172a' }}>{n.title}</span>
                    </div>
                    <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>
                      {n.message}
                    </p>
                  </div>
                  <button
                    onClick={() => dismiss(n.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: '#94a3b8', flexShrink: 0 }}
                  >
                    <X size={14} />
                  </button>
                </div>
              )
            }) : (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                <Bell size={32} style={{ margin: '0 auto 8px', opacity: 0.3, display: 'block' }} />
                <p style={{ margin: 0, fontSize: '13px' }}>No hay notificaciones pendientes</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationCenter
