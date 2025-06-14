import React, { useEffect } from "react";
import { ContractHeaderProps } from "./HeaderComponent";
import api from "../../../api/aixos";
import axios from "axios";
import { useAuth } from "../../../Hooks/auth";
import { urlToBlob } from "../SubscriptionFunctions";

const DownloadButtonsComponents: React.FC<any> =  ({student, subscription, onGenerate, pdfUrl, }) => {

  useEffect(() => {
    if (!pdfUrl) return;
    (async () => {
      try {
        const pdfBlob = await urlToBlob(pdfUrl);
        if (!pdfBlob || pdfBlob.size === 0) {
          throw new Error('Le fichier PDF est vide ou invalide');
        }
        // 2. Préparation du FormData
        const formData = new FormData();
        formData.append('file', pdfBlob, 'contrat.pdf');
        formData.append('user_id', String(student.id));
        formData.append('subscription_id', String(subscription.id));
        formData.append('url', `${student.id}-${subscription.id}-${Date.now()}.pdf`);

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
      } catch (error) {
        console.error('Erreur complète:', {
          message: error instanceof Error ? error.message : 'Erreur inconnue',
          stack: error instanceof Error ? error.stack : undefined,
          response: axios.isAxiosError(error) ? error.response?.data : undefined
        });
      }
    })();
  }, [pdfUrl, student.id, subscription.id]);

  return (
    <nav className="bg-gray-100 print:hidden">
      <div className="container mx-auto px-4 flex flex-wrap items-center justify-between py-2">
        <span className="font-semibold text-lg">Devis</span>
        <div className="space-x-2">
          <div className="flex space-x-4">
            <button
              onClick={onGenerate}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Générer et Prévisualiser
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
