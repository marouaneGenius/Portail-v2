import React, { useEffect, useState } from "react";
import { ContractHeaderProps } from "./HeaderComponent";
import api from "../../../api/aixos";
import axios from "axios";
import { useAuth } from "../../../Hooks/auth";
import { urlToBlob } from "../SubscriptionFunctions";
import { useNavigate } from "react-router-dom";
import { buildSessions, pad } from "@/services/functions";
import { LoaderOverlay } from "@/components/LoaderOverlay";

const DownloadButtonsComponents: React.FC<any> =  ({student, subscription, onGenerate, previewId}) => {
  const { user }:any = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [pdfUrl, setPdfUrl] = useState<string | any>(null);
  const isCombined = Array.isArray(subscription);
  const [isProgramed, setIsProgramed] = useState<boolean>( subscription.is_programed );

  const pdfOptions = {
    margin:      [10,10,10,10],
    filename:    'contrat-genius.pdf',
    image:       { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF:       { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak:   { mode: ['css','legacy'], before: '.page-break' },
  };

  const generatePdf = async () => {
    const el = document.getElementById(previewId);
    if (!el) return;

    try {
      const { default: html2pdf } = await import('html2pdf.js');
      const worker = html2pdf().set(pdfOptions).from(el);
      const blob: Blob = await worker.outputPdf('blob');
      setPdfUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error('Erreur génération PDF :', err);
    }
  };

  useEffect(() => {
      api.get<any[]>(`/api/subscription-url/student/${student.id}`)
      .then(res => {
        const subscriptionId = res.data.find((item) => item.subscription_id)
        if(res.data.length === 0) {
          return false
        } else {
          return subscription.id === subscriptionId.subscription_id 
        }
      }).then((r) => {

        console.log(r);

        if(!r) {
          generatePdf()
        } else {
          console.log('file exist')
        }
      })
  }, [student.id, subscription.id]);

  useEffect(() => {
    if(pdfUrl) {
      saveContract();
    }
  }, [pdfUrl])

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



  return (
    <nav className="bg-gray-100 print:hidden mx-auto w-5/6 rounded">
      <div className="container mx-auto px-4 flex flex-wrap items-center justify-between py-2">
        <span className="font-semibold text-lg">Devis</span>
        <div className="space-x-2">
          <div className="flex space-x-4">
            {/* {
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
            } */}

              {/* <button
                onClick={()=>  navigate(`/student/subscriptions/${student.id}`)}
                className="mt-4 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
              >
                Mes contrats
              </button> */}

            {/* <button
              onClick={validateContract}
              className={isValide
                ? `mt-4 px-4 py-2 bg-yellow-200 text-gray-400 rounded shadow-lg`
                : `mt-4 px-4 py-2 bg-yellow-400 text-white rounded hover:bg-yellow-200 hover:text-yellow-600 shadow-lg`}
              disabled={isValide}
            >
              {isValide
                ? `Contrat validé`
                : `Valider le Contrat`}
            </button> */}
            {/* {pdfUrl && (
              <a
                href={pdfUrl}
                download="contrat-genius.pdf"
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Télécharger le PDF
              </a>
            )} */}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default DownloadButtonsComponents;
