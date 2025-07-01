
import { useEffect } from 'react';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

interface UseMobileNavigationProps {
  onBackPress?: () => void;
  canGoBack: boolean;
}

export const useMobileNavigation = ({ onBackPress, canGoBack }: UseMobileNavigationProps) => {
  useEffect(() => {
    // Ne fonctionne que sur les plateformes natives (mobile)
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    const handleBackButton = () => {
      if (canGoBack && onBackPress) {
        onBackPress();
      } else {
        // Si on ne peut pas revenir en arrière dans le composant, 
        // on laisse le comportement par défaut (géré par useBackButton dans App)
        App.exitApp();
      }
    };

    // Écouter l'événement du bouton retour
    const listener = App.addListener('backButton', handleBackButton);

    return () => {
      listener.remove();
    };
  }, [onBackPress, canGoBack]);
};
