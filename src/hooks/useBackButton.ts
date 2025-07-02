
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

    let backPressCount = 0;
    let backPressTimer: NodeJS.Timeout | null = null;

    const handleBackButton = () => {
      // Si on n'est pas sur la page d'accueil, navigation normale
      if (location.pathname !== '/') {
        navigate(-1);
        return;
      }

      // Si on est sur la page d'accueil, double-tap pour quitter
      backPressCount++;
      
      if (backPressCount === 1) {
        // Premier appui - afficher un message et démarrer le timer
        console.log('Appuyez encore une fois pour quitter');
        
        // Réinitialiser le compteur après 2 secondes
        backPressTimer = setTimeout(() => {
          backPressCount = 0;
        }, 2000);
      } else if (backPressCount === 2) {
        // Deuxième appui - quitter l'app
        if (backPressTimer) {
          clearTimeout(backPressTimer);
        }
        App.exitApp();
      }
    };

    // Écouter l'événement du bouton retour
    let listenerHandle: any = null;
    
    App.addListener('backButton', handleBackButton).then((handle) => {
      listenerHandle = handle;
    });

    return () => {
      if (listenerHandle) {
        listenerHandle.remove();
      }
      if (backPressTimer) {
        clearTimeout(backPressTimer);
      }
    };
  }, [navigate, location.pathname]);
};
