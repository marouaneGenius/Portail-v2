// src/api/axios.ts
import axios, { AxiosError } from 'axios';
import { useAuth } from '../Hooks/auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL_DEV, 
  withCredentials: true,                 
});


// → Avant chaque requête : injecte le JWT si présent
api.interceptors.request.use((config) => {
  const token = useAuth.getState().accessToken;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// // → Après une réponse 401 non interceptée : tente un refresh token
let isRefreshing = false;
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !isRefreshing) {
      isRefreshing = true;
      try {
        const { data } = await axios.post(
          '/api/token/refresh',
          {},
          {
            baseURL: import.meta.env.VITE_API_URL,
            withCredentials: true,
          }
        );
        // le back renvoie { token, user }
        useAuth.getState().setUser(data.user, data.token);
        // rejoue la requête initiale
        if (originalRequest?.headers) {
          originalRequest.headers.Authorization = `Bearer ${data.token}`;
        }
        return api.request(originalRequest!);
      } catch {
        useAuth.getState().logout();
        window.location.href = '/login';
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
