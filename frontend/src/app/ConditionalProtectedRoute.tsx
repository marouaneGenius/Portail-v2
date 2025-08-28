import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../Hooks/auth";

// Routes qui ne nécessitent pas d'authentification
const PUBLIC_ROUTES = ['/login', '/payment/success', '/payment/cancel', '/404'];

export default function ConditionalProtectedRoute() {
  const { user } = useAuth();
  const location = useLocation();
  
  // Si la route est publique, laisser passer
  const isPublicRoute = PUBLIC_ROUTES.includes(location.pathname);
  
  if (isPublicRoute) {
    return <Outlet />;
  }
  
  // Pour les routes protégées, vérifier l'authentification
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}