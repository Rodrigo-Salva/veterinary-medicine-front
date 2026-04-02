import React, { useEffect, useState } from 'react'
import { Save, Building2, Clock, DollarSign, Phone, Mail, Globe, CheckCircle, Settings } from 'lucide-react'
import { useNotify } from '../context/NotificationContext'

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
  const notify = useNotify()
  const [form, setForm] = useState(DEFAULTS)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('vet_settings')
    if (stored) { try { setForm(JSON.parse(stored)) } catch {} }
  }, [])

  const handleSave = () => {
    localStorage.setItem('vet_settings', JSON.stringify(form))
    setSaved(true)
    notify.success('Configuración guardada correctamente')
    setTimeout(() => setSaved(false), 3000)
  }

  const handleUpdateSchedule = () => {
    notify.info('Actualizando horario de atención...')
    handleSave()
  }

  return (
    <div className="dashboard-container animate-fade-in" style={{ maxWidth: '800px' }}>
      <div className="header-row">
        <div className="greetings">
          <h2 style={{ fontSize: '24px', fontWeight: 700 }}>Configuración</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Personaliza la información de tu clínica y preferencias</p>
        </div>
        <button 
          className={`btn-premium ${saved ? 'success' : ''}`} 
          onClick={handleSave}
          style={{ background: saved ? '#10b981' : 'var(--primary)' }}
        >
          {saved ? <><CheckCircle size={18} /> Guardado</> : <><Save size={18} /> Guardar Cambios</>}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Clínica */}
        <div className="section-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
            <Building2 size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Información de la Clínica</h3>
          </div>
          
          <div className="management-form-premium">
            <div className="form-group">
              <label>Nombre de la Clínica</label>
              <input className="input-premium" type="text" placeholder="VetCare Pro" value={form.clinic_name} onChange={e => setForm(f => ({ ...f, clinic_name: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Dirección</label>
              <input className="input-premium" type="text" placeholder="Calle 123 #45-67, Bogotá" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Teléfono</label>
                <input className="input-premium" type="tel" placeholder="+57 300 000 0000" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Email de Contacto</label>
                <input className="input-premium" type="email" placeholder="info@vetcare.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
            </div>
            <div className="form-group">
              <label>Logo URL (Imagen de la clínica)</label>
              <input className="input-premium" type="url" placeholder="https://..." value={form.logo_url} onChange={e => setForm(f => ({ ...f, logo_url: e.target.value }))} />
            </div>
          </div>

          <div style={{ marginTop: '24px', padding: '16px', background: '#f8fafc', borderRadius: '16px', border: '1.5px dashed #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 800, color: 'var(--primary)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
              {form.logo_url
                ? <img src={form.logo_url} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : (form.clinic_name[0] || 'V').toUpperCase()
              }
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px' }}>{form.clinic_name || 'Nombre de la Clínica'}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>PREVISUALIZACIÓN DEL LOGO</div>
            </div>
          </div>
        </div>

        {/* Horarios */}
        <div className="section-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
            <Clock size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Horario de Atención</h3>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Apertura</label>
              <input className="input-premium" type="time" value={form.open_time} onChange={e => setForm(f => ({ ...f, open_time: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Cierre</label>
              <input className="input-premium" type="time" value={form.close_time} onChange={e => setForm(f => ({ ...f, close_time: e.target.value }))} />
            </div>
          </div>
        </div>

        {/* Facturación */}
        <div className="section-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
            <DollarSign size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Facturación & Región</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div className="form-group">
              <label>Moneda</label>
              <select className="input-premium" value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}>
                <option value="USD">Dólar (USD)</option>
                <option value="COP">Peso Colombiano (COP)</option>
                <option value="EUR">Euro (EUR)</option>
                <option value="MXN">Peso Mexicano (MXN)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Impuesto (IVA %)</label>
              <input className="input-premium" type="number" step="0.1" value={form.tax_rate} onChange={e => setForm(f => ({ ...f, tax_rate: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Zona Horaria</label>
              <select className="input-premium" value={form.timezone} onChange={e => setForm(f => ({ ...f, timezone: e.target.value }))}>
                <option value="America/Bogota">UTC-5 (Bogotá)</option>
                <option value="America/Santiago">UTC-4 (Santiago)</option>
                <option value="Europe/Madrid">UTC+1 (Madrid)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsView
