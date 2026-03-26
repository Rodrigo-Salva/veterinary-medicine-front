import React from 'react'
import { AlertTriangle, Trash2, PowerOff } from 'lucide-react'

type Variant = 'danger' | 'warning' | 'info'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  variant?: Variant
  onConfirm: () => void
  onCancel: () => void
}

const VARIANT: Record<Variant, { iconBg: string; iconColor: string; btnBg: string; btnHover: string }> = {
  danger:  { iconBg: '#fff1f2', iconColor: '#dc2626', btnBg: '#dc2626', btnHover: '#b91c1c' },
  warning: { iconBg: '#fffbeb', iconColor: '#d97706', btnBg: '#d97706', btnHover: '#b45309' },
  info:    { iconBg: '#eff6ff', iconColor: '#2563eb', btnBg: '#2563eb', btnHover: '#1d4ed8' },
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen, title, message, confirmLabel = 'Confirmar',
  variant = 'danger', onConfirm, onCancel,
}) => {
  if (!isOpen) return null
  const v = VARIANT[variant]

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
      }}
      onClick={onCancel}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: '16px', padding: '28px', width: '400px',
          maxWidth: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          display: 'flex', flexDirection: 'column', gap: '20px',
          animation: 'slideUp .2s ease',
        }}
      >
        {/* Icon + text */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '12px', background: v.iconBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <AlertTriangle size={22} color={v.iconColor} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>{title}</h3>
            <p style={{ margin: '6px 0 0', fontSize: '14px', color: '#64748b', lineHeight: 1.5 }}>{message}</p>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            className="btn"
            style={{ background: '#f1f5f9', color: '#475569' }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="btn"
            style={{ background: v.btnBg, color: '#fff' }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
