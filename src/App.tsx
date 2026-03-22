import React from 'react'
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './components/Login'
import { 
  LayoutDashboard, 
  Dog, 
  Calendar, 
  FileText, 
  Settings, 
  LogOut, 
  Search, 
  Bell, 
  ChevronDown,
  User as UserIcon,
  Zap,
  Bus,
  ArrowRightLeft,
  CreditCard,
  MessageSquare,
  Package,
  Shield
} from 'lucide-react'
import Pets from './pages/Pets'
import Dashboard from './components/Dashboard'
import RightPanel from './components/RightPanel'
import HospitalView from './components/HospitalView'
import MedicalHistoryView from './components/MedicalHistoryView'
import InventoryView from './components/InventoryView'
import PlaceholderView from './components/PlaceholderView'
import UserManagement from './components/UserManagement'

const AppContent: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="app-wrapper">
      <aside className="sidebar-slim">
        <div className="logo-circle">{(user?.username?.[0] || 'V').toUpperCase()}</div>
        <nav className="nav-icon-list">
          <NavLink title="Dashboard" to="/" className={({ isActive }) => `nav-icon ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={20} />
          </NavLink>
          <NavLink title="Mascotas" to="/pets" className={({ isActive }) => `nav-icon ${isActive ? 'active' : ''}`}>
            <Dog size={20} />
          </NavLink>
          <NavLink title="Hospitalización" to="/hospital" className={({ isActive }) => `nav-icon ${isActive ? 'active' : ''}`}>
            <Zap size={20} />
          </NavLink>
          <NavLink title="Inventario" to="/inventory" className={({ isActive }) => `nav-icon ${isActive ? 'active' : ''}`}>
            <Package size={20} />
          </NavLink>
          <NavLink title="Calendario" to="/calendar" className={({ isActive }) => `nav-icon ${isActive ? 'active' : ''}`}>
            <Calendar size={20} />
          </NavLink>
          <NavLink title="Historias" to="/history" className={({ isActive }) => `nav-icon ${isActive ? 'active' : ''}`}>
            <FileText size={20} />
          </NavLink>
          {user?.role === 'Admin' && (
            <NavLink title="Usuarios" to="/users" className={({ isActive }) => `nav-icon ${isActive ? 'active' : ''}`}>
              <Shield size={20} />
            </NavLink>
          )}
          <NavLink title="Configuración" to="/settings" className={({ isActive }) => `nav-icon ${isActive ? 'active' : ''}`}>
            <Settings size={20} />
          </NavLink>
        </nav>
        <button 
          onClick={logout}
          className="nav-icon" 
          title="Cerrar Sesión"
          style={{ background: 'none', border: 'none', cursor: 'pointer', marginTop: 'auto' }}
        >
          <LogOut size={20} />
        </button>
      </aside>

      <main style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/pets" element={<Pets />} />
          <Route path="/hospital" element={<HospitalView />} />
          <Route path="/inventory" element={<InventoryView />} />
          <Route path="/history" element={<MedicalHistoryView />} />
          <Route path="/users" element={user?.role === 'Admin' ? <UserManagement /> : <Navigate to="/" replace />} />
          <Route path="/calendar" element={<PlaceholderView title="Calendario" icon={Calendar} />} />
          <Route path="/settings" element={<PlaceholderView title="Configuración" icon={Settings} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <RightPanel />
    </div>
  );
}

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  )
}

export default App
