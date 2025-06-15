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
  weight_kg?: number;
  height_cm?: number;
  role: 'user' | 'doctor' | 'admin';
  share_with_doctor: boolean;
  access_status: 'active' | 'restricted' | 'expired';
  doctor_access_key?: string;
  created_at: string;
  updated_at: string;
}

export interface ProfileWithBMI extends Profile {
  bmi?: number;
  bmi_category?: string;
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
  access_key: string;
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
  // Relations pour les noms d'affichage
  patient?: { name?: string; email?: string };
  doctor?: { name?: string; email?: string };
  admin?: { name?: string; email?: string };
}

// Profile functions
export const getUserProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  if (!data) return null;

  return {
    ...data,
    role: (data.role ?? 'user') as 'admin' | 'doctor' | 'user',
    access_status: (data.access_status ?? 'active') as 'active' | 'restricted' | 'expired',
  };
};

export const getUserProfileWithBMI = async (userId: string): Promise<ProfileWithBMI | null> => {
  const { data, error } = await supabase
    .from('profiles_with_bmi')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching user profile with BMI:', error);
    return null;
  }

  if (!data) return null;

  return {
    ...data,
    role: (data.role ?? 'user') as 'admin' | 'doctor' | 'user',
    access_status: (data.access_status ?? 'active') as 'active' | 'restricted' | 'expired',
  };
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
  console.log('Fetching all profiles...');
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching profiles:', error);
    throw error;
  }

  console.log('Profiles fetched successfully:', data?.length || 0, 'profiles');
  return (data || []).map(p => ({
    ...p,
    role: (p.role ?? 'user') as 'admin' | 'doctor' | 'user',
    access_status: (p.access_status ?? 'active') as 'active' | 'restricted' | 'expired',
  }));
};

// Medication functions with proper RLS handling
export const getMedicationsForUser = async (userId: string): Promise<Medication[]> => {
  const { data, error } = await supabase
    .from('medications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching medications:', error);
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
    console.error('Error adding medication:', error);
    throw error;
  }

  return data;
};

// Reminder functions with proper RLS handling
export const getRemindersForUser = async (userId: string): Promise<ReminderDB[]> => {
  const { data, error } = await supabase
    .from('reminders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching reminders:', error);
    throw error;
  }

  // Ajout champ 'frequency' manquant en le reconstituant depuis days_of_week
  return (data || []).map((reminder: any) => ({
    ...reminder,
    frequency:
      Array.isArray(reminder.days_of_week) && reminder.days_of_week.length === 7
        ? 'Tous les jours'
        : Array.isArray(reminder.days_of_week)
        ? reminder.days_of_week.join(',')
        : '',
  }));
};

export const addReminder = async (reminder: ReminderInput): Promise<ReminderDB> => {
  const { data, error } = await supabase
    .from('reminders')
    .insert(reminder)
    .select()
    .single();

  if (error) {
    console.error('Error adding reminder:', error);
    throw error;
  }

  return {
    ...data,
    frequency:
      Array.isArray(data.days_of_week) && data.days_of_week.length === 7
        ? 'Tous les jours'
        : Array.isArray(data.days_of_week)
        ? data.days_of_week.join(',')
        : '',
  };
};

export const deleteReminder = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('reminders')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting reminder:', error);
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
    .maybeSingle();

  // Si un QR code actif existe déjà, le retourner
  if (existingQRCode) {
    return {
      ...existingQRCode,
      status: (existingQRCode.status ?? 'active') as 'active' | 'expired' | 'used',
    };
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
    console.error('Error generating QR code text:', funcError);
    throw funcError;
  }
  
  const { data, error } = await supabase
    .from('qr_codes')
    .insert({
      user_id: userId,
      qr_code: qrCodeText,
      access_key: qrCodeText, // Utiliser le même code pour l'access_key
      status: 'active',
      expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 an
    })
    .select()
    .single();
    
  if (error) {
    console.error('Error creating QR code record:', error);
    throw error;
  }
  
  return {
    ...data,
    status: (data.status ?? 'active') as 'active' | 'expired' | 'used',
  };
};

export const getQRCodesForUser = async (userId: string): Promise<QRCode[]> => {
  const { data, error } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching QR codes:', error);
    throw error;
  }

  return (data || []).map((q: any) => ({
    ...q,
    status: (q.status ?? 'active') as 'active' | 'expired' | 'used',
  }));
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

// Nouvelle fonction pour valider une clé d'accès
export const validateAccessKey = async (accessKey: string): Promise<{ valid: boolean; userId?: string }> => {
  console.log('Validating access key:', accessKey);
  
  const { data, error } = await supabase
    .from('qr_codes')
    .select('user_id, status, expires_at')
    .eq('access_key', accessKey)
    .eq('status', 'active')
    .maybeSingle();
    
  if (error) {
    console.error('Error validating access key:', error);
    return { valid: false };
  }
  
  if (!data) {
    console.log('Access key not found or inactive');
    return { valid: false };
  }
  
  const isExpired = new Date(data.expires_at) < new Date();
  if (isExpired) {
    console.log('Access key expired');
    return { valid: false };
  }
  
  console.log('Access key valid for user:', data.user_id);
  return { valid: true, userId: data.user_id };
};

// Doctor access session functions
export const createDoctorSession = async (patientId: string, doctorId: string, qrCodeId?: string): Promise<DoctorAccessSession> => {
  console.log('Creating doctor session:', { patientId, doctorId, qrCodeId });
  
  // Vérifier que l'utilisateur est bien un médecin
  const { data: doctorProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', doctorId)
    .single();
    
  if (!doctorProfile || doctorProfile.role !== 'doctor') {
    throw new Error('Seuls les médecins peuvent créer des sessions d\'accès');
  }
  
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
  
  // Logger l'accès
  await logAccess({
    patient_id: patientId,
    doctor_id: doctorId,
    action: 'session_created',
    details: { session_id: data.id, qr_code_id: qrCodeId }
  });
  
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
  console.log('Fetching access logs...');
  
  // Récupérer d'abord les logs
  const { data: logs, error: logsError } = await supabase
    .from('access_logs')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (logsError) {
    console.error('Error fetching access logs:', logsError);
    throw logsError;
  }

  if (!logs || logs.length === 0) {
    console.log('No access logs found');
    return [];
  }

  // Récupérer les profils pour les relations
  const userIds = [...new Set([
    ...logs.map(log => log.patient_id).filter(Boolean),
    ...logs.map(log => log.doctor_id).filter(Boolean),
    ...logs.map(log => log.admin_id).filter(Boolean)
  ])];

  const { data: profiles } = await supabase
    .from('profiles')
    .select('user_id, name, email')
    .in('user_id', userIds);

  const profilesMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

  // Enrichir les logs avec les données des profils
  const enrichedLogs = logs.map(log => ({
    ...log,
    patient: profilesMap.get(log.patient_id),
    doctor: log.doctor_id ? profilesMap.get(log.doctor_id) : undefined,
    admin: log.admin_id ? profilesMap.get(log.admin_id) : undefined,
    ip_address: log.ip_address ? String(log.ip_address) : undefined
  }));

  console.log('Access logs fetched successfully:', enrichedLogs.length, 'logs');
  return enrichedLogs as AccessLog[];
};

// Admin functions
export const updateUserRole = async (userId: string, role: 'user' | 'doctor' | 'admin'): Promise<void> => {
  const { error } = await supabase
    .from('profiles')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('user_id', userId);
    
  if (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

export const updateUserAccessStatus = async (userId: string, status: 'active' | 'restricted' | 'expired'): Promise<void> => {
  const { error } = await supabase
    .from('profiles')
    .update({ access_status: status, updated_at: new Date().toISOString() })
    .eq('user_id', userId);
    
  if (error) {
    console.error('Error updating access status:', error);
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
    console.error('Error generating doctor access key:', error);
    throw error;
  }
  
  return accessKey;
};

// Fonction utilitaire pour nettoyer les données expirées - utilise la fonction existante
export const cleanupExpiredData = async (): Promise<void> => {
  try {
    const { error } = await supabase.rpc('cleanup_expired_sessions');
    if (error) {
      console.error('Error cleaning up expired data:', error);
    }
  } catch (error) {
    console.error('Error calling cleanup function:', error);
  }
};
