import { ReminderDB, ReminderForm, ReminderInput } from '@/types/reminder';
import { scheduleReminderNotification, cancelReminderNotification, createMedicationReminder } from './notificationService';

export const convertDBReminderToForm = (dbReminder: ReminderDB): ReminderForm => {
  return {
    id: dbReminder.id,
    title: `Rappel ${dbReminder.medication_name}`,
    medicationName: dbReminder.medication_name,
    time: dbReminder.time,
    days: dbReminder.frequency.split(',').map(day => day.trim()),
    notes: `${dbReminder.dosage} - ${dbReminder.frequency}`
  };
};

export const convertFormReminderToDB = (formReminder: Omit<ReminderForm, 'id'>, userId: string): ReminderInput => {
  // Convert day names to numbers (0 = Sunday, 1 = Monday, etc.)
  const dayNameToNumber: { [key: string]: number } = {
    'sunday': 0,
    'monday': 1,
    'tuesday': 2,
    'wednesday': 3,
    'thursday': 4,
    'friday': 5,
    'saturday': 6,
    'dimanche': 0,
    'lundi': 1,
    'mardi': 2,
    'mercredi': 3,
    'jeudi': 4,
    'vendredi': 5,
    'samedi': 6
  };

  const days_of_week = formReminder.days.map(day => 
    dayNameToNumber[day.toLowerCase()] ?? parseInt(day)
  ).filter(day => !isNaN(day));

  return {
    user_id: userId,
    medication_name: formReminder.medicationName,
    dosage: formReminder.notes.split(' - ')[0] || 'Dosage non spécifié',
    frequency: formReminder.days.join(', '),
    time: formReminder.time,
    is_active: true,
    days_of_week: days_of_week
  };
};

// Fonction pour programmer les notifications d'un rappel
export const scheduleReminderNotifications = async (reminder: ReminderForm): Promise<boolean> => {
  try {
    const notifications = createMedicationReminder(reminder);
    
    let allScheduled = true;
    for (const notification of notifications) {
      if (notification) {
        const success = await scheduleReminderNotification(notification);
        if (!success) {
          allScheduled = false;
        }
      }
    }
    
    return allScheduled;
  } catch (error) {
    console.error('Error scheduling reminder notifications:', error);
    return false;
  }
};

// Fonction pour annuler les notifications d'un rappel
export const cancelReminderNotifications = async (reminderId: string): Promise<boolean> => {
  try {
    // Annuler toutes les notifications liées à ce rappel
    const dayIndexes = [0, 1, 2, 3, 4, 5, 6]; // Tous les jours de la semaine
    
    let allCancelled = true;
    for (const dayIndex of dayIndexes) {
      const notificationId = `${reminderId}_${dayIndex}`;
      const success = await cancelReminderNotification(notificationId);
      if (!success) {
        allCancelled = false;
      }
    }
    
    return allCancelled;
  } catch (error) {
    console.error('Error cancelling reminder notifications:', error);
    return false;
  }
};
