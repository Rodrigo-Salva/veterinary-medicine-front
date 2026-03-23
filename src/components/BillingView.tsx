import React, { useEffect, useState } from 'react'
import { Plus, X, CheckCircle, XCircle, Clock, DollarSign, Trash2, FileText } from 'lucide-react'
import { billingService, petService, ownerService } from '../services/api'

interface InvoiceItem { description: string; quantity: number; unit_price: number }
interface Invoice { id: string; pet_id: string; owner_id: string; date: string; subtotal: number; tax_rate: number; total: number; status: string; notes?: string; items: InvoiceItem[] }

const STATUS_ICON: Record<string, React.ReactNode> = {
  Pending: <Clock size={14} />,
  Paid: <CheckCircle size={14} />,
  Cancelled: <XCircle size={14} />,
}
const STATUS_COLOR: Record<string, string> = {
  Pending: '#f59e0b',
  Paid: '#10b981',
  Cancelled: '#ef4444',
}

const BillingView: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [filter, setFilter] = useState<string>('')
  const [showModal, setShowModal] = useState(false)
  const [pets, setPets] = useState<any[]>([])
  const [owners, setOwners] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ pet_id: '', owner_id: '', tax_rate: '0', notes: '', items: [{ description: '', quantity: 1, unit_price: 0 }] })

  const load = async () => {
    try { setInvoices(await billingService.getAll(filter || undefined)) } catch {}
  }

  useEffect(() => { load() }, [filter])
  useEffect(() => {
    petService.getAll().then(setPets).catch(() => {})
    ownerService.getAll().then(setOwners).catch(() => {})
  }, [])

  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { description: '', quantity: 1, unit_price: 0 }] }))
  const removeItem = (i: number) => setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }))
  const updateItem = (i: number, key: string, val: any) => setForm(f => {
    const items = [...f.items]; items[i] = { ...items[i], [key]: val }; return { ...f, items }
  })

  const formSubtotal = form.items.reduce((s, it) => s + (it.quantity || 0) * (it.unit_price || 0), 0)
  const formTotal = formSubtotal * (1 + parseFloat(form.tax_rate || '0') / 100)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    try {
      await billingService.create({
        pet_id: form.pet_id,
        owner_id: form.owner_id,
        tax_rate: parseFloat(form.tax_rate) || 0,
        notes: form.notes,
        items: form.items.map(it => ({ description: it.description, quantity: it.quantity, unit_price: it.unit_price }))
      })
      setShowModal(false)
      setForm({ pet_id: '', owner_id: '', tax_rate: '0', notes: '', items: [{ description: '', quantity: 1, unit_price: 0 }] })
      load()
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  const handleStatus = async (id: string, status: string) => {
    try { await billingService.updateStatus(id, status); load() } catch {}
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar factura?')) return
    try { await billingService.delete(id); load() } catch {}
  }

  return (
    <div className="bill-wrapper">
      <style>{`
        .bill-wrapper { flex: 1; overflow-y: auto; padding: 28px; background: var(--bg-primary,#0f172a); font-family: inherit; }
        .bill-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
        .bill-title { font-size: 1.5rem; font-weight: 700; color: #f1f5f9; }
        .bill-actions { display: flex; gap: 10px; align-items: center; }
        .bill-filter { display: flex; gap: 6px; }
        .bill-filter-btn { padding: 6px 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: #64748b; font-size: 0.8rem; cursor: pointer; transition: all .15s; }
        .bill-filter-btn.active { background: #3b82f6; color: #fff; border-color: #3b82f6; }
        .bill-new-btn { display: flex; align-items: center; gap: 6px; background: #3b82f6; color: #fff; border: none; border-radius: 10px; padding: 9px 16px; font-size: 0.85rem; font-weight: 600; cursor: pointer; }
        .bill-new-btn:hover { background: #2563eb; }
        .bill-table { background: #1e293b; border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; overflow: hidden; }
        .bill-thead { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr 120px; padding: 14px 20px; background: rgba(255,255,255,0.03); border-bottom: 1px solid rgba(255,255,255,0.05); }
        .bill-thead span { font-size: 0.72rem; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: .04em; }
        .bill-row { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr 120px; padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.04); align-items: center; transition: background .15s; }
        .bill-row:hover { background: rgba(255,255,255,0.02); }
        .bill-row:last-child { border-bottom: none; }
        .bill-id { font-size: 0.75rem; color: #f1f5f9; font-family: monospace; }
        .bill-date { font-size: 0.8rem; color: #64748b; }
        .bill-amount { font-size: 0.9rem; font-weight: 700; color: #f1f5f9; }
        .bill-tax { font-size: 0.75rem; color: #64748b; }
        .bill-status-badge { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 999px; font-size: 0.72rem; font-weight: 600; }
        .bill-row-actions { display: flex; gap: 6px; align-items: center; }
        .bill-action-btn { background: rgba(255,255,255,0.05); border: none; border-radius: 6px; color: #94a3b8; padding: 5px 8px; font-size: 0.72rem; cursor: pointer; display: flex; align-items: center; gap: 3px; transition: all .15s; }
        .bill-action-btn:hover { background: rgba(255,255,255,0.1); color: #f1f5f9; }
        .bill-del-btn { color: #ef4444; background: rgba(239,68,68,0.08); }
        .bill-del-btn:hover { background: rgba(239,68,68,0.18); }
        .bill-empty { text-align: center; padding: 48px; color: #475569; }

        /* Modal */
        .bill-modal-bg { position: fixed; inset: 0; background: rgba(0,0,0,0.75); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 16px; }
        .bill-modal { background: #1e293b; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 28px; width: 600px; max-width: 100%; max-height: 90vh; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; }
        .bill-modal h2 { font-size: 1.1rem; font-weight: 700; color: #f1f5f9; margin: 0; }
        .bill-modal label { font-size: 0.8rem; color: #94a3b8; font-weight: 600; display: block; margin-bottom: 4px; }
        .bill-modal input, .bill-modal select, .bill-modal textarea { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #f1f5f9; padding: 9px 12px; font-size: 0.85rem; box-sizing: border-box; }
        .bill-modal-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .bill-items-header { display: grid; grid-template-columns: 3fr 80px 100px 30px; gap: 8px; font-size: 0.72rem; color: #475569; font-weight: 600; text-transform: uppercase; padding: 0 4px; }
        .bill-item-row { display: grid; grid-template-columns: 3fr 80px 100px 30px; gap: 8px; align-items: center; }
        .bill-item-row input { padding: 7px 10px; }
        .bill-remove-item { background: none; border: none; color: #ef4444; cursor: pointer; padding: 2px; }
        .bill-totals { background: rgba(255,255,255,0.03); border-radius: 10px; padding: 14px; display: flex; flex-direction: column; gap: 6px; }
        .bill-totals-row { display: flex; justify-content: space-between; font-size: 0.85rem; color: #94a3b8; }
        .bill-totals-row.total { font-weight: 800; font-size: 1rem; color: #f1f5f9; }
        .bill-modal-actions { display: flex; gap: 10px; justify-content: flex-end; }
        .bill-modal-actions button { padding: 9px 22px; border-radius: 8px; border: none; font-size: 0.85rem; font-weight: 600; cursor: pointer; }
        .bill-btn-cancel { background: rgba(255,255,255,0.07); color: #94a3b8; }
        .bill-btn-save { background: #3b82f6; color: #fff; }
      `}</style>

      <div className="bill-header">
        <div className="bill-title">💳 Facturación</div>
        <div className="bill-actions">
          <div className="bill-filter">
            {['', 'Pending', 'Paid', 'Cancelled'].map(s => (
              <button key={s} className={`bill-filter-btn${filter === s ? ' active' : ''}`} onClick={() => setFilter(s)}>
                {s === '' ? 'Todas' : s === 'Pending' ? 'Pendientes' : s === 'Paid' ? 'Pagadas' : 'Canceladas'}
              </button>
            ))}
          </div>
          <button className="bill-new-btn" onClick={() => setShowModal(true)}><Plus size={16} /> Nueva Factura</button>
        </div>
      </div>

      <div className="bill-table">
        <div className="bill-thead">
          <span>Factura / Paciente</span>
          <span>Fecha</span>
          <span>Subtotal</span>
          <span>Total</span>
          <span>Estado</span>
          <span>Acciones</span>
        </div>
        {invoices.length === 0
          ? <div className="bill-empty"><FileText size={32} style={{ marginBottom: 8, opacity: 0.3 }} /><div>Sin facturas</div></div>
          : invoices.map(inv => (
            <div key={inv.id} className="bill-row">
              <div>
                <div className="bill-id">#{inv.id.slice(0, 8)}...</div>
                <div className="bill-date">{inv.items.length} ítem(s)</div>
              </div>
              <div className="bill-date">{new Date(inv.date).toLocaleDateString('es')}</div>
              <div>
                <div className="bill-amount">${inv.subtotal.toFixed(2)}</div>
                <div className="bill-tax">IVA {inv.tax_rate}%</div>
              </div>
              <div className="bill-amount">${inv.total.toFixed(2)}</div>
              <div>
                <span className="bill-status-badge" style={{ background: STATUS_COLOR[inv.status] + '22', color: STATUS_COLOR[inv.status] }}>
                  {STATUS_ICON[inv.status]} {inv.status === 'Pending' ? 'Pendiente' : inv.status === 'Paid' ? 'Pagada' : 'Cancelada'}
                </span>
              </div>
              <div className="bill-row-actions">
                {inv.status === 'Pending' && (
                  <button className="bill-action-btn" onClick={() => handleStatus(inv.id, 'Paid')} style={{ color: '#10b981' }}>✓ Pagar</button>
                )}
                {inv.status === 'Pending' && (
                  <button className="bill-action-btn" onClick={() => handleStatus(inv.id, 'Cancelled')}>Cancelar</button>
                )}
                <button className="bill-action-btn bill-del-btn" onClick={() => handleDelete(inv.id)}><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
      </div>

      {showModal && (
        <div className="bill-modal-bg" onClick={() => setShowModal(false)}>
          <div className="bill-modal" onClick={e => e.stopPropagation()}>
            <h2>Nueva Factura</h2>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="bill-modal-row">
                <div>
                  <label>Mascota</label>
                  <select required value={form.pet_id} onChange={e => setForm(f => ({ ...f, pet_id: e.target.value }))}>
                    <option value="">Seleccionar...</option>
                    {pets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label>Dueño</label>
                  <select required value={form.owner_id} onChange={e => setForm(f => ({ ...f, owner_id: e.target.value }))}>
                    <option value="">Seleccionar...</option>
                    {owners.map(o => <option key={o.id} value={o.id}>{o.first_name} {o.last_name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label>Ítems de la Factura</label>
                <div className="bill-items-header"><span>Descripción</span><span>Cantidad</span><span>Precio Unit.</span><span></span></div>
                {form.items.map((it, i) => (
                  <div key={i} className="bill-item-row" style={{ marginBottom: 8 }}>
                    <input placeholder="Ej: Consulta, Vacuna..." value={it.description} onChange={e => updateItem(i, 'description', e.target.value)} required />
                    <input type="number" min="0.01" step="0.01" value={it.quantity} onChange={e => updateItem(i, 'quantity', parseFloat(e.target.value))} />
                    <input type="number" min="0" step="0.01" value={it.unit_price} onChange={e => updateItem(i, 'unit_price', parseFloat(e.target.value))} />
                    <button type="button" className="bill-remove-item" onClick={() => removeItem(i)}><X size={14} /></button>
                  </div>
                ))}
                <button type="button" className="bill-action-btn" onClick={addItem} style={{ marginTop: 4 }}><Plus size={12} /> Agregar ítem</button>
              </div>

              <div className="bill-modal-row">
                <div>
                  <label>IVA (%)</label>
                  <input type="number" min="0" max="100" step="0.1" value={form.tax_rate} onChange={e => setForm(f => ({ ...f, tax_rate: e.target.value }))} />
                </div>
                <div>
                  <label>Notas</label>
                  <input placeholder="Opcional..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
                </div>
              </div>

              <div className="bill-totals">
                <div className="bill-totals-row"><span>Subtotal</span><span>${formSubtotal.toFixed(2)}</span></div>
                <div className="bill-totals-row"><span>IVA ({form.tax_rate}%)</span><span>${(formTotal - formSubtotal).toFixed(2)}</span></div>
                <div className="bill-totals-row total"><span>Total</span><span>${formTotal.toFixed(2)}</span></div>
              </div>

              <div className="bill-modal-actions">
                <button type="button" className="bill-btn-cancel" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="bill-btn-save" disabled={loading}>{loading ? 'Creando...' : 'Crear Factura'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default BillingView
