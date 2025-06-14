
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
