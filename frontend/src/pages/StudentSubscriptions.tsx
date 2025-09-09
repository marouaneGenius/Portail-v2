import React, { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../Hooks/auth";
import api from "../api/aixos";
import { GradientCard } from "../components/GardientCard";

interface Contract {
  id: number;
  subscription_id: number;
  url: string;
}

export default function StudentSubscriptions() {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [student, setStudent] = useState<any>();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [selected, setSelected] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate(); 

  // Fonction utilitaire pour construire les URLs absolues
  const getAbsoluteUrl = (url: string) => {
    return url.startsWith('/') ? `${window.location.origin}${url}` : url;
  };

  // Fonction pour réactiver les sessions suspendues d'un contrat
  const unsuspendContract = async (contractId: number) => {
    try {
      const response = await api.post(`/api/subs/${contractId}/unsuspend-sessions`);
      if (response) {
        alert(`Sessions réactivées avec succès ! ${response.data.unsuspended_sessions_count} sessions réactivées.`);
        // Rafraîchir les données
        window.location.reload();
      }
    } catch (e: any) {
      console.error('Erreur lors de la réactivation:', e);
      alert('Erreur lors de la réactivation des sessions');
    }
  };
  
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    
    // Charger les informations de l'étudiant avec les contrats et sessions suspendues
    api.get<any>(`/api/student/${id}`)
      .then((res) => {
        console.log('Student with contracts:', res.data);
        setStudent(res.data);
        setSubscriptions(res.data.contracts || []);
      })
      .catch(() => {
        setError("Impossible de charger les informations de l'étudiant.");
      });

    // Charger les URLs des contrats (PDFs)
    api.get<Contract[]>(`/api/subscription-url/student/${id}`)
      .then(res => setContracts(res.data))
      .catch(() => setError("Impossible de charger les contrats."))
      .finally(() => setLoading(false));
  }, [id]);

  if (!user) return <Navigate to="/login" replace />;
  if (loading) return <p>Chargement…</p>;
  if (error)   return <p className="text-red-600">{error}</p>;

  return (
    <div className="px-4 py-8 space-y-8">
      <GradientCard className="w-full md:w-4/5 mx-auto" innerClassName="p-8">
      {student && 
        <h1 className="text-3xl font-bold mb-6 text-center">
          Les contrats de {student.firstname} {student.lastname}
        </h1>
        }

        {!selected && (
          <>
            {/* Section des contrats avec informations détaillées */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Contrats & Abonnements</h2>
              <div className="space-y-4">
                {subscriptions.map((subscription: any) => {
                  const relatedContract = contracts.find(c => c.subscription_id === subscription.id);
                  return (
                    <div key={subscription.id} className={`border rounded-lg p-4 ${
                      subscription.is_canceled 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-green-300 bg-green-50'
                    }`}>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-semibold">
                            {subscription.subscription_type} - {subscription.offer_type}
                          </h3>
                          <div className="text-sm text-gray-600 mt-1">
                            Matières: {Array.isArray(subscription.school_subjects) 
                              ? subscription.school_subjects.join(', ') 
                              : subscription.school_subjects || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-600">
                            {subscription.session_per_week} séances/semaine
                          </div>
                          <div className="text-sm text-gray-600">
                            Du {subscription.subscription_start_date} au {subscription.subscription_end_date}
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2 items-end">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            subscription.is_canceled 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {subscription.is_canceled ? 'Contrat annulé' : 'Contrat actif'}
                          </span>
                          
                          {subscription.has_suspended_sessions && (
                            <>
                              <span className="px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
                                {subscription.suspended_sessions_count} sessions suspendues
                              </span>
                              <button
                                onClick={() => unsuspendContract(subscription.id)}
                                className="px-4 py-2 bg-blue-600 text-white text-sm hover:bg-blue-700 rounded"
                              >
                                Réactiver
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {subscription.canceled_by && (
                        <div className="text-xs text-red-600 mt-2">
                          Annulé par: {subscription.canceled_by}
                        </div>
                      )}

                      {/* Boutons d'actions pour le PDF */}
                      {relatedContract && (
                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={() => setSelected(relatedContract)}
                            className="px-3 py-1 bg-gray-600 text-white text-sm hover:bg-gray-700 rounded"
                          >
                            Voir le PDF
                          </button>
                          <button
                            onClick={() => navigate(`/contract/${relatedContract.subscription_id}/${student.id}`)}
                            className="px-3 py-1 bg-gray-600 text-white text-sm hover:bg-gray-700 rounded"
                          >
                            Détails du contrat
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section des PDFs (ancienne vue) - optionnelle */}
            {contracts.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Aperçu des PDFs</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {contracts.map((c:any) => (
                    <div key={c.id} className=" ">
                      <div className={c.is_valide ? 
                        `border  rounded overflow-hidden flex flex-col border-4 border-green-500` 
                        : `border rounded overflow-hidden flex flex-col border-4 border-orange-500 ` }
                      >
                        <div className="flex-1 bg-gray-100">
                          <iframe
                            src={getAbsoluteUrl(c.url)}
                            title={`Contrat ${c.id}`}
                            width="100%"
                            height="150px"
                            className="object-cover"
                          />
                        </div>

                        <div className="flex justify-between p-1">
                          <button
                            onClick={() => setSelected(c)}
                            className="px-2 py-1 bg-blue-600 text-white text-sm hover:bg-blue-700 border-2 rounded"
                          >
                            Voir le pdf
                          </button>

                          <button
                            onClick={() => navigate(`/contract/${c.subscription_id}/${student.id}`)}
                            className="px-2 py-1 bg-blue-600 text-white text-sm hover:bg-blue-700 border-2"
                          >
                            Voir le contrat 
                          </button>
                        </div>

                      </div>
                      <p className={c.is_valide ? `text-center text-sm mt-3 text-green-400` : `text-center text-sm mt-3 text-orange-400` }>
                        {c.is_valide ? `Contrat Validé` : `Contrat pas Validé` }
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {
            contracts.length === 0 && (
              <p className="text-gray-600 text-center mt-4">
                Aucun contrat trouvé pour cet étudiant.
              </p>
            )
        }
        {/* 2) Visionneuse en grand */}
        
        {selected && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-2">
              Contrat #{selected.id} — abonnement {selected.subscription_id}
            </h2>
            <div className="w-full h-[600px] border">
              <iframe
                src={getAbsoluteUrl(selected.url)}
                title={`Aperçu grand contrat ${selected.id}`}
                width="100%"
                height="100%"
              />
            </div>
            <button
              onClick={() => setSelected(null)}
              className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Fermer
            </button>
          </div>
        )}
      </GradientCard>
    </div>
  );
}



// Seances

/**
 * refaire la bdd pour la partie subscription - session, c'est une many to one (une session est lie a un abonnement, un abonnement a plusieurs sessions)
 * un bouton qui va programer toutes les sreances du contrat annuel / pre
 * une seance sd on doit choisir/filtrer matiere, tuteuret date-heure
 * 
 * 
 */