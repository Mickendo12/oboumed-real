
import { useEffect } from 'react';
import { initializeNotifications } from '@/services/notificationService';
import { useToast } from '@/components/ui/use-toast';

export const useNotificationInit = () => {
  const { toast } = useToast();

  useEffect(() => {
    const initNotifications = async () => {
      try {
        const success = await initializeNotifications();
        if (success) {
          console.log('Notifications initialized successfully');
        } else {
          console.log('Notifications not available on this platform');
        }
      } catch (error) {
        console.error('Error initializing notifications:', error);
        toast({
          variant: "destructive",
          title: "Erreur notifications",
          description: "Impossible d'initialiser les notifications."
        });
      }
    };

    initNotifications();
  }, [toast]);
};
