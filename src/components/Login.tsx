import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import { AlertCircle, PawPrint } from 'lucide-react';
import { useNotify } from '../context/NotificationContext';

const Login: React.FC = () => {
  const notify = useNotify();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await authService.login({ username, password });
      login(response);
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Error al iniciar sesión. Verifica tus credenciales.';
      setError(msg);
      notify.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="paw-screen">
      <div className="paw-card">

        {/* ── Panel izquierdo ── */}
        <div className="paw-left">
          <div className="paw-logo">
            <div className="paw-logo-icon">
              <PawPrint size={20} color="#fff" />
            </div>
            VETPREMIUM
          </div>

          <nav className="paw-steps">
            <div className="paw-step">
              <div className="paw-step-dot"></div>
              <span>Perfil</span>
            </div>
            <div className="paw-step active">
              <div className="paw-step-dot"></div>
              <span>Identificación</span>
            </div>
            <div className="paw-step">
              <div className="paw-step-dot"></div>
              <span>Seguridad</span>
            </div>
            <div className="paw-step">
              <div className="paw-step-dot"></div>
              <span>Confirmar</span>
            </div>
          </nav>

          <img src="/login-bg.png" alt="" className="paw-dog-img" />

          <span className="paw-save">Guardar y salir</span>
        </div>

        {/* ── Panel derecho ── */}
        <div className="paw-right">
          <div className="paw-right-inner">
            <h1 className="paw-title">
              Expertos en cuidado animal.<br />
              Inicia sesión para continuar.
            </h1>

            {error && (
              <div className="paw-error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form id="paw-form" onSubmit={handleSubmit} className="paw-form">
              <div className="paw-grid-2">
                <div className="paw-field">
                  <label>Usuario</label>
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Ej. rodrigo_vet"
                    required
                  />
                </div>
                <div className="paw-field">
                  <label>Contraseña</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            </form>

            <div className="paw-footer">
              <button type="button" className="paw-btn-back">Ayuda</button>
              <button form="paw-form" type="submit" className="paw-btn-next" disabled={loading}>
                {loading ? 'Cargando...' : 'Siguiente'}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
