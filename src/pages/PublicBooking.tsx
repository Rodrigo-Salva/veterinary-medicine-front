import React, { useState } from 'react'
import { Calendar, CheckCircle2, ChevronRight, Dog, Mail, Phone, User } from 'lucide-react'
import axios from 'axios'

const PublicBooking: React.FC = () => {
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        pet_name: '',
        species: 'Perro',
        breed: '',
        reason: '',
        date: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            await axios.post('http://localhost:8000/public/appointments', formData)
            setSuccess(true)
        } catch (err) {
            alert("Error al enviar la solicitud. Por favor intenta de nuevo.")
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '20px' }}>
                <div style={{ background: 'white', padding: '48px', borderRadius: '32px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', maxWidth: '500px', textAlign: 'center' }}>
                    <div style={{ width: '80px', height: '80px', background: '#f0fdf4', color: '#22c55e', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                        <CheckCircle2 size={42} />
                    </div>
                    <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1e293b', marginBottom: '16px' }}>¡Cita Solicitada!</h1>
                    <p style={{ color: '#64748b', lineHeight: '1.6', marginBottom: '32px' }}>
                        Hemos recibido tu solicitud para <strong>{formData.pet_name}</strong>. Nos pondremos en contacto contigo en breve para confirmar el horario.
                    </p>
                    <button onClick={() => window.location.reload()} className="btn-premium" style={{ width: '100%', justifyContent: 'center' }}>Hacer otra reserva</button>
                </div>
            </div>
        )
    }

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px' }}>
            <div style={{ maxWidth: '600px', width: '100%' }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{ width: '64px', height: '64px', background: '#0d2b2b', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <Dog color="white" size={32} />
                    </div>
                    <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#1e293b' }}>Reserva tu Cita</h1>
                    <p style={{ color: '#64748b', marginTop: '8px' }}>Cuidamos a tu mejor amigo con tecnología y amor</p>
                </div>

                <div className="stat-card-main" style={{ background: 'white', padding: '40px', borderRadius: '32px' }}>
                    <form onSubmit={handleSubmit}>
                        {step === 1 ? (
                            <div className="animate-fade-in">
                                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <User size={18} color="var(--primary)" /> Datos del Propietario
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                    <div className="form-group">
                                        <label>Nombre</label>
                                        <input className="input-premium" type="text" required value={formData.first_name} onChange={e => setFormData({ ...formData, first_name: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Apellido</label>
                                        <input className="input-premium" type="text" required value={formData.last_name} onChange={e => setFormData({ ...formData, last_name: e.target.value })} />
                                    </div>
                                </div>
                                <div className="form-group" style={{ marginBottom: '16px' }}>
                                    <label>Email</label>
                                    <div style={{ position: 'relative' }}>
                                        <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                        <input className="input-premium" style={{ paddingLeft: '40px' }} type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Teléfono</label>
                                    <div style={{ position: 'relative' }}>
                                        <Phone size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                        <input className="input-premium" style={{ paddingLeft: '40px' }} type="tel" required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                    </div>
                                </div>
                                <button type="button" onClick={() => setStep(2)} className="btn-premium" style={{ width: '100%', marginTop: '32px', justifyContent: 'center' }}>
                                    Continuar <ChevronRight size={18} />
                                </button>
                            </div>
                        ) : (
                            <div className="animate-fade-in">
                                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Dog size={18} color="var(--primary)" /> Datos de la Mascota
                                </h3>
                                <div className="form-group" style={{ marginBottom: '16px' }}>
                                    <label>Nombre de la Mascota</label>
                                    <input className="input-premium" type="text" required value={formData.pet_name} onChange={e => setFormData({ ...formData, pet_name: e.target.value })} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                    <div className="form-group">
                                        <label>Especie</label>
                                        <select className="input-premium" value={formData.species} onChange={e => setFormData({ ...formData, species: e.target.value })}>
                                            <option value="Perro">Perro</option>
                                            <option value="Gato">Gato</option>
                                            <option value="Ave">Ave</option>
                                            <option value="Otro">Otro</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Raza</label>
                                        <input className="input-premium" type="text" value={formData.breed} onChange={e => setFormData({ ...formData, breed: e.target.value })} />
                                    </div>
                                </div>
                                <div className="form-group" style={{ marginBottom: '16px' }}>
                                    <label>Motivo de Consulta</label>
                                    <textarea className="input-premium" rows={2} required value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Fecha sugerida</label>
                                    <div style={{ position: 'relative' }}>
                                        <Calendar size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                        <input className="input-premium" style={{ paddingLeft: '40px' }} type="datetime-local" required value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                                    <button type="button" onClick={() => setStep(1)} style={{ flex: 1, padding: '14px', borderRadius: '16px', background: 'white', border: '1px solid #e2e8f0', fontWeight: '600' }}>Atrás</button>
                                    <button type="submit" disabled={loading} className="btn-premium" style={{ flex: 2, justifyContent: 'center' }}>
                                        {loading ? 'Enviando...' : 'Confirmar Reserva'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
                <p style={{ textAlign: 'center', marginTop: '24px', color: '#94a3b8', fontSize: '12px' }}>
                    Al reservar, usted acepta nuestros términos de servicio y política de privacidad.
                </p>
            </div>
        </div>
    )
}

export default PublicBooking
