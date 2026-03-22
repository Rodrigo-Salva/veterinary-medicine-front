import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ 
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }} onClick={onClose}>
      <div className="glass-card animate-fade-in" style={{ 
        width: '90%', maxWidth: '500px', borderRadius: '24px', 
        padding: '32px', position: 'relative' 
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b' }}>{title}</h3>
          <button 
            onClick={onClose}
            style={{ 
              background: '#f1f5f9', border: 'none', borderRadius: '50%', 
              width: '32px', height: '32px', display: 'flex', 
              alignItems: 'center', justifyContent: 'center', cursor: 'pointer' 
            }}
          >
            <X size={18} color="#64748b" />
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
