import React, { useEffect, useRef, useState } from "react";
import { BadgeCheck, Check, Clock, Eye, ProportionsIcon, XCircle } from "lucide-react";
import api from "@/api/aixos";
import { useAuth } from "@/Hooks/auth";
import { getNiveauScolaire, getPrice, IsStudentIsMember } from "./SubscriptionFunctions";
import { useNavigate } from "react-router-dom";
import { buildSessions } from "@/services/functions";
import { LoaderOverlay } from "../LoaderOverlay";
import { BadgeMark } from "@mui/material";

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

export function StudentSubscriptionCard({ studentId, student, hasParent }: Props) {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [isMember, setIsMember] = useState<any>([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isValide, setIsValide] = useState<boolean>();
  const [isProgramed, setIsProgramed] = useState<boolean>( );
  const { user } = useAuth();
  const loadedCombined = useRef<Set<number>>(new Set());


  useEffect(() => {
    setLoading(true);
    api
      .get(`/api/subs/student/${studentId}`)
      .then(res => setSubs(res.data))
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
  
      // const res = await api.patch(  `/api/subs/${subscription.id}/validate`, { updated_by: user?.email } );
      // if (res.status === 200) {
          //  setSubs(prev =>
          //       prev.map(s =>
          //         s.id === subscription.id ? { ...s, is_valide: true } : s
          //       )
          //    );
      // }
    } catch (err) {
      console.error("Erreur de validation :", err);
    }
  }

  const handleCancel = async (subscription:any, subscriptionId: number) => {
    if (!window.confirm("Confirmer la rupture de l'abonnement ?")) return;
    const ids = subscription.combined_id !== null ? await  getIdsToUpdate(subscription): [subscription.id];

    try {
      await Promise.all(
        ids.map((id:any) =>
          api.patch(`/api/subs/${id}/cancel`, { canceled_by: user?.email })
        )
      );
  
      setSubs(prev =>
        prev.map(s =>
          ids.includes(s.id) ? { ...s, is_canceled: true } : s
        )
      );
    } catch (err) {
      console.error('Erreur d’annulation :', err);
    }


    // await api.patch(`/api/subs/${subscriptionId}/cancel`, {
    //   canceled_by: user?.email,
    // });

    // setSubs((prev) =>
    //     prev.map((s) =>
    //       s.id === subscriptionId
    //         ? { ...s, is_canceled: true }
    //         : s
    //     )
    //   );
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

  const programSessions = (subscription:any) => {
    const sub = subscription.isCombined ? (Array.isArray(subscription) ?subscription.find((item) => item.subscription_type === 'annuel') : null ): subscription
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
            const used = sub.used_hours ?? 0;
            const total = sub.total_hours ?? 60; // par défaut 60h, à remplacer selon tes données
            const niveau = getNiveauScolaire(student.class)
            const price = getPrice(sub.subscription_type, sub?.session_per_week, niveau, { combined: sub?.is_combined ? true : false, isMember: isMember })
            const percent = Math.min(100, Math.round((used / total) * 100));
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
                    onClick={() => handleCancel(sub, sub.id)}
                >
                    <XCircle size={16} /> Rompre
                </button>
                )}
                <button
                  className="border border-green-300 text-green-500 rounded px-3 py-1 flex items-center gap-1 font-semibold hover:bg-green-50 transition text-sm"
                  onClick={e => {
                    e.preventDefault();
                    window.open(sub.url, '_blank');
                  }}
                >
                  <Eye size={16} /> Voir 
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
                  isProgramed && programedbadgeContent(isProgramed)
                }

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
    </div>
  );
}
