import React, { useState, useEffect } from 'react'
import { hospitalService, petService } from '../services/api'
import { Activity, Thermometer, Heart, PlusCircle, Loader2, LogOut, Plus, X, Edit2, Trash2 } from 'lucide-react'
import Modal from './Modal'
import ConfirmDialog from './ConfirmDialog'
import HeaderActions from './HeaderActions'

interface Cage { 
  id: string; 
  name: string; 
  is_occupied: boolean; 
  current_pet_id?: string;
  current_hospitalization_id?: string;
}
interface VitalSign { id: string; hospitalization_id: string; temperature: number; heart_rate: number; respiratory_rate: number; notes: string; timestamp: string }
interface Hospitalization { id: string; pet_id: string; cage_id: string; reason: string; check_in_date: string; status: string; vital_signs: VitalSign[] }

const lbl: React.CSSProperties = { fontSize: '13px', fontWeight: 600, color: '#64748b', marginBottom: '8px', display: 'block' }

const HospitalView: React.FC = () => {
  const [cages, setCages]     = useState<Cage[]>([])
  const [pets, setPets]       = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Cage CRUD
  const [showCageModal, setShowCageModal] = useState(false)
  const [editingCage, setEditingCage]     = useState<Cage | null>(null)
  const [cageName, setCageName]           = useState('')
  const [cageSaving, setCageSaving]       = useState(false)

  // Check-in modal
  const [checkInCage, setCheckInCage]     = useState<Cage | null>(null)
  const [checkInForm, setCheckInForm]     = useState({ pet_id: '', reason: '' })
  const [checkInSaving, setCheckInSaving] = useState(false)

  // Manage modal (discharge + vitals)
  const [manageHosp, setManageHosp]   = useState<any | null>(null)
  const [managePet, setManagePet]     = useState<any | null>(null)
  const [vitalForm, setVitalForm]     = useState({ temperature: '', heart_rate: '', respiratory_rate: '', notes: '' })
  const [vitalSaving, setVitalSaving] = useState(false)
  const [showVitalForm, setShowVitalForm] = useState(false)

  // Confirm dialog
  const [confirm, setConfirm] = useState<{ open: boolean; title: string; message: string; onConfirm: () => void; variant?: 'warning' | 'danger' }>({
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

  // --- Cage CRUD ---
  const handleCageSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setCageSaving(true)
    try {
      if (editingCage) {
        await hospitalService.updateCage(editingCage.id, cageName)
      } else {
        await hospitalService.createCage(cageName)
      }
      setShowCageModal(false); setEditingCage(null); setCageName(''); load()
    } catch (err) { alert('Error al guardar jaula: ' + err) }
    finally { setCageSaving(false) }
  }

  const handleDeleteCage = (cage: Cage) => {
    setConfirm({
      open: true,
      title: 'Eliminar Jaula',
      message: `¿Estás seguro de eliminar la ${cage.name}? Esta acción no se puede deshacer.`,
      variant: 'danger',
      onConfirm: async () => {
        setConfirm(c => ({ ...c, open: false }))
        try {
          await hospitalService.deleteCage(cage.id)
          load()
        } catch (err) { alert('No se pudo eliminar: ' + err) }
      }
    })
  }

  // --- Daily Operations ---
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

  // Open manage modal
  const openManage = (cage: Cage) => {
    setManageHosp({ 
      id: cage.current_hospitalization_id, 
      pet_id: cage.current_pet_id ?? '', 
      cage_id: cage.id 
    })
    setManagePet(pets.find(p => p.id === cage.current_pet_id) ?? null)
    setShowVitalForm(false)
  }

  // Discharge
  const askDischarge = (cage: Cage) => {
    const hospId = cage.current_hospitalization_id
    if (!hospId) { alert('No se encontró el ID de hospitalización.'); return }

    setConfirm({
      open: true,
      title: 'Alta Médica',
      message: `¿Dar de alta a ${petName(cage.current_pet_id)} de ${cage.name}? La jaula quedará libre.`,
      variant: 'warning',
      onConfirm: async () => {
        setConfirm(c => ({ ...c, open: false }))
        try {
          await hospitalService.discharge(hospId)
          setManageHosp(null); load()
        } catch (err) { alert('Error al procesar el alta.') }
      },
    })
  }

  // Record vitals
  const handleVitals = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!manageHosp?.id) { alert('ID de hospitalización no disponible.'); return }
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
      <div className="header-row" style={{ alignItems: 'flex-start' }}>
        <div className="greetings">
          <h2 style={{ fontSize: '24px', fontWeight: 700 }}>Hospitalización y Monitoreo</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Gestión de jaulas y cuidado crítico de pacientes</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button className="btn" onClick={() => { setEditingCage(null); setCageName(''); setShowCageModal(true) }}
            style={{ background: '#0d2b2b', color: '#fff' }}>
            <Plus size={18} /> Nueva Jaula
          </button>
          <HeaderActions />
        </div>
      </div>

      {/* Stats */}
      <div className="stats-cards-grid" style={{ marginBottom: '20px', gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card-main">
          <p style={{ fontSize: '13px', color: '#a0a0a0' }}>Total Jaulas</p>
          <h4 style={{ fontSize: '28px', margin: '8px 0' }}>{cages.length}</h4>
          <div className="card-footer">
            <Activity size={14} color="var(--primary)" />
            <p style={{ fontSize: '12px', color: '#a0a0a0', marginLeft: '5px' }}>Disponibles en el sistema</p>
          </div>
        </div>
        <div className="stat-card-main light" style={{ borderLeft: '4px solid var(--error)' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Ocupadas</p>
          <h4 style={{ fontSize: '28px', margin: '8px 0', color: occupied > 0 ? 'var(--error)' : 'inherit' }}>{occupied}</h4>
          <div className="card-footer">
            <Heart size={14} color={occupied > 0 ? 'var(--error)' : '#a0a0a0'} />
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginLeft: '5px' }}>Pacientes críticos</p>
          </div>
        </div>
        <div className="stat-card-main light" style={{ borderLeft: '4px solid #10b981' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Libres</p>
          <h4 style={{ fontSize: '28px', margin: '8px 0', color: '#10b981' }}>{free}</h4>
          <div className="card-footer">
            <PlusCircle size={14} color="#10b981" />
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginLeft: '5px' }}>Listas para ingreso</p>
          </div>
        </div>
      </div>

      {/* Cage grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {cages.map(cage => (
          <div key={cage.id} style={{
            background: '#fff', borderRadius: '24px', padding: '24px',
            boxShadow: 'var(--shadow)', border: `1.5px solid ${cage.is_occupied ? 'rgba(239,68,68,0.1)' : 'rgba(13,43,43,0.05)'}`,
            display: 'flex', flexDirection: 'column', gap: '16px',
            position: 'relative', overflow: 'hidden'
          }}>
            {/* Admin actions (overlay top right) */}
            {!cage.is_occupied && (
              <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '6px' }}>
                <button title="Editar jaula" onClick={() => { setEditingCage(cage); setCageName(cage.name); setShowCageModal(true) }}
                  style={{ background: '#f1f5f9', border: 'none', padding: '6px', borderRadius: '8px', cursor: 'pointer', color: '#475569' }}>
                  <Edit2 size={13} />
                </button>
                <button title="Eliminar jaula" onClick={() => handleDeleteCage(cage)}
                  style={{ background: '#fef2f2', border: 'none', padding: '6px', borderRadius: '8px', cursor: 'pointer', color: '#dc2626' }}>
                  <Trash2 size={13} />
                </button>
              </div>
            )}

            {/* Cage header */}
            <div style={{ paddingRight: cage.is_occupied ? 0 : '60px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Cama / Localización</div>
              <div style={{ fontWeight: 800, fontSize: '17px', color: '#0f172a' }}>{cage.name}</div>
            </div>

            {cage.is_occupied ? (
              <>
                {/* Patient card */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: 'rgba(34,197,94,0.05)', borderRadius: '16px', border: '1px solid rgba(34,197,94,0.1)' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <Activity size={20} color="var(--primary)" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Paciente activo</div>
                    <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '15px' }}>{petName(cage.current_pet_id)}</div>
                  </div>
                </div>

                {/* Operations */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    className="btn-premium"
                    onClick={() => openManage(cage)}
                    style={{ flex: 1, fontSize: '12px', padding: '10px', height: '40px', borderRadius: '12px', boxShadow: 'none' }}
                  >
                    <Thermometer size={14} /> Signos Vitales
                  </button>
                  <button
                    className="btn"
                    onClick={() => askDischarge(cage)}
                    style={{ flex: 1, background: '#fff1f2', color: '#be123c', border: '1.5px solid #fecaca', fontSize: '12px', padding: '10px', height: '40px', borderRadius: '12px', fontWeight: 700 }}
                  >
                    <LogOut size={14} /> Alta Médica
                  </button>
                </div>
              </>
            ) : (
              <button
                className="btn"
                onClick={() => { setCheckInCage(cage); setCheckInForm({ pet_id: '', reason: '' }) }}
                style={{ width: '100%', height: '44px', justifyContent: 'center', background: '#f0fdf4', color: '#166534', border: '1.5px dashed #86efac', borderRadius: '12px', fontWeight: 600 }}
              >
                <PlusCircle size={16} /> Asignar Paciente
              </button>
            )}
          </div>
        ))}

        {cages.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '6rem', color: '#94a3b8', background: '#fff', borderRadius: '32px', border: '2px dashed #e2e8f0' }}>
            <Activity size={48} style={{ margin: '0 auto 16px', opacity: .2, display: 'block' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#64748b' }}>Sin infraestructura</h3>
            <p style={{ fontSize: '14px', maxWidth: '300px', margin: '8px auto' }}>Parece que no tienes jaulas configuradas. Comienza agregando una cama o jaula hospitalaria.</p>
            <button className="btn" onClick={() => setShowCageModal(true)} style={{ marginTop: '16px', background: 'var(--primary)', color: '#fff', margin: '20px auto 0' }}>
              Agregar mi primera jaula
            </button>
          </div>
        )}
      </div>

      {/* --- MODALES --- */}

      {/* Cage Management Modal */}
      <Modal isOpen={showCageModal} onClose={() => setShowCageModal(false)} title={editingCage ? 'Editar Jaula' : 'Nueva Jaula Hospitalaria'}>
        <form onSubmit={handleCageSave} className="management-form-premium">
          <div className="form-group">
            <label style={lbl}>Identificación / Nombre</label>
            <input className="input-premium" required placeholder="Ej: Jaula A1 (Grande)"
              value={cageName} onChange={e => setCageName(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button type="button" className="btn" onClick={() => setShowCageModal(false)}
              style={{ flex: 1, background: '#f1f5f9', color: '#475569' }}>Cancelar</button>
            <button type="submit" className="btn" disabled={cageSaving}
              style={{ flex: 2, background: 'var(--primary)', color: 'white' }}>
              {cageSaving ? 'Guardando...' : (editingCage ? 'Actualizar Jaula' : 'Crear Jaula')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Check-in Modal */}
      <Modal isOpen={!!checkInCage} onClose={() => setCheckInCage(null)} title={`Ingreso a ${checkInCage?.name}`}>
        <form onSubmit={handleCheckIn} className="management-form-premium">
          <div className="form-group">
            <label style={lbl}>Mascota</label>
            <select className="input-premium" required value={checkInForm.pet_id}
              onChange={e => setCheckInForm(f => ({ ...f, pet_id: e.target.value }))}>
              <option value="">Selecciona un paciente...</option>
              {pets.filter(p => !cages.some(c => c.current_pet_id === p.id)).map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.species} · {p.breed})</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label style={lbl}>Motivo Hospitalización</label>
            <textarea className="input-premium" required rows={3} placeholder="Instrucciones médicas o motivo..."
              value={checkInForm.reason} onChange={e => setCheckInForm(f => ({ ...f, reason: e.target.value }))} />
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button type="button" className="btn" onClick={() => setCheckInCage(null)}
              style={{ flex: 1, background: '#f1f5f9', color: '#475569' }}>Cancelar</button>
            <button type="submit" className="btn" disabled={checkInSaving}
              style={{ flex: 2, background: 'var(--primary)', color: 'white' }}>
              {checkInSaving ? 'Procesando...' : 'Confirmar Ingreso'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Vitals Modal */}
      <Modal isOpen={!!manageHosp && !confirm.open} onClose={() => setManageHosp(null)} title={`Signos Vitales — ${managePet?.name ?? '...'}`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {!showVitalForm ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Activity size={30} color="var(--primary)" />
              </div>
              <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>Registra una nueva medición de signos vitales para el control del paciente.</p>
              <button className="btn-premium" onClick={() => setShowVitalForm(true)}
                style={{ margin: '0 auto', width: 'auto', padding: '12px 24px' }}>
                <Plus size={18} /> Nueva Medición
              </button>
            </div>
          ) : (
            <form onSubmit={handleVitals} className="management-form-premium">
              <div className="form-row">
                <div className="form-group">
                  <label style={lbl}>Temp. (°C)</label>
                  <input className="input-premium" type="number" step="0.1" required value={vitalForm.temperature}
                    onChange={e => setVitalForm(f => ({ ...f, temperature: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label style={lbl}>F. Cardíaca (bpm)</label>
                  <input className="input-premium" type="number" required value={vitalForm.heart_rate}
                    onChange={e => setVitalForm(f => ({ ...f, heart_rate: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label style={lbl}>F. Respiratoria (rpm)</label>
                <input className="input-premium" type="number" required value={vitalForm.respiratory_rate}
                  onChange={e => setVitalForm(f => ({ ...f, respiratory_rate: e.target.value }))} />
              </div>
              <div className="form-group">
                <label style={lbl}>Notas / Observaciones</label>
                <textarea className="input-premium" rows={2} value={vitalForm.notes}
                  onChange={e => setVitalForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" className="btn" onClick={() => setShowVitalForm(false)}
                  style={{ flex: 1, background: '#f1f5f9', color: '#475569' }}>Cancelar</button>
                <button type="submit" className="btn" disabled={vitalSaving}
                  style={{ flex: 2, background: 'var(--primary)', color: 'white' }}>
                  {vitalSaving ? 'Guardando...' : 'Guardar Medición'}
                </button>
              </div>
            </form>
          )}
        </div>
      </Modal>

      {/* Global Confirm */}
      <ConfirmDialog
        isOpen={confirm.open}
        title={confirm.title}
        message={confirm.message}
        confirmLabel={confirm.variant === 'danger' ? 'Eliminar' : 'Dar de Alta'}
        variant={confirm.variant ?? 'warning'}
        onConfirm={confirm.onConfirm}
        onCancel={() => setConfirm(c => ({ ...c, open: false }))}
      />
    </div>
  )
}

export default HospitalView
