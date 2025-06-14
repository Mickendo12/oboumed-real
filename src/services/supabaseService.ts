
import { supabase } from '@/integrations/supabase/client';
import { ReminderDB, ReminderInput } from '@/types/reminder';

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

export interface QRCode {
  id: string;
  user_id: string;
  qr_code: string;
  status: 'active' | 'expired' | 'used';
  expires_at: string;
  created_by?: string;
  created_at: string;
}

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

// Profile functions
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

// Medication functions
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

// Reminder functions
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

// QR Code functions
export const generateQRCodeForUser = async (userId: string): Promise<QRCode> => {
  // Vérifier s'il existe déjà un QR code actif pour cet utilisateur
  const { data: existingQRCode } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  // Si un QR code actif existe déjà, le retourner
  if (existingQRCode) {
    return existingQRCode;
  }

  // Marquer tous les anciens QR codes comme expirés
  await supabase
    .from('qr_codes')
    .update({ status: 'expired' })
    .eq('user_id', userId);

  const { data: qrCodeText, error: funcError } = await supabase.rpc('generate_qr_code', {
    patient_user_id: userId
  });
  
  if (funcError) {
    throw funcError;
  }
  
  const { data, error } = await supabase
    .from('qr_codes')
    .insert({
      user_id: userId,
      qr_code: qrCodeText,
      status: 'active',
      expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 an (QR permanent)
    })
    .select()
    .single();
    
  if (error) {
    throw error;
  }
  
  return data;
};

export const getQRCodesForUser = async (userId: string): Promise<QRCode[]> => {
  const { data, error } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  if (error) {
    throw error;
  }
  
  return data || [];
};

export const validateQRCode = async (qrCode: string): Promise<{ valid: boolean; userId?: string }> => {
  console.log('Validating QR code:', qrCode);
  
  const { data, error } = await supabase
    .from('qr_codes')
    .select('user_id, status, expires_at')
    .eq('qr_code', qrCode)
    .eq('status', 'active')
    .maybeSingle();
    
  if (error) {
    console.error('Error validating QR code:', error);
    return { valid: false };
  }
  
  if (!data) {
    console.log('QR code not found or inactive');
    return { valid: false };
  }
  
  const isExpired = new Date(data.expires_at) < new Date();
  if (isExpired) {
    console.log('QR code expired');
    return { valid: false };
  }
  
  console.log('QR code valid for user:', data.user_id);
  return { valid: true, userId: data.user_id };
};

// Doctor access session functions
export const createDoctorSession = async (patientId: string, doctorId: string, qrCodeId?: string): Promise<DoctorAccessSession> => {
  console.log('Creating doctor session:', { patientId, doctorId, qrCodeId });
  
  // Créer directement la session sans utiliser une fonction RPC
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

// Access log functions
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

// Admin functions
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
