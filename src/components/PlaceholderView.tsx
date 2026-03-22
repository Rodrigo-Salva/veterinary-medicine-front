import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PlaceholderViewProps {
  title: string;
  icon: LucideIcon;
}

const PlaceholderView: React.FC<PlaceholderViewProps> = ({ title, icon: Icon }) => {
  return (
    <div style={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: '#f8fafc',
      color: '#64748b' 
    }}>
      <div style={{ 
        background: 'white', 
        padding: '48px', 
        borderRadius: '24px', 
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <Icon size={64} style={{ marginBottom: '24px', color: '#3b82f6', opacity: 0.8 }} />
        <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>{title}</h2>
        <p style={{ maxWidth: '300px' }}>Esta funcionalidad está siendo desarrollada para ofrecerte la mejor experiencia premium.</p>
        <button 
          onClick={() => window.history.back()} 
          className="btn-secondary" 
          style={{ marginTop: '24px' }}
        >
          Volver atrás
        </button>
      </div>
    </div>
  );
};

export default PlaceholderView;
