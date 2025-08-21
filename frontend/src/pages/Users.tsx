// src/pages/Users.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../Hooks/auth';
import { usePermissions } from '../Hooks/usePermissions';
import CustomDataTable from '../components/CustomDataTable';

const Users: React.FC = () => {
  const { user } = useAuth();
  const { hasPermission } = usePermissions();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Vérifier les permissions d'accès à la page utilisateurs
  if (!hasPermission('user:view')) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="mx-auto py-2 px-4">
      {/* <h1 className="text-3xl font-bold mb-6">Utilisateurs</h1> */}
      <CustomDataTable endpoint="user" title="Liste des utilisateurs" addLabel="Ajouter un utilisateur" />
    </div>
  );
};

export default Users;