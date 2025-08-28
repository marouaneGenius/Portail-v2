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

        <div className="mb-6 sm:mb-8">
          <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
            Prochaines étapes
          </h2>
          <ul className="text-left text-sm sm:text-base text-gray-600 space-y-2 sm:space-y-3">
            <li>• Un reçu vous sera envoyé par email</li>
            <li>• Votre séance sera confirmée</li>
            <li>• Vous recevrez un SMS de rappel</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            onClick={handleGoHome}
            className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 sm:py-3 rounded-lg font-medium transition-colors duration-200"
          >
            <Home className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">Accueil</span>
          </button>
          <button
            onClick={handleGoToSessions}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 sm:py-3 rounded-lg font-medium transition-colors duration-200"
          >
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">Mes séances</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;