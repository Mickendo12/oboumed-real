import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UseAutoLogoutOptions {
  timeoutMinutes?: number; // Temps d'inactivité avant déconnexion (défaut: 15 minutes)
  warningMinutes?: number; // Temps avant déconnexion pour afficher l'avertissement (défaut: 2 minutes)
  enabled?: boolean; // Activer/désactiver la déconnexion automatique
}

export const useAutoLogout = (options: UseAutoLogoutOptions = {}) => {
  const {
    timeoutMinutes = 15,
    warningMinutes = 2,
    enabled = true
  } = options;

  const { toast } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningShownRef = useRef(false);

  const clearTimeouts = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
      warningTimeoutRef.current = null;
    }
    warningShownRef.current = false;
  };

  const performLogout = useCallback(async () => {
    try {
      console.log('🔄 Auto-logout: Déconnexion automatique après inactivité');
      
      // Nettoyer toutes les sessions actives
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Log de déconnexion automatique
        try {
          await supabase
            .from('access_logs')
            .insert({
              action: 'auto_logout',
              patient_id: session.user.id,
              details: {
                reason: 'inactivity_timeout',
                timeout_minutes: timeoutMinutes,
                timestamp: new Date().toISOString()
              },
              ip_address: 'auto_logout'
            });
        } catch (logError) {
          console.error('Error logging auto-logout:', logError);
        }
      }

      await supabase.auth.signOut();
      
      toast({
        variant: "destructive",
        title: "Session expirée",
        description: `Vous avez été déconnecté après ${timeoutMinutes} minutes d'inactivité.`
      });
      
    } catch (error) {
      console.error('Auto-logout error:', error);
    }
  }, [timeoutMinutes, toast]);

  const showWarning = useCallback(() => {
    if (!warningShownRef.current) {
      warningShownRef.current = true;
      toast({
        title: "Session bientôt expirée",
        description: `Votre session expirera dans ${warningMinutes} minutes d'inactivité. Bougez la souris ou tapez pour rester connecté.`,
        duration: 10000 // 10 secondes
      });
    }
  }, [warningMinutes, toast]);

  const resetTimeout = useCallback(() => {
    if (!enabled) return;

    clearTimeouts();
    warningShownRef.current = false;

    // Timer pour l'avertissement
    const warningTime = (timeoutMinutes - warningMinutes) * 60 * 1000;
    warningTimeoutRef.current = setTimeout(showWarning, warningTime);

    // Timer pour la déconnexion
    const logoutTime = timeoutMinutes * 60 * 1000;
    timeoutRef.current = setTimeout(performLogout, logoutTime);

  }, [enabled, timeoutMinutes, warningMinutes, showWarning, performLogout]);

  useEffect(() => {
    if (!enabled) {
      clearTimeouts();
      return;
    }

    // Événements à surveiller pour détecter l'activité
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    // Fonction throttlée pour éviter trop d'appels
    let lastResetTime = 0;
    const throttledReset = () => {
      const now = Date.now();
      if (now - lastResetTime > 5000) { // Maximum 1 fois toutes les 5 secondes pour optimiser
        lastResetTime = now;
        resetTimeout();
      }
    };

    // Ajouter les listeners
    events.forEach(event => {
      document.addEventListener(event, throttledReset, true);
    });

    // Démarrer le timer initial
    resetTimeout();

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, throttledReset, true);
      });
      clearTimeouts();
    };
  }, [enabled, resetTimeout]);

  // Nettoyer lors du démontage
  useEffect(() => {
    return () => {
      clearTimeouts();
    };
  }, []);

  return {
    resetTimeout,
    clearTimeouts
  };
};