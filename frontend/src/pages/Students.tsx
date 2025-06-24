// src/pages/Profile.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../Hooks/auth';
import CustomDataTable from '../components/CustomDataTable';

const Students: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="mx-auto py-2 px-4">
      {/* <h1 className="text-3xl font-bold mb-0">Liste des étudiants</h1> */}
      {/* <div className='flex w-1/6'>       */}
        <CustomDataTable endpoint="student" title="Liste des étudiants" addLabel="Ajouter un étudiant" />

      {/* </div> */}
    </div>
  );
};

export default Students;