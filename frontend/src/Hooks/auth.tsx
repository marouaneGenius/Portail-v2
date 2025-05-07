import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: number;
  email: string;
  firstname?: string;
  lastname?: string;
  roles?: string[];
}

interface AuthState {
  user: User | null;
  accessToken: string | null;

  // setters
  setUser: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  // ➜ persist = sauvegarde dans localStorage pour recharger au hard‑refresh
  persist(
    (set) => ({
      user: null,
      accessToken: null,

      setUser: (user, token) => set({ user, accessToken: token }),

      logout: () => {
        // Ici tu peux aussi appeler ton endpoint Symfony /logout
        set({ user: null, accessToken: null });
        localStorage.removeItem('access_token'); // si tu l'avais stocké ailleurs
      },
    }),
    {
      name: 'auth-storage', // clé localStorage
      partialize: ({ user, accessToken }) => ({ user, accessToken }),
    },
  ),
);

// 2️⃣  Helper facultatif : header Authorization prêt à l'emploi
export const authHeader = () => {
  const token = useAuth.getState().accessToken;
  return token ? { Authorization: `Bearer ${token}` } : {};
};