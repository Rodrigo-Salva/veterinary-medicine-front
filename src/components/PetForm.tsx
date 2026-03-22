import React, { useState, useEffect } from 'react';
import { petService, ownerService } from '../services/api';
import { PetCreate, Owner } from '../types';

interface PetFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const PetForm: React.FC<PetFormProps> = ({ onSuccess, onCancel }) => {
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
      alert('Please select an owner');
      return;
    }
    setLoading(true);
    try {
      await petService.create(formData);
      onSuccess();
    } catch (error) {
      console.error('Error creating pet:', error);
      alert('Error creating pet. Please check the console.');
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
      <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
        <button type="button" onClick={onCancel} style={{ flex: 1, padding: '14px', borderRadius: '16px', background: 'white', border: '1px solid #e2e8f0', fontWeight: '600', color: '#64748b' }}>
          Cancelar
        </button>
        <button type="submit" className="btn-premium" style={{ flex: 2, justifyContent: 'center' }} disabled={loading || owners.length === 0}>
          {loading ? 'Registrando...' : 'Registrar Mascota'}
        </button>
      </div>
    </form>
  );
};

export default PetForm;
