// src/pages/Login.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../api/api';
import { useAuth } from '../../Hooks/auth';

const Login: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
              className="w-full rounded bg-white py-2 font-medium text-indigo-600 transition hover:bg-gray-100 disabled:opacity-50"
            >
              {loading ? 'Connexion…' : 'Se connecter'}
            </button>
            <button
              type="button"
              onClick={() => {/* Google OAuth… */}}
              className="flex w-full items-center justify-center rounded border border-white bg-transparent py-2 font-medium  transition hover:bg-white/20"
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