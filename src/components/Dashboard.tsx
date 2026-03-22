import React, { useEffect, useState } from 'react'
import { 
  Search, 
  ChevronDown,
  User as UserIcon,
  ArrowRightLeft,
  Zap,
  Bell,
  Bus,
  Loader2,
  Plus
} from 'lucide-react'
import { statsService } from '../services/api'
import PetList from './PetList'
import Modal from './Modal'
import OwnerForm from './OwnerForm'
import PetForm from './PetForm'
import AppointmentForm from './AppointmentForm'
import VaccineReminders from './VaccineReminders'

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeForm, setActiveForm] = useState<'owner' | 'pet' | 'appointment' | null>(null);

  const fetchStats = async () => {
    try {
      const data = await statsService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const openForm = (form: 'owner' | 'pet' | 'appointment') => {
    setActiveForm(form);
    setIsModalOpen(true);
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    setActiveForm(null);
    fetchStats(); // Refresh stats after creation
  };

  if (loading) {
// ...
    return (
      <div className="dashboard-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Loader2 className="animate-spin" size={48} color="var(--primary)" />
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="header-row">
        <div className="greetings">
          <h2 style={{ fontSize: '24px', fontWeight: 700 }}>Greetings! 👋</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Start your day with VETSYSTEM</p>
        </div>
        <div className="search-bar">
          <Search size={18} color="#7c7c7c" />
          <input type="text" placeholder="Search" />
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <div className="user-profile-badge">
            <UserIcon size={18} />
            <span>My account</span>
            <ChevronDown size={14} />
          </div>
        </div>
      </div>

      <div className="stats-cards-grid">
        <div className="stat-card-main">
          <p style={{ fontSize: '14px', color: '#a0a0a0' }}>Total Patients</p>
          <h4 style={{ fontSize: '28px', margin: '10px 0' }}>{stats?.total_pets || 0}</h4>
          <div className="card-footer">
            <p style={{ fontSize: '12px', color: '#a0a0a0' }}>Active in system</p>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>Live View</div>
          </div>
        </div>
        <div className="stat-card-main light">
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Appointments</p>
          <h4 style={{ fontSize: '28px', margin: '10px 0', color: 'var(--text-primary)' }}>{stats?.total_appointments || 0}</h4>
          <div className="card-footer">
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Upcoming items</p>
            <div style={{ width: '24px', height: '16px', background: '#f0f0f0', borderRadius: '4px' }}></div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px' }}>
        <button 
          className="btn-premium" 
          onClick={() => openForm('pet')}
        >
          <Plus size={18} />
          Registrar Mascota
        </button>
        <button 
          className="btn-premium" 
          onClick={() => openForm('owner')}
          style={{ background: 'white', color: '#475569', boxShadow: 'var(--shadow)' }}
        >
          <UserIcon size={18} />
          Añadir Dueño
        </button>
        <button 
          className="btn-premium" 
          onClick={() => openForm('appointment')}
          style={{ background: 'white', color: '#475569', boxShadow: 'var(--shadow)' }}
        >
          <Zap size={18} />
          Agendar Visita
        </button>
      </div>

      <div className="section-header" style={{ marginTop: '30px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Upcoming Reminders</h3>
      </div>
      <div style={{ marginBottom: '30px' }}>
        <VaccineReminders />
      </div>

      <div className="section-header">
        <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Recent Patients</h3>
        <p style={{ color: 'var(--primary)', fontSize: '13px', cursor: 'pointer' }}>See all</p>
      </div>

      <PetList />

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={
          activeForm === 'owner' ? 'Add New Owner' : 
          activeForm === 'pet' ? 'Register New Pet' : 
          'Schedule Appointment'
        }
      >
        {activeForm === 'owner' && <OwnerForm onSuccess={handleSuccess} onCancel={() => setIsModalOpen(false)} />}
        {activeForm === 'pet' && <PetForm onSuccess={handleSuccess} onCancel={() => setIsModalOpen(false)} />}
        {activeForm === 'appointment' && <AppointmentForm onSuccess={handleSuccess} onCancel={() => setIsModalOpen(false)} />}
      </Modal>
    </div>
  )
}

export default Dashboard
