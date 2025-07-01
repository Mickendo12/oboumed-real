
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

export const useBackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Ne fonctionne que sur les plateformes natives (mobile)
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    const handleBackButton = () => {
      // Si on est sur la page d'accueil, on quitte l'app
      if (location.pathname === '/') {
        App.exitApp();
        return;
      }

      // Sinon, on navigue vers la page précédente
      navigate(-1);
    };

    // Écouter l'événement du bouton retour
    const listener = App.addListener('backButton', handleBackButton);

    return () => {
      listener.remove();
    };
  }, [navigate, location.pathname]);
};
