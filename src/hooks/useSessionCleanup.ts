import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Hook pour nettoyer les sessions expirées régulièrement
export const useSessionCleanup = () => {
  useEffect(() => {
    const cleanupExpiredSessions = async () => {
      try {
        console.log('🧹 Nettoyage des sessions expirées...');
        
        // Nettoyer les sessions de médecins expirées
        const { error: doctorSessionError } = await supabase
          .from('doctor_access_sessions')
          .update({ is_active: false })
          .eq('is_active', true)
          .lt('expires_at', new Date().toISOString());

        if (doctorSessionError) {
          console.error('Erreur nettoyage sessions médecins:', doctorSessionError);
        }

        // Nettoyer les QR codes expirés
        const { error: qrCodeError } = await supabase
          .from('qr_codes')
          .update({ status: 'expired' })
          .eq('status', 'active')
          .lt('expires_at', new Date().toISOString());

        if (qrCodeError) {
          console.error('Erreur nettoyage QR codes:', qrCodeError);
        }

        console.log('✅ Nettoyage des sessions terminé');
      } catch (error) {
        console.error('Erreur lors du nettoyage des sessions:', error);
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