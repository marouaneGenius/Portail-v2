import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import { Button, Card } from "@mui/material";
import api from "../../api/aixos";
import ContractPdfExporter from "./views/PdfGenerator";


interface Subscription {
  id: number;
  offer_type: string;
  subscription_type: string;
  // 🔸 ajoute ici ce dont tu as besoin pour le gabarit du contrat
}

interface Student {
  id: number;
  firstname: string;
  lastname: string;
  // 🔸 complète selon les besoins du contrat
}

const ContractGenerator: React.FC = () => {
  /* -----------------------------------------------------------------
   * URL params & query params
   * -----------------------------------------------------------------*/
  const { id: subIdParam, student: stuIdParam, combined: combinedIdParam} = useParams<{
    id: string;
    student: string;
    combined?: string;
    
  }>();

  /* -----------------------------------------------------------------
   * State machine
   * -----------------------------------------------------------------*/
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [student, setStudent] = useState<Student | null>(null);

  /* -----------------------------------------------------------------
   * Guards
   * -----------------------------------------------------------------*/
  const subscriptionId = subIdParam;
  const studentId = stuIdParam;
  const combinedId = combinedIdParam ? combinedIdParam : undefined;
  const isValid = subscriptionId && studentId;

  /* -----------------------------------------------------------------
   * Fetch data once params are validated
   * -----------------------------------------------------------------*/
  useEffect(() => {
    if (!isValid) {
      setError("Paramètres d'URL invalides – impossible de générer le contrat.");
      setLoading(false);
      return;    
    }
    if (!studentId || !subscriptionId) return;        // garde-fous
      
    setLoading(true);
    setError(null);
    
    /* -------------------- 1) BÂTIR LE TABLEAU DE PROMESSES -------------------- */
    const requests: Promise<any>[] = [
        api.get(`/api/student/${studentId}`),           // 0 → student
        api.get(`/api/subs/${subscriptionId}`)          // 1 → subscription
    ];
    
    // on ne connait le combinedId… qu’après avoir lu la subscription,
    // donc on fera la 3ᵉ requête juste après (voir plus bas).
    
    /* -------------------- 2) PREMIÈRE SALVE DE REQUÊTES ---------------------- */
    Promise.all(requests)
        .then(([stuRes, subRes]) => {
        setStudent(stuRes.data);
        const combinedId = subRes.data.combined_id;   
        // console.log(combinedId)
        if (!combinedId) {
            setSubscription(subRes.data);
            return null;

        } else{
            // return combinedId;
            return api.get(`/api/subs/combined/${combinedId}`)
            .then(res => ({ combined: res.data }))
            .catch(err => {
            console.error('Erreur req. combined :', err);
            setError('Impossible de récupérer le 2ᵉ abonnement.');
            return null;
            });
        }
 
        /* --------- 3) LANCER LA 3ᵉ REQUÊTE SEULEMENT SI combinedId EXISTE ------ */
   
        })
        .then(extra => {
        if (extra?.combined) {
            setSubscription(extra.combined)
        }
        })
        .catch(() => setError('Impossible de récupérer les données nécessaires.'))
        .finally(() => setLoading(false));
      
      }, [studentId, subscriptionId]);


  if (loading)
    return (
      <Card className="max-w-xl mx-auto mt-8 text-center">
        <div className="py-8 flex flex-col items-center gap-2">
          {/* <Loader2 className="animate-spin" /> */}
          <span>Chargement des informations…</span>
        </div>
      </Card>
    );

  if (error)
    return (
      <Card className="max-w-xl mx-auto mt-8 text-center border-red-500">
        <div className="py-8 flex flex-col items-center gap-2 text-red-600">
          <span>{error}</span>
        </div>
      </Card>
    );

  return (
    <div className="p-0 h-full bg-gray-200 ">
      <div className="  p-0 rounded flex flex-col items-center shadow-md">
        <ContractPdfExporter 
        Student={student}
        Subscription={subscription}
        />
      </div>
    </div>
  );
};

export default ContractGenerator;
