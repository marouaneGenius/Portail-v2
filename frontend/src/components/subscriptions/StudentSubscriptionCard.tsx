import React, { useEffect, useRef, useState } from "react";
import { BadgeCheck, Check, Clock, Download, Eye, ProportionsIcon, XCircle } from "lucide-react";
import api from "@/api/aixos";
import { useAuth } from "@/Hooks/auth";
import { getNiveauScolaire, getPrice, IsStudentIsMember } from "./SubscriptionFunctions";
import { useNavigate } from "react-router-dom";
import { buildSessions } from "@/services/functions";
import { LoaderOverlay } from "../LoaderOverlay";
import { BadgeMark } from "@mui/material";
import { nbSeancesperWeek } from "@/mocks/mocks";
import { Student } from "@/types/entities";
import { toast } from "sonner";

type Subscription = {
  id: number;
  subscription_type: string;
  is_valide: boolean;
  subscription_start_date: string;
  subscription_end_date: string;
  offer_amount?: number;
  offer_type?: string;
  school_subjects?: string[];
  used_hours?: number;
  total_hours?: number;
  price?: number;
  is_canceled: boolean;
  session_per_week:any;
  is_combined:boolean;
  combined_id:boolean;
  combined?: any[];
  url:string;
  is_suspended:boolean;
  is_programed:boolean;
};

type Props = {
  studentId: any;
  student:any;
  hasParent: boolean;
};

const statusStyle = {
  active: "bg-green-100 text-green-800",
  expired: "bg-orange-100 text-orange-500",
};

const badgeContent = (isActive: boolean) =>
  isActive ? (
    <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs ${statusStyle.active}`}>
      <BadgeCheck size={16} /> validé
    </span>
  ) : (
    <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs ${statusStyle.expired}`}>
      <Clock size={16} /> Pas encore validé
    </span>
  );

  const programedbadgeContent = (isProgramed: boolean) =>{
     return (
      <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-500`}>
        <Clock size={16} /> Programé
      </span>
     )
}

  const downloadPDF = async (subscriptionId: number, student: Student) => {
    try {
      const response = await api.get(`/api/subs/${subscriptionId}/download-pdf`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Récupérer le nom du fichier depuis les headers ou utiliser un nom par défaut
      const contentDisposition = response.headers['content-disposition'];
      let fileName = `contrat_${subscriptionId}_${student.centers?.id}_${student.lastname}_${student.firstname}.pdf`;
      if (contentDisposition && contentDisposition.includes('filename=')) {
        fileName = contentDisposition.split('filename=')[1].replace(/"/g, '');
      }
      
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors du téléchargement du PDF:', error);
      alert('Erreur lors du téléchargement du PDF');
    }
  };

export function StudentSubscriptionCard({ studentId, student, hasParent }: Props) {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [isMember, setIsMember] = useState<any>([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isValide, setIsValide] = useState<boolean>();
  const [isProgramed, setIsProgramed] = useState<boolean>( );
  const { user } = useAuth();
  const loadedCombined = useRef<Set<number>>(new Set());
  const [subscriptionSessions, setSubscriptionSessions] = useState<{[key: number]: any[]}>({});
  const [showResiliationModal, setShowResiliationModal] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<any>(null);
  const [resiliationDate, setResiliationDate] = useState('');

  // Helper function to format decimal hours to "Xh30" format
  const formatHours = (hours: number): string => {
    const wholeHours = Math.floor(hours);
    const minutes = (hours - wholeHours) * 60;
    
    if (minutes === 0) {
      return `${wholeHours}h`;
    } else {
      return `${wholeHours}h${minutes.toString().padStart(2, '0')}`;
    }
  };

  // Helper function to calculate used hours (sessions with dates before today)
  const calculateUsedHours = (subscriptionId: number) => {
    const sessions = subscriptionSessions[subscriptionId] || [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const usedSessions = sessions.filter(session => {
      const sessionDate = new Date(session.date_slot || session.scheduled_at);
      sessionDate.setHours(0, 0, 0, 0);
      return sessionDate < today;
    });
    
    return formatHours(usedSessions.length * 1.5); // 1.5h per session
  };

  // Helper function to calculate total hours (total sessions × 1.5h)
  const calculateTotalHours = (subscriptionId: number) => {
    const sessions = subscriptionSessions[subscriptionId] || [];
    return formatHours(sessions.length * 1.5); // 1.5h per session
  };

  // Helper functions for numeric calculations (for percentage)
  const calculateUsedHoursNumeric = (subscriptionId: number): number => {
    const sessions = subscriptionSessions[subscriptionId] || [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const usedSessions = sessions.filter(session => {
      const sessionDate = new Date(session.date_slot || session.scheduled_at);
      sessionDate.setHours(0, 0, 0, 0);
      return sessionDate < today;
    });
    
    return usedSessions.length * 1.5;
  };

  const calculateTotalHoursNumeric = (subscriptionId: number): number => {
    const sessions = subscriptionSessions[subscriptionId] || [];
    return sessions.length * 1.5;
  };


  // Function to fetch sessions for a subscription
  const fetchSessionsForSubscription = async (subscriptionId: number) => {
    try {
      const response = await api.get(`/api/sessions/subscription/${subscriptionId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching sessions for subscription ${subscriptionId}:`, error);
      return [];
    }
  };

  useEffect(() => {
    setLoading(true);
    api
      .get(`/api/subs/student/${studentId}`)
      .then(async res => {
        setSubs(res.data);
        
        // Fetch sessions for each subscription
        const sessionsPromises = res.data.map(async (sub: any) => {
          const sessions = await fetchSessionsForSubscription(sub.id);
          return { subscriptionId: sub.id, sessions };
        });
        
        const allSessions = await Promise.all(sessionsPromises);
        const sessionsMap: {[key: number]: any[]} = {};
        
        allSessions.forEach(({ subscriptionId, sessions }) => {
          sessionsMap[subscriptionId] = sessions;
        });
        
        setSubscriptionSessions(sessionsMap);
      })
      .finally(() => setLoading(false));
      IsStudentIsMember(studentId).then(setIsMember);
  }, [studentId, ]);

  useEffect(() => {
    subs.forEach((sub:any) => {
      if (sub.combined_id && !loadedCombined.current.has(sub.combined_id)) {
        loadedCombined.current.add(sub.combined_id);
  
        api
          .get(`/api/subs/combined/${sub.combined_id}`)
          .then(res => {
            setSubs(prev =>
              prev.map((s:any) =>
                s.combined_id === sub.combined_id
                  ? { ...s, combined: res.data }      
                  : s
              )
            );
          })
          .catch(console.error);
      }
    });
  }, [subs]);

  const getIdsToUpdate = async (sub: Subscription)  => {
    return await  api
    .get(`/api/subs/combined/${sub.combined_id}`)
    .then(res => {
      return res.data.map((s:any) =>  s.id)
    })
  }


  const validateContract = async (subscription:any) => {
    const ids = subscription.combined_id !== null ? await  getIdsToUpdate(subscription): [subscription.id];

  console.log(ids)

    try {
      await Promise.all(
        ids.map((id:any) =>
          api.patch(`/api/subs/${id}/validate`, { updated_by: user?.email })
        )
      );
      alert('Le contrat a été validé')
      setIsValide(true);
  
          setSubs(prev =>
            prev.map(s =>
              ids.includes(s.id) ? { ...s, is_valide: true } : s
            )
          );
  
    } catch (err) {
      console.error("Erreur de validation :", err);
    }
  }

  // Calculer les dates de résiliation possibles (logique de ProcedureResiliationComponent)
  const calculateResiliationDates = (subscription: any) => {
    const TOTAL_MONTHS = 9;
    const INTERVAL = 3;
    const offsetDays = 7;

    const startDate = subscription.subscription_start_date ;
    const start = new Date(startDate);
    
    const endDates: Date[] = [];
    for (let m = INTERVAL; m <= TOTAL_MONTHS; m += INTERVAL) {
      const d = new Date(start);
      d.setMonth(start.getMonth() + m);
      d.setDate(1); // toujours le 1er du mois
      endDates.push(d);
    }

    // Prépare l'affichage (date de fin + date-limite)
    return endDates.map((end) => {
      const deadline = new Date(end);
      deadline.setDate(end.getDate() - offsetDays);
      return {
        endDate: end,
        deadlineDate: deadline,
        endFr: end.toLocaleDateString("fr-FR", {
          weekday: "long",
          day: "2-digit", 
          month: "long",
          year: "numeric",
        }),
        deadlineFr: deadline.toLocaleDateString("fr-FR", {
          weekday: "long",
          day: "2-digit",
          month: "long", 
          year: "numeric",
        }),
        value: end.toISOString().split('T')[0] // pour le select
      };
    });
  };

  const openResiliationModal = (subscription: any) => {
    setSelectedSubscription(subscription);
    setResiliationDate('');
    setShowResiliationModal(true);
  };

  const closeResiliationModal = () => {
    setShowResiliationModal(false);
    setSelectedSubscription(null);
    setResiliationDate('');
  };

  const handleCancel = async () => {
    if (!selectedSubscription || !resiliationDate) {
      alert('Veuillez sélectionner une date de résiliation');
      return;
    }

    const ids = selectedSubscription.combined_id !== null ? await getIdsToUpdate(selectedSubscription): [selectedSubscription.id];

    try {
      await Promise.all(
        ids.map((id:any) =>
          api.patch(`/api/subs/${id}/cancel`, { 
            canceled_by: user?.email, 
            is_suspended: true,
            resiliation_date: resiliationDate
          })
        )
      );
  
      setSubs(prev =>
        prev.map(s =>
          ids.includes(s.id) ? { ...s, is_canceled: true, is_suspended: true } : s
        )
      );
      
      closeResiliationModal();
      alert('Contrat résilié avec succès');
    } catch (err) {
      console.error('Erreur d\'annulation :', err);
      alert('Erreur lors de la résiliation');
    }
  };

  const handleReactivate = async (subscription:any, subscriptionId: number) => {
    if (!window.confirm("Confirmer la réactivation de l'abonnement ?")) return;
    const ids = subscription.combined_id !== null ? await  getIdsToUpdate(subscription): [subscription.id];

    try {
      await Promise.all(
        ids.map((id:any) =>
          api.patch(`/api/subs/${id}/reactivate`, { updated_by: user?.email })
        )
      );
  
      setSubs(prev =>
        prev.map(s =>
          ids.includes(s.id) ? { ...s, is_canceled: false, is_suspended: false } : s
        )
      );
    } catch (err) {
      console.error('Erreur de réactivation :', err);
    }
  };

  const programeContract = async (subscription:any) => {
    try {
      const res = await api.patch(
        `/api/subs/${subscription.id}/programed`,
        { programed_by: user?.email }
      );
      if (res.status === 200) {
        alert('Le contrat a été programé')
        setIsProgramed(true);
        setSubs(prev =>
            prev.map(s =>
              s.id === subscription.id ? { ...s, is_programed: true } : s
            )
          );
      }
    } catch (err) {
      console.error("Erreur de validation :", err);
    }
  }

  const programSessions = async (subscription: any) => {
    const geniusContract = subscription.subscription_type.includes('genius')

    if(geniusContract) {
      console.log('Subscription:', subscription);
      
      setLoading(true);
      
      try {
        console.log(`Appel API: /api/subs/${subscription.id}/program-sessions`);
        const response = await api.post(`/api/subs/${subscription.id}/program-sessions`);
        
        if (response.data.success) {
          toast.success(`Sessions Genius programmées avec succès ! ${response.data.sessions_created} sessions créées sur ${response.data.weeks_planned} semaines.`);
          window.location.reload(); // Rafraîchir pour voir les nouvelles sessions
        } else {
          throw new Error(response.data.error || 'Erreur lors de la programmation');
        }
      } catch (error: any) {
        console.error('Erreur lors de la programmation des sessions Genius:', error);
        const errorMessage = error.response?.data?.error || 'Erreur lors de la programmation des sessions';
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    } else {
      const sub = subscription.isCombined ? (Array.isArray(subscription) ? subscription.find((item) => item.subscription_type === 'annuel') : null ) : subscription
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
  }

  const handleCreateSessidons = async (allSessions:any, subscription:any) => {
    setLoading(true);

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
          created_by: user?.email,
          updated_by: user?.email,
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
      programeContract(subscription)
    } catch (e) {
      console.error('Erreur création séances', e);
      alert('Une erreur est survenue lors de la création des séances');
    } finally {
      setLoading(false);
    }
  }

  const multipleBadge = (
    <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-700">
      <ProportionsIcon size={16} /> Multiple
    </span>
  );



  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2 text-xl font-bold">
          <span>
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-yellow-500 inline mr-2" fill="none" stroke="currentColor">
              <rect x="3" y="4" width="18" height="18" rx="4" className="stroke-yellow-400" strokeWidth="1.5" />
              <path d="M8 2v4M16 2v4" className="stroke-yellow-400" strokeWidth="1.5" />
            </svg>
            Contrats & Abonnements
          </span>
        </div>
        <button 
          disabled={hasParent} 
          // className="bg-yellow-400 hover:bg-yellow-500 text-white font-semibold rounded px-4 py-2 flex items-center gap-2 text-sm transition"
          className={`${hasParent ? 'bg-gray-300 ' :  'bg-yellow-400 hover:bg-yellow-500'} text-white font-semibold rounded px-4 py-2 flex items-center gap-2 text-sm transition`}
            onClick={()=>navigate(`/abonnements/${studentId}`)}>
          <span className="text-lg font-bold">+</span> Nouveau contrat
        </button>
      </div>
      <LoaderOverlay isLoading={loading} />

      {hasParent && <p className="text-red-500 text-xs py-6">Pour créer un contrat, vous devez attacher ou créer un parent pour cet eleve!</p>}

      <div className="space-y-6">
        {subs.length === 0 && <div className="text-gray-400 italic">Aucun abonnement trouvé.</div>}

        {subs
          .filter(
            (sub:any, idx, arr) =>
              !sub.combined_id ||
              arr.findIndex((s:any) => s.combined_id && s.combined_id === sub.combined_id) === idx
          ).map((sub, i) => {
            const isActive = sub.is_valide ;
            const isProgramed = sub.is_programed ;
            const isCanceled = !!sub.is_canceled;
            const isSuspended = !!sub.is_suspended;
            const used = calculateUsedHours(sub.id);
            const total = calculateTotalHours(sub.id);
            const usedNumeric = calculateUsedHoursNumeric(sub.id);
            const totalNumeric = calculateTotalHoursNumeric(sub.id);
            const niveau = getNiveauScolaire(student.class)
            const price = getPrice(sub.subscription_type, sub?.session_per_week, niveau, { combined: sub?.is_combined ? true : false, isMember: isMember })
            const percent = totalNumeric > 0 ? Math.min(100, Math.round((usedNumeric / totalNumeric) * 100)) : 0;
            const isCombined = sub.combined_id !== null;
            const label = isCombined !== null
            ? sub.combined?.map((c: any) => c.subscription_type).join(' / ') || 'Multiple'
            : sub.subscription_type;

          return (
            <div key={sub.id}   className={
                "relative bg-white border rounded-xl p-5 shadow flex flex-col gap-2 transition-all " +
                (isCanceled
                  ? "border-red-300 bg-red-50 opacity-80"
                  : "border-gray-200")
              }>
              <div className="flex items-center justify-between gap-2">

                {
                  sub.combined_id ? (
                    <span className="font-semibold text-lg">{label}</span>
                  ) :(
                    <span className="font-semibold text-lg">{sub.subscription_type}</span>

                  )
                }

                {isCanceled ? (
                    <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-red-100 text-red-700 font-semibold">
                        <XCircle size={16} /> Annulé
                    </span>
                    ) : (
                    badgeContent(isActive)
                )}
                 {sub.combined_id && multipleBadge}

                {!isCanceled && isActive && (
                <button
                    className="border border-red-300 text-red-500 rounded px-3 py-1 flex items-center gap-1 font-semibold hover:bg-red-50 transition text-sm"
                    onClick={() => openResiliationModal(sub)}
                >
                    <XCircle size={16} /> Rompre
                </button>
                )}
                <button
                  className="border border-green-300 text-green-500 rounded px-3 py-1 flex items-center gap-1 font-semibold hover:bg-green-50 transition text-sm"
                  onClick={async (e) => {
                    e.preventDefault();
                    
                    try {
                      // Récupérer l'URL du PDF via l'API backend
                      const response = await api.get(`/api/subs/${sub.id}/download-pdf`, {
                        responseType: 'blob'
                      });
                      
                      // Créer une URL temporaire pour visualiser le PDF
                      const blob = new Blob([response.data], { type: 'application/pdf' });
                      const pdfUrl = window.URL.createObjectURL(blob);
                      
                      // Ouvrir le PDF dans un nouvel onglet pour visualisation
                      window.open(pdfUrl, '_blank');
                      
                    } catch (error) {
                      console.error('Erreur lors de l\'ouverture du contrat:', error);
                      toast.error('Impossible d\'ouvrir le contrat. Il n\'a peut-être pas encore été généré.');
                    }
                  }}
                >
                  <Eye size={16} /> Voir 
                </button>
                
                <button
                  className="border border-blue-300 text-blue-500 rounded px-3 py-1 flex items-center gap-1 font-semibold hover:bg-blue-50 transition text-sm"
                  onClick={() => {
                    downloadPDF(sub.id, student);
                  }}
                >
                  <Download size={16} /> PDF
                </button>

                {
                  !isActive &&
                  <button
                  className="border border-orange-300 text-orange-500 rounded px-3 py-1 flex items-center gap-1 font-semibold hover:bg-orange-50 transition text-sm"
                  onClick={e => validateContract(sub)}
                >
                  <Check size={16} /> Valider 
                  </button>
                }

                {
                  isProgramed && !isSuspended && programedbadgeContent(isProgramed)
                }
                
                {(isCanceled || isSuspended) && (
                  <button
                      className="border border-green-300 text-green-500 rounded px-3 py-1 flex items-center gap-1 font-semibold hover:bg-green-50 transition text-sm"
                      onClick={() => handleReactivate(sub, sub.id)}
                  >
                      <Check size={16} /> Réactiver
                  </button>
                )}

                {
                  !isProgramed && isActive && !isCanceled && !isCombined && 
                    <button
                      className="border border-blue-300 text-blue-500 rounded px-3 py-1 flex items-center gap-1 font-semibold hover:bg-orange-50 transition text-sm"
                      onClick={e => programSessions(sub)}
                    >
                      <ProportionsIcon size={16} /> Programer 
                    </button>
                }

              </div>
              <div className="text-gray-700 text-sm mt-1 mb-2">
                Du <span className="font-medium">{sub.subscription_start_date && new Date(sub.subscription_start_date).toLocaleDateString("fr-FR")}</span> au <span className="font-medium">{sub.subscription_end_date && new Date(sub.subscription_end_date).toLocaleDateString("fr-FR")}</span>
              </div>
              <div className="text-gray-700 text-sm">Heures: <span className="font-medium">{used}/{total}</span> utilisées</div>
              <div className="text-gray-700 text-sm mb-2">Contrat de <span className="font-medium">{nbSeancesperWeek[sub.session_per_week -1]} par semaine</span></div>
              <div className="text-gray-700 text-sm mb-2">Prix: <span className="font-medium">{price}€/mois</span></div>
              

              
              <div className="flex flex-wrap gap-2 mt-2 mb-3">
                {(sub.school_subjects || []).map((mat, idx) => (
                  <span key={idx} className="bg-gray-100 px-3 py-1 rounded-full text-sm font-semibold text-gray-700">{mat}</span>
                ))}
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${percent}%`, background: "#FFC107" }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de résiliation */}
      {showResiliationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 text-red-600">
              Résiliation du contrat
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de résiliation possible
              </label>
              <select
                value={resiliationDate}
                onChange={(e) => setResiliationDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">Sélectionner une date de résiliation</option>
                {selectedSubscription && calculateResiliationDates(selectedSubscription).map((dateInfo, index) => (
                  <option key={index} value={dateInfo.value}>
                    {dateInfo.endFr} (à notifier avant le {dateInfo.deadlineFr})
                  </option>
                ))}
              </select>
            </div>

            {resiliationDate && selectedSubscription && (
              <div className="mb-4">
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Date sélectionnée :</strong> Résiliation effective le {new Date(resiliationDate).toLocaleDateString("fr-FR", {
                      weekday: "long",
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Attention :</strong> La résiliation sera effective à la date sélectionnée. 
                Toutes les séances programmées après cette date seront annulées.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={closeResiliationModal}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition"
              >
                Annuler
              </button>
              <button
                onClick={handleCancel}
                disabled={!resiliationDate}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
              >
                Confirmer la résiliation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
