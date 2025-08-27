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

  const handleGoogleLogin = () => {
    const popup = window.open(
      `${API_URL}/connect/google`,
      'google-auth',
      'width=500,height=650'
    );
    if (!popup) return; 
  
    const receive = async (e: MessageEvent) => {
      // Vérifier que le message vient de la popup Google
      if (e.source !== popup) return;
      
      if (e.data?.token) {
        try {
          popup.close();
        } catch (error) {
          // La popup peut déjà être fermée par le backend
        }
        localStorage.setItem('jwt', e.data.token);
        const me :any = await getCurrentUser(API_URL, e.data.token)

        if(me) {
          useAuth.getState().setUser(me, e.data.token);
          
          // Rediriger selon le rôle de l'utilisateur
          if (me.roles?.includes('ROLE_TUTOR')) {
            navigate('/planning');
          } else if (me.roles?.includes('ROLE_PARENT')) { 
            navigate('/parent-dashboard');
          } else if (me.roles?.includes('ROLE_ADMIN') || me.roles?.includes('ROLE_USER')) {
            navigate('/dashboard');
          } else {
            navigate('/dashboard'); // fallback
          }
        } else {
          console.error('ERROR => Un problème est survenu lors de la recuperatin du compte')
        }
        window.removeEventListener('message', receive);
      } else if (e.data?.error) {
        try {
          popup.close();
        } catch (error) {
          // La popup peut déjà être fermée par le backend
        }
        setError(e.data.error);
        window.removeEventListener('message', receive);
      }
    };
    
    window.addEventListener('message', receive);
    
    // Vérifier si la popup est fermée manuellement
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        window.removeEventListener('message', receive);
      }
    }, 1000);
  };

  // const handleGoogleLogin = () => {
  //   console.log('=== DEBUT GOOGLE LOGIN ===');
  //   console.log('API_URL:', API_URL);
    
  //   const popup = window.open(
  //     `${API_URL}/connect/google`,
  //     'google-auth',
  //     'width=500,height=650'
  //   );
    
  //   if (!popup) {
  //     console.error('POPUP BLOQUÉE');
  //     setError('Popup bloquée par le navigateur');
  //     return;
  //   }
    
  //   console.log('Popup ouverte, attente du message...');
    
  //   const receive = async (e: MessageEvent) => {
  //     console.log('=== MESSAGE REÇU ===', e.data);
  //     console.log('Source:', e.source === popup ? 'POPUP' : 'AUTRE');
      
  //     if (e.source !== popup) return;
      
  //     if (e.data?.token) {
  //       console.log('TOKEN REÇU:', e.data.token.substring(0, 20) + '...');
  //       // ... reste du code
  //     } else if (e.data?.error) {
  //       console.error('ERREUR REÇUE:', e.data.error);
  //       setError(e.data.error);
  //     }
  //   };
    
  //   window.addEventListener('message', receive);
  // };
  
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
