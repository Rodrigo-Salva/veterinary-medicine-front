import React, { useState, useCallback, useRef, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './components/Login'
import { searchService } from './services/api'
import { 
  LayoutDashboard, Dog, Calendar, FileText, Settings, LogOut,
  Search, Bell, Package, Shield, TrendingUp, CreditCard, X, ChevronRight
} from 'lucide-react'
import Pets from './pages/Pets'
import Dashboard from './components/Dashboard'
import RightPanel from './components/RightPanel'
import HospitalView from './components/HospitalView'
import MedicalHistoryView from './components/MedicalHistoryView'
import InventoryView from './components/InventoryView'
import UserManagement from './components/UserManagement'
import CalendarView from './components/CalendarView'
import ReportsView from './components/ReportsView'
import BillingView from './components/BillingView'
import SettingsView from './components/SettingsView'

// ─── Global Search Overlay ────────────────────────────────────────────────────
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
      try { setResults(await searchService.search(q)) } catch {}
      finally { setLoading(false) }
    }, 300)
  }, [])

  const handleKey = (e: React.KeyboardEvent) => { if (e.key === 'Escape') onClose() }

  const total = results ? (results.pets?.length || 0) + (results.owners?.length || 0) + (results.appointments?.length || 0) : 0

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
                <div className="gs-group-label">🐾 Mascotas ({results.pets.length})</div>
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
                <div className="gs-group-label">👤 Dueños ({results.owners.length})</div>
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
                <div className="gs-group-label">📅 Citas ({results.appointments.length})</div>
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

      <style>{`
        .gs-bg { position: fixed; inset: 0; background: rgba(0,0,0,0.75); z-index: 2000; display: flex; align-items: flex-start; justify-content: center; padding-top: 80px; }
        .gs-panel { background: #1e293b; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; width: 560px; max-width: 95vw; max-height: 70vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 25px 60px rgba(0,0,0,0.6); }
        .gs-input-wrap { display: flex; align-items: center; padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.07); gap: 12px; }
        .gs-icon { color: #64748b; flex-shrink: 0; }
        .gs-input { flex: 1; background: none; border: none; color: #f1f5f9; font-size: 1rem; outline: none; }
        .gs-input::placeholder { color: #475569; }
        .gs-clear { background: none; border: none; color: #64748b; cursor: pointer; padding: 2px; display: flex; }
        .gs-clear:hover { color: #f1f5f9; }
        .gs-loading { padding: 20px; text-align: center; color: #64748b; font-size: 0.85rem; }
        .gs-results { overflow-y: auto; max-height: 400px; }
        .gs-group { padding: 8px 0; }
        .gs-group-label { font-size: 0.72rem; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: .05em; padding: 6px 20px; }
        .gs-item { display: flex; align-items: center; padding: 10px 20px; cursor: pointer; gap: 10px; transition: background .1s; }
        .gs-item:hover { background: rgba(255,255,255,0.05); }
        .gs-item-main { flex: 1; font-size: 0.9rem; color: #f1f5f9; font-weight: 500; }
        .gs-item-sub { font-size: 0.75rem; color: #64748b; }
        .gs-arrow { color: #475569; flex-shrink: 0; }
        .gs-hint { padding: 20px; text-align: center; color: #475569; font-size: 0.82rem; }
        .gs-empty { padding: 24px 20px; color: #475569; font-size: 0.85rem; }
      `}</style>
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────
const AppContent: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth()
  const [showSearch, setShowSearch] = useState(false)

  // Keyboard shortcut: Ctrl+K or Cmd+K to open search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setShowSearch(true) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  if (!isAuthenticated) return <Login />

  return (
    <div className="app-wrapper">
      {showSearch && <GlobalSearch onClose={() => setShowSearch(false)} />}

      <aside className="sidebar-slim">
        <div className="logo-circle" title={`@${user?.username}`}>{(user?.username?.[0] || 'V').toUpperCase()}</div>
        <nav className="nav-icon-list">
          <NavLink title="Dashboard" to="/" className={({ isActive }) => `nav-icon ${isActive ? 'active' : ''}`}><LayoutDashboard size={20} /></NavLink>
          <NavLink title="Mascotas" to="/pets" className={({ isActive }) => `nav-icon ${isActive ? 'active' : ''}`}><Dog size={20} /></NavLink>
          <NavLink title="Hospitalización" to="/hospital" className={({ isActive }) => `nav-icon ${isActive ? 'active' : ''}`}>
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </NavLink>
          <NavLink title="Inventario" to="/inventory" className={({ isActive }) => `nav-icon ${isActive ? 'active' : ''}`}><Package size={20} /></NavLink>
          <NavLink title="Calendario" to="/calendar" className={({ isActive }) => `nav-icon ${isActive ? 'active' : ''}`}><Calendar size={20} /></NavLink>
          <NavLink title="Historial Clínico" to="/history" className={({ isActive }) => `nav-icon ${isActive ? 'active' : ''}`}><FileText size={20} /></NavLink>
          <NavLink title="Reportes" to="/reports" className={({ isActive }) => `nav-icon ${isActive ? 'active' : ''}`}><TrendingUp size={20} /></NavLink>
          <NavLink title="Facturación" to="/billing" className={({ isActive }) => `nav-icon ${isActive ? 'active' : ''}`}><CreditCard size={20} /></NavLink>
          {user?.role === 'Admin' && (
            <NavLink title="Usuarios" to="/users" className={({ isActive }) => `nav-icon ${isActive ? 'active' : ''}`}><Shield size={20} /></NavLink>
          )}

          <div style={{ flex: 1 }} />

          <button title="Buscar (Ctrl+K)" className="nav-icon" onClick={() => setShowSearch(true)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <Search size={20} />
          </button>
          <NavLink title="Configuración" to="/settings" className={({ isActive }) => `nav-icon ${isActive ? 'active' : ''}`}><Settings size={20} /></NavLink>
          <button onClick={logout} className="nav-icon" title="Cerrar Sesión" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <LogOut size={20} />
          </button>
        </nav>
      </aside>

      <main style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/pets" element={<Pets />} />
          <Route path="/hospital" element={<HospitalView />} />
          <Route path="/inventory" element={<InventoryView />} />
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/history" element={<MedicalHistoryView />} />
          <Route path="/reports" element={<ReportsView />} />
          <Route path="/billing" element={<BillingView />} />
          <Route path="/settings" element={<SettingsView />} />
          <Route path="/users" element={user?.role === 'Admin' ? <UserManagement /> : <Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <RightPanel />
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
