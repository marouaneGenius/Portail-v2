import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Composant pour gérer les routes 404 dans les sections protégées
const NotFoundHandler: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Rediriger vers la page 404 publique
    navigate('/404', { replace: true });
  }, [navigate, location]);

  return null;
};

export default NotFoundHandler;