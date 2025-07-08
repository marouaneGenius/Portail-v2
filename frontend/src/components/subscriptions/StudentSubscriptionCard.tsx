import React, { useEffect, useState } from "react";
import { BadgeCheck, Clock, Eye, XCircle } from "lucide-react";
import api from "@/api/aixos";
import { useAuth } from "@/Hooks/auth";
import { getNiveauScolaire, getPrice, IsStudentIsMember } from "./SubscriptionFunctions";
import { useNavigate } from "react-router-dom";

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
};

type Props = {
  studentId: any;
  student:any;
};

const statusStyle = {
  active: "bg-green-100 text-green-800",
  expired: "bg-gray-100 text-gray-500",
};

const badgeContent = (isActive: boolean) =>
  isActive ? (
    <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs ${statusStyle.active}`}>
      <BadgeCheck size={16} /> Active
    </span>
  ) : (
    <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs ${statusStyle.expired}`}>
      <Clock size={16} /> Expired
    </span>
  );

export function StudentSubscriptionCard({ studentId, student }: Props) {
    const [subs, setSubs] = useState<Subscription[]>([]);
    const [isMember, setIsMember] = useState<any>([]);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

  useEffect(() => {
    setLoading(true);
    api
      .get(`/api/subs/student/${studentId}`)
      .then(res => setSubs(res.data))
      .finally(() => setLoading(false));
      IsStudentIsMember(studentId).then(setIsMember)
  }, [studentId]);


  const handleCancel = async (subscriptionId: number) => {
    if (!window.confirm("Confirmer la rupture de l'abonnement ?")) return;
    await api.patch(`/api/subs/${subscriptionId}/cancel`, {
      canceled_by: user?.email,
    });

    setSubs((prev) =>
        prev.map((s) =>
          s.id === subscriptionId
            ? { ...s, is_canceled: true }
            : s
        )
      );
  };

  if (loading) return <div>Chargement...</div>;

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
        <button className="bg-yellow-400 hover:bg-yellow-500 text-white font-semibold rounded px-4 py-2 flex items-center gap-2 text-sm transition"
            onClick={()=>navigate(`/abonnements/${studentId}`)}>
          <span className="text-lg font-bold">+</span> Nouveau contrat
        </button>
      </div>

      <div className="space-y-6">
        {subs.length === 0 && <div className="text-gray-400 italic">Aucun abonnement trouvé.</div>}
        {subs.map((sub, i) => {
          // Statut
            const today = new Date();
            const start = new Date(sub.subscription_start_date);
            const end = new Date(sub.subscription_end_date);
            const isActive = sub.is_valide && today <= end && today >= start;

            const isCanceled = !!sub.is_canceled;

            // Heures utilisées (exemple, tu dois adapter la logique)
            const used = sub.used_hours ?? 0;
            const total = sub.total_hours ?? 60; // par défaut 60h, à remplacer selon tes données
            const niveau = getNiveauScolaire(student.class)
            const price = getPrice(sub.subscription_type, sub?.session_per_week, niveau, { combined: sub?.is_combined ? true : false, isMember: isMember })

          // Pourcent (progression)
          const percent = Math.min(100, Math.round((used / total) * 100));

          return (
            <div key={sub.id}   className={
                "relative bg-white border rounded-xl p-5 shadow flex flex-col gap-2 transition-all " +
                (isCanceled
                  ? "border-red-300 bg-red-50 opacity-80"
                  : "border-gray-200")
              }>
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-lg">{sub.subscription_type}</span>
                {isCanceled ? (
                    <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-red-100 text-red-700 font-semibold">
                        <XCircle size={16} /> Annulé
                    </span>
                    ) : (
                    badgeContent(isActive)
                )}
                {!isCanceled && (
                <button
                    className="border border-red-300 text-red-500 rounded px-3 py-1 flex items-center gap-1 font-semibold hover:bg-red-50 transition text-sm"
                    onClick={() => handleCancel(sub.id)}
                >
                    <XCircle size={16} /> Rompre
                </button>
                )}
                <button
                    className="border border-green-300 text-green-500 rounded px-3 py-1 flex items-center gap-1 font-semibold hover:bg-green-50 transition text-sm"
                    onClick={() => navigate(`/contract/${sub.id}/${studentId}`)}
                >
                    <Eye size={16} /> Voir le contrat
                </button>
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
