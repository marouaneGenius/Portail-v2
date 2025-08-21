import { Navigate, Outlet, useLocation } from "react-router-dom";
import { usePermissions } from "../Hooks/usePermissions";

export default function ParentProtectedRoute() {
  const { isParent } = usePermissions();
  const location = useLocation();
  
  // Routes autorisées pour les parents
  const allowedParentRoutes = ['/parent-dashboard', '/profile'];
  
  if (isParent()) {
    // Si c'est un parent, vérifier qu'il accède uniquement aux routes autorisées
    if (!allowedParentRoutes.includes(location.pathname)) {
      return <Navigate to="/parent-dashboard" replace />;
    }
  }
  
  return <Outlet />;
}