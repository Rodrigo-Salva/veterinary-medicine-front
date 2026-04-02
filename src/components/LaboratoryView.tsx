import React, { useState, useEffect } from 'react';
import { 
  Beaker, Search, Filter, Plus, Calendar, 
  FileText, Trash2, ChevronRight, AlertCircle,
  Activity, CheckCircle2, ChevronDown
} from 'lucide-react';
import { laboratoryService, petService } from '../services/api';
import { Pet, LaboratoryResult } from '../types';
import Modal from './Modal';
import ConfirmDialog from './ConfirmDialog';
import { useNotify } from '../context/NotificationContext';

const CATEGORIES = ['Sangre', 'Orina', 'Heces', 'Biopsia', 'RX', 'Ecografia', 'Otro'];

const LaboratoryView: React.FC = () => {
  const notify = useNotify();
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string>('');
  const [results, setResults] = useState<LaboratoryResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<LaboratoryResult | null>(null);

  // Form state
  const [form, setForm] = useState({
    test_name: '',
    category: 'Sangre',
    notes: '',
    parameters: ''
  });

  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    try {
      const data = await petService.getAll();
      setPets(data);
    } catch {
      notify.error('Error al cargar la lista de mascotas');
    }
  };

  useEffect(() => {
    if (selectedPetId) {
      loadResults(selectedPetId);
    } else {
      setResults([]);
    }
  }, [selectedPetId]);

  const loadResults = async (petId: string) => {
    setLoading(true);
    try {
      const data = await laboratoryService.getByPet(petId);
      setResults(data);
    } catch {
      notify.error('Error al cargar resultados de laboratorio');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPetId) return;
    setSaving(true);
    try {
      await laboratoryService.create({
        pet_id: selectedPetId,
        ...form
      });
      notify.success('Resultado de laboratorio guardado correctamente');
      setModalOpen(false);
      setForm({ test_name: '', category: 'Sangre', notes: '', parameters: '' });
      loadResults(selectedPetId);
    } catch {
      notify.error('Error al guardar el resultado de laboratorio');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await laboratoryService.delete(confirmDelete.id);
      notify.success('Resultado eliminado');
      loadResults(selectedPetId);
    } catch {
      notify.error('Error al eliminar el resultado');
    } finally {
      setConfirmDelete(null);
    }
  };

  const selectedPet = pets.find(p => p.id === selectedPetId);

  return (
    <div className="dashboard-container animate-fade-in">
      {/* Header */}
      <div className="header-row">
        <div className="greetings">
          <h2 style={{ fontSize: '24px', fontWeight: 700 }}>Laboratorio Clínico</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Gestión de análisis y diagnóstico avanzado</p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div className="search-bar" style={{ width: '300px' }}>
            <Search size={18} color="#7aaa8a" />
            <select 
              value={selectedPetId} 
              onChange={e => setSelectedPetId(e.target.value)}
              style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', fontSize: '14px', color: 'var(--text-primary)', cursor: 'pointer' }}
            >
              <option value="">Seleccionar Mascota...</option>
              {pets.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.species})</option>
              ))}
            </select>
          </div>
          <button 
            className="btn-premium" 
            onClick={() => setModalOpen(true)}
            disabled={!selectedPetId}
            style={{ opacity: selectedPetId ? 1 : 0.6 }}
          >
            <Plus size={18} /> Nuevo Análisis
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <Activity size={36} className="animate-pulse" color="var(--primary)" />
        </div>
      ) : !selectedPetId ? (
        <div className="section-card" style={{ textAlign: 'center', padding: '100px 40px', background: 'rgba(255,255,255,0.5)', border: '2px dashed #e2e8f0' }}>
          <Beaker size={64} color="#94a3b8" style={{ marginBottom: '24px', opacity: 0.5 }} />
          <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#64748b' }}>Selecciona una mascota para ver sus análisis</h3>
          <p style={{ color: '#94a3b8', marginTop: '10px' }}>Podrás gestionar hemogramas, perfiles bioquímicos, imágenes y más.</p>
        </div>
      ) : results.length === 0 ? (
        <div className="section-card" style={{ textAlign: 'center', padding: '80px 40px' }}>
          <div style={{ background: '#f0fdf4', width: '80px', height: '80px', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <CheckCircle2 size={40} color="var(--primary)" />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Sin registros para {selectedPet?.name}</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Aún no hay resultados de laboratorio registrados para este paciente.</p>
          <button className="btn" style={{ marginTop: '20px', background: 'var(--primary)', color: 'white', padding: '10px 24px' }} onClick={() => setModalOpen(true)}>
             Añadir Primer Análisis
          </button>
        </div>
      ) : (
        <div className="results-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
          {results.map(res => (
            <div key={res.id} className="stat-card-main light animate-fade-in" style={{ padding: '24px', cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ padding: '4px 12px', background: '#e0f2fe', color: '#0369a1', borderRadius: '12px', fontSize: '12px', fontWeight: 700 }}>
                  {res.category}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => setConfirmDelete(res)}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <h4 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '4px' }}>{res.test_name}</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '16px' }}>
                <Calendar size={14} /> {new Date(res.result_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>

              {res.notes && (
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', fontSize: '13px', color: '#334155', marginBottom: '16px', borderLeft: '3px solid var(--primary)' }}>
                  <p style={{ fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '4px' }}>Observaciones</p>
                  {res.notes}
                </div>
              )}

              {res.parameters && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <p style={{ fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', color: '#64748b' }}>Resultados Detallados</p>
                  <pre style={{ fontSize: '12px', background: '#f1f5f9', padding: '10px', borderRadius: '8px', overflow: 'hidden', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                    {res.parameters}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal Add Result */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={`Nuevo Análisis: ${selectedPet?.name}`}>
        <form onSubmit={handleSave} className="management-form-premium">
          <div className="form-row">
            <div className="form-group">
              <label>Nombre del Análisis</label>
              <input 
                className="input-premium" type="text" required placeholder="Ej: Hemograma Completo"
                value={form.test_name} onChange={e => setForm({...form, test_name: e.target.value})} 
              />
            </div>
            <div className="form-group">
              <label>Categoría</label>
              <select className="input-premium" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label>Valores / Resultados (formato libre)</label>
            <textarea 
              className="input-premium" rows={5} placeholder="Ej: Glucosa: 110 mg/dL&#10;WBC: 8.5 x10^3/uL..."
              value={form.parameters} onChange={e => setForm({...form, parameters: e.target.value})} 
            />
          </div>

          <div className="form-group">
            <label>Notas Adicionales</label>
            <input 
              className="input-premium" type="text" placeholder="Observaciones del analista..."
              value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} 
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
            <button type="button" className="btn" style={{ flex: 1, background: '#f1f5f9', color: '#475569' }} onClick={() => setModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn-premium" style={{ flex: 2 }} disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar Resultado'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog 
        isOpen={!!confirmDelete}
        title="Eliminar registro"
        message="¿Estás seguro de eliminar este resultado de laboratorio? Esta acción no se puede deshacer."
        confirmLabel="Eliminar permanentemente"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
};

export default LaboratoryView;
