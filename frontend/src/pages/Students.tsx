// src/pages/Students.tsx
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../Hooks/auth';
import CustomDataTable from '../components/CustomDataTable';
import StudentExportDialog from '../components/StudentExportDialog';
import { Button } from '@/components/ui/button';
import { FileDown, X } from 'lucide-react';

const Students: React.FC = () => {
  const { user } = useAuth();
  const [showExportModal, setShowExportModal] = useState(false);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <div className="mx-auto py-2 px-4">
        <CustomDataTable
          endpoint="student"
          title="Liste des élèves"
          addLabel="Ajouter un élève"
          extraActions={
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => setShowExportModal(true)}
            >
              <FileDown className="w-4 h-4" />
              Export avancé
            </Button>
          }
        />
      </div>

      {/* Modal d'export avancé */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-4xl my-8">
            <Button
              variant="ghost"
              size="icon"
              className="absolute -top-12 right-0 text-white hover:bg-white/20"
              onClick={() => setShowExportModal(false)}
            >
              <X className="h-6 w-6" />
            </Button>
            <StudentExportDialog onClose={() => setShowExportModal(false)} />
          </div>
        </div>
      )}
    </>
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