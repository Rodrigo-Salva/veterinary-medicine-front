import React, { useState, useEffect } from 'react';
import { appointmentService, petService, ownerService } from '../services/api';
import { AppointmentCreate, Pet, Owner } from '../types';

interface AppointmentFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<AppointmentCreate>({
    pet_id: '',
    owner_id: '',
    date: new Date().toISOString().slice(0, 16),
    reason: '',
    cost: 0,
  });
  const [pets, setPets] = useState<Pet[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ownersData, petsData] = await Promise.all([
          ownerService.getAll(),
          petService.getAll(),
        ]);
        setOwners(ownersData);
        setPets(petsData);
      } catch (error) {
        console.error('Error fetching data for appointments:', error);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.pet_id || !formData.owner_id) {
      alert('Please select both a pet and an owner');
      return;
    }
    setLoading(true);
    try {
      await appointmentService.create({
        ...formData,
        date: new Date(formData.date).toISOString(),
      });
      onSuccess();
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      alert('Error scheduling appointment. Please check the console.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="management-form-premium">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="form-group">
          <label style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', marginBottom: '8px', display: 'block' }}>Dueño</label>
          <select
            className="input-premium"
            required
            value={formData.owner_id}
            onChange={(e) => setFormData({ ...formData, owner_id: e.target.value })}
          >
            <option value="">Seleccione dueño</option>
            {owners.map((owner) => (
              <option key={owner.id} value={owner.id}>
                {owner.first_name} {owner.last_name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', marginBottom: '8px', display: 'block' }}>Mascota</label>
          <select
            className="input-premium"
            required
            value={formData.pet_id}
            onChange={(e) => setFormData({ ...formData, pet_id: e.target.value })}
          >
            <option value="">Seleccione mascota</option>
            {pets
              .filter((p) => !formData.owner_id || p.owner_id === formData.owner_id)
              .map((pet) => (
                <option key={pet.id} value={pet.id}>
                  {pet.name} ({pet.species})
                </option>
              ))}
          </select>
        </div>
      </div>
      <div className="form-group">
        <label style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', marginBottom: '8px', display: 'block' }}>Fecha y Hora</label>
        <input
          className="input-premium"
          type="datetime-local"
          required
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
        />
      </div>
      <div className="form-group">
        <label style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', marginBottom: '8px', display: 'block' }}>Motivo de consulta</label>
        <textarea
          className="input-premium"
          required
          value={formData.reason}
          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          placeholder="Ej: Control de vacunas, Cirugía programada..."
          rows={3}
        />
      </div>
      <div className="form-group">
        <label style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', marginBottom: '8px', display: 'block' }}>Costo Estimado ($)</label>
        <input
          className="input-premium"
          type="number"
          step="0.01"
          required
          value={formData.cost}
          onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) })}
        />
      </div>
      <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
        <button type="button" onClick={onCancel} style={{ flex: 1, padding: '14px', borderRadius: '16px', background: 'white', border: '1px solid #e2e8f0', fontWeight: '600', color: '#64748b' }}>
          Cancelar
        </button>
        <button type="submit" className="btn-premium" style={{ flex: 2, justifyContent: 'center' }} disabled={loading}>
          {loading ? 'Agendando...' : 'Agendar Cita'}
        </button>
      </div>
    </form>
  );
};

export default AppointmentForm;
