import React, { useState, useEffect, useRef } from 'react';
import { 
  Video, VideoOff, Mic, MicOff, PhoneOff, Send, 
  User, MessageSquare, FileText, ChevronRight, 
  Maximize2, Activity, Heart, Thermometer, Info, 
  PlusCircle, Layout, ArrowLeft
} from 'lucide-react';
import { telemedicineService, medicalService, petService } from '../services/api';
import { MedicalRecord } from '../types';

const TelemedicineView: React.FC = () => {
  const [activeSession, setActiveSession] = useState<any>(null);
  const [pets, setPets] = useState<any[]>([]);
  const [selectedPet, setSelectedPet] = useState<any | null>(null);
  const [history, setHistory] = useState<MedicalRecord[]>([]);
  const [chatMessages, setChatMessages] = useState<{sender: string, text: string, time: string}[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  
  // Clinical Notes form
  const [notes, setNotes] = useState({
    description: '',
    diagnosis: '',
    treatment: '',
    record_type: 'Telemedicine'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [sessions, p] = await Promise.all([
        telemedicineService.getActiveSessions(),
        petService.getAll()
      ]);
      setPets(p);
      if (sessions.length > 0) {
        setActiveSession(sessions[0]);
        const pet = p.find(pp => pp.id === sessions[0].pet_id);
        if (pet) {
          setSelectedPet(pet);
          const h = await medicalService.getHistory(pet.id);
          setHistory(h);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setChatMessages([...chatMessages, { sender: 'Vet', text: newMessage, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]);
    setNewMessage('');
  };

  const handleSaveNotes = async () => {
    if (!selectedPet) return;
    try {
      await medicalService.addRecord({
        pet_id: selectedPet.id,
        ...notes
      });
      alert('Notas guardadas correctamente');
      const h = await medicalService.getHistory(selectedPet.id);
      setHistory(h);
    } catch (err) {
      alert('Error al guardar notas');
    }
  };

  if (loading) return <div className="loading-state">Iniciando Consultorio Virtual...</div>;

  if (!activeSession) {
    return (
      <div className="dashboard-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', textAlign: 'center' }}>
        <div style={{ background: 'rgba(34,197,94,0.1)', padding: '40px', borderRadius: '32px', maxWidth: '500px' }}>
          <Video size={64} color="var(--primary)" style={{ marginBottom: '24px' }} />
          <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>Sin Sesiones Activas</h2>
          <p style={{ color: '#64748b', fontSize: '16px', lineHeight: 1.6 }}>No tienes consultas remotas programadas para este momento. Las sesiones de telemedicina aparecerán aquí automáticamente cuando un dueño se conecte.</p>
          <button className="btn-premium" style={{ marginTop: '24px' }} onClick={loadData}>
            Actualizar Estado
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="telemedicine-container" style={{ 
      display: 'grid', 
      gridTemplateColumns: '1.2fr 0.8fr', 
      height: 'calc(100vh - 100px)', 
      gap: '20px',
      padding: '10px'
    }}>
      
      {/* --- LADO IZQUIERDO: VIDEO Y CHAT --- */}
      <div className="video-section" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Main Video Window */}
        <div className="video-window-premium" style={{ 
          flex: 1, 
          background: '#0f172a', 
          borderRadius: '32px', 
          position: 'relative', 
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
        }}>
          {/* Mock Video Feed */}
          {isVideoOn ? (
            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
              <img 
                src="https://images.unsplash.com/photo-1544568100-847a948585b9?auto=format&fit=crop&q=80&w=1200" 
                alt="Patient" 
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} 
              />
              <div style={{ position: 'absolute', bottom: '20px', left: '20px', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', padding: '8px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontSize: '14px', fontWeight: 600 }}>
                <Activity size={16} color="#22c55e" className="animate-pulse" />
                DUEÑO: {activeSession.doctor_name} — {selectedPet?.name}
              </div>
            </div>
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <VideoOff size={64} style={{ opacity: 0.2 }} />
              <p style={{ marginTop: '16px', opacity: 0.5 }}>Cámara desactivada</p>
            </div>
          )}

          {/* Mini Self-View Overlay */}
          <div style={{ 
            position: 'absolute', 
            top: '20px', 
            right: '20px', 
            width: '180px', 
            height: '110px', 
            borderRadius: '16px', 
            background: '#1e293b', 
            border: '2px solid rgba(255,255,255,0.1)',
            overflow: 'hidden',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)'
          }}>
            <img 
              src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300" 
              alt="Me" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          </div>

          {/* Call Controls Bar */}
          <div style={{ 
            position: 'absolute', 
            bottom: '30px', 
            left: '50%', 
            transform: 'translateX(-50%)', 
            display: 'flex', 
            gap: '15px', 
            padding: '12px 24px', 
            background: 'rgba(15,23,42,0.6)', 
            backdropFilter: 'blur(20px)', 
            borderRadius: '24px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <button 
              onClick={() => setIsMicOn(!isMicOn)}
              style={{ width: '48px', height: '48px', borderRadius: '16px', background: isMicOn ? 'rgba(255,255,255,0.1)' : '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
            >
              {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
            </button>
            <button 
              onClick={() => setIsVideoOn(!isVideoOn)}
              style={{ width: '48px', height: '48px', borderRadius: '16px', background: isVideoOn ? 'rgba(255,255,255,0.1)' : '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
            >
              {isVideoOn ? <Video size={20} /> : <VideoOff size={20} />}
            </button>
            <button style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layout size={20} />
            </button>
            <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)', margin: '4px 8px' }} />
            <button 
              onClick={() => telemedicineService.endSession(activeSession.id).then(() => setActiveSession(null))}
              style={{ width: '48px', height: '48px', borderRadius: '16px', background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <PhoneOff size={20} />
            </button>
          </div>
        </div>

        {/* Chat Section */}
        <div style={{ height: '220px', background: '#fff', borderRadius: '32px', display: 'flex', padding: '16px', boxShadow: 'var(--shadow)', border: '1px solid #f1f5f9' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, overflowY: 'auto', marginBottom: '12px', paddingRight: '10px' }}>
              {chatMessages.length === 0 ? (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '13px' }}>
                  Chat de la sesión iniciado. Escribe un mensaje...
                </div>
              ) : (
                chatMessages.map((msg, i) => (
                  <div key={i} style={{ marginBottom: '8px', textAlign: msg.sender === 'Vet' ? 'right' : 'left' }}>
                    <div style={{ 
                      display: 'inline-block', 
                      background: msg.sender === 'Vet' ? 'var(--primary)' : '#f1f5f9', 
                      color: msg.sender === 'Vet' ? '#fff' : '#0f172a', 
                      padding: '8px 14px', 
                      borderRadius: '14px', 
                      fontSize: '13px',
                      maxWidth: '80%'
                    }}>
                      {msg.text}
                    </div>
                    <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>{msg.time}</div>
                  </div>
                ))
              )}
            </div>
            <form onSubmit={handleSendMessage} style={{ position: 'relative' }}>
              <input 
                type="text" 
                className="input-premium" 
                placeholder="Escribe al dueño..." 
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                style={{ paddingRight: '50px' }}
              />
              <button type="submit" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}>
                <Send size={20} />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* --- LADO DERECHO: NOTAS CLÍNICAS Y ANTECEDENTES --- */}
      <div className="notes-section" style={{ background: '#fff', borderRadius: '32px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: 'var(--shadow)', border: '1px solid #f1f5f9' }}>
        
        {/* Header Tabs */}
        <div style={{ display: 'flex', background: '#f8fafc', padding: '10px' }}>
          <button style={{ flex: 1, padding: '12px', borderRadius: '16px', background: '#fff', border: '1px solid #e2e8f0', color: 'var(--primary)', fontWeight: 700, fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <FileText size={16} /> Nota Actual
          </button>
          <button style={{ flex: 1, padding: '12px', color: '#64748b', fontWeight: 600, fontSize: '13px', border: 'none', background: 'transparent' }}>
            Historial ({history.length})
          </button>
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Patient Info Card */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: '#f0fdf4', borderRadius: '24px', border: '1px solid #dcfce7' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={24} color="#22c55e" />
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>Paciente</div>
              <div style={{ fontWeight: 800, fontSize: '16px', color: '#0f172a' }}>{selectedPet?.name} <span style={{ fontWeight: 400, color: '#64748b' }}>({selectedPet?.breed})</span></div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="management-form-premium" style={{ gap: '16px' }}>
            <div className="form-group">
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px', display: 'block' }}>Motivo de la Video-consulta</label>
              <textarea 
                className="input-premium" 
                rows={3} 
                placeholder="¿Qué observa el dueño?..."
                value={notes.description}
                onChange={e => setNotes({...notes, description: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px', display: 'block' }}>Diagnóstico Preliminar</label>
              <input 
                className="input-premium" 
                placeholder="Ej: Conjuntivitis leve..."
                value={notes.diagnosis}
                onChange={e => setNotes({...notes, diagnosis: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px', display: 'block' }}>Sugerencias de Tratamiento</label>
              <textarea 
                className="input-premium" 
                rows={4} 
                placeholder="Prescribir o sugerir fármacos..."
                value={notes.treatment}
                onChange={e => setNotes({...notes, treatment: e.target.value})}
              />
            </div>
          </div>

          {/* Quick Vitals Mock (Tele-medición) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
             <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
               <Thermometer size={16} color="#ef4444" />
               <span style={{ fontSize: '12px', fontWeight: 600 }}>T: Enviar termómetro</span>
             </div>
             <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
               <Heart size={16} color="#ef4444" />
               <span style={{ fontSize: '12px', fontWeight: 600 }}>F.C: Ver pulso</span>
             </div>
          </div>

          <button 
            className="btn-premium" 
            onClick={handleSaveNotes}
            style={{ width: '100%', marginTop: 'auto', padding: '16px', fontSize: '15px' }}
          >
            <PlusCircle size={20} /> Guardar Registro Médico
          </button>
        </div>
      </div>
    </div>
  );
};

export default TelemedicineView;
