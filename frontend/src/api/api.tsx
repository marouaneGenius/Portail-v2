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

export const getCurrentUser = async (host:String, jwt:any) => {
  try {
    const res = await fetch(`${host}/api/user/me/current_user`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });   
    const me = await res.json();
    return me;   
  } catch(e:any) {
    console.error('errer ==>',e)
  }
}

export const getCenters = async () => {
  const response = await api.get<any[]>('/api/center');
  return response.data;
}

export const getUser = async (id:string) => {
  const response = await api.get<any[]>(`/api/user/${id}`);
  return response.data;
}