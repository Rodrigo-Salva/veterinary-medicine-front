import React, { useState, useEffect, useRef } from 'react'
import {
  ArrowLeft, Camera, Weight, Syringe, AlertTriangle, Heart, Edit2, Save,
  Dog, Cat, Bird, Loader2, Plus, X,
} from 'lucide-react'
import { petService, ownerService, medicalService } from '../services/api'
import type { Pet, Owner, MedicalRecord, WeightRecord } from '../types'
import Modal from './Modal'

const API_URL = import.meta.env.VITE_API_URL as string

// ─── Weight Chart (simple SVG) ───────────────────────────────────────────────

const WeightChart: React.FC<{ records: WeightRecord[] }> = ({ records }) => {
  if (records.length < 2) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontSize: '13px' }}>
        Se necesitan al menos 2 registros para ver la grafica
      </div>
    )
  }

  const W = 500, H = 200, PAD = 40
  const weights = records.map(r => r.weight)
  const min = Math.min(...weights) * 0.9
  const max = Math.max(...weights) * 1.1
  const range = max - min || 1

  const points = records.map((r, i) => ({
    x: PAD + (i / (records.length - 1)) * (W - PAD * 2),
    y: H - PAD - ((r.weight - min) / range) * (H - PAD * 2),
  }))

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaD = pathD + ` L ${points[points.length - 1].x} ${H - PAD} L ${points[0].x} ${H - PAD} Z`

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
      <defs>
        <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#wg)" />
      <path d={pathD} fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4" fill="white" stroke="var(--primary)" strokeWidth="2" />
          <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="10" fill="#64748b" fontWeight="600">
            {records[i].weight}kg
          </text>
          <text x={p.x} y={H - 10} textAnchor="middle" fontSize="9" fill="#94a3b8">
            {new Date(records[i].recorded_date).toLocaleDateString('es', { month: 'short', day: 'numeric' })}
          </text>
        </g>
      ))}
    </svg>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

interface PetProfileProps {
  petId: string
  onBack: () => void
  onUpdated?: () => void
}

const PetProfile: React.FC<PetProfileProps> = ({ petId, onBack, onUpdated }) => {
  const [pet, setPet] = useState<Pet | null>(null)
  const [owner, setOwner] = useState<Owner | null>(null)
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState<any>({})
  const [saving, setSaving] = useState(false)
  const [weightModal, setWeightModal] = useState(false)
  const [weightForm, setWeightForm] = useState({ weight: '', recorded_date: new Date().toISOString().split('T')[0], notes: '' })
  const fileRef = useRef<HTMLInputElement>(null)

  const load = async () => {
    try {
      const p = await petService.getById(petId)
      setPet(p)
      setEditForm({
        name: p.name, species: p.species, breed: p.breed, age: p.age,
        sex: p.sex || '', color: p.color || '', allergies: p.allergies || '',
        is_neutered: p.is_neutered, microchip: p.microchip || '',
        birth_date: p.birth_date?.split('T')[0] || '', notes: p.notes || '',
      })
      const [o, m] = await Promise.all([
        ownerService.getById(p.owner_id),
        medicalService.getHistory(p.id),
      ])
      setOwner(o)
      setRecords(m)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [petId])

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !pet) return
    try {
      const updated = await petService.uploadPhoto(pet.id, file)
      setPet(updated)
      onUpdated?.()
    } catch { alert('Error al subir la foto') }
  }

  const handleSave = async () => {
    if (!pet) return
    setSaving(true)
    try {
      const updated = await petService.update(pet.id, editForm)
      setPet(updated)
      setEditing(false)
      onUpdated?.()
    } catch { alert('Error al guardar') }
    finally { setSaving(false) }
  }

  const handleAddWeight = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pet) return
    try {
      await petService.addWeight(pet.id, {
        weight: parseFloat(weightForm.weight),
        recorded_date: weightForm.recorded_date,
        notes: weightForm.notes || undefined,
      })
      setWeightModal(false)
      setWeightForm({ weight: '', recorded_date: new Date().toISOString().split('T')[0], notes: '' })
      load()
    } catch { alert('Error al registrar peso') }
  }

  if (loading || !pet) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <Loader2 size={36} className="animate-spin" color="var(--primary)" />
      </div>
    )
  }

  const SpeciesIcon = pet.species.toLowerCase().includes('perro') || pet.species.toLowerCase().includes('dog')
    ? Dog : pet.species.toLowerCase().includes('gato') || pet.species.toLowerCase().includes('cat')
    ? Cat : pet.species.toLowerCase().includes('ave') || pet.species.toLowerCase().includes('bird')
    ? Bird : Heart

  const allergiesList = pet.allergies?.split(',').map(a => a.trim()).filter(Boolean) || []

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <button onClick={onBack} className="btn" style={{ background: '#f1f5f9', color: '#475569', padding: '8px' }}>
          <ArrowLeft size={18} />
        </button>
        <h2 style={{ fontSize: '22px', fontWeight: 700, margin: 0 }}>Ficha de {pet.name}</h2>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
          {editing ? (
            <>
              <button onClick={() => setEditing(false)} className="btn" style={{ background: '#f1f5f9', color: '#475569' }}>
                <X size={16} /> Cancelar
              </button>
              <button onClick={handleSave} className="btn" disabled={saving} style={{ background: 'var(--primary)', color: 'white' }}>
                <Save size={16} /> {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} className="btn" style={{ background: 'var(--primary)', color: 'white' }}>
              <Edit2 size={16} /> Editar
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px' }}>
        {/* LEFT: Profile card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Photo + basic info */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow)', textAlign: 'center' }}>
            <div
              onClick={() => fileRef.current?.click()}
              style={{
                width: '120px', height: '120px', borderRadius: '50%', margin: '0 auto 16px',
                background: pet.photo_url ? `url(${API_URL}${pet.photo_url}) center/cover` : '#f0fdf4',
                border: '3px solid var(--primary)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative',
              }}
            >
              {!pet.photo_url && <SpeciesIcon size={40} color="var(--primary)" />}
              <div style={{
                position: 'absolute', bottom: 0, right: 0, width: '32px', height: '32px',
                borderRadius: '50%', background: 'var(--primary)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Camera size={14} color="white" />
              </div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={handlePhotoUpload} />

            <h3 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: 700 }}>{pet.name}</h3>
            <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 12px' }}>
              {pet.species} · {pet.breed}
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '13px' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '18px', color: '#0f172a' }}>{pet.age}</div>
                <div style={{ color: '#94a3b8' }}>Años</div>
              </div>
              <div style={{ width: '1px', background: '#e2e8f0' }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '18px', color: '#0f172a' }}>{pet.weight || '—'}</div>
                <div style={{ color: '#94a3b8' }}>Kg</div>
              </div>
              <div style={{ width: '1px', background: '#e2e8f0' }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '18px', color: '#0f172a' }}>{records.length}</div>
                <div style={{ color: '#94a3b8' }}>Consultas</div>
              </div>
            </div>
          </div>

          {/* Details card */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow)' }}>
            <h4 style={{ margin: '0 0 14px', fontSize: '14px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Informacion
            </h4>
            {editing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { label: 'Nombre', key: 'name' },
                  { label: 'Especie', key: 'species' },
                  { label: 'Raza', key: 'breed' },
                  { label: 'Edad', key: 'age', type: 'number' },
                  { label: 'Color', key: 'color' },
                  { label: 'Microchip', key: 'microchip' },
                  { label: 'Fecha nacimiento', key: 'birth_date', type: 'date' },
                  { label: 'Alergias (separar por coma)', key: 'allergies' },
                  { label: 'Notas', key: 'notes' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>{f.label}</label>
                    <input
                      className="input-premium"
                      type={f.type || 'text'}
                      value={editForm[f.key] || ''}
                      onChange={e => setEditForm({ ...editForm, [f.key]: f.type === 'number' ? parseInt(e.target.value) : e.target.value })}
                      style={{ marginTop: '4px' }}
                    />
                  </div>
                ))}
                <div>
                  <label style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>Sexo</label>
                  <select className="input-premium" value={editForm.sex} onChange={e => setEditForm({ ...editForm, sex: e.target.value })} style={{ marginTop: '4px' }}>
                    <option value="">Sin especificar</option>
                    <option value="Macho">Macho</option>
                    <option value="Hembra">Hembra</option>
                  </select>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={editForm.is_neutered} onChange={e => setEditForm({ ...editForm, is_neutered: e.target.checked })} />
                  Esterilizado/a
                </label>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                {[
                  ['Sexo', pet.sex || 'No especificado'],
                  ['Color', pet.color || 'No especificado'],
                  ['Esterilizado', pet.is_neutered ? 'Si' : 'No'],
                  ['Microchip', pet.microchip || 'No registrado'],
                  ['Fecha nacimiento', pet.birth_date ? new Date(pet.birth_date).toLocaleDateString('es') : 'No registrada'],
                  ['Dueño', owner ? `${owner.first_name} ${owner.last_name}` : '—'],
                  ['Telefono', owner?.phone || '—'],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ color: '#94a3b8' }}>{label}</span>
                    <span style={{ fontWeight: 600, color: '#334155' }}>{value}</span>
                  </div>
                ))}
                {pet.notes && (
                  <div style={{ marginTop: '8px', padding: '10px', background: '#f8fafc', borderRadius: '8px', color: '#475569' }}>
                    {pet.notes}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Tabs content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Allergies banner */}
          {allergiesList.length > 0 && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px',
              padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px',
            }}>
              <AlertTriangle size={20} color="#dc2626" />
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px', color: '#dc2626' }}>Alergias registradas</div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                  {allergiesList.map((a, i) => (
                    <span key={i} style={{
                      padding: '2px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 600,
                      background: '#fee2e2', color: '#dc2626',
                    }}>{a}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Weight card */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Weight size={18} color="var(--primary)" />
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>Historial de Peso</h4>
              </div>
              <button onClick={() => setWeightModal(true)} className="btn" style={{ background: 'var(--primary)', color: 'white', padding: '6px 12px', fontSize: '12px' }}>
                <Plus size={14} /> Registrar
              </button>
            </div>
            <WeightChart records={pet.weight_history || []} />
          </div>

          {/* Recent medical records */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Syringe size={18} color="var(--primary)" />
              <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>Ultimas Consultas</h4>
            </div>
            {records.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {records.slice(0, 5).map(r => (
                  <div key={r.id} style={{
                    padding: '12px 14px', background: '#f8fafc', borderRadius: '10px',
                    borderLeft: '3px solid var(--primary)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, fontSize: '13px', color: '#334155' }}>{r.diagnosis}</span>
                      <span style={{
                        padding: '2px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: 600,
                        background: '#e0f2fe', color: '#0369a1',
                      }}>{r.record_type}</span>
                    </div>
                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>{r.treatment}</p>
                    <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#94a3b8' }}>
                      {new Date(r.recording_date).toLocaleDateString('es')}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '13px', padding: '1rem' }}>
                No hay consultas registradas
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Weight modal */}
      <Modal isOpen={weightModal} onClose={() => setWeightModal(false)} title="Registrar Peso">
        <form onSubmit={handleAddWeight} className="management-form-premium">
          <div className="form-group">
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', marginBottom: '8px', display: 'block' }}>Peso (kg)</label>
            <input className="input-premium" type="number" step="0.1" required min="0.1"
              value={weightForm.weight} onChange={e => setWeightForm({ ...weightForm, weight: e.target.value })} />
          </div>
          <div className="form-group">
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', marginBottom: '8px', display: 'block' }}>Fecha</label>
            <input className="input-premium" type="date" required
              value={weightForm.recorded_date} onChange={e => setWeightForm({ ...weightForm, recorded_date: e.target.value })} />
          </div>
          <div className="form-group">
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', marginBottom: '8px', display: 'block' }}>Notas</label>
            <input className="input-premium" type="text" placeholder="Opcional"
              value={weightForm.notes} onChange={e => setWeightForm({ ...weightForm, notes: e.target.value })} />
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button type="button" onClick={() => setWeightModal(false)} className="btn" style={{ flex: 1, background: '#f1f5f9', color: '#475569' }}>Cancelar</button>
            <button type="submit" className="btn" style={{ flex: 2, background: 'var(--primary)', color: 'white' }}>Registrar</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default PetProfile
