import { Navigate } from "react-router-dom";
import { useAuth } from "../Hooks/auth";

/**
 * Composant pour gérer la route racine "/" 
 * 
 * Redirige toujours vers /dashboard, mais comme c'est protégé,
 * les utilisateurs non connectés seront automatiquement redirigés vers /login
 */
const DefaultRedirect: React.FC = () => {
  return <Navigate to="/dashboard" replace />;
};

export default DefaultRedirect;