import React, { useState, useEffect } from 'react';
import { hospitalService, petService } from '../services/api';
import { Activity, Thermometer, Heart, LogOut, PlusCircle } from 'lucide-react';
import Modal from './Modal';

interface Cage {
  id: string;
  name: string;
  is_occupied: boolean;
  current_pet_id?: string;
}

const HospitalView: React.FC = () => {
  const [cages, setCages] = useState<Cage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCage, setSelectedCage] = useState<Cage | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pets, setPets] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    pet_id: '',
    reason: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [cagesData, petsData] = await Promise.all([
        hospitalService.getCages(),
        petService.getAll()
      ]);
      setCages(cagesData);
      setPets(petsData);
    } catch (error) {
      console.error("Error fetching hospital data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCage) return;
    try {
      await hospitalService.checkIn({
        pet_id: formData.pet_id,
        cage_id: selectedCage.id,
        reason: formData.reason
      });
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      alert("Error en el ingreso: " + error);
    }
  };

  if (loading) return <div className="p-8">Cargando Hospital...</div>;

  return (
    <div className="hospital-container" style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
      <header style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#1a1a1a', marginBottom: '8px' }}>
          Hospitalización y Monitoreo
        </h2>
        <p style={{ color: '#666' }}>Gestión de jaulas y cuidado crítico de pacientes.</p>
      </header>

      <div className="cages-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
        gap: '24px' 
      }}>
        {cages.map(cage => (
          <div key={cage.id} className="floating-card animate-fade-in" style={{
            background: 'white',
            borderRadius: '24px',
            padding: '24px',
            boxShadow: 'var(--shadow)',
            border: `1px solid ${cage.is_occupied ? '#fee2e2' : '#f1f5f9'}`,
            cursor: cage.is_occupied ? 'default' : 'pointer',
            position: 'relative',
            overflow: 'hidden'
          }} onClick={() => {
            if (!cage.is_occupied) {
              setSelectedCage(cage);
              setIsModalOpen(true);
            }
          }}>
            {/* Background Accent */}
            <div style={{ 
              position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', 
              background: cage.is_occupied ? '#fef2f2' : '#f0fdf4',
              borderRadius: '0 0 0 100%', zIndex: 0, opacity: 0.5
            }}></div>

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <span style={{ fontWeight: '700', fontSize: '18px', color: '#1e293b' }}>{cage.name}</span>
                <span style={{ 
                  padding: '6px 14px', 
                  borderRadius: '20px', 
                  fontSize: '11px', 
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  background: cage.is_occupied ? '#fee2e2' : '#dcfce7',
                  color: cage.is_occupied ? '#991b1b' : '#166534'
                }}>
                  {cage.is_occupied ? 'Ocupada' : 'Libre'}
                </span>
              </div>
              
              {cage.is_occupied ? (
                <div className="animate-fade-in">
                  <div style={{ 
                    display: 'flex', alignItems: 'center', gap: '12px', 
                    padding: '16px', background: '#f8fafc', 
                    borderRadius: '16px', marginBottom: '16px' 
                  }}>
                    <div style={{ 
                      width: '40px', height: '40px', background: 'white', 
                      borderRadius: '12px', display: 'flex', 
                      alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}>
                      <Activity size={20} color="#3b82f6" />
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Paciente Actual</div>
                      <div style={{ fontWeight: '600', color: '#1e293b' }}>
                        {pets.find(p => p.id === cage.current_pet_id)?.name || 'Cargando...'}
                      </div>
                    </div>
                  </div>
                  <button className="btn-premium" style={{ width: '100%', justifyContent: 'center' }}>
                    Gestionar Paciente
                  </button>
                </div>
              ) : (
                <div style={{ 
                  textAlign: 'center', color: '#94a3b8', padding: '32px 16px',
                  border: '2px dashed #f1f5f9', borderRadius: '16px'
                }}>
                  <PlusCircle size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
                  <p style={{ fontSize: '14px', fontWeight: '500' }}>Asignar Paciente</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={`Ingreso a ${selectedCage?.name}`}
      >
        <form onSubmit={handleCheckIn} className="management-form-premium">
          <div className="form-group">
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', marginBottom: '8px', display: 'block' }}>
              Mascota a Hospitalizar
            </label>
            <select 
              className="input-premium"
              value={formData.pet_id} 
              onChange={e => setFormData({...formData, pet_id: e.target.value})}
              required
            >
              <option value="">Seleccione una mascota...</option>
              {pets.map(pet => (
                <option key={pet.id} value={pet.id}>{pet.name} ({pet.species})</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', marginBottom: '8px', display: 'block' }}>
              Motivo Seleccionado
            </label>
            <textarea 
              className="input-premium"
              value={formData.reason}
              onChange={e => setFormData({...formData, reason: e.target.value})}
              placeholder="Describa el motivo del ingreso"
              required
              rows={4}
            />
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} style={{ 
              flex: 1, padding: '14px', borderRadius: '16px', border: '1px solid #e2e8f0',
              background: 'white', fontWeight: '600', color: '#64748b', cursor: 'pointer'
            }}>
              Cancelar
            </button>
            <button type="submit" className="btn-premium" style={{ flex: 2, justifyContent: 'center' }}>
              Confirmar Ingreso
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default HospitalView;
