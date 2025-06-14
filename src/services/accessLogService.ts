
import { supabase } from '@/integrations/supabase/client';

export interface AccessLog {
  id: string;
  patient_id: string;
  doctor_id?: string;
  admin_id?: string;
  action: string;
  details?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export const logAccess = async (log: Omit<AccessLog, 'id' | 'created_at'>): Promise<void> => {
  const { error } = await supabase
    .from('access_logs')
    .insert(log);
    
  if (error) {
    console.error('Error logging access:', error);
  }
};

export const getAccessLogs = async (): Promise<AccessLog[]> => {
  const { data, error } = await supabase
    .from('access_logs')
    .select(`
      *,
      patient:profiles!access_logs_patient_id_fkey(name, email),
      doctor:profiles!access_logs_doctor_id_fkey(name, email)
    `)
    .order('created_at', { ascending: false });
    
  if (error) {
    throw error;
  }
  
  return (data || []).map(log => ({
    ...log,
    ip_address: log.ip_address ? String(log.ip_address) : undefined
  })) as AccessLog[];
};
