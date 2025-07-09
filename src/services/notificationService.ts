
export const initializeNotifications = async (): Promise<boolean> => {
  console.log('Notifications not supported - Capacitor removed');
  return false;
};

export const scheduleReminderNotification = async (reminder: {
  id: string;
  title: string;
  body: string;
  schedule: any;
}): Promise<boolean> => {
  console.log('Scheduling notifications not supported - Capacitor removed');
  return scheduleWebNotification(reminder);
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
  console.log('Cancelling notifications not supported - Capacitor removed');
  return false;
};

export const getPendingNotifications = async (): Promise<any[]> => {
  console.log('Getting pending notifications not supported - Capacitor removed');
  return [];
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
