
import { LocalNotifications } from '@capacitor/local-notifications';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

export interface ReminderNotification {
  id: number;
  title: string;
  body: string;
  schedule: {
    at: Date;
    repeats?: boolean;
    every?: 'day' | 'week' | 'month';
  };
}

export const initializeNotifications = async (): Promise<boolean> => {
  if (!Capacitor.isNativePlatform()) {
    console.log('Notifications not supported on web platform');
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
    PushNotifications.addListener('registration', (token) => {
      console.log('Push registration success, token: ' + token.value);
    });

    PushNotifications.addListener('registrationError', (error) => {
      console.error('Push registration error: ', error);
    });

    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push notification received: ', notification);
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
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

export const scheduleReminderNotification = async (reminder: ReminderNotification): Promise<boolean> => {
  if (!Capacitor.isNativePlatform()) {
    console.log('Scheduling notifications not supported on web platform');
    return false;
  }

  try {
    await LocalNotifications.schedule({
      notifications: [{
        id: reminder.id,
        title: reminder.title,
        body: reminder.body,
        schedule: reminder.schedule,
        actionTypeId: 'MEDICATION_REMINDER',
        extra: {
          type: 'medication_reminder'
        }
      }]
    });

    console.log(`Notification scheduled for reminder ${reminder.id}`);
    return true;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return false;
  }
};

export const cancelReminderNotification = async (notificationId: number): Promise<boolean> => {
  if (!Capacitor.isNativePlatform()) {
    return false;
  }

  try {
    await LocalNotifications.cancel({
      notifications: [{ id: notificationId }]
    });
    console.log(`Notification ${notificationId} cancelled`);
    return true;
  } catch (error) {
    console.error('Error cancelling notification:', error);
    return false;
  }
};

export const getPendingNotifications = async () => {
  if (!Capacitor.isNativePlatform()) {
    return [];
  }

  try {
    const pending = await LocalNotifications.getPending();
    return pending.notifications;
  } catch (error) {
    console.error('Error getting pending notifications:', error);
    return [];
  }
};
