
import { Capacitor } from '@capacitor/core';

// Variables pour les plugins Capacitor
let LocalNotifications: any = null;
let PushNotifications: any = null;

// Fonction pour initialiser les plugins de façon asynchrone
const initializeCapacitorPlugins = async () => {
  if (!Capacitor.isNativePlatform()) {
    return false;
  }

  try {
    // Import dynamique conditionnel
    const localNotificationsModule = await import('@capacitor/local-notifications');
    LocalNotifications = localNotificationsModule.LocalNotifications;

    const pushNotificationsModule = await import('@capacitor/push-notifications');
    PushNotifications = pushNotificationsModule.PushNotifications;

    return true;
  } catch (error) {
    console.warn('Capacitor notification plugins not available:', error);
    return false;
  }
};

export const initializeNotifications = async (): Promise<boolean> => {
  if (!Capacitor.isNativePlatform()) {
    console.log('Notifications not supported on this platform');
    return false;
  }

  // Initialiser les plugins d'abord
  const pluginsLoaded = await initializeCapacitorPlugins();
  if (!pluginsLoaded || !LocalNotifications || !PushNotifications) {
    console.log('Could not load notification plugins');
    return false;
  }

  try {
    // Demander les permissions pour les notifications locales
    const localPermission = await LocalNotifications.requestPermissions();
    if (localPermission.display !== 'granted') {
      console.log('Local notification permission denied');
      return false;
    }

    // Demander les permissions pour les notifications push
    const pushPermission = await PushNotifications.requestPermissions();
    if (pushPermission.receive !== 'granted') {
      console.log('Push notification permission denied');
    }

    // Configurer les listeners pour les notifications push
    PushNotifications.addListener('registration', (token: any) => {
      console.log('Push registration success, token: ' + token.value);
    });

    PushNotifications.addListener('registrationError', (error: any) => {
      console.error('Push registration error: ', error);
    });

    PushNotifications.addListener('pushNotificationReceived', (notification: any) => {
      console.log('Push notification received: ', notification);
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (notification: any) => {
      console.log('Push notification action performed: ', notification);
    });

    // S'enregistrer pour les notifications push
    await PushNotifications.register();

    return true;
  } catch (error) {
    console.error('Error initializing notifications:', error);
    return false;
  }
};

export const scheduleReminderNotification = async (reminder: {
  id: string;
  title: string;
  body: string;
  schedule: any;
}): Promise<boolean> => {
  if (!Capacitor.isNativePlatform()) {
    console.log('Scheduling notifications not supported on this platform');
    // Pour le web, on peut utiliser les notifications du navigateur
    return scheduleWebNotification(reminder);
  }

  // Initialiser les plugins si pas encore fait
  if (!LocalNotifications) {
    const pluginsLoaded = await initializeCapacitorPlugins();
    if (!pluginsLoaded || !LocalNotifications) {
      console.log('Could not load local notifications plugin');
      return scheduleWebNotification(reminder);
    }
  }

  try {
    await LocalNotifications.schedule({
      notifications: [
        {
          id: parseInt(reminder.id.replace(/\D/g, '').slice(0, 9)) || Math.floor(Math.random() * 1000000),
          title: reminder.title,
          body: reminder.body,
          schedule: reminder.schedule,
          actionTypeId: 'MEDICATION_REMINDER',
          extra: {
            type: 'medication_reminder',
            reminder_id: reminder.id
          }
        }
      ]
    });

    console.log(`Notification scheduled for reminder ${reminder.id}`);
    return true;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return false;
  }
};

const scheduleWebNotification = async (reminder: {
  id: string;
  title: string;
  body: string;
  schedule: any;
}): Promise<boolean> => {
  try {
    // Vérifier les permissions du navigateur
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        // Pour le web, on programme avec setTimeout (simplification)
        const now = new Date();
        const scheduleTime = new Date(reminder.schedule.at || now.getTime() + 60000); // 1 minute par défaut
        const delay = scheduleTime.getTime() - now.getTime();

        if (delay > 0) {
          setTimeout(() => {
            new Notification(reminder.title, {
              body: reminder.body,
              icon: '/favicon.ico',
              tag: reminder.id
            });
          }, delay);
          return true;
        }
      }
    }
    return false;
  } catch (error) {
    console.error('Error scheduling web notification:', error);
    return false;
  }
};

export const cancelReminderNotification = async (notificationId: string): Promise<boolean> => {
  if (!Capacitor.isNativePlatform()) {
    console.log('Cancelling notifications not supported on this platform');
    return false;
  }

  // Initialiser les plugins si pas encore fait
  if (!LocalNotifications) {
    const pluginsLoaded = await initializeCapacitorPlugins();
    if (!pluginsLoaded || !LocalNotifications) {
      console.log('Could not load local notifications plugin');
      return false;
    }
  }

  try {
    const numericId = parseInt(notificationId.replace(/\D/g, '').slice(0, 9)) || Math.floor(Math.random() * 1000000);
    
    await LocalNotifications.cancel({
      notifications: [
        {
          id: numericId
        }
      ]
    });

    console.log(`Notification ${notificationId} cancelled`);
    return true;
  } catch (error) {
    console.error('Error cancelling notification:', error);
    return false;
  }
};

export const getPendingNotifications = async (): Promise<any[]> => {
  if (!Capacitor.isNativePlatform()) {
    return [];
  }

  // Initialiser les plugins si pas encore fait
  if (!LocalNotifications) {
    const pluginsLoaded = await initializeCapacitorPlugins();
    if (!pluginsLoaded || !LocalNotifications) {
      return [];
    }
  }

  try {
    const pending = await LocalNotifications.getPending();
    return pending.notifications;
  } catch (error) {
    console.error('Error getting pending notifications:', error);
    return [];
  }
};

// Fonction pour créer une notification de rappel basée sur un rappel de médicament
export const createMedicationReminder = (reminder: {
  id: string;
  medicationName: string;
  time: string;
  days: string[];
}) => {
  const now = new Date();
  const [hours, minutes] = reminder.time.split(':').map(Number);
  
  // Créer les notifications pour chaque jour
  const notifications = reminder.days.map(day => {
    const dayIndex = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'].indexOf(day.toLowerCase());
    if (dayIndex === -1) return null;

    const scheduleDate = new Date();
    scheduleDate.setHours(hours, minutes, 0, 0);
    
    // Trouver le prochain jour correspondant
    const currentDay = scheduleDate.getDay();
    const daysUntil = (dayIndex - currentDay + 7) % 7;
    if (daysUntil === 0 && scheduleDate <= now) {
      scheduleDate.setDate(scheduleDate.getDate() + 7);
    } else {
      scheduleDate.setDate(scheduleDate.getDate() + daysUntil);
    }

    return {
      id: `${reminder.id}_${dayIndex}`,
      title: `Rappel médicament`,
      body: `Il est temps de prendre votre ${reminder.medicationName}`,
      schedule: {
        at: scheduleDate,
        every: 'week'
      }
    };
  }).filter(Boolean);

  return notifications;
};
