import React, { useEffect, useState } from "react";
import api from "../../../api/aixos";
import axios from "axios";
import { useAuth } from "../../../Hooks/auth";
import { urlToBlob } from "../SubscriptionFunctions";
import { LoaderOverlay } from "@/components/LoaderOverlay";
import { useNavigate } from "react-router-dom";

const DownloadButtonsComponents: React.FC<any> =  ({student, subscription, onGenerate, previewId}) => {
  const [pdfUrl, setPdfUrl] = useState<string | any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  

  const pdfOptions = {
    margin:      [10,0,10,10],
    filename:    'contrat-genius.pdf',
    image:       { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF:       { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak:   { mode: ['css','legacy','avoid-all'], before: '.page-break' },
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
        if(!r) {
          setTimeout(() => {
            setLoading(false);
            generatePdf();
          } , 4000);
        } else {
          console.log('file exist')
          setLoading(false);

        }
      })
  }, [student.id, subscription.id, subscription, student]);

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
        navigate(`/student/${student.id}`)
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
          <LoaderOverlay isLoading={loading} />
      </div>
    </nav>
  );
};

export default DownloadButtonsComponents;
