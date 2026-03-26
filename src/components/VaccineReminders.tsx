import React, { useEffect, useState } from 'react'
import { vaccineService } from '../services/api'
import { VaccineReminder } from '../types'
import { Syringe, Calendar, Loader2 } from 'lucide-react'

const VaccineReminders: React.FC = () => {
  const [reminders, setReminders] = useState<VaccineReminder[]>([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    vaccineService.getUpcoming(30)
      .then(setReminders)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ padding: '24px', textAlign: 'center' }}>
      <Loader2 size={24} className="animate-spin" color="var(--primary)" style={{ margin: '0 auto' }} />
    </div>
  )

  return (
    <div style={{ background: '#fff', borderRadius: '16px', boxShadow: 'var(--shadow)', overflow: 'hidden', border: '1.5px solid rgba(34,197,94,0.15)' }}>
      {reminders.length === 0 ? (
        <div style={{ padding: '28px', textAlign: 'center', color: '#cbd5e1' }}>
          <Syringe size={28} style={{ margin: '0 auto 8px', opacity: .3, display: 'block' }} />
          <p style={{ margin: 0, fontSize: '13px' }}>No hay vacunas programadas en los próximos 30 días</p>
        </div>
      ) : (
        reminders.map((r, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px',
            borderBottom: i < reminders.length - 1 ? '1px solid #f8fafc' : 'none',
          }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px', background: '#fffbeb',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Syringe size={16} color="#d97706" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '13px', color: '#0f172a' }}>{r.pet_name}</div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>{r.record_type} · {r.owner_name}</div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '12px', color: '#d97706' }}>
                {new Date(r.next_date).toLocaleDateString('es')}
              </div>
              <div style={{ fontSize: '10px', color: '#f59e0b', fontWeight: 600, textTransform: 'uppercase' }}>Pendiente</div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default VaccineReminders
