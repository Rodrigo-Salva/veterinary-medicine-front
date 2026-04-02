import React, { useState, useEffect } from 'react'
import { Shield, Plus, Edit2, Trash2, Loader2, Save, X } from 'lucide-react'
import { roleService } from '../services/api'
import type { Role, Permission } from '../types'
import Modal from './Modal'
import ConfirmDialog from './ConfirmDialog'
import { useNotify } from '../context/NotificationContext'

const MODULE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  mascotas: 'Mascotas',
  propietarios: 'Propietarios',
  citas: 'Citas',
  historial_medico: 'Historial Médico',
  hospitalizacion: 'Hospitalización',
  inventario: 'Inventario',
  facturacion: 'Facturación',
  reportes: 'Reportes',
  usuarios: 'Usuarios',
  roles: 'Roles',
  laboratorio: 'Laboratorio',
  telemedicina: 'Telemedicina',
}

const ACTION_LABELS: Record<string, string> = {
  listar: 'Listar',
  registrar: 'Registrar',
  editar: 'Editar',
  eliminar: 'Eliminar',
}

const RoleManagement: React.FC = () => {
  const notify = useNotify()
  const [roles, setRoles] = useState<Role[]>([])
  const [allPermissions, setAllPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [activePerms, setActivePerms] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ name: '', description: '' })
  const [editRole, setEditRole] = useState<Role | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Role | null>(null)

  const load = async () => {
    try {
      const [r, p] = await Promise.all([roleService.getAll(), roleService.getAllPermissions()])
      setRoles(r)
      setAllPermissions(p)
      if (r.length > 0 && !selectedRole) {
        selectRole(r[0])
      } else if (selectedRole) {
        const updated = r.find(role => role.id === selectedRole.id)
        if (updated) selectRole(updated)
      }
    } catch { 
      notify.error('Error al cargar roles y permisos')
    }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const selectRole = (role: Role) => {
    setSelectedRole(role)
    setActivePerms(new Set(role.permissions.map(p => p.id)))
  }

  const togglePermission = (permId: string) => {
    setActivePerms(prev => {
      const next = new Set(prev)
      if (next.has(permId)) next.delete(permId)
      else next.add(permId)
      return next
    })
  }

  const toggleModule = (module: string) => {
    const modulePerms = allPermissions.filter(p => p.module === module)
    const allActive = modulePerms.every(p => activePerms.has(p.id))
    setActivePerms(prev => {
      const next = new Set(prev)
      modulePerms.forEach(p => {
        if (allActive) next.delete(p.id)
        else next.add(p.id)
      })
      return next
    })
  }

  const savePermissions = async () => {
    if (!selectedRole) return
    setSaving(true)
    try {
      await roleService.setPermissions(selectedRole.id, Array.from(activePerms))
      notify.success('Permisos actualizados correctamente')
      await load()
    } catch { 
      notify.error('Error al guardar los permisos')
    }
    finally { setSaving(false) }
  }

  const openCreate = () => {
    setEditRole(null)
    setForm({ name: '', description: '' })
    setModalOpen(true)
  }

  const openEdit = (role: Role) => {
    setEditRole(role)
    setForm({ name: role.name, description: role.description || '' })
    setModalOpen(true)
  }

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editRole) {
        await roleService.update(editRole.id, form)
        notify.success('Rol actualizado con éxito')
      } else {
        await roleService.create(form)
        notify.success('Rol creado correctamente')
      }
      setModalOpen(false)
      await load()
    } catch { 
      notify.error('Error al guardar el rol')
    }
    finally { setSaving(false) }
  }

  const doDelete = async () => {
    if (!confirmDelete) return
    try {
      await roleService.delete(confirmDelete.id)
      notify.success('Rol eliminado')
      if (selectedRole?.id === confirmDelete.id) setSelectedRole(null)
      await load()
    } catch { 
      notify.error('No se puede eliminar este rol (puede tener usuarios asignados)')
    }
    finally { setConfirmDelete(null) }
  }

  // Group permissions by module
  const modules = Array.from(new Set(allPermissions.map(p => p.module)))

  const hasChanges = selectedRole && (
    activePerms.size !== selectedRole.permissions.length ||
    !selectedRole.permissions.every(p => activePerms.has(p.id))
  )

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <Loader2 size={36} className="animate-spin" color="var(--primary)" />
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="header-row">
        <div className="greetings">
          <h2 style={{ fontSize: '24px', fontWeight: 700 }}>Roles y Permisos</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Configura los permisos de cada rol del sistema
          </p>
        </div>
        <button className="btn" onClick={openCreate} style={{ background: 'var(--primary)', color: 'white' }}>
          <Plus size={18} /> Nuevo Rol
        </button>
      </div>

      <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
        {/* Sidebar: Role list */}
        <div style={{
          width: '260px', flexShrink: 0, background: 'white', borderRadius: '16px',
          padding: '16px', boxShadow: 'var(--shadow)',
        }}>
          <p style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Roles del sistema
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {roles.map(role => (
              <div
                key={role.id}
                onClick={() => selectRole(role)}
                style={{
                  padding: '12px 14px', borderRadius: '10px', cursor: 'pointer',
                  background: selectedRole?.id === role.id ? 'var(--primary)' : '#f8fafc',
                  color: selectedRole?.id === role.id ? 'white' : '#334155',
                  transition: 'all 0.15s ease',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>{role.name}</div>
                  {role.description && (
                    <div style={{
                      fontSize: '12px', marginTop: '2px',
                      color: selectedRole?.id === role.id ? 'rgba(255,255,255,0.75)' : '#94a3b8',
                    }}>
                      {role.description}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    title="Editar"
                    onClick={(e) => { e.stopPropagation(); openEdit(role) }}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
                      color: selectedRole?.id === role.id ? 'rgba(255,255,255,0.8)' : '#94a3b8',
                    }}
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    title="Eliminar"
                    onClick={(e) => { e.stopPropagation(); setConfirmDelete(role) }}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
                      color: selectedRole?.id === role.id ? 'rgba(255,255,255,0.8)' : '#94a3b8',
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main: Permissions grid */}
        <div style={{ flex: 1 }}>
          {selectedRole ? (
            <>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: '16px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Shield size={20} color="var(--primary)" />
                  <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>
                    Permisos de "{selectedRole.name}"
                  </h3>
                </div>
                {hasChanges && (
                  <button
                    className="btn"
                    onClick={savePermissions}
                    disabled={saving}
                    style={{ background: 'var(--primary)', color: 'white' }}
                  >
                    <Save size={16} />
                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                )}
              </div>

              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '16px',
              }}>
                {modules.map(module => {
                  const modulePerms = allPermissions.filter(p => p.module === module)
                  const allActive = modulePerms.every(p => activePerms.has(p.id))
                  const someActive = modulePerms.some(p => activePerms.has(p.id))

                  return (
                    <div key={module} style={{
                      background: 'white', borderRadius: '16px', overflow: 'hidden',
                      boxShadow: 'var(--shadow)',
                    }}>
                      {/* Module header */}
                      <div
                        onClick={() => toggleModule(module)}
                        style={{
                          background: 'var(--primary)', color: 'white', padding: '14px 18px',
                          cursor: 'pointer', display: 'flex', alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span style={{ fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          {MODULE_LABELS[module] || module}
                        </span>
                        <div style={{
                          width: '18px', height: '18px', borderRadius: '4px',
                          border: '2px solid rgba(255,255,255,0.6)',
                          background: allActive ? 'white' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {allActive && <span style={{ color: 'var(--primary)', fontSize: '12px', fontWeight: 700 }}>&#10003;</span>}
                          {!allActive && someActive && <span style={{ color: 'white', fontSize: '10px' }}>&#8211;</span>}
                        </div>
                      </div>

                      {/* Permission toggles */}
                      <div style={{ padding: '8px 0' }}>
                        {modulePerms.map(perm => (
                          <div
                            key={perm.id}
                            onClick={() => togglePermission(perm.id)}
                            style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              padding: '14px 18px', cursor: 'pointer',
                              borderBottom: '1px solid #f1f5f9',
                            }}
                          >
                            <span style={{ fontSize: '14px', fontWeight: 500, color: '#334155' }}>
                              {ACTION_LABELS[perm.action] || perm.action}
                            </span>
                            {/* Toggle switch */}
                            <div style={{
                              width: '44px', height: '24px', borderRadius: '12px',
                              background: activePerms.has(perm.id) ? 'var(--primary)' : '#e2e8f0',
                              position: 'relative', transition: 'background 0.2s ease',
                              flexShrink: 0,
                            }}>
                              <div style={{
                                width: '20px', height: '20px', borderRadius: '50%',
                                background: 'white', position: 'absolute', top: '2px',
                                left: activePerms.has(perm.id) ? '22px' : '2px',
                                transition: 'left 0.2s ease',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                              }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', padding: '4rem', color: '#94a3b8',
            }}>
              <Shield size={48} />
              <p style={{ marginTop: '12px', fontSize: '15px' }}>Selecciona un rol para ver sus permisos</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Create/Edit Role */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editRole ? 'Editar Rol' : 'Nuevo Rol'}>
        <form onSubmit={handleSaveRole} className="management-form-premium">
          <div className="form-group">
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', marginBottom: '8px', display: 'block' }}>
              Nombre del rol
            </label>
            <input
              className="input-premium" type="text" required placeholder="Ej: Administrador"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', marginBottom: '8px', display: 'block' }}>
              Descripción
            </label>
            <input
              className="input-premium" type="text" placeholder="Descripción breve del rol"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button type="button" className="btn" onClick={() => setModalOpen(false)}
              style={{ flex: 1, background: '#f1f5f9', color: '#475569' }}>
              Cancelar
            </button>
            <button type="submit" className="btn" disabled={saving}
              style={{ flex: 2, background: 'var(--primary)', color: 'white' }}>
              {saving ? 'Guardando...' : editRole ? 'Guardar Cambios' : 'Crear Rol'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete */}
      {confirmDelete && (
        <ConfirmDialog
          isOpen={!!confirmDelete}
          title="Eliminar rol"
          message={`¿Estás seguro de eliminar el rol "${confirmDelete.name}"? Los usuarios con este rol perderán acceso.`}
          confirmLabel="Eliminar"
          variant="warning"
          onConfirm={() => { doDelete() }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  )
}

export default RoleManagement
