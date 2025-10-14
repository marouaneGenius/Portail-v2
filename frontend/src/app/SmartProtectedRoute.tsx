import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../Hooks/auth";
import Page404 from "../pages/Page404";

// Routes qui ne correspondent à aucune route définie et doivent afficher la 404
const is404Route = (pathname: string): boolean => {
  // Routes exactes (sans paramètres)
  const exactRoutes = [
    '/home',
    '/dashboard',
    '/profile',
    '/centers',
    '/users',
    '/students',
    '/parents',
    '/planing',
    '/planning',
    '/session-calendar',
    '/tutors',
    '/historique',
    '/parent-dashboard',
    '/trial-sessions',
    '/canceled-subscriptions',
    '/deposits',
  ];

  // Routes avec paramètres spécifiques
  const paramRoutes = [
    /^\/sessions\/\d+$/, // /sessions/:id (ID numérique)
    /^\/abonnements\/\d+$/, // /abonnements/:id
    /^\/form\/[^\/]+\/?\d*$/, // /form/:resource/:id?
    /^\/studentDetails\/\d+$/, // /studentDetails/:id
    /^\/subscriptions\/\d+$/, // /subscriptions/:id
    /^\/contract\/\d+\/\d+(\/combined)?$/, // /contract/:id/:student/:combined?
    /^\/student\/subscriptions\/\d+$/, // /student/subscriptions/:id
    /^\/genius-contract\/\d+$/, // /genius-contract/:id
  ];

  // Routes génériques valides (resources connus seulement)
  const validResources = ['centers', 'center', 'users', 'user', 'students', 'student', 'parents', 'parent', 'sessions', 'tutors'];
  const genericRoutes = [
    new RegExp(`^\\/(${validResources.join('|')})\\/\\d+$`), // /:resource/:id (ID numérique)
    new RegExp(`^\\/(${validResources.join('|')})\\/\\d+\\/edit$`), // /:resource/:id/edit
  ];

  // Vérifier les routes exactes
  if (exactRoutes.includes(pathname)) {
    return false;
  }

  // Vérifier les routes avec paramètres
  if (paramRoutes.some(pattern => pattern.test(pathname))) {
    return false;
  }

  // Vérifier les routes génériques valides
  if (genericRoutes.some(pattern => pattern.test(pathname))) {
    return false;
  }

  // Si aucune correspondance, c'est une 404
  return true;
};

export default function SmartProtectedRoute() {
  const { user } = useAuth();
  const location = useLocation();

  // Si c'est une route qui doit afficher 404, l'afficher directement
  if (is404Route(location.pathname)) {
    return <Page404 />;
  }

  // Sinon, appliquer la protection normale
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}