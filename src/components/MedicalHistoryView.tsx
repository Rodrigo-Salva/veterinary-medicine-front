import React, { useState, useEffect } from 'react';
import { medicalService, petService, prescriptionService, attachmentService } from '../services/api';
import { Search, Plus, Calendar, User, FileText, ChevronRight, FilePlus, Image as ImageIcon, Trash2, Printer } from 'lucide-react';
import Modal from './Modal';
import ConfirmDialog from './ConfirmDialog';
import { MedicalRecord, Prescription, Attachment } from '../types';
import { useNotify } from '../context/NotificationContext';

const MedicalHistoryView: React.FC = () => {
  const notify = useNotify();
  const [pets, setPets] = useState<any[]>([]);
  const [selectedPet, setSelectedPet] = useState<any | null>(null);
  const [history, setHistory] = useState<MedicalRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [activeTab, setActiveTab] = useState<'history' | 'prescriptions' | 'attachments'>('history');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    description: '',
    diagnosis: '',
    treatment: '',
    record_type: 'Consultation',
    next_date: ''
  });
  const [prescriptionData, setPrescriptionData] = useState({
    medications: '',
    instructions: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileDescription, setFileDescription] = useState('');
  const [fileCategory, setFileCategory] = useState('General');
  const [confirmDeleteAttachment, setConfirmDeleteAttachment] = useState<string | null>(null);

  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    try {
      const data = await petService.getAll();
      setPets(data);
    } catch (err) {
      notify.error('Error al cargar la lista de pacientes');
    } finally {
      setLoading(false);
    }
  };

  const selectPet = async (pet: any) => {
    setSelectedPet(pet);
    try {
      const [historyData, prescriptionData, attachmentData] = await Promise.all([
        medicalService.getHistory(pet.id),
        prescriptionService.getByPet(pet.id),
        attachmentService.getByPet(pet.id)
      ]);
      setHistory(historyData);
      setPrescriptions(prescriptionData);
      setAttachments(attachmentData);
    } catch (err) {
      notify.error('Error al cargar el historial del paciente');
    }
  };

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPet) return;
    try {
      await medicalService.addRecord({
        pet_id: selectedPet.id,
        ...formData,
        next_date: formData.next_date || null
      });
      notify.success('Registro médico guardado');
      setIsModalOpen(false);
      setFormData({ description: '', diagnosis: '', treatment: '', record_type: 'Consultation', next_date: '' });
      selectPet(selectedPet);
    } catch (err) {
      notify.error('Error al guardar el registro médico');
    }
  };

  const handleAddPrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPet) return;
    try {
      await prescriptionService.create({
        pet_id: selectedPet.id,
        ...prescriptionData
      });
      notify.success('Receta emitida correctamente');
      setIsPrescriptionModalOpen(false);
      setPrescriptionData({ medications: '', instructions: '' });
      selectPet(selectedPet);
    } catch (err) {
      notify.error('Error al guardar la receta');
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPet || !selectedFile) return;
    try {
      await attachmentService.upload(selectedPet.id, selectedFile, fileDescription, fileCategory);
      notify.success('Archivo subido con éxito');
      setIsAttachmentModalOpen(false);
      setSelectedFile(null);
      setFileDescription('');
      setFileCategory('General');
      selectPet(selectedPet);
    } catch (err) {
      notify.error('Error al subir el archivo');
    }
  };

  const deleteAttachment = (id: string) => setConfirmDeleteAttachment(id);

  const doDeleteAttachment = async () => {
    if (!confirmDeleteAttachment) return;
    try {
      await attachmentService.delete(confirmDeleteAttachment);
      notify.success('Archivo eliminado');
      setConfirmDeleteAttachment(null);
      selectPet(selectedPet);
    } catch {
      notify.error('Error al eliminar el archivo');
    }
  };

  if (loading) return <div className="p-8">Cargando Pacientes...</div>;

  return (
    <div className="history-container" style={{ display: 'flex', height: '100%', background: '#f8fafc' }}>
      {/* Left Sidebar: Pet List */}
      <div className="pet-list-sidebar" style={{
        width: '320px',
        background: 'white',
        borderRight: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>Pacientes</h3>
          <div className="search-box" style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Buscar paciente..."
              style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px' }}
            />
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {pets.map(pet => (
            <div
              key={pet.id}
              onClick={() => selectPet(pet)}
              style={{
                padding: '16px 24px',
                cursor: 'pointer',
                borderBottom: '1px solid #f1f5f9',
                background: selectedPet?.id === pet.id ? '#f0f7ff' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'background 0.2s'
              }}
            >
              <div>
                <div style={{ fontWeight: '600', color: '#1e293b' }}>{pet.name}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>{pet.species} • {pet.breed}</div>
              </div>
              <ChevronRight size={16} color="#94a3b8" />
            </div>
          ))}
        </div>
      </div>

      {/* Main Content: History */}
      <div className="history-content" style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        {selectedPet ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>Historial Clínico: {selectedPet.name}</h2>
                <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#64748b' }}>
                    <User size={14} /> Dueño ID: {selectedPet.owner_id}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#64748b' }}>
                    <Calendar size={14} /> Edad: {selectedPet.age} años
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setIsPrescriptionModalOpen(true)}
                  className="btn-premium"
                  style={{ background: '#f1f5f9', color: '#475569', boxShadow: 'none' }}
                >
                  <FilePlus size={18} /> Nueva Receta
                </button>
                <button
                  onClick={() => setIsAttachmentModalOpen(true)}
                  className="btn-premium"
                  style={{ background: '#f1f5f9', color: '#475569', boxShadow: 'none' }}
                >
                  <ImageIcon size={18} /> Subir Archivo
                </button>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="btn-premium"
                >
                  <Plus size={18} /> Nuevo Registro
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: '24px' }}>
              <button
                onClick={() => setActiveTab('history')}
                style={{
                  padding: '12px 24px',
                  borderBottom: activeTab === 'history' ? '2px solid #3b82f6' : 'none',
                  color: activeTab === 'history' ? '#3b82f6' : '#64748b',
                  fontWeight: '600',
                  background: 'none',
                  cursor: 'pointer'
                }}
              >
                Historial Médico
              </button>
              <button
                onClick={() => setActiveTab('prescriptions')}
                style={{
                  padding: '12px 24px',
                  borderBottom: activeTab === 'prescriptions' ? '2px solid #3b82f6' : 'none',
                  color: activeTab === 'prescriptions' ? '#3b82f6' : '#64748b',
                  fontWeight: '600',
                  background: 'none',
                  cursor: 'pointer'
                }}
              >
                Recetas
              </button>
              <button
                onClick={() => setActiveTab('attachments')}
                style={{
                  padding: '12px 24px',
                  borderBottom: activeTab === 'attachments' ? '2px solid #3b82f6' : 'none',
                  color: activeTab === 'attachments' ? '#3b82f6' : '#64748b',
                  fontWeight: '600',
                  background: 'none',
                  cursor: 'pointer'
                }}
              >
                Archivos / Imágenes
              </button>
            </div>

            {activeTab === 'history' && (
              <div className="timeline animate-fade-in" style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '20px', top: '0', bottom: '0', width: '2px', background: 'linear-gradient(to bottom, #3b82f6, transparent)' }}></div>

                {history.length > 0 ? history.map((record, index) => (
                  <div key={record.id} style={{ position: 'relative', paddingLeft: '60px', marginBottom: '48px' }}>
                    <div style={{
                      position: 'absolute',
                      left: '0',
                      top: '0',
                      width: '42px',
                      height: '42px',
                      background: 'white',
                      border: '6px solid #f8fafc',
                      borderRadius: '50%',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 1
                    }}>
                      <div style={{ width: '12px', height: '12px', background: '#3b82f6', borderRadius: '50%' }}></div>
                    </div>

                    <div className="floating-card" style={{ background: 'white', borderRadius: '24px', padding: '32px', boxShadow: 'var(--shadow)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                            <span style={{
                              fontSize: '11px',
                              textTransform: 'uppercase',
                              fontWeight: '700',
                              padding: '4px 10px',
                              borderRadius: '20px',
                              background: record.record_type === 'Vaccine' ? '#dcfce7' : '#f1f5f9',
                              color: record.record_type === 'Vaccine' ? '#166534' : '#64748b',
                              letterSpacing: '0.05em'
                            }}>
                              {record.record_type}
                            </span>
                          </div>
                          <h4 style={{ fontWeight: '700', color: '#1e293b', fontSize: '20px' }}>Consulta Médica</h4>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ color: '#1e293b', fontSize: '15px', fontWeight: '600' }}>{new Date(record.recording_date).toLocaleDateString()}</div>
                          {record.next_date && (
                            <div style={{ color: '#ef4444', fontSize: '12px', fontWeight: '700', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                              <Calendar size={12} /> Próximo: {new Date(record.next_date).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>

                      <div style={{ marginBottom: '24px', padding: '16px', background: '#f8fafc', borderRadius: '16px' }}>
                        <p style={{ color: '#475569', lineHeight: '1.6' }}>{record.description}</p>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        <div>
                          <label style={{ fontWeight: '700', display: 'block', fontSize: '11px', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '12px', letterSpacing: '0.05em' }}>Diagnóstico</label>
                          <div style={{ color: '#1e293b', padding: '16px', background: '#fef2f2', borderRadius: '16px', border: '1px solid #fee2e2', fontWeight: '500' }}>{record.diagnosis}</div>
                        </div>
                        <div>
                          <label style={{ fontWeight: '700', display: 'block', fontSize: '11px', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '12px', letterSpacing: '0.05em' }}>Tratamiento</label>
                          <div style={{ color: '#1e293b', padding: '16px', background: '#f0fdf4', borderRadius: '16px', border: '1px solid #dcfce7', fontWeight: '500' }}>{record.treatment}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div style={{ textAlign: 'center', padding: '48px', color: '#94a3b8' }}>
                    No hay registros médicos para este paciente.
                  </div>
                )}
              </div>
            )}

            {activeTab === 'prescriptions' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                {prescriptions.map(p => (
                  <div key={p.id} style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <div style={{ fontWeight: '700', color: '#1e293b' }}>Receta Médica</div>
                      <Printer size={16} color="#64748b" style={{ cursor: 'pointer' }} />
                    </div>
                    <div style={{ fontSize: '14px', marginBottom: '8px' }}>
                      <span style={{ fontWeight: '600' }}>Fecha:</span> {new Date(p.date).toLocaleDateString()}
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#94a3b8' }}>MEDICAMENTOS</label>
                      <p style={{ whiteSpace: 'pre-wrap', fontSize: '14px' }}>{p.medications}</p>
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#94a3b8' }}>INDICACIONES</label>
                      <p style={{ whiteSpace: 'pre-wrap', fontSize: '14px', color: '#64748b' }}>{p.instructions}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'attachments' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {['General', 'Laboratory', 'X-Ray', 'Ultrasound'].map(cat => {
                  const catFiles = attachments.filter(a => a.category === cat || (!a.category && cat === 'General'));
                  if (catFiles.length === 0) return null;

                  return (
                    <div key={cat}>
                      <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '0.05em' }}>
                        {cat === 'General' ? 'Documentos Generales' : 
                         cat === 'Laboratory' ? 'Laboratorio' :
                         cat === 'X-Ray' ? 'Radiografías' : 'Ecografías'}
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
                        {catFiles.map(a => (
                          <div key={a.id} className="floating-card" style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0', transition: 'transform 0.2s' }}>
                            <div style={{ height: '160px', overflow: 'hidden', background: '#f8fafc', position: 'relative' }}>
                              {a.file_type === 'Image' ? (
                                <img 
                                  src={`http://localhost:8000/${a.file_path}`} 
                                  alt={a.description} 
                                  style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
                                  onClick={() => window.open(`http://localhost:8000/${a.file_path}`, '_blank')}
                                />
                              ) : (
                                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                                  <FileText size={48} />
                                  <span style={{ fontSize: '11px', fontWeight: '700', marginTop: '8px' }}>PDF</span>
                                </div>
                              )}
                            </div>
                            <div style={{ padding: '16px' }}>
                              <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {a.description || 'Sin descripción'}
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '12px', color: '#94a3b8' }}>{new Date(a.upload_date).toLocaleDateString()}</span>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <button 
                                    onClick={() => window.open(`http://localhost:8000/${a.file_path}`, '_blank')}
                                    style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                                  >Ver</button>
                                  <Trash2 size={14} color="#ef4444" style={{ cursor: 'pointer' }} onClick={() => deleteAttachment(a.id)} />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {attachments.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '48px', color: '#94a3b8' }}>
                    No hay archivos adjuntos para este paciente.
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
            <FileText size={64} style={{ marginBottom: '16px', opacity: 0.2 }} />
            <p>Seleccione un paciente para ver su historial clínico</p>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nuevo Registro Clínico">
        <form onSubmit={handleAddRecord} className="management-form-premium">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', marginBottom: '8px', display: 'block' }}>Tipo</label>
              <select
                className="input-premium"
                value={formData.record_type}
                onChange={e => setFormData({ ...formData, record_type: e.target.value })}
                required
              >
                <option value="Consultation">Consulta General</option>
                <option value="Vaccine">Vacuna / Refuerzo</option>
                <option value="Surgery">Cirugía</option>
                <option value="Check-up">Control</option>
              </select>
            </div>
            <div className="form-group">
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', marginBottom: '8px', display: 'block' }}>Próxima Cita</label>
              <input
                className="input-premium"
                type="date"
                value={formData.next_date}
                onChange={e => setFormData({ ...formData, next_date: e.target.value })}
              />
            </div>
          </div>
          <div className="form-group">
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', marginBottom: '8px', display: 'block' }}>Descripción Preliminar</label>
            <textarea
              className="input-premium"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describa el motivo y estado inicial"
              required
              rows={3}
            />
          </div>
          <div className="form-group">
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', marginBottom: '8px', display: 'block' }}>Diagnóstico Final</label>
            <input
              className="input-premium"
              type="text"
              value={formData.diagnosis}
              onChange={e => setFormData({ ...formData, diagnosis: e.target.value })}
              placeholder="Diagnóstico médico"
              required
            />
          </div>
          <div className="form-group">
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', marginBottom: '8px', display: 'block' }}>Tratamiento a Seguir</label>
            <textarea
              className="input-premium"
              value={formData.treatment}
              onChange={e => setFormData({ ...formData, treatment: e.target.value })}
              placeholder="Medicación o cuidados especiales"
              required
              rows={3}
            />
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '14px', borderRadius: '16px', background: 'white', border: '1px solid #e2e8f0', fontWeight: '600' }}>Cancelar</button>
            <button type="submit" className="btn-premium" style={{ flex: 2, justifyContent: 'center' }}>Guardar Registro</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isPrescriptionModalOpen} onClose={() => setIsPrescriptionModalOpen(false)} title="Nueva Receta Digital">
        <form onSubmit={handleAddPrescription} className="management-form-premium">
          <div className="form-group">
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', marginBottom: '8px', display: 'block' }}>Medicamentos</label>
            <textarea
              className="input-premium"
              value={prescriptionData.medications}
              onChange={e => setPrescriptionData({ ...prescriptionData, medications: e.target.value })}
              placeholder="Medicamentos y dosis"
              required
              rows={4}
            />
          </div>
          <div className="form-group">
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', marginBottom: '8px', display: 'block' }}>Indicaciones</label>
            <textarea
              className="input-premium"
              value={prescriptionData.instructions}
              onChange={e => setPrescriptionData({ ...prescriptionData, instructions: e.target.value })}
              placeholder="Instrucciones de administración"
              required
              rows={3}
            />
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
            <button type="button" onClick={() => setIsPrescriptionModalOpen(false)} style={{ flex: 1, padding: '14px', borderRadius: '16px', background: 'white', border: '1px solid #e2e8f0', fontWeight: '600' }}>Cancelar</button>
            <button type="submit" className="btn-premium" style={{ flex: 2, justifyContent: 'center' }}>Emitir Receta</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isAttachmentModalOpen} onClose={() => setIsAttachmentModalOpen(false)} title="Adjuntar Documento">
        <form onSubmit={handleFileUpload} className="management-form-premium">
          <div className="form-group">
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', marginBottom: '8px', display: 'block' }}>Descripción del archivo</label>
            <input
              className="input-premium"
              type="text"
              value={fileDescription}
              onChange={e => setFileDescription(e.target.value)}
              placeholder="Ej: Radiografía, Resultado de sangre..."
              required
            />
          </div>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', marginBottom: '8px', display: 'block' }}>Categoría de Estudio</label>
            <select
              className="input-premium"
              value={fileCategory}
              onChange={e => setFileCategory(e.target.value)}
              required
            >
              <option value="General">Documento General</option>
              <option value="Laboratory">Laboratorio / Análisis</option>
              <option value="X-Ray">Radiografía (Rayos X)</option>
              <option value="Ultrasound">Ecografía / Ultrasonido</option>
            </select>
          </div>
          <div className="form-group">
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', marginBottom: '8px', display: 'block' }}>Seleccionar archivo</label>
            <input
              className="input-premium"
              type="file"
              onChange={e => setSelectedFile(e.target.files ? e.target.files[0] : null)}
              accept="image/*,.pdf"
              required
            />
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
            <button type="button" onClick={() => setIsAttachmentModalOpen(false)} style={{ flex: 1, padding: '14px', borderRadius: '16px', background: 'white', border: '1px solid #e2e8f0', fontWeight: '600' }}>Cancelar</button>
            <button type="submit" className="btn-premium" style={{ flex: 2, justifyContent: 'center' }}>Subir Archivo</button>
          </div>
        </form>
      </Modal>

      {confirmDeleteAttachment && (
        <ConfirmDialog
          isOpen={true}
          title="Eliminar archivo"
          message="¿Estás seguro de que deseas eliminar este archivo? Esta acción no se puede deshacer."
          confirmLabel="Eliminar"
          variant="danger"
          onConfirm={doDeleteAttachment}
          onCancel={() => setConfirmDeleteAttachment(null)}
        />
      )}
    </div>
  );
};

export default MedicalHistoryView;
