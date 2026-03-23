import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Plus, X, Clock, DollarSign } from 'lucide-react'
import { appointmentService, petService, ownerService } from '../services/api'

const STATUS_COLORS: Record<string, string> = {
  Pending: '#f59e0b',
  Success: '#10b981',
  Failed: '#ef4444',
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

const MONTH_NAMES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DAY_NAMES = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']

interface Appointment {
  id: string
  pet_id: string
  owner_id: string
  date: string
  reason: string
  status: string
  cost: number
}

interface FormData {
  pet_id: string
  owner_id: string
  date: string
  time: string
  reason: string
  cost: string
}

const CalendarView: React.FC = () => {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [pets, setPets] = useState<any[]>([])
  const [owners, setOwners] = useState<any[]>([])
  const [form, setForm] = useState<FormData>({ pet_id: '', owner_id: '', date: '', time: '09:00', reason: '', cost: '' })
  const [loading, setLoading] = useState(false)

  const loadAppointments = async () => {
    try {
      const start = new Date(year, month, 1).toISOString()
      const end = new Date(year, month + 1, 0, 23, 59, 59).toISOString()
      const data = await appointmentService.getByRange(start, end)
      setAppointments(data)
    } catch { setAppointments([]) }
  }

  useEffect(() => { loadAppointments() }, [year, month])
  useEffect(() => {
    petService.getAll().then(setPets).catch(() => {})
    ownerService.getAll().then(setOwners).catch(() => {})
  }, [])

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1) }
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1) }

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  const appointmentsForDay = (day: number) => {
    return appointments.filter(a => {
      const d = new Date(a.date)
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day
    })
  }

  const handleDayClick = (day: number) => {
    setSelectedDay(day)
    const d = new Date(year, month, day)
    const dateStr = d.toISOString().split('T')[0]
    setForm(f => ({ ...f, date: dateStr }))
    setShowModal(true)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const dateTime = `${form.date}T${form.time}:00`
      await appointmentService.create({
        pet_id: form.pet_id,
        owner_id: form.owner_id,
        date: dateTime,
        reason: form.reason,
        cost: parseFloat(form.cost) || 0,
      })
      setShowModal(false)
      loadAppointments()
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await appointmentService.updateStatus(id, status)
      loadAppointments()
    } catch {}
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta cita?')) return
    try {
      await appointmentService.delete(id)
      loadAppointments()
    } catch {}
  }

  const selectedDayAppts = selectedDay ? appointmentsForDay(selectedDay) : []

  return (
    <div className="cal-wrapper">
      <style>{`
        .cal-wrapper { display: flex; gap: 0; height: 100%; overflow: hidden; background: var(--bg-primary, #0f172a); font-family: inherit; }
        .cal-main { flex: 1; display: flex; flex-direction: column; padding: 28px; overflow-y: auto; }
        .cal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
        .cal-title { font-size: 1.5rem; font-weight: 700; color: #f1f5f9; }
        .cal-nav { display: flex; align-items: center; gap: 12px; }
        .cal-nav button { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #94a3b8; border-radius: 8px; padding: 8px; cursor: pointer; display: flex; align-items: center; transition: all .2s; }
        .cal-nav button:hover { background: rgba(255,255,255,0.1); color: #f1f5f9; }
        .cal-nav .month-label { font-size: 1rem; font-weight: 600; color: #f1f5f9; min-width: 160px; text-align: center; }
        .cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 1px; background: rgba(255,255,255,0.06); border-radius: 12px; overflow: hidden; }
        .cal-day-header { background: rgba(255,255,255,0.04); padding: 10px; text-align: center; font-size: 0.75rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: .05em; }
        .cal-cell { background: #1e293b; min-height: 100px; padding: 8px; cursor: pointer; transition: background .15s; position: relative; }
        .cal-cell:hover { background: #263347; }
        .cal-cell.today { background: #1d2f4f; }
        .cal-cell.today .cal-cell-num { color: #60a5fa; font-weight: 700; }
        .cal-cell.empty { background: rgba(15,23,42,0.5); cursor: default; }
        .cal-cell-num { font-size: 0.8rem; font-weight: 600; color: #64748b; margin-bottom: 4px; }
        .cal-dot-list { display: flex; flex-direction: column; gap: 2px; }
        .cal-dot { font-size: 0.7rem; padding: 2px 5px; border-radius: 4px; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
        .cal-more { font-size: 0.65rem; color: #60a5fa; cursor: pointer; }

        .cal-panel { width: 340px; background: #1e293b; border-left: 1px solid rgba(255,255,255,0.06); display: flex; flex-direction: column; overflow-y: auto; padding: 24px; gap: 16px; }
        .cal-panel h3 { font-size: 1rem; font-weight: 700; color: #f1f5f9; margin: 0; }
        .cal-appt-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 14px; display: flex; flex-direction: column; gap: 8px; }
        .cal-appt-card .reason { font-size: 0.9rem; font-weight: 600; color: #f1f5f9; }
        .cal-appt-card .meta { font-size: 0.75rem; color: #94a3b8; display: flex; align-items: center; gap: 4px; }
        .cal-appt-card .badges { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
        .cal-status-badge { font-size: 0.7rem; padding: 2px 8px; border-radius: 999px; font-weight: 600; border: none; cursor: pointer; }
        .cal-del-btn { margin-left: auto; background: none; border: none; color: #ef4444; cursor: pointer; opacity: .7; }
        .cal-del-btn:hover { opacity: 1; }

        .cal-add-btn { display: flex; align-items: center; gap: 8px; background: #3b82f6; color: #fff; border: none; border-radius: 10px; padding: 10px 16px; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: background .2s; width: 100%; justify-content: center; }
        .cal-add-btn:hover { background: #2563eb; }

        /* Modal */
        .cal-modal-bg { position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 1000; display: flex; align-items: center; justify-content: center; }
        .cal-modal { background: #1e293b; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 28px; width: 420px; max-width: 95vw; display: flex; flex-direction: column; gap: 16px; }
        .cal-modal h2 { font-size: 1.1rem; font-weight: 700; color: #f1f5f9; margin: 0; }
        .cal-modal label { font-size: 0.8rem; color: #94a3b8; font-weight: 600; display: block; margin-bottom: 4px; }
        .cal-modal input, .cal-modal select, .cal-modal textarea { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #f1f5f9; padding: 9px 12px; font-size: 0.85rem; box-sizing: border-box; }
        .cal-modal-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .cal-modal-actions { display: flex; gap: 10px; justify-content: flex-end; }
        .cal-modal-actions button { padding: 9px 20px; border-radius: 8px; border: none; font-size: 0.85rem; font-weight: 600; cursor: pointer; }
        .cal-btn-cancel { background: rgba(255,255,255,0.07); color: #94a3b8; }
        .cal-btn-save { background: #3b82f6; color: #fff; }
        .cal-btn-save:hover { background: #2563eb; }
        .cal-empty-state { color: #475569; font-size: 0.85rem; text-align: center; padding: 24px 0; }
      `}</style>

      <div className="cal-main">
        <div className="cal-header">
          <div className="cal-title">📅 Calendario de Citas</div>
          <div className="cal-nav">
            <button onClick={prevMonth}><ChevronLeft size={16} /></button>
            <span className="month-label">{MONTH_NAMES[month]} {year}</span>
            <button onClick={nextMonth}><ChevronRight size={16} /></button>
          </div>
        </div>

        <div className="cal-grid">
          {DAY_NAMES.map(d => <div key={d} className="cal-day-header">{d}</div>)}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`e${i}`} className="cal-cell empty" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const appts = appointmentsForDay(day)
            const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
            return (
              <div key={day} className={`cal-cell${isToday ? ' today' : ''}`} onClick={() => handleDayClick(day)}>
                <div className="cal-cell-num">{day}</div>
                <div className="cal-dot-list">
                  {appts.slice(0, 2).map(a => (
                    <div key={a.id} className="cal-dot" style={{ background: STATUS_COLORS[a.status] + 'cc' }}>
                      {a.reason}
                    </div>
                  ))}
                  {appts.length > 2 && <div className="cal-more">+{appts.length - 2} más</div>}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="cal-panel">
        {selectedDay ? (
          <>
            <h3>{selectedDay} de {MONTH_NAMES[month]}</h3>
            <button className="cal-add-btn" onClick={() => { setShowModal(true) }}>
              <Plus size={16} /> Nueva Cita
            </button>
            {selectedDayAppts.length === 0 ? (
              <div className="cal-empty-state">Sin citas este día</div>
            ) : selectedDayAppts.map(a => (
              <div key={a.id} className="cal-appt-card">
                <div className="reason">{a.reason}</div>
                <div className="meta"><Clock size={12} /> {new Date(a.date).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}</div>
                <div className="meta"><DollarSign size={12} /> ${a.cost.toFixed(2)}</div>
                <div className="badges">
                  {(['Pending','Success','Failed'] as const).map(s => (
                    <button
                      key={s}
                      className="cal-status-badge"
                      style={{ background: a.status === s ? STATUS_COLORS[s] : 'rgba(255,255,255,0.07)', color: a.status === s ? '#fff' : '#94a3b8' }}
                      onClick={() => handleStatusChange(a.id, s)}
                    >{s === 'Pending' ? 'Pendiente' : s === 'Success' ? 'Completada' : 'Cancelada'}</button>
                  ))}
                  <button className="cal-del-btn" onClick={() => handleDelete(a.id)}><X size={14} /></button>
                </div>
              </div>
            ))}
          </>
        ) : (
          <div className="cal-empty-state" style={{ paddingTop: 60 }}>← Selecciona un día para ver o crear citas</div>
        )}
      </div>

      {showModal && (
        <div className="cal-modal-bg" onClick={() => setShowModal(false)}>
          <div className="cal-modal" onClick={e => e.stopPropagation()}>
            <h2>Nueva Cita — {selectedDay} de {MONTH_NAMES[month]}</h2>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label>Mascota</label>
                <select required value={form.pet_id} onChange={e => setForm(f => ({ ...f, pet_id: e.target.value }))}>
                  <option value="">Selecciona una mascota</option>
                  {pets.map(p => <option key={p.id} value={p.id}>{p.name} ({p.species})</option>)}
                </select>
              </div>
              <div>
                <label>Dueño</label>
                <select required value={form.owner_id} onChange={e => setForm(f => ({ ...f, owner_id: e.target.value }))}>
                  <option value="">Selecciona un dueño</option>
                  {owners.map(o => <option key={o.id} value={o.id}>{o.first_name} {o.last_name}</option>)}
                </select>
              </div>
              <div className="cal-modal-row">
                <div>
                  <label>Hora</label>
                  <input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} required />
                </div>
                <div>
                  <label>Costo ($)</label>
                  <input type="number" min="0" step="0.01" placeholder="0.00" value={form.cost} onChange={e => setForm(f => ({ ...f, cost: e.target.value }))} />
                </div>
              </div>
              <div>
                <label>Motivo</label>
                <input type="text" required placeholder="Ej: Consulta general, vacuna..." value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} />
              </div>
              <div className="cal-modal-actions">
                <button type="button" className="cal-btn-cancel" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="cal-btn-save" disabled={loading}>{loading ? 'Guardando...' : 'Crear Cita'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default CalendarView
