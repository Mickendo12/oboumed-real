
import { supabase } from '@/integrations/supabase/client';
import { ReminderDB, ReminderInput } from '@/types/reminder';

// Types pour la conversion
export interface ReminderForm {
  id: string;
  title: string;
  medicationName: string;
  time: string;
  dosage: string;
  frequency: string;
}

export const getRemindersForUser = async (userId: string): Promise<ReminderDB[]> => {
  const { data, error } = await supabase
    .from('reminders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  if (error) {
    throw error;
  }
  
  return data || [];
};

export const addReminder = async (reminder: ReminderInput): Promise<ReminderDB> => {
  const { data, error } = await supabase
    .from('reminders')
    .insert(reminder)
    .select()
    .single();
    
  if (error) {
    throw error;
  }
  
  return data;
};

export const deleteReminder = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('reminders')
    .delete()
    .eq('id', id);
    
  if (error) {
    throw error;
  }
};

// Fonctions de conversion pour compatibilité
export const convertDBReminderToForm = (reminder: ReminderDB): ReminderForm => {
  return {
    id: reminder.id,
    title: `${reminder.medication_name} - ${reminder.dosage}`,
    medicationName: reminder.medication_name,
    time: reminder.time,
    dosage: reminder.dosage,
    frequency: reminder.frequency
  };
};

export const convertFormReminderToDB = (reminder: Omit<ReminderForm, 'id' | 'title'>, userId: string): ReminderInput => {
  return {
    user_id: userId,
    medication_name: reminder.medicationName,
    time: reminder.time,
    dosage: reminder.dosage,
    frequency: reminder.frequency
  };
};
