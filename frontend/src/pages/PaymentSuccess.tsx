import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, Home, Calendar } from 'lucide-react';

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionIdParam = searchParams.get('session_id');
    if (sessionIdParam) {
      setSessionId(sessionIdParam);
      // Optionnel : vérifier le statut du paiement auprès du backend
      verifyPaymentStatus(sessionIdParam);
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  const verifyPaymentStatus = async (sessionId: string) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL_DEV || 'http://localhost:8080/';
      const response = await fetch(`${apiUrl}api/payment/verify-session/${sessionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Paiement vérifié:', data);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du paiement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoToSessions = () => {
    navigate('/sessions');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        <div className="mb-6">
          <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Paiement réussi !
          </h1>
          <p className="text-gray-600">
            Votre paiement a été traité avec succès.
          </p>
        </div>

        {sessionId && (
          <div className="mb-6 p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-700">
              <strong>ID de session :</strong> {sessionId}
            </p>
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            {/* Prochaines étapes */}
          </h2>
          <ul className="text-left text-gray-600 space-y-2">
            {/* <li>• Un reçu vous sera envoyé par email</li> */}
            <li>• Votre séance sera confirmée</li>
            {/* <li>• Vous recevrez un SMS de rappel</li> */}
          </ul>
        </div>

    
      </div>
    </div>
  );
};

export default PaymentSuccess;