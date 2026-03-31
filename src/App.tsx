import React, { useState, useCallback, useRef, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './components/Login'
import { searchService } from './services/api'
import {
  LayoutDashboard, Dog, Calendar, FileText, Settings, LogOut,
  Search, Package, Shield, TrendingUp, CreditCard, X, ChevronRight, UsersRound, BedDouble, UserCircle2,
  KeyRound,
} from 'lucide-react'
import Pets from './pages/Pets'
import Dashboard from './components/Dashboard'
import RightPanel from './components/RightPanel'
import HospitalView from './components/HospitalView'
import MedicalHistoryView from './components/MedicalHistoryView'
import InventoryView from './components/InventoryView'
import UserManagement from './components/UserManagement'
import RoleManagement from './components/RoleManagement'
import CalendarView from './components/CalendarView'
import ReportsView from './components/ReportsView'
import BillingView from './components/BillingView'
import SettingsView from './components/SettingsView'
import OwnersView from './components/OwnersView'
import NotificationCenter from './components/NotificationCenter'
import PublicBooking from './pages/PublicBooking'


const GlobalSearch: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounce = useRef<any>()

  useEffect(() => { inputRef.current?.focus() }, [])

  const doSearch = useCallback((q: string) => {
    clearTimeout(debounce.current)
    if (!q.trim() || q.length < 2) { setResults(null); return }
    debounce.current = setTimeout(async () => {
      setLoading(true)
      try {
        setResults(await searchService.search(q))
      } catch {
        setResults(null)
      } finally {
        setLoading(false)
      }
    }, 300)
  }, [])

  const handleKey = (e: React.KeyboardEvent) => { if (e.key === 'Escape') onClose() }
  const total = results
    ? (results.pets?.length || 0) + (results.owners?.length || 0) + (results.appointments?.length || 0)
    : 0

  return (
    <div className="gs-bg" onClick={onClose}>
      <div className="gs-panel" onClick={e => e.stopPropagation()}>
        <div className="gs-input-wrap">
          <Search size={18} className="gs-icon" />
          <input
            ref={inputRef}
            className="gs-input"
            placeholder="Buscar mascotas, dueños, citas..."
            value={query}
            onChange={e => { setQuery(e.target.value); doSearch(e.target.value) }}
            onKeyDown={handleKey}
          />
          {query && <button className="gs-clear" onClick={() => { setQuery(''); setResults(null) }}><X size={14} /></button>}
        </div>

        {loading && <div className="gs-loading">Buscando...</div>}

        {results && !loading && (
          <div className="gs-results">
            {total === 0 && <div className="gs-empty">Sin resultados para "{query}"</div>}
            {results.pets?.length > 0 && (
              <div className="gs-group">
                <div className="gs-group-label"><Dog size={13} style={{ display:'inline', verticalAlign:'middle', marginRight:5 }} />Mascotas ({results.pets.length})</div>
                {results.pets.map((p: any) => (
                  <div key={p.id} className="gs-item" onClick={onClose}>
                    <div className="gs-item-main">{p.name}</div>
                    <div className="gs-item-sub">{p.species} · {p.breed}</div>
                    <ChevronRight size={14} className="gs-arrow" />
                  </div>
                ))}
              </div>
            )}
            {results.owners?.length > 0 && (
              <div className="gs-group">
                <div className="gs-group-label"><UsersRound size={13} style={{ display:'inline', verticalAlign:'middle', marginRight:5 }} />Dueños ({results.owners.length})</div>
                {results.owners.map((o: any) => (
                  <div key={o.id} className="gs-item" onClick={onClose}>
                    <div className="gs-item-main">{o.name}</div>
                    <div className="gs-item-sub">{o.email} · {o.phone}</div>
                    <ChevronRight size={14} className="gs-arrow" />
                  </div>
                ))}
              </div>
            )}
            {results.appointments?.length > 0 && (
              <div className="gs-group">
                <div className="gs-group-label"><Calendar size={13} style={{ display:'inline', verticalAlign:'middle', marginRight:5 }} />Citas ({results.appointments.length})</div>
                {results.appointments.map((a: any) => (
                  <div key={a.id} className="gs-item" onClick={onClose}>
                    <div className="gs-item-main">{a.reason}</div>
                    <div className="gs-item-sub">{new Date(a.date).toLocaleDateString('es')} · {a.status}</div>
                    <ChevronRight size={14} className="gs-arrow" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {!query && <div className="gs-hint">Escribe al menos 2 caracteres para buscar</div>}
      </div>
    </div>
  )
}

interface NavItemProps {
  to: string
  icon: React.ReactNode
  label: string
  expanded: boolean
}
const NavItem: React.FC<NavItemProps> = ({ to, icon, label, expanded }) => (
  <NavLink
    title={label}
    to={to}
    className={({ isActive }) => `nav-icon${isActive ? ' active' : ''}`}
  >
    <span className="nav-icon-glyph">{icon}</span>
    {expanded && <span className="nav-label">{label}</span>}
  </NavLink>
)

const AppContent: React.FC = () => {
  const { isAuthenticated, logout, user, hasPermission } = useAuth()
  const [showSearch, setShowSearch] = useState(false)
  const sidebarOpen = true

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setShowSearch(true) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/reservar" element={<PublicBooking />} />
        <Route path="*" element={<Login />} />
      </Routes>
    )
  }

  return (
    <div className="app-wrapper">
      {showSearch && <GlobalSearch onClose={() => setShowSearch(false)} />}

      <aside className={`sidebar-slim${sidebarOpen ? ' expanded' : ''}`}>
        {/* Header */}
        <div className="sidebar-header">
          <div className="logo-circle" title={`@${user?.username}`}>
            <UserCircle2 size={22} color="#0d2b2b" />
          </div>
          <span className="sidebar-brand">Veterinaria</span>
        </div>

        {/* Nav links */}
        <nav className="nav-icon-list">
          <NavItem to="/"          icon={<LayoutDashboard size={20} />} label="Dashboard"       expanded={sidebarOpen} />
          {hasPermission('mascotas', 'listar') && (
            <NavItem to="/pets"      icon={<Dog size={20} />}             label="Mascotas"         expanded={sidebarOpen} />
          )}
          {hasPermission('propietarios', 'listar') && (
            <NavItem to="/owners"    icon={<UsersRound size={20} />}     label="Propietarios"     expanded={sidebarOpen} />
          )}
          {hasPermission('citas', 'listar') && (
            <NavItem to='/calendar' icon={<Calendar size={20}/>}  label='Calendario' expanded={sidebarOpen}/>
          )}
          {hasPermission('usuarios', 'listar') && (
            <NavItem to="/users"   icon={<Shield size={20} />}          label="Usuarios"         expanded={sidebarOpen} />
          )}
          {hasPermission('roles', 'listar') && (
            <NavItem to="/roles"   icon={<KeyRound size={20} />}        label="Roles"            expanded={sidebarOpen} />
          )}
          {hasPermission('hospitalizacion', 'listar') && (
            <NavItem to="/hospital" icon={<BedDouble size={20} />}     label="Hospital"        expanded={sidebarOpen} />
          )}
          {hasPermission('inventario', 'listar') && (
            <NavItem to="/inventory" icon={<Package size={20} />}     label="Inventario"      expanded={sidebarOpen} />
          )}
          {hasPermission('facturacion', 'listar') && (
            <NavItem to="/billing"  icon={<CreditCard size={20} />}     label="Facturación"     expanded={sidebarOpen} />
          )}
          <NavItem to="/reports"   icon={<TrendingUp size={20} />}     label="Reportes BI"     expanded={sidebarOpen} />

          <div className="nav-spacer" />

          <NavItem to="/reservar"   icon={<FileText size={20} />}        label="Portal Público"   expanded={sidebarOpen} />

          <button
            title="Buscar (Ctrl+K)"
            className="nav-icon nav-btn"
            onClick={() => setShowSearch(true)}
          >
            <span className="nav-icon-glyph"><Search size={20} /></span>
            {sidebarOpen && <span className="nav-label">Buscar</span>}
          </button>
          <NavItem to="/settings"  icon={<Settings size={20} />}        label="Ajustes"          expanded={sidebarOpen} />
          <button
            className="nav-icon nav-btn nav-logout"
            title="Cerrar Sesión"
            onClick={logout}
          >
            <span className="nav-icon-glyph"><LogOut size={20} /></span>
            {sidebarOpen && <span className="nav-label">Salir</span>}
          </button>
        </nav>
      </aside>

      <div className="content-card">
        <main style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <Routes>
            <Route path="/"        element={<Dashboard />} />
            <Route path="/pets"    element={hasPermission('mascotas', 'listar') ? <Pets /> : <Navigate to="/" replace />} />
            <Route path="/owners"  element={hasPermission('propietarios', 'listar') ? <OwnersView /> : <Navigate to="/" replace />} />
            <Route path="/hospital" element={hasPermission('hospitalizacion', 'listar') ? <HospitalView /> : <Navigate to="/" replace />} />
            <Route path="/inventory" element={hasPermission('inventario', 'listar') ? <InventoryView /> : <Navigate to="/" replace />} />
            <Route path="/calendar" element={hasPermission('citas', 'listar') ? <CalendarView /> : <Navigate to="/" replace />} />
            <Route path="/history" element={hasPermission('historial_medico', 'listar') ? <MedicalHistoryView /> : <Navigate to="/" replace />} />
            <Route path="/reports" element={<ReportsView />} />
            <Route path="/billing" element={hasPermission('facturacion', 'listar') ? <BillingView /> : <Navigate to="/" replace />} />
            <Route path="/settings" element={<SettingsView />} />
            <Route path="/users"   element={hasPermission('usuarios', 'listar') ? <UserManagement /> : <Navigate to="/" replace />} />
            <Route path="/roles"   element={hasPermission('roles', 'listar') ? <RoleManagement /> : <Navigate to="/" replace />} />
            <Route path="/reservar" element={<PublicBooking />} />
            <Route path="*"        element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <RightPanel />
      </div>
    </div>
  )
}

const App: React.FC = () => (
  <AuthProvider>
    <Router>
      <AppContent />
    </Router>
  </AuthProvider>
)

export default App
