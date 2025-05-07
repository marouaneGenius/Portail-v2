// src/pages/Profile.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../Hooks/auth';

const Profile: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Mon Profil</h1>
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* <div>
            <h2 className="text-sm font-semibold text-gray-500">Identifiant</h2>
            <p className="mt-1 text-gray-700">{user.id}</p>
          </div> */}
          <div>
            <h2 className="text-sm font-semibold text-gray-500">Adresse e-mail</h2>
            <p className="mt-1 text-gray-700">{user.email}</p>
          </div>
          {user.firstname && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500">Prénom</h2>
              <p className="mt-1 text-gray-700">{user.firstname}</p>
            </div>
          )}
          {user.lastname && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500">Nom</h2>
              <p className="mt-1 text-gray-700">{user.lastname}</p>
            </div>
          )}
          <div className="md:col-span-2">
            <h2 className="text-sm font-semibold text-gray-500">Rôles</h2>
            <ul className="mt-1 list-disc list-inside text-gray-700">
              {user.roles?.map((role) => (
                <li key={role}>{role}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;