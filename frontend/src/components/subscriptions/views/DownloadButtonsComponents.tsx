import React, { useEffect, useState } from "react";
import { ContractHeaderProps } from "./HeaderComponent";
import api from "../../../api/aixos";
import axios from "axios";
import { useAuth } from "../../../Hooks/auth";
import { urlToBlob } from "../SubscriptionFunctions";
import { useNavigate } from "react-router-dom";
import { buildSessions, pad } from "@/services/functions";
import { LoaderOverlay } from "@/components/LoaderOverlay";

const DownloadButtonsComponents: React.FC<any> =  ({student, subscription, onGenerate, pdfUrl, seeContract}) => {
  const { user }:any = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const isCombined = Array.isArray(subscription);
  
  const [isValide, setIsValide] = useState<boolean>(
    subscription.is_valide
  );
  const [isProgramed, setIsProgramed] = useState<boolean>(
    subscription.is_programed
  );

  useEffect(() => {
    if (!pdfUrl) return;

      api.get<any[]>(`/api/subscription-url/student/${student.id}`)
      .then(res => {
        const subscriptionId = res.data.find((item) => item.subscription_id)
        if(res.data.length === 0) {
          return false
        } else {
          const hasIdSubscription = subscription.find((sub:any) => subscriptionId.subscription_id === sub.id )
          return hasIdSubscription ? true :  false
        }
      }).then((r) => {
        if(!r) {
          saveContract()
        } else {
          console.log('file exist')
        }
      })
  }, [pdfUrl, student.id, subscription.id]);

  const saveContract = async() => {
    try {
      const pdfBlob = await urlToBlob(pdfUrl);
      if (!pdfBlob || pdfBlob.size === 0) {
        throw new Error('Le fichier PDF est vide ou invalide');
      }

      let subscriptionId ;
      const formData = new FormData();

      if(Array.isArray(subscription)) {
        const res = subscription.map(sub => {
          return sub.id
        })
        subscriptionId = res[0];
        formData.append('is_combined', String(true));
      } else {
        subscriptionId = subscription.id
        formData.append('is_combined', String(false));
      }

      if(subscriptionId) {
        // 2. Préparation du FormData
        formData.append('file', pdfBlob, 'contrat.pdf');
        formData.append('user_id', String(student.id));
        formData.append('subscription_id', String(subscriptionId));
        formData.append('url', `${student.id}-${subscriptionId}-${Date.now()}.pdf`);

        for (const [key, value] of formData.entries()) {
          console.log(key, value instanceof Blob ? 
            `Blob (${value.type}, ${value.size} bytes)` : 
            value
          );
        }

        const apiUrl = `${import.meta.env.VITE_API_URL_DEV}api/subscription-url`;
        const authToken = useAuth.getState().accessToken;


        await axios.post(apiUrl, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${authToken}`,
          },
        });
      }

    } catch (error) {
      console.error('Erreur complète:', {
        message: error instanceof Error ? error.message : 'Erreur inconnue',
        stack: error instanceof Error ? error.stack : undefined,
        response: axios.isAxiosError(error) ? error.response?.data : undefined
      });
    }
  }

  const validateContract = async () => {
    try {
      const res = await api.patch(
        `/api/subs/${subscription.id}/validate`,
        { updated_by: user.email }
      );
      if (res.status === 200) {
        alert('Le contrat a été validé')
        setIsValide(true);
      }
    } catch (err) {
      console.error("Erreur de validation :", err);
    }
  }

  const programeContract = async () => {
    try {
      const res = await api.patch(
        `/api/subs/${subscription.id}/programed`,
        { programed_by: user.email }
      );
      if (res.status === 200) {
        alert('Le contrat a été programé')
        setIsProgramed(true);
      }
    } catch (err) {
      console.error("Erreur de validation :", err);
    }
  }

  const programSessions = () => {
    const sub = isCombined ? (Array.isArray(subscription) ?subscription.find((item) => item.subscription_type === 'annuel') : null ): subscription
    if (!sub) {
      alert('Aucune subscription valide trouvée.');
      console.warn('Aucune subscription valide trouvée.');
      return;
    }

    const allSessions = buildSessions(
      sub.subscription_start_date,
      sub.subscription_end_date,
      sub.favorite_slots,
      sub.session_per_week
    );

    handleCreateSessidons(allSessions, sub)
  }

  const handleCreateSessidons = async (allSessions:any, subscription:any) => {
    setIsLoading(true);

    try {
      const promises = allSessions.map((sess:any) => {
        const now = new Date();
        const datePart = now.toISOString().split('T')[0];

        const payload = {
          payment_date: datePart,
          date_slot: sess.scheduled_at.split(' ')[0] || sess.scheduled_at.split('T')[0],
          scheduled_at: sess.scheduled_at,
          tutor_id: sess.tutor_id,
          student_ids: [student.id],
          subscription_ids:[subscription.id],
          school_subjects: sess.school_subjects,
          created_by: user.email,
          updated_by: user.email,
          is_paid: true,
          is_absent: false,
          session_type: 'standard',
          is_canceled: false,
          center_id: student.centers.id
        };

       
        return api.post('/api/sessions', payload);
      });

      // on attend que tous les calls se terminent
      await Promise.all(promises);
      alert('Toutes les séances ont été créées !');
      programeContract()
    } catch (e) {
      console.error('Erreur création séances', e);
      alert('Une erreur est survenue lors de la création des séances');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <nav className="bg-gray-100 print:hidden mx-auto w-5/6 rounded">
      <div className="container mx-auto px-4 flex flex-wrap items-center justify-between py-2">
        <span className="font-semibold text-lg">Devis</span>
        <LoaderOverlay isLoading={isLoading} />
        <div className="space-x-2">
          <div className="flex space-x-4">

            {
              isProgramed === false ? 
              <button
                onClick={programSessions}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
              {isCombined? 'Programer les seances Annuel' : 'Programer les seances'} 
              </button>
              :
              <button
              disabled={true}
              className="mt-4 px-4 py-2 bg-green-200 text-gray-400 rounded hover:bg-green-300"
              >
              Seances deja programé
              </button>
            }

              <button
                onClick={()=>  navigate(`/student/subscriptions/${student.id}`)}
                className="mt-4 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
              >
                Mes contrats
              </button>


            {
              <button
                onClick={onGenerate}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Sauvegarder et Prévisualiser
              </button>
            }
            
            <button
              onClick={validateContract}
              className={isValide
                ? `mt-4 px-4 py-2 bg-yellow-200 text-gray-400 rounded shadow-lg`
                : `mt-4 px-4 py-2 bg-yellow-400 text-white rounded hover:bg-yellow-200 hover:text-yellow-600 shadow-lg`}
              disabled={isValide}
            >
              {isValide
                ? `Contrat validé`
                : `Valider le Contrat`}
            </button>
            {pdfUrl && (
              <a
                href={pdfUrl}
                download="contrat-genius.pdf"
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Télécharger le PDF
              </a>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default DownloadButtonsComponents;
