import { useAuth, User } from '../Hooks/auth';
import api from './aixos';


interface LoginResponse {
  token: string;
  user: User;
}

/**
 * Appelle POST /login, stocke user & token dans Zustand, et renvoie l'user.
 */
export async function login(email: string, password: string): Promise<User> {
  const { data } = await api.post<LoginResponse>('/login', { email, password });
  // Stocke dans le store (persisté en localStorage)
  useAuth.getState().setUser(data.user, data.token);
  return data.user;
}
