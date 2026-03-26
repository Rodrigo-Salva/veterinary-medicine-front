import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Plus, X, Clock, DollarSign, Calendar } from 'lucide-react'
import { appointmentService, petService, ownerService } from '../services/api'
import ConfirmDialog from './ConfirmDialog'

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  Pending:  { bg: '#fff7ed', text: '#c2410c', dot: '#f97316' },
  Success:  { bg: '#f0fdf4', text: '#15803d', dot: '#22c55e' },
  Failed:   { bg: '#fff1f2', text: '#be123c', dot: '#f43f5e' },
}
const STATUS_LABEL: Record<string, string> = {
  Pending: 'Pendiente', Success: 'Completada', Failed: 'Cancelada',
}

const MONTH_NAMES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DAY_NAMES = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']

interface Appointment {
  id: string; pet_id: string; owner_id: string
  date: string; reason: string; status: string; cost: number
}

const CalendarView: React.FC = () => {
  const today = new Date()
  const [year, setYear]           = useState(today.getFullYear())
  const [month, setMonth]         = useState(today.getMonth())
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [selectedDay, setSelectedDay]   = useState<number | null>(null)
  const [showModal, setShowModal]       = useState(false)
  const [pets, setPets]     = useState<any[]>([])
  const [owners, setOwners] = useState<any[]>([])
  const [form, setForm] = useState({ pet_id:'', owner_id:'', date:'', time:'09:00', reason:'', cost:'' })
  const [saving, setSaving] = useState(false)
  const [confirm, setConfirm] = useState<{ open: boolean; apptId: string }>({ open: false, apptId: '' })

  const load = async () => {
    try {
      const start = new Date(year, month, 1).toISOString()
      const end   = new Date(year, month + 1, 0, 23, 59, 59).toISOString()
      setAppointments(await appointmentService.getByRange(start, end))
    } catch { setAppointments([]) }
  }

  useEffect(() => { load() }, [year, month])
  useEffect(() => {
    petService.getAll().then(setPets).catch(() => {})
    ownerService.getAll().then(setOwners).catch(() => {})
  }, [])

  const prevMonth = () => month === 0  ? (setMonth(11), setYear(y => y-1)) : setMonth(m => m-1)
  const nextMonth = () => month === 11 ? (setMonth(0),  setYear(y => y+1)) : setMonth(m => m+1)

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay    = new Date(year, month, 1).getDay()

  const dayAppts = (day: number) =>
    appointments.filter(a => {
      const d = new Date(a.date)
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day
    })

  const openDay = (day: number) => {
    setSelectedDay(day)
    setForm(f => ({ ...f, date: new Date(year, month, day).toISOString().split('T')[0] }))
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      await appointmentService.create({
        pet_id: form.pet_id, owner_id: form.owner_id,
        date: `${form.date}T${form.time}:00`,
        reason: form.reason, cost: parseFloat(form.cost) || 0,
      })
      setShowModal(false); load()
    } catch(err) { console.error(err) }
    finally { setSaving(false) }
  }

  const handleStatus = async (id: string, status: string) => {
    try { await appointmentService.updateStatus(id, status); load() } catch {}
  }
  const handleDelete = async (id: string) => {
    try { await appointmentService.delete(id); load() } catch {}
  }

  const selAppts = selectedDay ? dayAppts(selectedDay) : []

  return (
    <div className="dashboard-container" style={{ display: 'flex', gap: 0, padding: 0, overflow: 'hidden' }}>

      {/* ── Left: calendar ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '28px', overflowY: 'auto', minWidth: 0 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#0f172a' }}>Calendario de Citas</h2>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94a3b8' }}>{MONTH_NAMES[month]} {year}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={prevMonth} style={navBtn}><ChevronLeft size={16} /></button>
            <span style={{ fontWeight: 600, color: '#0f172a', minWidth: '130px', textAlign: 'center', fontSize: '15px' }}>
              {MONTH_NAMES[month]} {year}
            </span>
            <button onClick={nextMonth} style={navBtn}><ChevronRight size={16} /></button>
          </div>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '1px', background: '#e2e8f0', borderRadius: '14px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
          {DAY_NAMES.map(d => (
            <div key={d} style={{ background: '#f8fafc', padding: '10px 6px', textAlign: 'center', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.05em' }}>
              {d}
            </div>
          ))}

          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`e${i}`} style={{ background: '#f8fafc', minHeight: '88px' }} />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const appts = dayAppts(day)
            const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
            const isSelected = day === selectedDay
            return (
              <div
                key={day}
                onClick={() => openDay(day)}
                style={{
                  background: isSelected ? '#eff6ff' : '#ffffff',
                  minHeight: '88px', padding: '8px', cursor: 'pointer',
                  transition: 'background .15s',
                  outline: isSelected ? '2px solid var(--primary)' : 'none',
                  outlineOffset: '-2px',
                }}
                onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = '#f8fafc' }}
                onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = '#ffffff' }}
              >
                <div style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: '24px', height: '24px', borderRadius: '50%',
                  background: isToday ? 'var(--primary)' : 'transparent',
                  color: isToday ? '#fff' : '#475569',
                  fontSize: '12px', fontWeight: isToday ? 700 : 500,
                  marginBottom: '4px',
                }}>
                  {day}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {appts.slice(0, 2).map(a => {
                    const cfg = STATUS_COLORS[a.status] ?? STATUS_COLORS.Pending
                    return (
                      <div key={a.id} style={{
                        fontSize: '10px', padding: '2px 5px', borderRadius: '4px',
                        background: cfg.bg, color: cfg.text,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        fontWeight: 600,
                      }}>
                        {a.reason}
                      </div>
                    )
                  })}
                  {appts.length > 2 && (
                    <div style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: 600 }}>+{appts.length - 2} más</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Right: day panel ── */}
      <div style={{
        width: '320px', flexShrink: 0, borderLeft: '1px solid #f0f0f0',
        display: 'flex', flexDirection: 'column', background: '#ffffff', overflowY: 'auto', padding: '24px', gap: '16px',
      }}>
        {selectedDay ? (
          <>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                {selectedDay} de {MONTH_NAMES[month]}
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94a3b8' }}>
                {selAppts.length} cita{selAppts.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              className="btn"
              onClick={() => setShowModal(true)}
              style={{ background: 'var(--primary)', color: '#fff', justifyContent: 'center' }}
            >
              <Plus size={16} /> Nueva Cita
            </button>

            {selAppts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: '#cbd5e1' }}>
                <Calendar size={32} style={{ margin: '0 auto 8px', opacity: .4, display: 'block' }} />
                <p style={{ margin: 0, fontSize: '13px' }}>Sin citas este día</p>
              </div>
            ) : selAppts.map(a => {
              const cfg = STATUS_COLORS[a.status] ?? STATUS_COLORS.Pending
              return (
                <div key={a.id} style={{
                  background: '#f8fafc', border: '1px solid #f0f0f0', borderRadius: '12px', padding: '14px',
                  display: 'flex', flexDirection: 'column', gap: '8px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontWeight: 600, fontSize: '14px', color: '#0f172a' }}>{a.reason}</span>
                    <button onClick={() => setConfirm({ open: true, apptId: a.id })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1', padding: '0 0 0 8px' }}>
                      <X size={14} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#94a3b8' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={11} /> {new Date(a.date).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <DollarSign size={11} /> ${a.cost.toFixed(2)}
                    </span>
                  </div>
                  {/* Status selector */}
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {(['Pending','Success','Failed'] as const).map(s => (
                      <button
                        key={s}
                        onClick={() => handleStatus(a.id, s)}
                        style={{
                          fontSize: '11px', padding: '3px 8px', borderRadius: '999px',
                          border: 'none', cursor: 'pointer', fontWeight: 600,
                          background: a.status === s ? STATUS_COLORS[s].bg : '#f1f5f9',
                          color: a.status === s ? STATUS_COLORS[s].text : '#94a3b8',
                          outline: a.status === s ? `1px solid ${STATUS_COLORS[s].dot}` : 'none',
                        }}
                      >
                        {STATUS_LABEL[s]}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#cbd5e1', gap: '12px' }}>
            <Calendar size={40} style={{ opacity: .3 }} />
            <p style={{ margin: 0, fontSize: '13px', textAlign: 'center' }}>Selecciona un día para ver o crear citas</p>
          </div>
        )}
      </div>

      {/* ── Modal: Nueva Cita ── */}
      <ConfirmDialog
        isOpen={confirm.open}
        title="Eliminar Cita"
        message="¿Estás seguro de eliminar esta cita? No se podrá recuperar."
        confirmLabel="Eliminar"
        variant="danger"
        onConfirm={() => { setConfirm({ open: false, apptId: '' }); handleDelete(confirm.apptId) }}
        onCancel={() => setConfirm({ open: false, apptId: '' })}
      />

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>
                Nueva Cita — {selectedDay} de {MONTH_NAMES[month]}
              </h3>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleCreate} className="management-form-premium">
              <div className="form-row">
                <div className="form-group">
                  <label style={labelStyle}>Mascota</label>
                  <select className="input-premium" required value={form.pet_id}
                    onChange={e => setForm(f => ({ ...f, pet_id: e.target.value }))}>
                    <option value="">Selecciona...</option>
                    {pets.map(p => <option key={p.id} value={p.id}>{p.name} ({p.species})</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label style={labelStyle}>Dueño</label>
                  <select className="input-premium" required value={form.owner_id}
                    onChange={e => setForm(f => ({ ...f, owner_id: e.target.value }))}>
                    <option value="">Selecciona...</option>
                    {owners.map(o => <option key={o.id} value={o.id}>{o.first_name} {o.last_name}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label style={labelStyle}>Hora</label>
                  <input className="input-premium" type="time" value={form.time}
                    onChange={e => setForm(f => ({ ...f, time: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label style={labelStyle}>Costo ($)</label>
                  <input className="input-premium" type="number" min="0" step="0.01" placeholder="0.00"
                    value={form.cost} onChange={e => setForm(f => ({ ...f, cost: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label style={labelStyle}>Motivo</label>
                <input className="input-premium" type="text" required placeholder="Ej: Consulta, vacuna..."
                  value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button type="button" className="btn" onClick={() => setShowModal(false)}
                  style={{ flex: 1, background: '#f1f5f9', color: '#475569' }}>Cancelar</button>
                <button type="submit" className="btn" disabled={saving}
                  style={{ flex: 2, background: 'var(--primary)', color: '#fff' }}>
                  {saving ? 'Guardando...' : 'Crear Cita'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

const navBtn: React.CSSProperties = {
  background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '8px',
  padding: '7px', cursor: 'pointer', display: 'flex', alignItems: 'center',
  color: '#475569', transition: 'all .15s',
}

const labelStyle: React.CSSProperties = {
  fontSize: '13px', fontWeight: 600, color: '#64748b', marginBottom: '8px', display: 'block',
}

export default CalendarView
