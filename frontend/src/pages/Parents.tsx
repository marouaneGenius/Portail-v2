// src/pages/Profile.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../Hooks/auth';
import CustomDataTable from '../components/CustomDataTable';

const Parents: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Parents</h1>
      <CustomDataTable endpoint="parent" pageSize={20} />
    </div>
  );
};

export default Parents;