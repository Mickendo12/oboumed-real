import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Hook pour nettoyer les sessions expirées régulièrement
export const useSessionCleanup = () => {
  useEffect(() => {
    const cleanupExpiredSessions = async () => {
      try {
        // Vérifier si l'utilisateur est authentifié avant le nettoyage
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          return; // Pas d'utilisateur connecté, pas de nettoyage nécessaire
        }

        console.log('🧹 Nettoyage des sessions expirées...');
        
        // Nettoyer les sessions de médecins expirées (seulement si admin/médecin)
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', session.user.id)
          .single();

        if (profile?.role === 'admin' || profile?.role === 'doctor') {
          const { error: doctorSessionError } = await supabase
            .from('doctor_access_sessions')
            .update({ is_active: false })
            .eq('is_active', true)
            .lt('expires_at', new Date().toISOString());

          if (doctorSessionError && doctorSessionError.code !== 'PGRST301') {
            console.error('Erreur nettoyage sessions médecins:', doctorSessionError);
          }

          const { error: qrCodeError } = await supabase
            .from('qr_codes')
            .update({ status: 'expired' })
            .eq('status', 'active')
            .lt('expires_at', new Date().toISOString());

          if (qrCodeError && qrCodeError.code !== 'PGRST301') {
            console.error('Erreur nettoyage QR codes:', qrCodeError);
          }
        }

        console.log('✅ Nettoyage des sessions terminé');
      } catch (error) {
        // Ignorer les erreurs JWT expirées et autres erreurs d'authentification
        if (error?.code !== 'PGRST301') {
          console.error('Erreur lors du nettoyage des sessions:', error);
        }
      }
    };

    // Nettoyer immédiatement au démarrage
    cleanupExpiredSessions();

    // Puis nettoyer toutes les 5 minutes
    const interval = setInterval(cleanupExpiredSessions, 5 * 60 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);
};