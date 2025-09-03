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
        <CustomDataTable endpoint="student" title="Liste des élèves" addLabel="Ajouter un élève" />

      {/* </div> */}
    </div>
  );
};

export default Students;


/*
  - dans le form student sois afficher le parent, sois lier l'enfant a un parent existant
  - revoir le probleme des l'heure sur les seances dans le page student "card seance"
  - revoir l'erreur quand je modifie toutes les prochaine seances dans la page Seances
  - sauvegarder le contrat automatiquement directement apres la generation
  - refaire la vue du planing Tuteur
  - les classes pour le tuteur ?
*/ 