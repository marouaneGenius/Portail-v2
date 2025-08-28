import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Home, Calendar } from 'lucide-react';

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoToSessions = () => {
    navigate('/sessions');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-sm sm:max-w-md lg:max-w-lg w-full bg-white rounded-lg shadow-xl p-6 sm:p-8 lg:p-10 text-center">
        <div className="mb-6 sm:mb-8">
          <CheckCircle2 className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-green-600 mx-auto mb-4" />
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
            Paiement réussi !
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Votre paiement a été traité avec succès.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;