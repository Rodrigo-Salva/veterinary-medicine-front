import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  Dog, Calendar, DollarSign, Users,
  Activity, Bell, Loader2, UserCircle,
} from 'lucide-react'
import { statsService } from '../services/api'
import VaccineReminders from './VaccineReminders'
import PetList from './PetList'
import HeaderActions from './HeaderActions'

// ── Utilidades de fecha/hora en español ──────────────────────────────────────
const getSaludo = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 18) return 'Buenas tardes'
  return 'Buenas noches'
}

const getFechaES = () =>
  new Date().toLocaleDateString('es', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

// ── Componente KPI ────────────────────────────────────────────────────────────
interface KpiProps {
  label: string
  value: string | number
  sub: string
  dark?: boolean
  prefix?: string
  icon: React.ReactNode
  accent?: string
}

const KpiCard: React.FC<KpiProps> = ({ label, value, sub, dark, prefix, icon, accent }) => {
  const bg = dark ? '#0d2b2b' : '#ffffff'
  const textMain = dark ? '#ffffff' : 'var(--text-primary)'
  const textSub = dark ? 'rgba(255,255,255,0.5)' : 'var(--text-secondary)'
  const iconBg = dark ? 'rgba(34,197,94,0.18)' : '#f0fdf4'
  const iconColor = dark ? '#22c55e' : 'var(--primary)'
  const accentUsed = accent ?? (dark ? '#22c55e' : 'var(--primary)')

  return (
    <div
      className="stat-card-main"
      style={{ background: bg, color: textMain }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: textSub, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {label}
        </span>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: iconBg, display: 'flex', alignItems: 'center',
          justifyContent: 'center', color: iconColor, flexShrink: 0,
        }}>
          {icon}
        </div>
      </div>
      <div style={{ fontSize: '34px', fontWeight: 800, lineHeight: 1, color: dark ? '#ffffff' : accentUsed }}>
        {prefix && <span style={{ fontSize: '22px', fontWeight: 700 }}>{prefix}</span>}
        {value}
      </div>
      <div style={{ fontSize: '12px', color: textSub, marginTop: '8px' }}>{sub}</div>
    </div>
  )
}

// ── Dashboard principal ───────────────────────────────────────────────────────
const Dashboard: React.FC = () => {
  const { user } = useAuth()
  const [stats, setStats]     = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    statsService.getStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="dashboard-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
      <Loader2 className="animate-spin" size={48} color="var(--primary)" />
    </div>
  )

  return (
    <div className="dashboard-container">

      {/* ── Saludo ── */}
      <div className="header-row" style={{ marginBottom: 20 }}>
        <div className="greetings">
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {getSaludo()}, {user?.username}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px', textTransform: 'capitalize' }}>
            {getFechaES()}
          </p>
        </div>
        <HeaderActions />
      </div>

      {/* ── KPI Cards (4 columnas: oscura, clara, clara, oscura) ── */}
      <div className="stats-cards-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <KpiCard
          dark
          icon={<Dog size={18} />}
          label="Total Pacientes"
          value={stats?.total_pets ?? 0}
          sub="Activos en el sistema"
        />
        <KpiCard
          icon={<Calendar size={18} />}
          label="Citas"
          value={stats?.total_appointments ?? 0}
          sub="Historial de citas"
          accent="var(--primary)"
        />
        <KpiCard
          icon={<Users size={18} />}
          label="Propietarios"
          value={stats?.total_owners ?? 0}
          sub="Clientes registrados"
          accent="var(--primary)"
        />
        <KpiCard
          dark
          icon={<DollarSign size={18} />}
          label="Ingresos Totales"
          value={(stats?.total_revenue ?? 0).toLocaleString('es')}
          prefix="$"
          sub="Facturación acumulada"
        />
      </div>

      {/* ── Dos columnas: Próximas Vacunas + Actividad Reciente ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

        {/* Próximas vacunas */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Bell size={16} color="var(--primary)" />
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Próximas Vacunas
            </h3>
          </div>
          <VaccineReminders />
        </div>

        {/* Actividad reciente */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Activity size={16} color="var(--primary)" />
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Actividad Reciente
            </h3>
          </div>
          <div style={{ background: '#ffffff', borderRadius: '16px', boxShadow: 'var(--shadow)', overflow: 'hidden', border: '1.5px solid rgba(34,197,94,0.15)' }}>
            {stats?.recent_activity?.length > 0 ? (
              stats.recent_activity.map((a: any, i: number) => (
                <div key={a.id ?? i} style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px',
                  borderBottom: i < stats.recent_activity.length - 1 ? '1px solid #f0f6f0' : 'none',
                }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    background: '#f0fdf4', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Calendar size={16} color="var(--primary)" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {a.reason}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {new Date(a.date).toLocaleDateString('es')}
                    </div>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--error)' }}>
                    -${a.cost}
                  </span>
                </div>
              ))
            ) : (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
                Sin actividad reciente
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Pacientes recientes ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Dog size={16} color="var(--primary)" />
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Pacientes Registrados
          </h3>
        </div>
        <PetList />
      </div>

    </div>
  )
}

export default Dashboard
