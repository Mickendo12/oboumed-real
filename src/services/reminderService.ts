
import { supabase } from '@/integrations/supabase/client';
import { ReminderDB, ReminderInput } from '@/types/reminder';

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

// Fonctions de conversion pour compatibilité avec les composants UI
export const convertDBReminderToForm = (reminder: ReminderDB): import('@/types/reminder').ReminderForm => {
  return {
    id: reminder.id,
    title: `${reminder.medication_name} - ${reminder.dosage}`,
    medicationName: reminder.medication_name,
    time: reminder.time,
    days: reminder.frequency === 'daily' ? ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] : ['monday', 'wednesday', 'friday'],
    notes: ''
  };
};

export const convertFormReminderToDB = (reminder: Omit<import('@/types/reminder').ReminderForm, 'id' | 'title'>, userId: string): ReminderInput => {
  return {
    user_id: userId,
    medication_name: reminder.medicationName,
    time: reminder.time,
    dosage: '1 comprimé', // Valeur par défaut
    frequency: reminder.days.length === 7 ? 'daily' : 'every_other_day'
  };
};
