import React from 'react';
import { 
  CheckCircle2, XCircle, AlertCircle, Info, X 
} from 'lucide-react';
import { Toast, NotificationType } from '../context/NotificationContext';

const ICON_MAP: Record<NotificationType, React.ReactNode> = {
  success: <CheckCircle2 size={18} color="#22c55e" />,
  error: <XCircle size={18} color="#ef4444" />,
  warning: <AlertCircle size={18} color="#f59e0b" />,
  info: <Info size={18} color="#3b82f6" />,
};

const BORDER_COLORS: Record<NotificationType, string> = {
  success: '#dcfce7',
  error: '#fee2e2',
  warning: '#fef9c3',
  info: '#e0f2fe',
};

interface ToastContainerProps {
  notifications: Toast[];
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ notifications, onRemove }) => {
  return (
    <div style={{
      position: 'fixed',
      top: '24px',
      right: '24px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      pointerEvents: 'none'
    }}>
      {notifications.map((toast) => (
        <div key={toast.id} className="animate-fade-in" style={{
          pointerEvents: 'auto',
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: `1.5px solid ${BORDER_COLORS[toast.type]}`,
          borderRadius: '16px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          minWidth: '320px',
          maxWidth: '450px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ flexShrink: 0 }}>
            {ICON_MAP[toast.type]}
          </div>
          <div style={{ flex: 1, fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
            {toast.message}
          </div>
          <button 
            onClick={() => onRemove(toast.id)}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#94a3b8', 
              cursor: 'pointer', 
              padding: '4px', 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};
