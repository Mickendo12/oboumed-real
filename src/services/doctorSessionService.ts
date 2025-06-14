
import { supabase } from '@/integrations/supabase/client';

export interface DoctorAccessSession {
  id: string;
  patient_id: string;
  doctor_id: string;
  qr_code_id?: string;
  access_granted_at: string;
  expires_at: string;
  is_active: boolean;
  created_at: string;
}

export const createDoctorSession = async (patientId: string, doctorId: string, qrCodeId?: string): Promise<DoctorAccessSession> => {
  console.log('Creating doctor session:', { patientId, doctorId, qrCodeId });
  
  // Créer directement la session - les politiques RLS permettront l'accès pour les médecins
  const sessionData = {
    patient_id: patientId,
    doctor_id: doctorId,
    qr_code_id: qrCodeId || null,
    access_granted_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
    is_active: true
  };

  const { data, error } = await supabase
    .from('doctor_access_sessions')
    .insert(sessionData)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating doctor session:', error);
    throw error;
  }
  
  console.log('Doctor session created successfully:', data);
  return data;
};

export const getActiveDoctorSessions = async (doctorId: string): Promise<DoctorAccessSession[]> => {
  const { data, error } = await supabase
    .from('doctor_access_sessions')
    .select('*')
    .eq('doctor_id', doctorId)
    .eq('is_active', true)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching active sessions:', error);
    return [];
  }
  
  return data || [];
};
