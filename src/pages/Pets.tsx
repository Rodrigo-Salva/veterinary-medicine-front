import React, { useState } from 'react'
import PetList from '../components/PetList'
import PetProfile from '../components/PetProfile'
import Modal from '../components/Modal'
import PetForm from '../components/PetForm'
import { Plus, Search } from 'lucide-react'

const Pets: React.FC = () => {
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null)

  const handleSuccess = () => {
    setShowModal(false)
    setRefreshKey(k => k + 1)
  }

  if (selectedPetId) {
    return (
      <PetProfile
        petId={selectedPetId}
        onBack={() => setSelectedPetId(null)}
        onUpdated={() => setRefreshKey(k => k + 1)}
      />
    )
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="header-row">
        <div className="greetings">
          <h2 style={{ fontSize: '24px', fontWeight: 700 }}>Mascotas</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Gestion de pacientes registrados</p>
        </div>
        <div className="search-bar">
          <Search size={18} color="#7c7c7c" />
          <input
            type="text"
            placeholder="Buscar por nombre, especie, raza..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button
          className="btn"
          onClick={() => setShowModal(true)}
          style={{ background: 'var(--primary)', color: 'white' }}
        >
          <Plus size={18} />
          Nueva Mascota
        </button>
      </div>

      <PetList key={refreshKey} searchQuery={search} onSelectPet={setSelectedPetId} />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Registrar Mascota">
        <PetForm onSuccess={handleSuccess} onCancel={() => setShowModal(false)} />
      </Modal>
    </div>
  )
}

export default Pets
