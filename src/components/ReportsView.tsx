import React, { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import { statsService } from '../services/api'
import { TrendingUp, Users, Calendar, DollarSign, Dog, Trophy, User as UserIcon } from 'lucide-react'

const PIE_COLORS = ['#6366f1','#10b981','#f59e0b','#8b5cf6','#ef4444','#06b6d4','#ec4899']
const AVATAR_COLORS = ['#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6']
const avatarColor = (s: string) => AVATAR_COLORS[(s?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length]

const KPI: React.FC<{ icon: React.ReactNode; iconBg: string; iconColor: string; value: string | number; label: string }> =
  ({ icon, iconBg, iconColor, value, label }) => (
    <div className="stat-card-main" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
      <div style={{
        width: '48px', height: '48px', borderRadius: '12px', background: iconBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        {React.cloneElement(icon as React.ReactElement, { color: iconColor, size: 22 })}
      </div>
      <div>
        <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>{label}</div>
      </div>
    </div>
  )

const ReportsView: React.FC = () => {
  const [overview, setOverview]     = useState<any>(null)
  const [monthly, setMonthly]       = useState<any[]>([])
  const [species, setSpecies]       = useState<any[]>([])
  const [topOwners, setTopOwners]   = useState<any[]>([])
  const [chart, setChart]           = useState<'appointments' | 'revenue'>('appointments')

  useEffect(() => {
    statsService.getStats().then(setOverview).catch(() => {})
    statsService.getMonthly().then(setMonthly).catch(() => {})
    statsService.getSpecies().then(setSpecies).catch(() => {})
    statsService.getTopOwners().then(setTopOwners).catch(() => {})
  }, [])

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="header-row" style={{ marginBottom: 0 }}>
        <div className="greetings">
          <h2 style={{ fontSize: '24px', fontWeight: 700 }}>Reportes & Estadísticas</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Métricas y tendencias del sistema</p>
        </div>
      </div>

      {/* KPI cards */}
      <div className="stats-cards-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        <KPI icon={<Users />} iconBg="#eff6ff" iconColor="#3b82f6" value={overview?.total_pets ?? '—'} label="Total Mascotas" />
        <KPI icon={<Users />} iconBg="#f0fdf4" iconColor="#10b981" value={overview?.total_owners ?? '—'} label="Total Dueños" />
        <KPI icon={<Calendar />} iconBg="#fffbeb" iconColor="#f59e0b" value={overview?.total_appointments ?? '—'} label="Total Citas" />
        <KPI icon={<DollarSign />} iconBg="#faf5ff" iconColor="#8b5cf6" value={`$${(overview?.total_revenue ?? 0).toLocaleString()}`} label="Ingresos Totales" />
      </div>

      {/* Bar chart */}
      <div className="section-card" style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#0f172a', fontSize: '15px' }}>
            <TrendingUp size={16} color="var(--primary)" /> Tendencia Mensual (12 meses)
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {(['appointments', 'revenue'] as const).map(k => (
              <button
                key={k}
                onClick={() => setChart(k)}
                className="btn"
                style={{
                  padding: '5px 14px', fontSize: '12px',
                  background: chart === k ? 'var(--primary)' : '#f1f5f9',
                  color: chart === k ? '#fff' : '#64748b',
                }}
              >
                {k === 'appointments' ? 'Citas' : 'Ingresos'}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={monthly} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
            <Tooltip
              contentStyle={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
              labelStyle={{ color: '#0f172a', fontWeight: 600 }}
            />
            {chart === 'appointments'
              ? <Bar dataKey="appointments" fill="#6366f1" radius={[4, 4, 0, 0]} name="Citas" />
              : <Bar dataKey="revenue" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Ingresos $" />
            }
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Pie chart */}
        <div className="section-card" style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow)' }}>
          <div style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><Dog size={16} color="var(--primary)" /> Mascotas por Especie</div>
          {species.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={species} dataKey="count" nameKey="species"
                  cx="50%" cy="50%" outerRadius={80} innerRadius={45}
                  label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {species.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#cbd5e1', fontSize: '14px' }}>Sin datos de especies</div>
          )}
        </div>

        {/* Top owners */}
        <div className="section-card" style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow)' }}>
          <div style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><Trophy size={16} color="#f59e0b" /> Top Dueños por Mascotas</div>
          {topOwners.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#cbd5e1', fontSize: '14px' }}>Sin datos</div>
          ) : topOwners.map((o, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '10px 0', borderBottom: i < topOwners.length - 1 ? '1px solid #f8fafc' : 'none',
            }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                background: '#f0fdf4', border: '1.5px solid rgba(34,197,94,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Users size={17} color="var(--primary)" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '14px', color: '#0f172a' }}>{o.owner}</div>
                <div style={{ fontSize: '12px', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.email}</div>
              </div>
              <span style={{
                padding: '3px 10px', borderRadius: '999px', background: '#eff6ff',
                color: '#6366f1', fontWeight: 700, fontSize: '13px',
              }}>
                {o.pet_count} <Dog size={11} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 2 }} />
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ReportsView
