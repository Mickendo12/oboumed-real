
import { useEffect } from 'react';

interface UseMobileNavigationProps {
  onBackPress?: () => void;
  canGoBack: boolean;
}

export const useMobileNavigation = ({ onBackPress, canGoBack }: UseMobileNavigationProps) => {
  useEffect(() => {
    // Hook désactivé - Capacitor supprimé
    console.log('Mobile navigation disabled - Capacitor removed');
  }, [onBackPress, canGoBack]);
};
