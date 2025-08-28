import React from 'react';
import { useNavigate } from 'react-router-dom';

const Page404: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Illustration 404 */}
        <div className="mb-8 relative">
          <div className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse">
            404
          </div>
          <div className="absolute -top-4 -right-4 w-16 h-16 bg-yellow-400 rounded-full opacity-20 animate-bounce"></div>
          <div className="absolute -bottom-2 -left-4 w-12 h-12 bg-pink-400 rounded-full opacity-30 animate-bounce delay-300"></div>
        </div>

        {/* Message principal */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Oups ! Page introuvable
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-2">
            La page que vous cherchez n'existe pas ou a été déplacée.
          </p>
          <p className="text-base text-gray-500">
            Mais ne vous inquiétez pas, nous pouvons vous aider à retrouver votre chemin !
          </p>
        </div>

        {/* Boutons d'action */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <button
            onClick={() => navigate(-1)}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg 
                       hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-200 
                       shadow-lg hover:shadow-xl"
          >
            ← Retour en arrière
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-lg 
                       hover:from-purple-700 hover:to-purple-800 transform hover:scale-105 transition-all duration-200 
                       shadow-lg hover:shadow-xl"
          >
            🏠 Accueil
          </button>
        </div>

   

        {/* Footer decoratif */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-400">
            Si le problème persiste, contactez le support technique
          </p>
        </div>

        {/* Éléments décoratifs flottants */}
        <div className="fixed top-20 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-float"></div>
        <div className="fixed top-40 right-20 w-16 h-16 bg-purple-200 rounded-full opacity-20 animate-float delay-700"></div>
        <div className="fixed bottom-20 left-20 w-12 h-12 bg-pink-200 rounded-full opacity-20 animate-float delay-1000"></div>
        <div className="fixed bottom-40 right-10 w-24 h-24 bg-yellow-200 rounded-full opacity-20 animate-float delay-500"></div>
      </div>
    </div>
  );
};

export default Page404;