import React, { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { statsService } from '../services/api'
import { TrendingUp, Users, Calendar, DollarSign } from 'lucide-react'

const PIE_COLORS = ['#3b82f6','#10b981','#f59e0b','#8b5cf6','#ef4444','#06b6d4','#ec4899']

const ReportsView: React.FC = () => {
  const [overview, setOverview] = useState<any>(null)
  const [monthly, setMonthly] = useState<any[]>([])
  const [species, setSpecies] = useState<any[]>([])
  const [topOwners, setTopOwners] = useState<any[]>([])
  const [activeChart, setActiveChart] = useState<'appointments' | 'revenue'>('appointments')

  useEffect(() => {
    statsService.getStats().then(setOverview).catch(() => {})
    statsService.getMonthly().then(setMonthly).catch(() => {})
    statsService.getSpecies().then(setSpecies).catch(() => {})
    statsService.getTopOwners().then(setTopOwners).catch(() => {})
  }, [])

  return (
    <div className="rep-wrapper">
      <style>{`
        .rep-wrapper { flex: 1; overflow-y: auto; padding: 28px; background: var(--bg-primary,#0f172a); font-family: inherit; }
        .rep-title { font-size: 1.5rem; font-weight: 700; color: #f1f5f9; margin-bottom: 24px; }
        .rep-kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
        .rep-kpi { background: #1e293b; border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 20px; display: flex; align-items: center; gap: 16px; }
        .rep-kpi-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .rep-kpi-val { font-size: 1.6rem; font-weight: 800; color: #f1f5f9; }
        .rep-kpi-label { font-size: 0.75rem; color: #64748b; margin-top: 2px; }
        .rep-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .rep-card { background: #1e293b; border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 22px; }
        .rep-card.full { grid-column: 1 / -1; }
        .rep-card-title { font-size: 0.9rem; font-weight: 700; color: #f1f5f9; margin-bottom: 18px; display: flex; align-items: center; gap: 8px; }
        .rep-tabs { display: flex; gap: 8px; margin-bottom: 16px; }
        .rep-tab { padding: 5px 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: #64748b; font-size: 0.8rem; cursor: pointer; transition: all .15s; }
        .rep-tab.active { background: #3b82f6; color: #fff; border-color: #3b82f6; }
        .rep-owner-row { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
        .rep-owner-row:last-child { border-bottom: none; }
        .rep-owner-avatar { width: 34px; height: 34px; border-radius: 50%; background: linear-gradient(135deg,#3b82f6,#8b5cf6); display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 700; color: #fff; flex-shrink: 0; }
        .rep-owner-name { flex: 1; font-size: 0.85rem; font-weight: 600; color: #f1f5f9; }
        .rep-owner-email { font-size: 0.72rem; color: #64748b; }
        .rep-owner-count { font-size: 0.85rem; font-weight: 700; color: #60a5fa; }
        .recharts-tooltip-wrapper .recharts-default-tooltip { background: #1e293b !important; border-color: rgba(255,255,255,0.1) !important; border-radius: 8px !important; }
      `}</style>

      <div className="rep-title">📊 Reportes & Estadísticas</div>

      <div className="rep-kpi-grid">
        <div className="rep-kpi">
          <div className="rep-kpi-icon" style={{ background: 'rgba(59,130,246,0.15)' }}>
            <Users size={20} color="#3b82f6" />
          </div>
          <div>
            <div className="rep-kpi-val">{overview?.total_pets ?? '—'}</div>
            <div className="rep-kpi-label">Total Mascotas</div>
          </div>
        </div>
        <div className="rep-kpi">
          <div className="rep-kpi-icon" style={{ background: 'rgba(16,185,129,0.15)' }}>
            <Users size={20} color="#10b981" />
          </div>
          <div>
            <div className="rep-kpi-val">{overview?.total_owners ?? '—'}</div>
            <div className="rep-kpi-label">Total Dueños</div>
          </div>
        </div>
        <div className="rep-kpi">
          <div className="rep-kpi-icon" style={{ background: 'rgba(245,158,11,0.15)' }}>
            <Calendar size={20} color="#f59e0b" />
          </div>
          <div>
            <div className="rep-kpi-val">{overview?.total_appointments ?? '—'}</div>
            <div className="rep-kpi-label">Total Citas</div>
          </div>
        </div>
        <div className="rep-kpi">
          <div className="rep-kpi-icon" style={{ background: 'rgba(139,92,246,0.15)' }}>
            <DollarSign size={20} color="#8b5cf6" />
          </div>
          <div>
            <div className="rep-kpi-val">${(overview?.total_revenue ?? 0).toLocaleString()}</div>
            <div className="rep-kpi-label">Ingresos Totales</div>
          </div>
        </div>
      </div>

      <div className="rep-grid">
        {/* Bar chart: monthly */}
        <div className="rep-card full">
          <div className="rep-card-title"><TrendingUp size={16} /> Tendencia Mensual (12 meses)</div>
          <div className="rep-tabs">
            <button className={`rep-tab${activeChart === 'appointments' ? ' active' : ''}`} onClick={() => setActiveChart('appointments')}>Citas</button>
            <button className={`rep-tab${activeChart === 'revenue' ? ' active' : ''}`} onClick={() => setActiveChart('revenue')}>Ingresos</button>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthly} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                labelStyle={{ color: '#f1f5f9' }}
                itemStyle={{ color: '#94a3b8' }}
              />
              {activeChart === 'appointments'
                ? <Bar dataKey="appointments" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Citas" />
                : <Bar dataKey="revenue" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Ingresos $" />
              }
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart: species */}
        <div className="rep-card">
          <div className="rep-card-title">🐾 Mascotas por Especie</div>
          {species.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={species} dataKey="count" nameKey="species" cx="50%" cy="50%" outerRadius={80} label={({ species: s, percent }) => `${s} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {species.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div style={{ color: '#475569', textAlign: 'center', paddingTop: 60 }}>Sin datos</div>}
        </div>

        {/* Top owners */}
        <div className="rep-card">
          <div className="rep-card-title">🏆 Top Dueños por Mascotas</div>
          {topOwners.length === 0
            ? <div style={{ color: '#475569', textAlign: 'center', paddingTop: 40 }}>Sin datos</div>
            : topOwners.map((o, i) => (
              <div key={i} className="rep-owner-row">
                <div className="rep-owner-avatar">{o.owner[0]}</div>
                <div>
                  <div className="rep-owner-name">{o.owner}</div>
                  <div className="rep-owner-email">{o.email}</div>
                </div>
                <div className="rep-owner-count">{o.pet_count} 🐾</div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}

export default ReportsView
