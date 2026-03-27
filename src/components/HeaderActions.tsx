import React from 'react'
import NotificationCenter from './NotificationCenter'
import { useAuth } from '../context/AuthContext'
import { UserCircle2 } from 'lucide-react'

const HeaderActions: React.FC = () => {
  const { user } = useAuth()
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
      <NotificationCenter />
      <div className="user-profile-badge" style={{ margin: 0 }}>
        <div style={{
          width: '28px', height: '28px', borderRadius: '8px',
          background: '#22c55e', display: 'flex', alignItems: 'center',
          justifyContent: 'center', color: '#0d2b2b',
        }}>
          <UserCircle2 size={18} color="#0d2b2b" />
        </div>
        <span style={{ fontSize: '13px', fontWeight: 600 }}>{user?.username}</span>
      </div>
    </div>
  )
}

export default HeaderActions
