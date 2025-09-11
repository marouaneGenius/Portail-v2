import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MultiStepFormWrapper from '../forms/MultiStepForm';
import { GeniusContractStep0, GeniusContractStep1, GeniusContractStep2, GeniusContractStep3 } from '../../forms/schemas';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Zap } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/api/aixos';

interface GeniusContractFormProps {
  student?: any;
}

const GeniusContractForm: React.FC<GeniusContractFormProps> = ({ student }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Configuration des étapes du formulaire
  const formSteps = [
    { title: 'Matières et créneaux', fields: GeniusContractStep0 },
    { title: 'Type de contrat', fields: GeniusContractStep1 },
    { title: 'Nombre de séances', fields: GeniusContractStep2 },
    { title: 'Paramètres du contrat', fields: GeniusContractStep3 },
  ];

  const handleFormSubmit = async (formData: Record<string, any>) => {
    setIsSubmitting(true);
    try {
      console.log('Données du formulaire Genius:', formData);

      // Préparer les données pour l'API
      const contractData = {
        student_id: parseInt(id!),
        // Nouvelles données de l'étape 0
        school_subjects: formData['matières et créneaux']?.school_subjects,
        favorite_slots_annuel: formData['matières et créneaux']?.favorite_slots_annuel,
        // Données des autres étapes
        contract_type: formData['type de contrat']?.contract_type,
        session_per_week: parseInt(formData['nombre de séances']?.session_per_week),
        engagement: formData['paramètres du contrat']?.engagement,
        registration_fee: parseInt(formData['paramètres du contrat']?.registration_fee || '0'),
        discount: parseInt(formData['paramètres du contrat']?.discount || '0'),
        contract_start_date: formData['paramètres du contrat']?.contract_start_date,
      };

      // Appeler l'API pour créer le contrat Genius via Subscription
      const response = await api.post('/api/subs/genius', contractData);

      toast.success('Contrat Genius créé avec succès !');
      
      // Rediriger vers la page de génération du contrat avec l'ID de la subscription
      const subscriptionId = response.data.contract.id;
      navigate(`/contract/${subscriptionId}/${id}`);

    } catch (error: any) {
      console.error('Erreur lors de la création du contrat Genius:', error);
      
      // Afficher un message d'erreur plus détaillé
      const errorMessage = error.response?.data?.error || 'Erreur lors de la création du contrat';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2">
      <div className=" mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => navigate(`/student/${id}`)}
            className="mb-4 flex items-center gap-2 hover:bg-white/80"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à la fiche étudiant
          </Button>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            {/* <CardHeader className="text-center bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-lg">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Zap className="w-8 h-8" />
                <CardTitle className="text-2xl font-bold">Contrat Genius</CardTitle>
              </div>
              <CardDescription className="text-purple-100">
                Créer un contrat personnalisé pour {student?.firstname} {student?.lastname}
              </CardDescription>
            </CardHeader>
             */}
            {/* {student && (
              <CardContent className="p-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-blue-800">Informations de l'étudiant</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Nom complet:</span>
                      <p className="font-medium text-gray-800">
                        {student.firstname} {student.lastname}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <p className="font-medium text-gray-800">{student.email}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Classe:</span>
                      <p className="font-medium text-gray-800">{student.class}</p>
                    </div>
                    {student.centers && (
                      <div>
                        <span className="text-gray-600">Centre:</span>
                        <p className="font-medium text-gray-800">{student.centers.name}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            )} */}
          </Card>
        </div>

        {/* Formulaire multi-étapes */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="p-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Configuration du contrat
              </h2>
              <p className="text-gray-600">
                Complétez les informations en 3 étapes pour générer le contrat personnalisé.
              </p>
            </div>

            {isSubmitting ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Création du contrat en cours...</p>
              </div>
            ) : (
              <MultiStepFormWrapper
                steps={formSteps}
                onSubmit={handleFormSubmit}
              />
            )}
          </CardContent>
        </Card>

        {/* Information supplémentaire */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            💡 Toutes les informations saisies sont sauvegardées automatiquement à chaque étape
          </p>
        </div>
      </div>
    </div>
  );
};

export default GeniusContractForm;