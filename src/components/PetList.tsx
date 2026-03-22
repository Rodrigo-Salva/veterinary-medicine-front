import React, { useEffect, useState } from 'react';
import { petService } from '../services/api';
import { Pet } from '../types';
import { Loader2 } from 'lucide-react';

const PetList: React.FC = () => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const data = await petService.getAll();
        setPets(data);
      } catch (error) {
        console.error('Error fetching pets:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPets();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="recent-activity-card">
      <table className="pets-table">
        <thead>
          <tr>
            <th>Pet name</th>
            <th>Type</th>
            <th>Breed</th>
            <th>Status</th>
            <th>Age</th>
          </tr>
        </thead>
        <tbody>
          {pets.length > 0 ? (
            pets.map((pet) => (
              <tr key={pet.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--text-secondary)', fontSize: '12px' }}>
                      {pet.name[0]}
                    </div>
                    <strong>{pet.name}</strong>
                  </div>
                </td>
                <td>{pet.species}</td>
                <td>{pet.breed}</td>
                <td><span className="status-pill status-success">Healthy</span></td>
                <td><strong>{pet.age} yrs</strong></td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                No pets registered in the system yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PetList;
