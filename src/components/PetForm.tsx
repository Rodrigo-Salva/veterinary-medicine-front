import React, { useState, useEffect } from 'react';
import { petService, ownerService } from '../services/api';
import { PetCreate, Owner } from '../types';
import { useNotify } from '../context/NotificationContext';

interface PetFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const PetForm: React.FC<PetFormProps> = ({ onSuccess, onCancel }) => {
  const notify = useNotify();
  const [formData, setFormData] = useState<PetCreate>({
    name: '',
    species: '',
    breed: '',
    age: 0,
    owner_id: '',
  });
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const data = await ownerService.getAll();
        setOwners(data);
      } catch (error) {
        console.error('Error fetching owners:', error);
      }
    };
    fetchOwners();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.owner_id) {
      notify.warning('Por favor seleccione un dueño');
      return;
    }
    setLoading(true);
    try {
      await petService.create(formData);
      notify.success('¡Mascota registrada con éxito!');
      onSuccess();
    } catch (error) {
      console.error('Error creating pet:', error);
      notify.error('Error al registrar mascota. Intente de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="management-form-premium">
      <div className="form-group">
        <label style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', marginBottom: '8px', display: 'block' }}>Nombre de la Mascota</label>
        <input
          className="input-premium"
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Luna"
        />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', marginBottom: '8px', display: 'block' }}>Especie</label>
          <input
            className="input-premium"
            type="text"
            required
            value={formData.species}
            onChange={(e) => setFormData({ ...formData, species: e.target.value })}
            placeholder="Perro"
          />
        </div>
        <div className="form-group">
          <label style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', marginBottom: '8px', display: 'block' }}>Raza</label>
          <input
            className="input-premium"
            type="text"
            required
            value={formData.breed}
            onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
            placeholder="Golden Retriever"
          />
        </div>
      </div>
      <div className="form-group">
        <label style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', marginBottom: '8px', display: 'block' }}>Edad (años)</label>
        <input
          className="input-premium"
          type="number"
          required
          min="0"
          value={formData.age}
          onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
        />
      </div>
      <div className="form-group">
        <label style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', marginBottom: '8px', display: 'block' }}>Dueño</label>
        <select
          className="input-premium"
          required
          value={formData.owner_id}
          onChange={(e) => setFormData({ ...formData, owner_id: e.target.value })}
        >
          <option value="">Seleccione un dueño</option>
          {owners.map((owner) => (
            <option key={owner.id} value={owner.id}>
              {owner.first_name} {owner.last_name}
            </option>
          ))}
        </select>
        {owners.length === 0 && (
          <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>No hay dueños. Cree uno primero.</p>
        )}
      </div>
      <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
        <button type="button" onClick={onCancel} className="btn" style={{ flex: 1, background: '#f1f5f9', color: '#475569' }}>
          Cancelar
        </button>
        <button type="submit" className="btn" disabled={loading || owners.length === 0} style={{ flex: 2, background: 'var(--primary)', color: 'white' }}>
          {loading ? 'Registrando...' : 'Registrar Mascota'}
        </button>
      </div>
    </form>
  );
};

export default PetForm;
