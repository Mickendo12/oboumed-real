
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const useBackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Hook désactivé - Capacitor supprimé  
    console.log('Back button handler disabled - Capacitor removed');
  }, [navigate, location.pathname]);
};
