import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import { LogIn, User, Lock, AlertCircle, ShieldCheck } from 'lucide-react';

const Login: React.FC = () => {
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
      setError(err.response?.data?.detail || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pawtastic-screen">
      <div className="pawtastic-card animate-fade-in">
        <div className="pawtastic-body">
          {/* Left Side: Stepper & Dog */}
          <div className="pawtastic-left">
            <div className="pawtastic-logo">
              <div style={{ width: '40px', height: '40px', backgroundColor: '#fdf2f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={24} color="#4a526d" />
              </div>
              VETPREMIUM
            </div>

            <div className="pawtastic-stepper">
              <div className="step-item active">
                <div className="step-dot"></div>
                Identificación
              </div>
              <div className="step-item">
                <div className="step-dot"></div>
                Seguridad
              </div>
              <div className="step-item">
                <div className="step-dot"></div>
                Confirmación
              </div>
            </div>

            <img 
              src="/login-bg.png" 
              alt="Dog background" 
              className="pawtastic-dog"
            />
            
            <div style={{ position: 'absolute', bottom: 20, left: 40, zIndex: 20, fontSize: '0.9rem', opacity: 0.8 }}>
              Save and exit
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="pawtastic-right">
            <h1>Expertos en cuidado animal. <br /> Inicia sesión para continuar.</h1>

            {error && (
              <div style={{ 
                marginBottom: '2rem', padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '1rem', 
                display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#f87171' 
              }} className="animate-shake">
                <AlertCircle size={20} />
                <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>{error}</span>
              </div>
            )}

            <form id="login-form" onSubmit={handleSubmit} style={{ flex: 1 }}>
              <div className="pawtastic-input-group">
                <label>Usuario</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pawtastic-input"
                  placeholder="Ej. rodrigo_vet"
                  required
                />
              </div>

              <div className="pawtastic-input-group">
                <label>Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pawtastic-input"
                  placeholder="••••••••"
                  required
                />
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="pawtastic-footer">
          <button type="button" className="btn-back">
            Ayuda
          </button>
          <button 
            form="login-form" 
            type="submit" 
            className="btn-next"
            disabled={loading}
          >
            {loading ? 'Cargando...' : 'Siguiente'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
