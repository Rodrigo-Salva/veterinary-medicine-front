import React, { useState, useEffect } from 'react'
import { Shield, UserPlus, Edit2, PowerOff, Loader2, Search, User as UserIcon } from 'lucide-react'
import api from '../services/api'
import Modal from './Modal'
import ConfirmDialog from './ConfirmDialog'

interface UserData {
  id: string
  username: string
  email: string
  role: string
  is_active: boolean
}

const ROLE_STYLE: Record<string, { bg: string; color: string }> = {
  Admin:        { bg: '#f0e9ff', color: '#7c3aed' },
  Vet:          { bg: '#e0f2fe', color: '#0369a1' },
  Receptionist: { bg: '#d1fae5', color: '#065f46' },
}

const AVATAR_COLORS = ['#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6','#ef4444','#14b8a6']
const avatarColor = (name: string) => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]

const UserManagement: React.FC = () => {
  const [users, setUsers]         = useState<UserData[]>([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editUser, setEditUser]   = useState<UserData | null>(null)

  const [form, setForm] = useState({ username:'', email:'', password:'', role:'Vet' })
  const [saving, setSaving] = useState(false)
  const [confirmToggle, setConfirmToggle] = useState<UserData | null>(null)

  const load = async () => {
    try {
      const r = await api.get('/users/')
      setUsers(r.data)
    } catch { console.error('Error loading users') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditUser(null)
    setForm({ username:'', email:'', password:'', role:'Vet' })
    setModalOpen(true)
  }

  const openEdit = (u: UserData) => {
    setEditUser(u)
    setForm({ username: u.username, email: u.email, password:'', role: u.role })
    setModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      if (editUser) {
        const payload: any = { username: form.username, email: form.email, role: form.role }
        if (form.password) payload.password = form.password
        await api.put(`/users/${editUser.id}`, payload)
      } else {
        await api.post('/users/', form)
      }
      setModalOpen(false); load()
    } catch { alert('Error al guardar usuario') }
    finally { setSaving(false) }
  }

  const handleToggle = (u: UserData) => setConfirmToggle(u)

  const doToggle = async () => {
    if (!confirmToggle) return
    try {
      await api.patch(`/users/${confirmToggle.id}/toggle`)
      load()
    } catch { alert('No se pudo cambiar el estado') }
    finally { setConfirmToggle(null) }
  }

  const filtered = users.filter(u => {
    const q = search.toLowerCase()
    return u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q)
  })

  const activeCount   = users.filter(u => u.is_active).length
  const inactiveCount = users.length - activeCount

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="header-row">
        <div className="greetings">
          <h2 style={{ fontSize: '24px', fontWeight: 700 }}>Gestión de Usuarios</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Administra los accesos y roles de tu equipo</p>
        </div>
        <div className="search-bar">
          <Search size={18} color="#7c7c7c" />
          <input
            type="text"
            placeholder="Buscar por nombre, email, rol..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button className="btn" onClick={openCreate} style={{ background: 'var(--primary)', color: 'white' }}>
          <UserPlus size={18} />
          Nuevo Usuario
        </button>
      </div>

      {/* Stats */}
      <div className="stats-cards-grid" style={{ marginBottom: '20px' }}>
        <div className="stat-card-main">
          <p style={{ fontSize: '13px', color: '#a0a0a0' }}>Total Usuarios</p>
          <h4 style={{ fontSize: '28px', margin: '8px 0' }}>{users.length}</h4>
          <div className="card-footer">
            <Shield size={14} color="var(--primary)" />
            <p style={{ fontSize: '12px', color: '#a0a0a0', marginLeft: '5px' }}>Registrados</p>
          </div>
        </div>
        <div className="stat-card-main light">
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Activos</p>
          <h4 style={{ fontSize: '28px', margin: '8px 0', color: '#10b981' }}>{activeCount}</h4>
          <div className="card-footer">
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display:'inline-block' }} />
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginLeft: '5px' }}>Con acceso</p>
          </div>
        </div>
        <div className="stat-card-main light">
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Inactivos</p>
          <h4 style={{ fontSize: '28px', margin: '8px 0', color: inactiveCount > 0 ? 'var(--error)' : 'inherit' }}>{inactiveCount}</h4>
          <div className="card-footer">
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: inactiveCount > 0 ? 'var(--error)' : '#a0a0a0', display:'inline-block' }} />
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginLeft: '5px' }}>Sin acceso</p>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <Loader2 size={36} className="animate-spin" color="var(--primary)" />
        </div>
      ) : (
        <div className="section-card" style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f0f0f0', textAlign: 'left' }}>
                {['Usuario', 'Email', 'Rol', 'Estado', 'Acciones'].map(h => (
                  <th key={h} style={{ padding: '12px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '13px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? filtered.map(u => {
                const role = ROLE_STYLE[u.role] ?? { bg: '#f1f5f9', color: '#475569' }
                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid #f8f8f8', opacity: u.is_active ? 1 : 0.55 }}>
                    {/* Avatar + name */}
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '10px',
                          background: '#f0fdf4', border: '1.5px solid rgba(34,197,94,0.2)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <UserIcon size={17} color="var(--primary)" />
                        </div>
                        <span style={{ fontWeight: 600, fontSize: '14px', color: '#0f172a' }}>{u.username}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px', fontSize: '13px', color: '#64748b' }}>{u.email}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                        background: role.bg, color: role.color,
                      }}>
                        {u.role === 'Receptionist' ? 'Recepcionista' : u.role === 'Vet' ? 'Veterinario' : 'Administrador'}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '3px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 600,
                        background: u.is_active ? '#d1fae5' : '#fee2e2',
                        color: u.is_active ? '#059669' : '#dc2626',
                      }}>
                        {u.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button title="Editar" onClick={() => openEdit(u)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', padding: '4px' }}>
                          <Edit2 size={16} />
                        </button>
                        <button title={u.is_active ? 'Desactivar' : 'Activar'} onClick={() => handleToggle(u)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: u.is_active ? 'var(--error)' : '#10b981', padding: '4px' }}>
                          <PowerOff size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              }) : (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', fontSize: '14px' }}>
                  {search ? `Sin resultados para "${search}"` : 'No hay usuarios registrados'}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {confirmToggle && (
        <ConfirmDialog
          title={confirmToggle.is_active ? 'Desactivar usuario' : 'Activar usuario'}
          message={`¿Deseas ${confirmToggle.is_active ? 'desactivar' : 'activar'} al usuario "${confirmToggle.username}"?`}
          confirmLabel={confirmToggle.is_active ? 'Desactivar' : 'Activar'}
          variant={confirmToggle.is_active ? 'warning' : 'info'}
          onConfirm={doToggle}
          onCancel={() => setConfirmToggle(null)}
        />
      )}

      {/* Modal Create / Edit */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editUser ? 'Editar Usuario' : 'Nuevo Usuario'}>
        <form onSubmit={handleSave} className="management-form-premium">
          <div className="form-row">
            <div className="form-group">
              <label style={{ fontSize:'13px', fontWeight:600, color:'#64748b', marginBottom:'8px', display:'block' }}>
                Nombre de usuario
              </label>
              <input className="input-premium" type="text" required placeholder="johndoe"
                value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
            </div>
            <div className="form-group">
              <label style={{ fontSize:'13px', fontWeight:600, color:'#64748b', marginBottom:'8px', display:'block' }}>
                Rol
              </label>
              <select className="input-premium" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                <option value="Admin">Administrador</option>
                <option value="Vet">Veterinario</option>
                <option value="Receptionist">Recepcionista</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label style={{ fontSize:'13px', fontWeight:600, color:'#64748b', marginBottom:'8px', display:'block' }}>
              Correo electrónico
            </label>
            <input className="input-premium" type="email" required placeholder="correo@ejemplo.com"
              value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div className="form-group">
            <label style={{ fontSize:'13px', fontWeight:600, color:'#64748b', marginBottom:'8px', display:'block' }}>
              Contraseña {editUser && <span style={{ fontWeight:400, color:'#94a3b8' }}>(dejar vacío para no cambiar)</span>}
            </label>
            <input className="input-premium" type="password" required={!editUser} placeholder="••••••••"
              value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
          </div>
          <div style={{ display:'flex', gap:'10px', marginTop:'4px' }}>
            <button type="button" className="btn" onClick={() => setModalOpen(false)}
              style={{ flex:1, background:'#f1f5f9', color:'#475569' }}>Cancelar</button>
            <button type="submit" className="btn" disabled={saving}
              style={{ flex:2, background:'var(--primary)', color:'white' }}>
              {saving ? 'Guardando...' : editUser ? 'Guardar Cambios' : 'Crear Usuario'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default UserManagement
