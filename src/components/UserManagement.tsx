import React, { useState, useEffect } from 'react';
import { User, Shield, UserPlus, Trash2, Edit2, CheckCircle, XCircle } from 'lucide-react';
import api from '../services/api';
import Modal from './Modal';

interface UserData {
  id: string;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'Vet'
  });

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users/');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/users/', formData);
      setModalOpen(false);
      fetchUsers();
      setFormData({ username: '', email: '', password: '', role: 'Vet' });
    } catch (error) {
      alert('Error al crear usuario');
    }
  };

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      Admin: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      Vet: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      Receptionist: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[role] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
        {role}
      </span>
    );
  };

  return (
    <div className="p-8 h-full overflow-y-auto bg-[#0f111a]">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Gestión de Usuarios</h1>
            <p className="text-gray-400 text-lg">Administra los accesos y roles de tu equipo.</p>
          </div>
          <button 
            onClick={() => setModalOpen(true)}
            className="btn-premium flex items-center gap-2 h-12 px-6 shadow-lg shadow-blue-500/20"
          >
            <UserPlus size={20} />
            Nuevo Usuario
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {users.map((user) => (
              <div key={user.id} className="glass-card hover:scale-[1.02] transition-all duration-300 p-6 flex flex-col gap-5 border border-white/5 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-blue-500/10 transition-colors"></div>
                
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-blue-500/20">
                      {user.username[0].toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{user.username}</h3>
                      <p className="text-gray-400 text-sm truncate w-40">{user.email}</p>
                    </div>
                  </div>
                  {getRoleBadge(user.role)}
                </div>

                <div className="flex items-center gap-2 py-2 px-3 bg-white/5 rounded-xl w-fit">
                  {user.is_active ? (
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"></div>
                      Activo
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-wider">
                      <div className="w-2 h-2 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]"></div>
                      Inactivo
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 mt-2">
                  <button className="flex-1 bg-white/5 hover:bg-white/10 text-white p-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm font-semibold border border-white/5">
                    <Edit2 size={16} className="text-blue-400" />
                    Editar
                  </button>
                  <button className="h-12 w-12 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors flex items-center justify-center border border-red-500/20">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal for Creating User */}
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Registrar Nuevo Usuario">
          <form onSubmit={handleCreate} className="space-y-6 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-1">Nombre de Usuario</label>
              <input 
                type="text" 
                className="input-premium w-full bg-[#0f111a] border-white/5"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-1">Correo Electrónico</label>
              <input 
                type="email" 
                className="input-premium w-full bg-[#0f111a] border-white/5"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-1">Contraseña</label>
              <input 
                type="password" 
                className="input-premium w-full bg-[#0f111a] border-white/5"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-1">Rol del Sistema</label>
              <select 
                className="input-premium w-full bg-[#0f111a] border-white/5 appearance-none"
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
              >
                <option value="Admin">Administrador</option>
                <option value="Vet">Veterinario</option>
                <option value="Receptionist">Recepcionista</option>
              </select>
            </div>
            <div className="flex gap-4 mt-8">
              <button 
                type="button"
                onClick={() => setModalOpen(false)}
                className="flex-1 px-6 py-4 rounded-2xl bg-white/5 text-white font-bold hover:bg-white/10 transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="flex-1 btn-premium font-bold shadow-xl shadow-blue-500/20"
              >
                Guardar Usuario
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default UserManagement;
