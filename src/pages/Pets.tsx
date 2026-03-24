import React from 'react';
import PetList from '../components/PetList';

const Pets: React.FC = () => {
  return (
    <div className="fade-in" style={{ 
      display: 'flex', 
      flexDirection: 'column',
      height: '100%',
      gap: '24px',
      padding: '24px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>Mascotas</h1>
          <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#94a3b8' }}>Gestión de pacientes registrados</p>
        </div>
      </div>

      {/* PetList crece para llenar todo el espacio restante */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <PetList />
      </div>
    </div>
  );
};

export default Pets;