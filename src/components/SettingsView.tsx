import React, { useEffect, useState } from 'react'
import { Save, Building2, Clock, DollarSign, Phone, Mail, Globe, CheckCircle } from 'lucide-react'

const DEFAULTS = {
  clinic_name: 'VetCare Pro',
  address: '',
  phone: '',
  email: '',
  website: '',
  currency: 'USD',
  timezone: 'America/Bogota',
  open_time: '08:00',
  close_time: '18:00',
  tax_rate: '19',
  logo_url: '',
}

const SettingsView: React.FC = () => {
  const [form, setForm] = useState(DEFAULTS)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('vet_settings')
    if (stored) { try { setForm(JSON.parse(stored)) } catch {} }
  }, [])

  const handleSave = () => {
    localStorage.setItem('vet_settings', JSON.stringify(form))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const Section: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="set-section">
      <div className="set-section-title">{icon} {title}</div>
      {children}
    </div>
  )

  const Field: React.FC<{ label: string; name: keyof typeof DEFAULTS; type?: string; placeholder?: string }> = ({ label, name, type='text', placeholder }) => (
    <div className="set-field">
      <label>{label}</label>
      <input type={type} placeholder={placeholder} value={form[name]} onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))} />
    </div>
  )

  return (
    <div className="set-wrapper">
      <style>{`
        .set-wrapper { flex: 1; overflow-y: auto; padding: 28px; background: var(--bg-primary,#0f172a); font-family: inherit; max-width: 720px; }
        .set-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; }
        .set-title { font-size: 1.5rem; font-weight: 700; color: #f1f5f9; }
        .set-save-btn { display: flex; align-items: center; gap: 8px; background: #3b82f6; color: #fff; border: none; border-radius: 10px; padding: 10px 20px; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all .2s; }
        .set-save-btn:hover { background: #2563eb; }
        .set-save-btn.saved { background: #10b981; }
        .set-section { background: #1e293b; border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 22px; margin-bottom: 16px; }
        .set-section-title { display: flex; align-items: center; gap: 8px; font-size: 0.9rem; font-weight: 700; color: #f1f5f9; margin-bottom: 18px; }
        .set-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .set-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; }
        .set-field { display: flex; flex-direction: column; gap: 5px; }
        .set-field.full { grid-column: 1 / -1; }
        .set-field label { font-size: 0.78rem; font-weight: 600; color: #64748b; }
        .set-field input, .set-field select { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #f1f5f9; padding: 9px 12px; font-size: 0.85rem; width: 100%; box-sizing: border-box; }
        .set-field input:focus, .set-field select:focus { outline: none; border-color: #3b82f6; }
        .set-preview { background: rgba(59,130,246,0.08); border: 1px solid rgba(59,130,246,0.2); border-radius: 10px; padding: 14px 18px; display: flex; align-items: center; gap: 14px; margin-top: 8px; }
        .set-preview-logo { width: 44px; height: 44px; border-radius: 10px; background: linear-gradient(135deg,#3b82f6,#8b5cf6); display: flex; align-items: center; justify-content: center; font-size: 1.2rem; font-weight: 800; color: #fff; overflow: hidden; }
        .set-preview-logo img { width: 100%; height: 100%; object-fit: cover; }
        .set-preview-info { flex: 1; }
        .set-preview-name { font-size: 0.95rem; font-weight: 700; color: #f1f5f9; }
        .set-preview-meta { font-size: 0.75rem; color: #64748b; margin-top: 2px; }
      `}</style>

      <div className="set-header">
        <div className="set-title">⚙️ Configuración</div>
        <button className={`set-save-btn${saved ? ' saved' : ''}`} onClick={handleSave}>
          {saved ? <><CheckCircle size={16} /> Guardado</> : <><Save size={16} /> Guardar Cambios</>}
        </button>
      </div>

      <Section icon={<Building2 size={16} />} title="Información de la Clínica">
        <div className="set-grid-2">
          <div className="set-field full">
            <label>Nombre de la Clínica</label>
            <input type="text" placeholder="VetCare Pro" value={form.clinic_name} onChange={e => setForm(f => ({ ...f, clinic_name: e.target.value }))} />
          </div>
          <div className="set-field full">
            <label>Dirección</label>
            <input type="text" placeholder="Calle 123 #45-67, Bogotá" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
          </div>
          <div className="set-field">
            <label>Teléfono</label>
            <input type="tel" placeholder="+57 300 000 0000" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          </div>
          <div className="set-field">
            <label>Email</label>
            <input type="email" placeholder="info@vetcare.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div className="set-field full">
            <label>Logo URL (opcional)</label>
            <input type="url" placeholder="https://..." value={form.logo_url} onChange={e => setForm(f => ({ ...f, logo_url: e.target.value }))} />
          </div>
        </div>

        <div className="set-preview" style={{ marginTop: 16 }}>
          <div className="set-preview-logo">
            {form.logo_url
              ? <img src={form.logo_url} alt="Logo" onError={e => (e.currentTarget.style.display = 'none')} />
              : (form.clinic_name[0] || 'V').toUpperCase()
            }
          </div>
          <div className="set-preview-info">
            <div className="set-preview-name">{form.clinic_name || 'Nombre de la Clínica'}</div>
            <div className="set-preview-meta">{form.address || 'Dirección'} · {form.phone || 'Teléfono'}</div>
          </div>
        </div>
      </Section>

      <Section icon={<Clock size={16} />} title="Horario de Atención">
        <div className="set-grid-2">
          <div className="set-field">
            <label>Apertura</label>
            <input type="time" value={form.open_time} onChange={e => setForm(f => ({ ...f, open_time: e.target.value }))} />
          </div>
          <div className="set-field">
            <label>Cierre</label>
            <input type="time" value={form.close_time} onChange={e => setForm(f => ({ ...f, close_time: e.target.value }))} />
          </div>
        </div>
      </Section>

      <Section icon={<DollarSign size={16} />} title="Facturación & Región">
        <div className="set-grid-3">
          <div className="set-field">
            <label>Moneda</label>
            <select value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}>
              <option value="USD">USD ($)</option>
              <option value="COP">COP ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="MXN">MXN ($)</option>
            </select>
          </div>
          <div className="set-field">
            <label>Zona Horaria</label>
            <select value={form.timezone} onChange={e => setForm(f => ({ ...f, timezone: e.target.value }))}>
              <option value="America/Bogota">Bogotá (UTC-5)</option>
              <option value="America/Mexico_City">Ciudad de México (UTC-6)</option>
              <option value="America/Lima">Lima (UTC-5)</option>
              <option value="America/Santiago">Santiago (UTC-4)</option>
              <option value="America/Buenos_Aires">Buenos Aires (UTC-3)</option>
              <option value="Europe/Madrid">Madrid (UTC+1)</option>
            </select>
          </div>
          <div className="set-field">
            <label>IVA por defecto (%)</label>
            <input type="number" min="0" max="100" step="0.1" value={form.tax_rate} onChange={e => setForm(f => ({ ...f, tax_rate: e.target.value }))} />
          </div>
        </div>
      </Section>
    </div>
  )
}

export default SettingsView
