
import { supabase } from '@/integrations/supabase/client';

export interface Medication {
  id: string;
  user_id: string;
  name: string;
  dosage?: string;
  frequency?: string;
  posology?: string;
  comments?: string;
  treatment_duration?: string;
  start_date?: string;
  end_date?: string;
  doctor_prescribed?: string;
  prescription_id?: string;
  created_at: string;
  updated_at: string;
}

export const getMedicationsForUser = async (userId: string): Promise<Medication[]> => {
  const { data, error } = await supabase
    .from('medications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  if (error) {
    throw error;
  }
  
  return data || [];
};

export const addMedication = async (medication: Omit<Medication, 'id' | 'created_at' | 'updated_at'>): Promise<Medication> => {
  const { data, error } = await supabase
    .from('medications')
    .insert(medication)
    .select()
    .single();
    
  if (error) {
    throw error;
  }
  
  return data;
};
