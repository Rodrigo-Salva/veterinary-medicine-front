import React, { useEffect, useState } from 'react'
import { Plus, X, CheckCircle, XCircle, Clock, DollarSign, Trash2, FileText, Search, Check } from 'lucide-react'
import { billingService, petService, ownerService } from '../services/api'
import Modal from './Modal'
import ConfirmDialog from './ConfirmDialog'

interface InvoiceItem { description: string; quantity: number; unit_price: number }
interface Invoice {
  id: string; pet_id: string; owner_id: string; date: string
  subtotal: number; tax_rate: number; total: number; status: string
  notes?: string; items: InvoiceItem[]
}

const STATUS_CFG: Record<string, { bg: string; color: string; label: string; icon: React.ReactNode }> = {
  Pending:   { bg: '#fffbeb', color: '#d97706', label: 'Pendiente',  icon: <Clock size={12} /> },
  Paid:      { bg: '#f0fdf4', color: '#15803d', label: 'Pagada',     icon: <CheckCircle size={12} /> },
  Cancelled: { bg: '#fff1f2', color: '#be123c', label: 'Cancelada',  icon: <XCircle size={12} /> },
}

const BillingView: React.FC = () => {
  const [invoices, setInvoices]   = useState<Invoice[]>([])
  const [filter, setFilter]       = useState('')
  const [showModal, setShowModal] = useState(false)
  const [pets, setPets]           = useState<any[]>([])
  const [owners, setOwners]       = useState<any[]>([])
  const [loading, setLoading]     = useState(false)

  // Confirm dialog state
  const [confirm, setConfirm] = useState<{ open: boolean; title: string; message: string; onConfirm: () => void }>({
    open: false, title: '', message: '', onConfirm: () => {},
  })

  const [form, setForm] = useState({
    pet_id: '', owner_id: '', tax_rate: '0', notes: '',
    items: [{ description: '', quantity: 1, unit_price: 0 }],
  })

  const load = async () => {
    try { setInvoices(await billingService.getAll(filter || undefined)) } catch {}
  }

  useEffect(() => { load() }, [filter])
  useEffect(() => {
    petService.getAll().then(setPets).catch(() => {})
    ownerService.getAll().then(setOwners).catch(() => {})
  }, [])

  const addItem    = () => setForm(f => ({ ...f, items: [...f.items, { description: '', quantity: 1, unit_price: 0 }] }))
  const removeItem = (i: number) => setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }))
  const updateItem = (i: number, key: string, val: any) =>
    setForm(f => { const items = [...f.items]; items[i] = { ...items[i], [key]: val }; return { ...f, items } })

  const formSubtotal = form.items.reduce((s, it) => s + (it.quantity || 0) * (it.unit_price || 0), 0)
  const formTotal    = formSubtotal * (1 + parseFloat(form.tax_rate || '0') / 100)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    try {
      await billingService.create({
        pet_id: form.pet_id, owner_id: form.owner_id,
        tax_rate: parseFloat(form.tax_rate) || 0, notes: form.notes,
        items: form.items,
      })
      setShowModal(false)
      setForm({ pet_id: '', owner_id: '', tax_rate: '0', notes: '', items: [{ description: '', quantity: 1, unit_price: 0 }] })
      load()
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const askStatus = (inv: Invoice, status: string) => {
    const isCancel = status === 'Cancelled'
    setConfirm({
      open: true,
      title: isCancel ? 'Cancelar Factura' : 'Marcar como Pagada',
      message: isCancel
        ? `¿Estás seguro de cancelar la factura #${inv.id.slice(0, 8)}? Esta acción no se puede deshacer.`
        : `¿Confirmar el pago de la factura #${inv.id.slice(0, 8)} por $${inv.total.toFixed(2)}?`,
      onConfirm: async () => {
        setConfirm(c => ({ ...c, open: false }))
        try { await billingService.updateStatus(inv.id, status); load() } catch {}
      },
    })
  }

  const askDelete = (inv: Invoice) => {
    setConfirm({
      open: true,
      title: 'Eliminar Factura',
      message: `¿Eliminar permanentemente la factura #${inv.id.slice(0, 8)}? No se podrá recuperar.`,
      onConfirm: async () => {
        setConfirm(c => ({ ...c, open: false }))
        try { await billingService.delete(inv.id); load() } catch {}
      },
    })
  }

  const petName   = (id: string) => pets.find(p => p.id === id)?.name ?? id.slice(0, 8)
  const ownerName = (id: string) => { const o = owners.find(o => o.id === id); return o ? `${o.first_name} ${o.last_name}` : '—' }

  const paidTotal    = invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + i.total, 0)
  const pendingCount = invoices.filter(i => i.status === 'Pending').length

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="header-row">
        <div className="greetings">
          <h2 style={{ fontSize: '24px', fontWeight: 700 }}>Facturación</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Gestión de facturas y cobros</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[['', 'Todas'], ['Pending', 'Pendientes'], ['Paid', 'Pagadas'], ['Cancelled', 'Canceladas']].map(([val, label]) => (
            <button
              key={val}
              className="btn"
              onClick={() => setFilter(val)}
              style={{
                background: filter === val ? 'var(--primary)' : '#f1f5f9',
                color: filter === val ? '#fff' : '#64748b',
                padding: '8px 14px', fontSize: '13px',
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <button className="btn" onClick={() => setShowModal(true)} style={{ background: 'var(--primary)', color: 'white' }}>
          <Plus size={18} /> Nueva Factura
        </button>
      </div>

      {/* Stats */}
      <div className="stats-cards-grid" style={{ marginBottom: '20px' }}>
        <div className="stat-card-main">
          <p style={{ fontSize: '13px', color: '#a0a0a0' }}>Total Facturas</p>
          <h4 style={{ fontSize: '28px', margin: '8px 0' }}>{invoices.length}</h4>
          <div className="card-footer">
            <FileText size={14} color="var(--primary)" />
            <p style={{ fontSize: '12px', color: '#a0a0a0', marginLeft: '5px' }}>Emitidas</p>
          </div>
        </div>
        <div className="stat-card-main light">
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Pendientes</p>
          <h4 style={{ fontSize: '28px', margin: '8px 0', color: pendingCount > 0 ? '#d97706' : 'inherit' }}>{pendingCount}</h4>
          <div className="card-footer">
            <Clock size={14} color="#d97706" />
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginLeft: '5px' }}>Por cobrar</p>
          </div>
        </div>
        <div className="stat-card-main light">
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Ingresos Cobrados</p>
          <h4 style={{ fontSize: '28px', margin: '8px 0', color: '#15803d' }}>${paidTotal.toFixed(2)}</h4>
          <div className="card-footer">
            <DollarSign size={14} color="#15803d" />
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginLeft: '5px' }}>Pagadas</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="section-card" style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow)' }}>
        {invoices.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
            <FileText size={40} style={{ margin: '0 auto 12px', opacity: .3, display: 'block' }} />
            <p style={{ margin: 0, fontWeight: 600 }}>Sin facturas{filter ? ` con estado "${filter}"` : ''}</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f0f0f0', textAlign: 'left' }}>
                {['#Factura', 'Paciente / Dueño', 'Fecha', 'Subtotal', 'Total', 'Estado', 'Acciones'].map(h => (
                  <th key={h} style={{ padding: '12px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '13px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => {
                const s = STATUS_CFG[inv.status] ?? STATUS_CFG.Pending
                return (
                  <tr key={inv.id} style={{ borderBottom: '1px solid #f8f8f8' }}>
                    <td style={{ padding: '12px' }}>
                      <code style={{ fontSize: '12px', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', color: '#475569' }}>
                        #{inv.id.slice(0, 8)}
                      </code>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 600, fontSize: '14px', color: '#0f172a' }}>{petName(inv.pet_id)}</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>{ownerName(inv.owner_id)}</div>
                    </td>
                    <td style={{ padding: '12px', fontSize: '13px', color: '#64748b' }}>
                      {new Date(inv.date).toLocaleDateString('es')}
                    </td>
                    <td style={{ padding: '12px', fontSize: '13px', color: '#64748b' }}>${inv.subtotal.toFixed(2)}</td>
                    <td style={{ padding: '12px', fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>${inv.total.toFixed(2)}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '5px',
                        padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 600,
                        background: s.bg, color: s.color,
                      }}>
                        {s.icon} {s.label}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {inv.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => askStatus(inv, 'Paid')}
                              style={{ background: '#f0fdf4', border: 'none', borderRadius: '6px', color: '#15803d', padding: '5px 10px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                            >
                              <Check size={12} style={{ display: 'inline', marginRight: 4 }} />Pagar
                            </button>
                            <button
                              onClick={() => askStatus(inv, 'Cancelled')}
                              style={{ background: '#f1f5f9', border: 'none', borderRadius: '6px', color: '#64748b', padding: '5px 10px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                            >
                              Cancelar
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => askDelete(inv)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)', padding: '4px' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Nueva Factura */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nueva Factura">
        <form onSubmit={handleCreate} className="management-form-premium">
          <div className="form-row">
            <div className="form-group">
              <label style={lbl}>Mascota</label>
              <select className="input-premium" required value={form.pet_id}
                onChange={e => setForm(f => ({ ...f, pet_id: e.target.value }))}>
                <option value="">Seleccionar...</option>
                {pets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label style={lbl}>Dueño</label>
              <select className="input-premium" required value={form.owner_id}
                onChange={e => setForm(f => ({ ...f, owner_id: e.target.value }))}>
                <option value="">Seleccionar...</option>
                {owners.map(o => <option key={o.id} value={o.id}>{o.first_name} {o.last_name}</option>)}
              </select>
            </div>
          </div>

          {/* Items */}
          <div className="form-group">
            <label style={lbl}>Ítems de la Factura</label>
            <div style={{ display: 'grid', gridTemplateColumns: '3fr 80px 110px 30px', gap: '6px', marginBottom: '6px' }}>
              {['Descripción', 'Cant.', 'Precio', ''].map(h => (
                <span key={h} style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>{h}</span>
              ))}
            </div>
            {form.items.map((it, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '3fr 80px 110px 30px', gap: '6px', marginBottom: '8px', alignItems: 'center' }}>
                <input className="input-premium" placeholder="Ej: Consulta, Vacuna..." value={it.description}
                  onChange={e => updateItem(i, 'description', e.target.value)} required />
                <input className="input-premium" type="number" min="1" step="1" value={it.quantity}
                  onChange={e => updateItem(i, 'quantity', parseInt(e.target.value))} />
                <input className="input-premium" type="number" min="0" step="0.01" value={it.unit_price}
                  onChange={e => updateItem(i, 'unit_price', parseFloat(e.target.value))} />
                <button type="button" onClick={() => removeItem(i)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)' }}>
                  <X size={14} />
                </button>
              </div>
            ))}
            <button type="button" className="btn" onClick={addItem}
              style={{ background: '#f1f5f9', color: '#475569', fontSize: '12px', padding: '6px 12px' }}>
              <Plus size={12} /> Agregar ítem
            </button>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label style={lbl}>IVA (%)</label>
              <input className="input-premium" type="number" min="0" max="100" step="0.1"
                value={form.tax_rate} onChange={e => setForm(f => ({ ...f, tax_rate: e.target.value }))} />
            </div>
            <div className="form-group">
              <label style={lbl}>Notas</label>
              <input className="input-premium" placeholder="Opcional..."
                value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>

          {/* Totals */}
          <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748b' }}>
              <span>Subtotal</span><span>${formSubtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748b' }}>
              <span>IVA ({form.tax_rate}%)</span><span>${(formTotal - formSubtotal).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 800, color: '#0f172a', borderTop: '1px solid #e2e8f0', paddingTop: '8px' }}>
              <span>Total</span><span>${formTotal.toFixed(2)}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" className="btn" onClick={() => setShowModal(false)}
              style={{ flex: 1, background: '#f1f5f9', color: '#475569' }}>Cancelar</button>
            <button type="submit" className="btn" disabled={loading}
              style={{ flex: 2, background: 'var(--primary)', color: 'white' }}>
              {loading ? 'Creando...' : 'Crear Factura'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm */}
      <ConfirmDialog
        isOpen={confirm.open}
        title={confirm.title}
        message={confirm.message}
        confirmLabel="Confirmar"
        variant="danger"
        onConfirm={confirm.onConfirm}
        onCancel={() => setConfirm(c => ({ ...c, open: false }))}
      />
    </div>
  )
}

const lbl: React.CSSProperties = { fontSize: '13px', fontWeight: 600, color: '#64748b', marginBottom: '8px', display: 'block' }

export default BillingView
