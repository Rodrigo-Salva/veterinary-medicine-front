import React, { useState } from 'react';
import { ownerService } from '../services/api';
import { OwnerCreate } from '../types';

interface OwnerFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const OwnerForm: React.FC<OwnerFormProps> = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<OwnerCreate>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await ownerService.create(formData);
      onSuccess();
    } catch (error) {
      console.error('Error creating owner:', error);
      alert('Error creating owner. Please check the console.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="management-form-premium">
      <div className="form-group">
        <label style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', marginBottom: '8px', display: 'block' }}>Nombre</label>
        <input
          className="input-premium"
          type="text"
          required
          value={formData.first_name}
          onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
          placeholder="Juan"
        />
      </div>
      <div className="form-group">
        <label style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', marginBottom: '8px', display: 'block' }}>Apellido</label>
        <input
          className="input-premium"
          type="text"
          required
          value={formData.last_name}
          onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
          placeholder="Perez"
        />
      </div>
      <div className="form-group">
        <label style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', marginBottom: '8px', display: 'block' }}>Correo Electrónico</label>
        <input
          className="input-premium"
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="juan.perez@example.com"
        />
      </div>
      <div className="form-group">
        <label style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', marginBottom: '8px', display: 'block' }}>Teléfono</label>
        <input
          className="input-premium"
          type="text"
          required
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="+56 9 1234 5678"
        />
      </div>
      <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
        <button type="button" onClick={onCancel} style={{ flex: 1, padding: '14px', borderRadius: '16px', background: 'white', border: '1px solid #e2e8f0', fontWeight: '600', color: '#64748b' }}>
          Cancelar
        </button>
        <button type="submit" className="btn-premium" style={{ flex: 2, justifyContent: 'center' }} disabled={loading}>
          {loading ? 'Guardando...' : 'Crear Dueño'}
        </button>
      </div>
    </form>
  );
};

export default OwnerForm;
