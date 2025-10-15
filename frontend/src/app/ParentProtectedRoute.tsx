import { Navigate, Outlet, useLocation } from "react-router-dom";
import { usePermissions } from "../Hooks/usePermissions";

export default function ParentProtectedRoute() {
  const { isParent, isTutor } = usePermissions();
  const location = useLocation();

  // Routes autorisées pour les parents
  const allowedParentRoutes = ['/parent-dashboard', '/profile'];

  // Routes autorisées pour les tuteurs
  const allowedTutorRoutes = ['/planning', '/profile'];

  if (isParent()) {
    // Si c'est un parent, vérifier qu'il accède uniquement aux routes autorisées
    if (!allowedParentRoutes.includes(location.pathname)) {
      return <Navigate to="/parent-dashboard" replace />;
    }
  }

  if (isTutor()) {
    // Si c'est un tuteur, vérifier qu'il accède uniquement aux routes autorisées
    if (!allowedTutorRoutes.includes(location.pathname)) {
      return <Navigate to="/planning" replace />;
    }
  }

  return <Outlet />;
}