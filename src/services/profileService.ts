
import { supabase } from '@/integrations/supabase/client';

export interface Profile {
  id: string;
  user_id: string;
  email: string;
  name?: string;
  phone_number?: string;
  blood_type?: string;
  allergies?: string;
  chronic_diseases?: string;
  current_medications?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  role: 'user' | 'doctor' | 'admin';
  share_with_doctor: boolean;
  access_status: 'active' | 'restricted' | 'expired';
  doctor_access_key?: string;
  created_at: string;
  updated_at: string;
}

export const getUserProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
    
  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
  
  return data;
};

export const updateUserProfile = async (userId: string, updates: Partial<Profile>): Promise<void> => {
  const { error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('user_id', userId);
    
  if (error) {
    throw error;
  }
};

export const getAllProfiles = async (): Promise<Profile[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    throw error;
  }
  
  return data || [];
};

export const updateUserRole = async (userId: string, role: 'user' | 'doctor' | 'admin'): Promise<void> => {
  const { error } = await supabase
    .from('profiles')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('user_id', userId);
    
  if (error) {
    throw error;
  }
};

export const updateUserAccessStatus = async (userId: string, status: 'active' | 'restricted' | 'expired'): Promise<void> => {
  const { error } = await supabase
    .from('profiles')
    .update({ access_status: status, updated_at: new Date().toISOString() })
    .eq('user_id', userId);
    
  if (error) {
    throw error;
  }
};

export const generateDoctorAccessKey = async (userId: string): Promise<string> => {
  const accessKey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  
  const { error } = await supabase
    .from('profiles')
    .update({ 
      doctor_access_key: accessKey,
      role: 'doctor',
      updated_at: new Date().toISOString() 
    })
    .eq('user_id', userId);
    
  if (error) {
    throw error;
  }
  
  return accessKey;
};
