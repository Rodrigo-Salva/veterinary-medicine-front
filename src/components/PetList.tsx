import React, { useEffect, useState } from 'react'
import { petService, ownerService } from '../services/api'
import { Pet, PetUpdate, Owner } from '../types'
import Modal from './Modal'
import { Loader2, Dog, Cat, Bird, Heart, AlertCircle, Edit2, PowerOff, Users } from 'lucide-react'
import ConfirmDialog from './ConfirmDialog'
import { useNotify } from '../context/NotificationContext'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b',
  '#10b981', '#3b82f6', '#ef4444', '#14b8a6',
]
const avatarColor = (name: string) => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]

const SpeciesIcon: React.FC<{ species: string }> = ({ species }) => {
  const s = species.toLowerCase()
  if (s.includes('dog') || s.includes('perro')) return <Dog size={14} />
  if (s.includes('cat') || s.includes('gato')) return <Cat size={14} />
  if (s.includes('bird') || s.includes('ave')) return <Bird size={14} />
  return <Heart size={14} />
}

// ─── Edit Form ────────────────────────────────────────────────────────────────

interface EditFormProps {
  pet: Pet
  onSuccess: (updated: Pet) => void
  onCancel: () => void
}

const EditPetForm: React.FC<EditFormProps> = ({ pet, onSuccess, onCancel }) => {
  const notify = useNotify()
  const [form, setForm] = useState<PetUpdate>({
    name: pet.name,
    species: pet.species,
    breed: pet.breed,
    age: pet.age,
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const updated = await petService.update(pet.id, form)
      notify.success('Mascota actualizada correctamente')
      onSuccess(updated)
    } catch (err) {
      notify.error('Error al actualizar la mascota')
    } finally {
      setLoading(false)
    }
  }

  const field = (label: string, key: keyof PetUpdate, type = 'text', extra?: object) => (
    <div className="form-group">
      <label style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', marginBottom: '8px', display: 'block' }}>
        {label}
      </label>
      <input
        className="input-premium"
        type={type}
        value={form[key] as string | number ?? ''}
        onChange={e => setForm({ ...form, [key]: type === 'number' ? parseInt(e.target.value) : e.target.value })}
        required
        {...extra}
      />
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="management-form-premium">
      {field('Nombre', 'name')}
      <div className="form-row">
        {field('Especie', 'species')}
        {field('Raza', 'breed')}
      </div>
      {field('Edad (años)', 'age', 'number', { min: 0 })}
      <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
        <button type="button" onClick={onCancel} className="btn" style={{ flex: 1, background: '#f1f5f9', color: '#475569' }}>
          Cancelar
        </button>
        <button type="submit" className="btn" disabled={loading} style={{ flex: 2, background: 'var(--primary)', color: 'white' }}>
          {loading ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </form>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface PetListProps {
  searchQuery?: string
  onSelectPet?: (petId: string) => void
}

const PetList: React.FC<PetListProps> = ({ searchQuery = '', onSelectPet }) => {
  const notify = useNotify()
  const [pets, setPets] = useState<Pet[]>([])
  const [owners, setOwners] = useState<Owner[]>([])
  const [loading, setLoading] = useState(true)
  const [editPet, setEditPet] = useState<Pet | null>(null)
  const [confirmPet, setConfirmPet] = useState<Pet | null>(null)

  const load = async () => {
    try {
      const [p, o] = await Promise.all([petService.getAll(), ownerService.getAll()])
      setPets(p)
      setOwners(o)
    } catch (e) {
      notify.error('Error al cargar la lista de pacientes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const ownerName = (ownerId: string) => {
    const o = owners.find(o => o.id === ownerId)
    return o ? `${o.first_name} ${o.last_name}` : '—'
  }

  const handleDeactivate = async (pet: Pet) => {
    try {
      const updated = await petService.deactivate(pet.id)
      notify.success(`${pet.name} desactivado correctamente`)
      setPets(prev => prev.map(p => p.id === updated.id ? updated : p))
    } catch (e) {
      notify.error('Error al desactivar la mascota')
    }
  }

  const handleEditSuccess = (updated: Pet) => {
    setPets(prev => prev.map(p => p.id === updated.id ? updated : p))
    setEditPet(null)
  }

  const filtered = pets.filter(p => {
    const q = searchQuery.toLowerCase()
    return (
      p.name.toLowerCase().includes(q) ||
      p.species.toLowerCase().includes(q) ||
      p.breed.toLowerCase().includes(q) ||
      ownerName(p.owner_id).toLowerCase().includes(q)
    )
  })

  const active = pets.filter(p => p.is_active).length
  const inactive = pets.length - active

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '4rem', color: '#6366f1' }}>
        <Loader2 size={36} className="animate-spin" />
        <span style={{ fontSize: '14px', color: '#9ca3af' }}>Cargando pacientes...</span>
      </div>
    )
  }

  return (
    <>
      {/* Stats row */}
      <div className="stats-cards-grid" style={{ marginBottom: '20px' }}>
        <div className="stat-card-main">
          <p style={{ fontSize: '13px', color: '#a0a0a0' }}>Total Mascotas</p>
          <h4 style={{ fontSize: '28px', margin: '8px 0' }}>{pets.length}</h4>
          <div className="card-footer">
            <Users size={14} color="#6366f1" />
            <p style={{ fontSize: '12px', color: '#a0a0a0', marginLeft: '5px' }}>Registradas</p>
          </div>
        </div>
        <div className="stat-card-main light">
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Activas</p>
          <h4 style={{ fontSize: '28px', margin: '8px 0', color: '#10b981' }}>{active}</h4>
          <div className="card-footer">
            <Heart size={14} color="#10b981" />
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginLeft: '5px' }}>En seguimiento</p>
          </div>
        </div>
        <div className="stat-card-main light">
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Inactivas</p>
          <h4 style={{ fontSize: '28px', margin: '8px 0', color: inactive > 0 ? 'var(--error)' : 'inherit' }}>{inactive}</h4>
          <div className="card-footer">
            <AlertCircle size={14} color={inactive > 0 ? 'var(--error)' : '#a0a0a0'} />
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginLeft: '5px' }}>Desactivadas</p>
          </div>
        </div>
      </div>

      {/* Table card */}
      <div className="section-card" style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #f0f0f0', textAlign: 'left' }}>
              {['Mascota', 'Especie / Raza', 'Dueño', 'Edad', 'Estado', 'Acciones'].map(h => (
                <th key={h} style={{ padding: '12px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '13px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? filtered.map(pet => (
              <tr
                key={pet.id}
                style={{
                  borderBottom: '1px solid #f8f8f8',
                  opacity: pet.is_active ? 1 : 0.5,
                  transition: 'opacity 0.2s',
                }}
              >
                {/* Name */}
                <td style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '10px',
                      background: '#f0fdf4', border: '1.5px solid rgba(34,197,94,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Dog size={18} color="var(--primary)" />
                    </div>
                    <span
                      onClick={() => onSelectPet?.(pet.id)}
                      style={{ fontWeight: 600, fontSize: '14px', color: '#0f172a', cursor: onSelectPet ? 'pointer' : 'default', textDecoration: onSelectPet ? 'none' : 'none' }}
                      onMouseEnter={e => { if (onSelectPet) (e.target as HTMLElement).style.color = 'var(--primary)' }}
                      onMouseLeave={e => { (e.target as HTMLElement).style.color = '#0f172a' }}
                    >{pet.name}</span>
                  </div>
                </td>

                {/* Species / Breed */}
                <td style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#475569', fontSize: '13px' }}>
                    <SpeciesIcon species={pet.species} />
                    {pet.species}
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{pet.breed}</div>
                </td>

                {/* Owner */}
                <td style={{ padding: '12px', fontSize: '13px', color: '#64748b' }}>
                  {ownerName(pet.owner_id)}
                </td>

                {/* Age */}
                <td style={{ padding: '12px' }}>
                  <span style={{ fontWeight: 600, fontSize: '13px' }}>{pet.age}</span>
                  <span style={{ fontSize: '12px', color: '#94a3b8', marginLeft: '3px' }}>años</span>
                </td>

                {/* Status badge */}
                <td style={{ padding: '12px' }}>
                  <span style={{
                    padding: '3px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 600,
                    background: pet.is_active ? '#d1fae5' : '#fee2e2',
                    color: pet.is_active ? '#059669' : '#dc2626',
                  }}>
                    {pet.is_active ? 'Activa' : 'Inactiva'}
                  </span>
                </td>

                {/* Actions */}
                <td style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      title="Editar"
                      onClick={() => setEditPet(pet)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', padding: '4px' }}
                    >
                      <Edit2 size={16} />
                    </button>
                    {pet.is_active && (
                      <button
                        title="Desactivar"
                        onClick={() => setConfirmPet(pet)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)', padding: '4px' }}
                      >
                        <PowerOff size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6}>
                  <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                    <Heart size={36} style={{ margin: '0 auto 10px', opacity: 0.3, display: 'block' }} />
                    <p style={{ margin: 0, fontWeight: 600 }}>
                      {searchQuery ? `Sin resultados para "${searchQuery}"` : 'No hay mascotas registradas'}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        isOpen={!!confirmPet}
        title="Desactivar Mascota"
        message={`¿Desactivar a ${confirmPet?.name}? Podrá reactivarse desde administración.`}
        confirmLabel="Desactivar"
        variant="warning"
        onConfirm={() => { if (confirmPet) handleDeactivate(confirmPet); setConfirmPet(null) }}
        onCancel={() => setConfirmPet(null)}
      />

      {/* Edit Modal */}
      <Modal isOpen={!!editPet} onClose={() => setEditPet(null)} title="Editar Mascota">
        {editPet && (
          <EditPetForm
            pet={editPet}
            onSuccess={handleEditSuccess}
            onCancel={() => setEditPet(null)}
          />
        )}
      </Modal>
    </>
  )
}

export default PetList
