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
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  

  const pdfOptions = {
    margin:      [10,0,10,10],
    filename:    'contrat-genius.pdf',
    image:       { type: 'jpeg', quality: 0.7 },  // Réduit de 0.98 à 0.7
    html2canvas: { scale: 1.5 },                  // Réduit de 2 à 1.5
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
    if(pdfUrl && !uploadSuccess) {
      saveContract();
    }
  }, [pdfUrl])

  useEffect(() => {
    if(uploadSuccess) {
      navigate(`/student/${student.id}`);
    }
  }, [uploadSuccess])

  const saveContract = async() => {
    try {
      const pdfBlob = await urlToBlob(pdfUrl);
      if (!pdfBlob || pdfBlob.size === 0) {
        throw new Error('Le fichier PDF est vide ou invalide');
      }
      
      // Validation de la taille (2MB max pour éviter le 413)
      const maxSize = 2 * 1024 * 1024; // 2 MB
      if (pdfBlob.size > maxSize) {
        throw new Error(`Le fichier PDF est trop volumineux (${Math.round(pdfBlob.size / 1024 / 1024)} MB). Taille maximale autorisée : 2 MB.`);
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

        const baseUrl = import.meta.env.VITE_API_URL_PROD || import.meta.env.VITE_API_URL_DEV;
        const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        const apiUrl = `${cleanBaseUrl}/api/subscription-url`;
        const authToken = useAuth.getState().accessToken;
        
        console.log('Upload URL:', apiUrl);
        console.log('FormData size:', pdfBlob.size, 'bytes');
        
        const response = await axios.post(apiUrl, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${authToken}`,
          },
        });
        
        console.log('Upload successful:', response.data);
        setUploadSuccess(true);
      }

    } catch (error) {
      const errorMessage = axios.isAxiosError(error) 
        ? `Erreur ${error.response?.status}: ${error.response?.data?.error || error.message}`
        : 'Erreur lors de l\'upload du contrat';
      
      setError(errorMessage);
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
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>Erreur:</strong> {error}
          </div>
        )}
        {uploadSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            Contrat sauvegardé avec succès!
          </div>
        )}
        <LoaderOverlay isLoading={loading} />
      </div>
    </nav>
  );
};

export default DownloadButtonsComponents;
