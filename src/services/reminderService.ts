
import { ReminderDB, ReminderForm, ReminderInput } from '@/types/reminder';

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
  return {
    user_id: userId,
    medication_name: formReminder.medicationName,
    dosage: formReminder.notes.split(' - ')[0] || 'Dosage non spécifié',
    frequency: formReminder.days.join(', '),
    time: formReminder.time,
    is_active: true
  };
};
