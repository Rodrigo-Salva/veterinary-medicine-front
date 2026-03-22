import React from 'react';
import PetList from '../components/PetList';

const Pets: React.FC = () => {
  return (
    <div className="fade-in">
      <h1>Mascotas</h1>
      <PetList />
    </div>
  );
};

export default Pets;
