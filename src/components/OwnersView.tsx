import React, { useEffect, useState } from 'react'
import { Plus, Search, Pencil, Dog, Users, UserCheck, UserX, Loader2, User as UserIcon } from 'lucide-react'
import { ownerService, petService } from '../services/api'
import api from '../services/api'
import Modal from './Modal'
import ConfirmDialog from './ConfirmDialog'
import type { Owner, OwnerCreate } from '../types'

// ── Tipos locales ─────────────────────────────────────────────────────────────
interface OwnerWithPets extends Owner {
  petCount: number
}

interface FormState {
  first_name: string
  last_name: string
  email: string
  phone: string
}

const emptyForm: FormState = { first_name: '', last_name: '', email: '', phone: '' }

// ── Componente ────────────────────────────────────────────────────────────────
const OwnersView: React.FC = () => {
  const [owners, setOwners]           = useState<OwnerWithPets[]>([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [showModal, setShowModal]     = useState(false)
  const [editTarget, setEditTarget]   = useState<Owner | null>(null)
  const [form, setForm]               = useState<FormState>(emptyForm)
  const [saving, setSaving]           = useState(false)
  const [formError, setFormError]     = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Owner | null>(null)

  // Carga datos
  const load = async () => {
    setLoading(true)
    try {
      const [ownersData, petsData] = await Promise.all([
        ownerService.getAll(),
        petService.getAll(),
      ])
      const countMap: Record<string, number> = {}
      petsData.forEach(p => {
        countMap[p.owner_id] = (countMap[p.owner_id] ?? 0) + 1
      })
      setOwners(ownersData.map(o => ({ ...o, petCount: countMap[o.id] ?? 0 })))
    } catch {
      // silencioso
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  // Filtro de búsqueda
  const filtered = owners.filter(o => {
    const q = search.toLowerCase()
    return (
      `${o.first_name} ${o.last_name}`.toLowerCase().includes(q) ||
      o.email.toLowerCase().includes(q) ||
      o.phone.toLowerCase().includes(q)
    )
  })

  // Stats
  const totalOwners    = owners.length
  const withPets       = owners.filter(o => o.petCount > 0).length
  const withoutPets    = owners.filter(o => o.petCount === 0).length

  // Abrir modal crear
  const handleNew = () => {
    setEditTarget(null)
    setForm(emptyForm)
    setFormError('')
    setShowModal(true)
  }

  // Abrir modal editar
  const handleEdit = (owner: Owner) => {
    setEditTarget(owner)
    setForm({
      first_name: owner.first_name,
      last_name:  owner.last_name,
      email:      owner.email,
      phone:      owner.phone,
    })
    setFormError('')
    setShowModal(true)
  }

  // Guardar (crear o editar)
  const handleSave = async () => {
    const { first_name, last_name, email, phone } = form
    if (!first_name.trim() || !last_name.trim() || !email.trim()) {
      setFormError('Nombre, apellido y correo son obligatorios.')
      return
    }
    setSaving(true)
    setFormError('')
    try {
      if (editTarget) {
        await api.put(`/owners/${editTarget.id}`, { first_name, last_name, email, phone })
      } else {
        await ownerService.create({ first_name, last_name, email, phone } as OwnerCreate)
      }
      setShowModal(false)
      await load()
    } catch (err: any) {
      setFormError(err?.response?.data?.detail ?? 'Error al guardar. Intente de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  // Confirmar eliminación
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    try {
      await api.delete(`/owners/${deleteTarget.id}`)
      setDeleteTarget(null)
      await load()
    } catch {
      setDeleteTarget(null)
    }
  }

  // Avatar inicial
  const avatarLetter = (o: Owner) =>
    `${o.first_name[0] ?? ''}${o.last_name[0] ?? ''}`.toUpperCase()

  if (loading) return (
    <div className="dashboard-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
      <Loader2 className="animate-spin" size={48} color="var(--primary)" />
    </div>
  )

  return (
    <div className="dashboard-container">

      {/* ── Header ── */}
      <div className="header-row">
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Propietarios
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Gestión de dueños de mascotas
          </p>
        </div>
        <button className="btn-premium" onClick={handleNew}>
          <Plus size={18} />
          Nuevo Propietario
        </button>
      </div>

      {/* ── Barra de búsqueda ── */}
      <div className="search-bar" style={{ width: '100%', maxWidth: '420px' }}>
        <Search size={16} color="var(--text-secondary)" />
        <input
          placeholder="Buscar por nombre, email o teléfono..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* ── Stats cards ── */}
      <div className="stats-cards-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card-main" style={{ background: '#0d2b2b', color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: 'rgba(34,197,94,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={16} color="#22c55e" />
            </div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#22c55e' }}>{totalOwners}</div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginTop: '6px' }}>Propietarios registrados</div>
        </div>

        <div className="stat-card-main light">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Con mascotas
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserCheck size={16} color="var(--primary)" />
            </div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--primary)' }}>{withPets}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px' }}>Tienen al menos 1 mascota</div>
        </div>

        <div className="stat-card-main light">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Sin mascotas
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserX size={16} color="var(--warning)" />
            </div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--warning)' }}>{withoutPets}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px' }}>Sin mascotas aún</div>
        </div>
      </div>

      {/* ── Tabla ── */}
      <div className="section-card">
        <div className="section-header">
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Lista de Propietarios
          </h3>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-secondary)' }}>
            <Users size={40} style={{ marginBottom: '12px', opacity: 0.3 }} />
            <p style={{ fontSize: '15px' }}>No se encontraron propietarios</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Propietario</th>
                <th>Correo</th>
                <th>Teléfono</th>
                <th>Mascotas</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(owner => (
                <tr key={owner.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '10px',
                        background: '#f0fdf4', border: '1.5px solid rgba(34,197,94,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <UserIcon size={17} color="var(--primary)" />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>
                          {owner.first_name} {owner.last_name}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>ID: {owner.id.slice(0, 8)}…</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{owner.email}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{owner.phone || '—'}</td>
                  <td>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      padding: '4px 10px', borderRadius: '10px',
                      background: owner.petCount > 0 ? '#f0fdf4' : '#f8fafc',
                      color: owner.petCount > 0 ? 'var(--primary)' : 'var(--text-secondary)',
                      fontSize: '13px', fontWeight: 600,
                    }}>
                      <Dog size={13} />
                      {owner.petCount}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="btn"
                        title="Editar propietario"
                        onClick={() => handleEdit(owner)}
                        style={{ background: '#f0fdf4', color: 'var(--primary)', padding: '8px 12px' }}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        className="btn"
                        title="Ver mascotas"
                        onClick={() => {/* Navegación futura */}}
                        style={{ background: '#f0f4ff', color: '#6366f1', padding: '8px 12px' }}
                      >
                        <Dog size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Modal crear/editar ── */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editTarget ? 'Editar Propietario' : 'Nuevo Propietario'}
      >
        <div className="management-form-premium">
          <div className="form-row">
            <div className="form-group">
              <label>Nombre</label>
              <input
                className="input-premium"
                placeholder="Nombre"
                value={form.first_name}
                onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>Apellido</label>
              <input
                className="input-premium"
                placeholder="Apellido"
                value={form.last_name}
                onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Correo electrónico</label>
            <input
              className="input-premium"
              type="email"
              placeholder="correo@ejemplo.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label>Teléfono</label>
            <input
              className="input-premium"
              type="tel"
              placeholder="+52 000 000 0000"
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            />
          </div>

          {formError && (
            <p style={{ color: 'var(--error)', fontSize: '13px', background: '#fee2e2', borderRadius: '8px', padding: '10px 14px' }}>
              {formError}
            </p>
          )}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '4px' }}>
            <button
              className="btn"
              onClick={() => setShowModal(false)}
              style={{ background: '#f1f5f9', color: 'var(--text-secondary)' }}
            >
              Cancelar
            </button>
            <button
              className="btn-premium"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : null}
              {editTarget ? 'Guardar cambios' : 'Crear propietario'}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── ConfirmDialog eliminar ── */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Eliminar propietario"
        message={deleteTarget ? `¿Eliminar a ${deleteTarget.first_name} ${deleteTarget.last_name}? Esta acción no se puede deshacer.` : ''}
        confirmLabel="Eliminar"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

export default OwnersView
