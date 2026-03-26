import React, { useEffect, useState } from 'react'
import { TrendingUp, Calendar, Dog, Loader2 } from 'lucide-react'
import { statsService } from '../services/api'

const RightPanel: React.FC = () => {
  const [stats, setStats]     = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    statsService.getStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const revenue = stats?.total_revenue ?? 0
  const pets    = stats?.total_pets ?? 0
  const appts   = stats?.total_appointments ?? 0
  const recent  = stats?.recent_activity ?? []

  // Donut: distribución visual simple basada en revenue
  const pct = revenue > 0 ? Math.min(Math.round((revenue / (revenue + 50)) * 100), 85) : 30

  return (
    <aside className="right-stats-panel">
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '40px' }}>
          <Loader2 className="animate-spin" size={24} color="var(--primary)" />
        </div>
      ) : (
        <>
          {/* Estadística */}
          <div className="section-header">
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Estadística</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Esta semana</span>
          </div>

          {/* Donut */}
          <div className="donut-chart-container">
            <div style={{
              width: '140px', height: '140px', borderRadius: '50%', position: 'relative',
              background: `conic-gradient(var(--primary) 0% ${pct}%, #e2e8f0 ${pct}% 100%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                width: '90px', height: '90px', borderRadius: '50%', background: '#fff',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Ingresos</span>
                <span style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>${revenue.toLocaleString('es')}</span>
              </div>
            </div>
          </div>

          {/* Leyenda */}
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', fontSize: '12px', color: '#64748b' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '10px', height: '10px', background: 'var(--primary)', borderRadius: '2px' }} />
              Facturado
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '10px', height: '10px', background: '#e2e8f0', borderRadius: '2px' }} />
              Pendiente
            </div>
          </div>

          {/* Mini stats */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <div style={{
              flex: 1, background: '#f8fafc', borderRadius: '10px', padding: '12px',
              textAlign: 'center', border: '1px solid #f1f5f9',
            }}>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>{pets}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Mascotas</div>
            </div>
            <div style={{
              flex: 1, background: '#f8fafc', borderRadius: '10px', padding: '12px',
              textAlign: 'center', border: '1px solid #f1f5f9',
            }}>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>{appts}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Citas</div>
            </div>
          </div>

          {/* Actividad reciente */}
          <div className="transaction-list">
            <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', color: '#0f172a' }}>
              Actividad Reciente
            </h4>
            {recent.length === 0 ? (
              <p style={{ fontSize: '12px', color: '#cbd5e1', textAlign: 'center', padding: '16px 0' }}>
                Sin actividad reciente
              </p>
            ) : recent.slice(0, 5).map((a: any) => (
              <div key={a.id} className="transaction-item">
                <div className="item-icon">
                  <Calendar size={16} />
                </div>
                <div className="item-details">
                  <p style={{ fontWeight: 600, fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px' }}>
                    {a.reason}
                  </p>
                  <p style={{ fontSize: '11px', color: '#94a3b8' }}>
                    {new Date(a.date).toLocaleDateString('es')}
                  </p>
                </div>
                <div className="amount-text">-${a.cost}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </aside>
  )
}

export default RightPanel
