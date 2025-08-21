import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft, RefreshCw, Phone } from 'lucide-react';

const PaymentCancel: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionInfo, setSessionInfo] = useState<any>(null);

  useEffect(() => {
    const sessionIdParam = searchParams.get('session_id');
    if (sessionIdParam) {
      setSessionId(sessionIdParam);
      // Optionnel : récupérer les informations de la session
      fetchSessionInfo(sessionIdParam);
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  const fetchSessionInfo = async (sessionId: string) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL_DEV || 'http://localhost:8080/';
      const response = await fetch(`${apiUrl}api/sessions/${sessionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setSessionInfo(data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des informations de session:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleRetryPayment = () => {
    if (sessionInfo?.payment_link) {
      window.open(sessionInfo.payment_link, '_blank');
    } else {
      // Retourner à la page de réservation
      navigate('/sessions');
    }
  };

  const handleContactSupport = () => {
    window.location.href = 'tel:+33123456789'; // Remplacez par votre numéro
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        <div className="mb-6">
          <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Paiement annulé
          </h1>
          <p className="text-gray-600">
            Votre paiement a été annulé. Aucun montant n'a été débité.
          </p>
        </div>

        {sessionId && (
          <div className="mb-6 p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-red-700">
              <strong>ID de session :</strong> {sessionId}
            </p>
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Que souhaitez-vous faire ?
          </h2>
          <p className="text-gray-600 text-sm mb-4">
            Vous pouvez réessayer le paiement ou nous contacter si vous rencontrez des difficultés.
          </p>
        </div>

  
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <h3 className="text-sm font-semibold text-yellow-800 mb-1">
            Besoin d'aide ?
          </h3>
          <p className="text-xs text-yellow-700">
            Si vous continuez à rencontrer des problèmes, n'hésitez pas à nous contacter. 
            Notre équipe est là pour vous aider.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;