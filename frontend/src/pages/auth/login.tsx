// src/pages/Login.tsx
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { getCurrentUser, login } from '../../api/api';
import { useAuth, User } from '../../Hooks/auth';
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL_PROD?.trim() || import.meta.env.VITE_API_URL_DEV?.trim();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { user } = useAuth();

  if (user?.roles?.includes('ROLE_TUTOR')) {
    return <Navigate to="/planning" replace />;
  } else if( user?.roles?.includes('ROLE_PARENT')) { 
    return <Navigate to="/parent-dashboard" replace />;
  } else if( user?.roles?.includes('ROLE_ADMIN') || user?.roles?.includes('ROLE_USER')) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };


  // const handleGoogleLogin = () => {
  //   const popup = window.open(
  //     `${API_URL}/connect/google`,
  //     'google-auth',
  //     'width=500,height=650'
  //   );
  //   if (!popup) return; 
  
  //   const receive = async (e: MessageEvent) => {
  //     // Vérifier que le message vient de la popup Google
  //     if (e.source !== popup) return;
      
  //     if (e.data?.token) {
  //       try {
  //         popup.close();
  //       } catch (error) {
  //         // La popup peut déjà être fermée par le backend
  //       }
  //       localStorage.setItem('jwt', e.data.token);
  //       const me :any = await getCurrentUser(API_URL, e.data.token)

  //       if(me) {
  //         useAuth.getState().setUser(me, e.data.token);
          
  //         // Rediriger selon le rôle de l'utilisateur
  //         if (me.roles?.includes('ROLE_TUTOR')) {
  //           navigate('/planning');
  //         } else if (me.roles?.includes('ROLE_PARENT')) { 
  //           navigate('/parent-dashboard');
  //         } else if (me.roles?.includes('ROLE_ADMIN') || me.roles?.includes('ROLE_USER')) {
  //           navigate('/dashboard');
  //         } else {
  //           navigate('/dashboard'); // fallback
  //         }
  //       } else {
  //         console.error('ERROR => Un problème est survenu lors de la recuperatin du compte')
  //       }
  //       window.removeEventListener('message', receive);
  //     } else if (e.data?.error) {
  //       try {
  //         popup.close();
  //       } catch (error) {
  //         // La popup peut déjà être fermée par le backend
  //       }
  //       setError(e.data.error);
  //       window.removeEventListener('message', receive);
  //     }
  //   };
    
  //   window.addEventListener('message', receive);
    
  //   // Vérifier si la popup est fermée manuellement
  //   const checkClosed = setInterval(() => {
  //     if (popup.closed) {
  //       clearInterval(checkClosed);
  //       window.removeEventListener('message', receive);
  //     }
  //   }, 1000);
  // };


  const handleGoogleLogin = () => {
    const popup = window.open(
      `${API_URL}/connect/google`,
      'google-auth',
      'width=500,height=650'
    );
    
    if (!popup) return;
  
    let tokenReceived = false;
  
    const receive = async (e: MessageEvent) => {
      if (tokenReceived) return; // Éviter les doublons
      
      console.log('Message reçu:', e.data);
      
      if (e.data?.token) {
        tokenReceived = true;
        console.log('Token reçu via postMessage');
        await processToken(e.data.token);
      } else if (e.data?.type === 'oauth_storage') {
        tokenReceived = true;
        console.log('Token reçu via storage');
        await processToken(e.data.token);
      }
    };
  
    // Fonction pour traiter le token
    const processToken = async (token: string) => {
      try {
        popup.close();
      } catch (error) {
        console.log('Popup fermée');
      }
      
      localStorage.setItem('jwt', token);
      const me = await getCurrentUser(API_URL, token);
      
      if(me) {
        useAuth.getState().setUser(me, token);
        
        if (me.roles?.includes('ROLE_TUTOR')) {
          navigate('/planning');
        } else if (me.roles?.includes('ROLE_PARENT')) { 
          navigate('/parent-dashboard');
        } else {
          navigate('/dashboard');
        }
      }
      
      window.removeEventListener('message', receive);
      clearInterval(checkStorage);
    };
  
    window.addEventListener('message', receive);
    
    // Méthode de fallback : vérifier le localStorage
    const checkStorage = setInterval(() => {
      if (tokenReceived) return;
      
      const token = localStorage.getItem('oauth_token_temp');
      const timestamp = localStorage.getItem('oauth_timestamp');
      
      if (token && timestamp) {
        const age = Date.now() - parseInt(timestamp);
        if (age < 10000) { // Token de moins de 10 secondes
          tokenReceived = true;
          console.log('Token trouvé via localStorage');
          localStorage.removeItem('oauth_token_temp');
          localStorage.removeItem('oauth_timestamp');
          processToken(token);
        }
      }
    }, 500);
  
    // Nettoyage après timeout
    setTimeout(() => {
      clearInterval(checkStorage);
      window.removeEventListener('message', receive);
    }, 60000);
  };



  return (
    <div className="flex w-full h-screen">
      {/* Left Panel - Logo with Gradient */}
      <div className="
          hidden
          md:flex
          md:w-1/2
          justify-center
          items-center
          bg-gradient-to-br
          from-purple-500
          via-pink-500
          to-red-500
          animate-gradient
          relative
          overflow-hidden
            ">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="relative z-10 flex flex-col items-center space-y-8">
          <img
            src="/logo/GENIUS-THUNDERBOLD-BIG.png"
            alt="Logo"
            className="h-96 w-96 object-contain drop-shadow-2xl animate-fade-in"
          />
          <div className="text-center text-white space-y-2">
            <h2 className="text-3xl font-bold">Genius</h2>
            <p className="text-lg opacity-90">Notre secret, c’est la Méthode</p>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex w-full md:w-1/2 items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md space-y-8 p-8 bg-white rounded-2xl shadow-2xl animate-slide-up"
        >
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Bienvenue
            </h1>
            <p className="text-gray-600 text-sm">Connectez-vous à votre compte</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-start space-x-2 animate-shake">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Email Input */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
              Adresse e-mail
            </label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
              <input
                id="email"
                type="email"
                required
                className="w-full rounded-lg border border-gray-300 bg-gray-50 pl-11 pr-4 py-3 outline-none transition-all focus:border-purple-500 focus:ring-4 focus:ring-purple-100 focus:bg-white hover:border-gray-400"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
              Mot de passe
            </label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                className="w-full rounded-lg border border-gray-300 bg-gray-50 pl-11 pr-12 py-3 outline-none transition-all focus:border-purple-500 focus:ring-4 focus:ring-purple-100 focus:bg-white hover:border-gray-400"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="space-y-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 py-3 font-semibold text-white transition-all hover:from-purple-700 hover:to-pink-700 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Connexion en cours...</span>
                </>
              ) : (
                <span>Se connecter</span>
              )}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">Ou continuer avec</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="flex w-full items-center justify-center space-x-2 rounded-lg border-2 border-gray-300 bg-white py-3 font-semibold text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-400 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <img src="logo/logo-google.svg" alt="Google" className="h-5 w-5" />
              <span>Connexion Google</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
