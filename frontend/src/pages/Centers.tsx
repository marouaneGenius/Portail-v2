// src/pages/Profile.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../Hooks/auth';
import CustomDataTable from '../components/CustomDataTable';

const Centers: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="mx-auto py-10 px-4">
      {/* <h1 className="text-3xl font-bold mb-6">Liste des centres</h1> */}
      <CustomDataTable endpoint="center" title="Liste des centres" addLabel="Ajouter un centre" />
    </div>
  );
};

export default Centers;