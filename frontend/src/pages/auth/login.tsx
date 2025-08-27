// src/pages/Login.tsx
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { getCurrentUser, login } from '../../api/api';
import { useAuth, User } from '../../Hooks/auth';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL_PROD?.trim() || import.meta.env.VITE_API_URL_DEV?.trim();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      <div className="
          flex
          w-1/2
          justify-center
          items-center
          bg-gradient-to-br
          from-purple-500
          via-pink-500
          to-red-500
          animate-gradient
            ">
        <img
          src="/logo/GENIUS-THUNDERBOLD-BIG.png"
          alt="Logo"
          className="h-96 w-96 object-contain"
        />
      </div>

      <div className="flex w-1/2 items-center justify-center bg-gray-100">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md space-y-6 p-8"
        >
          <h1 className="text-5xl font-bold text-center">
            Bienvenue
          </h1>

          {error && (
            <p className="rounded bg-red-100 px-4 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="space-y-1">
            <label htmlFor="email" className="block text-sm font-medium">
              Adresse e-mail
            </label>
            <input
              id="email"
              type="email"
              required
              className="w-full rounded border border-indigo-400 bg-indigo-50 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-300"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="block text-sm font-medium">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              required
              className="w-full rounded border border-indigo-400 bg-indigo-50 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-300"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded bg-border py-2 font-medium text-indigo-600 transition hover:bg-gray-100 disabled:opacity-50"
            >
              {loading ? 'Connexion…' : 'Se connecter'}
            </button>
            <button
              type="button"
              onClick={handleGoogleLogin} 
              className="flex w-full color-border items-center justify-center rounded border bg-transparent py-2 font-medium  transition hover:bg-white/20"
            >
              <img src="logo/logo-google.svg" alt="Google" className="mr-2 h-5 w-5" />
              Connexion Google
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
