import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions } from '../Hooks/usePermissions';

const Dashboard: React.FC = () => {
  const { isParent } = usePermissions();

  // Si l'utilisateur est un parent, le rediriger vers son dashboard dédié
  if (isParent()) {
    return <Navigate to="/parent-dashboard" replace />;
  }

  return (
    <main className="mx-auto max-w-5xl p-8">
      <section className="rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-600 p-10 text-white shadow-lg">
        <h1 className="mb-4 text-4xl font-bold">
        Dashboard 📚
        </h1>
        <p className="text-lg">
          Gérez vos centres, étudiants et séances en toute simplicité.
        </p>
      </section>
      <section className="mt-12 grid gap-6 sm:grid-cols-2">
          Dashboard
      </section>
    </main>
  );
};

export default Dashboard;