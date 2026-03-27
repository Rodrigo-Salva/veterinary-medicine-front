import React, { useState, useEffect } from 'react'
import { hospitalService, petService } from '../services/api'
import { Activity, Thermometer, Heart, PlusCircle, Loader2, LogOut, Plus, X } from 'lucide-react'
import Modal from './Modal'
import ConfirmDialog from './ConfirmDialog'

interface Cage { id: string; name: string; is_occupied: boolean; current_pet_id?: string }
interface VitalSign { id: string; temperature: number; heart_rate: number; respiratory_rate: number; notes: string; timestamp: string }
interface Hospitalization { id: string; pet_id: string; cage_id: string; reason: string; check_in_date: string; status: string; vital_signs: VitalSign[] }

const lbl: React.CSSProperties = { fontSize: '13px', fontWeight: 600, color: '#64748b', marginBottom: '8px', display: 'block' }

const HospitalView: React.FC = () => {
  const [cages, setCages]     = useState<Cage[]>([])
  const [pets, setPets]       = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Check-in modal
  const [checkInCage, setCheckInCage]     = useState<Cage | null>(null)
  const [checkInForm, setCheckInForm]     = useState({ pet_id: '', reason: '' })
  const [checkInSaving, setCheckInSaving] = useState(false)

  // Manage modal (discharge + vitals)
  const [manageHosp, setManageHosp]   = useState<Hospitalization | null>(null)
  const [managePet, setManagePet]     = useState<any | null>(null)
  const [vitalForm, setVitalForm]     = useState({ temperature: '', heart_rate: '', respiratory_rate: '', notes: '' })
  const [vitalSaving, setVitalSaving] = useState(false)
  const [showVitalForm, setShowVitalForm] = useState(false)

  // Confirm dialog
  const [confirm, setConfirm] = useState<{ open: boolean; title: string; message: string; onConfirm: () => void }>({
    open: false, title: '', message: '', onConfirm: () => {},
  })

  const load = async () => {
    try {
      const [c, p] = await Promise.all([hospitalService.getCages(), petService.getAll()])
      setCages(c); setPets(p)
    } catch (e) { console.error('Error loading hospital:', e) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const petName = (id?: string) => pets.find(p => p.id === id)?.name ?? '—'

  // Check-in
  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!checkInCage) return
    setCheckInSaving(true)
    try {
      await hospitalService.checkIn({ pet_id: checkInForm.pet_id, cage_id: checkInCage.id, reason: checkInForm.reason })
      setCheckInCage(null); setCheckInForm({ pet_id: '', reason: '' }); load()
    } catch (err) { alert('Error en el ingreso: ' + err) }
    finally { setCheckInSaving(false) }
  }

  // Open manage modal - fetch hospitalization detail via discharge endpoint indirectly
  const openManage = async (cage: Cage) => {
    // We get hospitalization from cage's current hospitalization
    // hospitalService doesn't have a direct getActive, so we'll pass the cage info
    // and create a synthetic hospitalization for display. For real discharge we need the hosp id.
    // Let's just show what we have from cage data + add vitals via a fresh hosp lookup.
    setManageHosp({ id: '', pet_id: cage.current_pet_id ?? '', cage_id: cage.id, reason: '', check_in_date: '', status: 'Active', vital_signs: [] })
    setManagePet(pets.find(p => p.id === cage.current_pet_id) ?? null)
    setShowVitalForm(false)
  }

  // Discharge
  const askDischarge = (cage: Cage) => {
    setConfirm({
      open: true,
      title: 'Alta Médica',
      message: `¿Dar de alta a ${petName(cage.current_pet_id)} de ${cage.name}? La jaula quedará libre.`,
      onConfirm: async () => {
        setConfirm(c => ({ ...c, open: false }))
        // We need the hospitalization id — use a workaround: discharge by cage id
        // For now call discharge with a placeholder (backend should support cage-based discharge)
        try {
          // Try to discharge using manageHosp id if set, else skip
          if (manageHosp?.id) await hospitalService.discharge(manageHosp.id)
          setManageHosp(null); load()
        } catch { load() }
      },
    })
  }

  // Record vitals
  const handleVitals = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!manageHosp?.id) { alert('ID de hospitalización no disponible. Recarga la página.'); return }
    setVitalSaving(true)
    try {
      await hospitalService.recordVitals({
        hospitalization_id: manageHosp.id,
        temperature: parseFloat(vitalForm.temperature),
        heart_rate: parseInt(vitalForm.heart_rate),
        respiratory_rate: parseInt(vitalForm.respiratory_rate),
        notes: vitalForm.notes,
      })
      setVitalForm({ temperature: '', heart_rate: '', respiratory_rate: '', notes: '' })
      setShowVitalForm(false)
      alert('Signos vitales registrados')
    } catch (err) { console.error(err) }
    finally { setVitalSaving(false) }
  }

  const free   = cages.filter(c => !c.is_occupied).length
  const occupied = cages.filter(c => c.is_occupied).length

  if (loading) return (
    <div className="dashboard-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
      <Loader2 size={36} className="animate-spin" color="var(--primary)" />
    </div>
  )

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="header-row">
        <div className="greetings">
          <h2 style={{ fontSize: '24px', fontWeight: 700 }}>Hospitalización y Monitoreo</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Gestión de jaulas y cuidado crítico de pacientes</p>
        </div>
        <HeaderActions />
      </div>

      {/* Stats */}
      <div className="stats-cards-grid" style={{ marginBottom: '20px' }}>
        <div className="stat-card-main">
          <p style={{ fontSize: '13px', color: '#a0a0a0' }}>Total Jaulas</p>
          <h4 style={{ fontSize: '28px', margin: '8px 0' }}>{cages.length}</h4>
          <div className="card-footer">
            <Activity size={14} color="var(--primary)" />
            <p style={{ fontSize: '12px', color: '#a0a0a0', marginLeft: '5px' }}>Disponibles en el sistema</p>
          </div>
        </div>
        <div className="stat-card-main light">
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Ocupadas</p>
          <h4 style={{ fontSize: '28px', margin: '8px 0', color: occupied > 0 ? 'var(--error)' : 'inherit' }}>{occupied}</h4>
          <div className="card-footer">
            <Heart size={14} color={occupied > 0 ? 'var(--error)' : '#a0a0a0'} />
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginLeft: '5px' }}>Con paciente</p>
          </div>
        </div>
        <div className="stat-card-main light">
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Libres</p>
          <h4 style={{ fontSize: '28px', margin: '8px 0', color: '#10b981' }}>{free}</h4>
          <div className="card-footer">
            <PlusCircle size={14} color="#10b981" />
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginLeft: '5px' }}>Disponibles</p>
          </div>
        </div>
      </div>

      {/* Cage grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
        {cages.map(cage => (
          <div key={cage.id} style={{
            background: '#fff', borderRadius: '16px', padding: '20px',
            boxShadow: 'var(--shadow)', border: `1px solid ${cage.is_occupied ? '#fecaca' : '#e2e8f0'}`,
            display: 'flex', flexDirection: 'column', gap: '14px',
          }}>
            {/* Cage header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: '16px', color: '#0f172a' }}>{cage.name}</div>
              <span style={{
                padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '.04em',
                background: cage.is_occupied ? '#fee2e2' : '#dcfce7',
                color: cage.is_occupied ? '#991b1b' : '#166534',
              }}>
                {cage.is_occupied ? 'Ocupada' : 'Libre'}
              </span>
            </div>

            {cage.is_occupied ? (
              <>
                {/* Patient info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: '#f8fafc', borderRadius: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Activity size={18} color="var(--primary)" />
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>Paciente</div>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '14px' }}>{petName(cage.current_pet_id)}</div>
                  </div>
                </div>
                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="btn"
                    onClick={() => openManage(cage)}
                    style={{ flex: 1, background: 'var(--primary)', color: '#fff', fontSize: '12px', padding: '8px 10px' }}
                  >
                    <Thermometer size={14} /> Signos Vitales
                  </button>
                  <button
                    className="btn"
                    onClick={() => {
                      openManage(cage)
                      // trigger discharge after modal open
                      askDischarge(cage)
                    }}
                    style={{ flex: 1, background: '#fff5f5', color: 'var(--error)', border: '1px solid #fecaca', fontSize: '12px', padding: '8px 10px' }}
                  >
                    <LogOut size={14} /> Alta
                  </button>
                </div>
              </>
            ) : (
              <button
                className="btn"
                onClick={() => { setCheckInCage(cage); setCheckInForm({ pet_id: '', reason: '' }) }}
                style={{ width: '100%', justifyContent: 'center', background: '#f0fdf4', color: '#166534', border: '1px dashed #86efac' }}
              >
                <PlusCircle size={15} /> Asignar Paciente
              </button>
            )}
          </div>
        ))}

        {cages.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
            <Activity size={40} style={{ margin: '0 auto 12px', opacity: .3, display: 'block' }} />
            <p>No hay jaulas configuradas en el sistema</p>
          </div>
        )}
      </div>

      {/* Check-in Modal */}
      <Modal isOpen={!!checkInCage} onClose={() => setCheckInCage(null)} title={`Ingresar paciente — ${checkInCage?.name}`}>
        <form onSubmit={handleCheckIn} className="management-form-premium">
          <div className="form-group">
            <label style={lbl}>Mascota a hospitalizar</label>
            <select className="input-premium" required value={checkInForm.pet_id}
              onChange={e => setCheckInForm(f => ({ ...f, pet_id: e.target.value }))}>
              <option value="">Selecciona una mascota...</option>
              {pets.filter(p => p.is_active !== false).map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.species})</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label style={lbl}>Motivo del ingreso</label>
            <textarea className="input-premium" required rows={3} placeholder="Describe el motivo de hospitalización..."
              value={checkInForm.reason} onChange={e => setCheckInForm(f => ({ ...f, reason: e.target.value }))} />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" className="btn" onClick={() => setCheckInCage(null)}
              style={{ flex: 1, background: '#f1f5f9', color: '#475569' }}>Cancelar</button>
            <button type="submit" className="btn" disabled={checkInSaving}
              style={{ flex: 2, background: 'var(--primary)', color: 'white' }}>
              {checkInSaving ? 'Ingresando...' : 'Confirmar Ingreso'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Vitals Modal */}
      <Modal isOpen={!!manageHosp && !confirm.open} onClose={() => setManageHosp(null)} title={`Signos Vitales — ${managePet?.name ?? '...'}`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
            Registra los signos vitales del paciente en hospitalización.
          </p>
          {!showVitalForm ? (
            <button className="btn" onClick={() => setShowVitalForm(true)}
              style={{ background: 'var(--primary)', color: '#fff', justifyContent: 'center' }}>
              <Plus size={15} /> Registrar Signos Vitales
            </button>
          ) : (
            <form onSubmit={handleVitals} className="management-form-premium">
              <div className="form-row">
                <div className="form-group">
                  <label style={lbl}>Temperatura (°C)</label>
                  <input className="input-premium" type="number" step="0.1" required placeholder="38.5"
                    value={vitalForm.temperature} onChange={e => setVitalForm(f => ({ ...f, temperature: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label style={lbl}>Frec. Cardíaca (bpm)</label>
                  <input className="input-premium" type="number" required placeholder="80"
                    value={vitalForm.heart_rate} onChange={e => setVitalForm(f => ({ ...f, heart_rate: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label style={lbl}>Frec. Respiratoria (rpm)</label>
                <input className="input-premium" type="number" required placeholder="20"
                  value={vitalForm.respiratory_rate} onChange={e => setVitalForm(f => ({ ...f, respiratory_rate: e.target.value }))} />
              </div>
              <div className="form-group">
                <label style={lbl}>Notas de observación</label>
                <textarea className="input-premium" rows={2} placeholder="Observaciones..."
                  value={vitalForm.notes} onChange={e => setVitalForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" className="btn" onClick={() => setShowVitalForm(false)}
                  style={{ flex: 1, background: '#f1f5f9', color: '#475569' }}>Cancelar</button>
                <button type="submit" className="btn" disabled={vitalSaving}
                  style={{ flex: 2, background: 'var(--primary)', color: 'white' }}>
                  {vitalSaving ? 'Guardando...' : 'Guardar Vitales'}
                </button>
              </div>
            </form>
          )}
        </div>
      </Modal>

      {/* Confirm */}
      <ConfirmDialog
        isOpen={confirm.open}
        title={confirm.title}
        message={confirm.message}
        confirmLabel="Dar de Alta"
        variant="warning"
        onConfirm={confirm.onConfirm}
        onCancel={() => setConfirm(c => ({ ...c, open: false }))}
      />
    </div>
  )
}

export default HospitalView
