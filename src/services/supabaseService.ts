import { supabase } from '@/integrations/supabase/client';
import { ReminderDB, ReminderInput } from '@/types/reminder';
import { decodeQRKey } from '@/utils/urlEncryption';
import { securityService } from './securityService';
import { encryptQRCode, decryptQRCode } from '@/utils/encryption';

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

// Profile functions - optimized for faster role loading
export const getUserProfile = async (userId: string): Promise<Profile | null> => {
  // Utiliser select spécifique pour réduire la latence
  const { data, error } = await supabase
    .from('profiles')
    .select('id, user_id, email, name, phone_number, blood_type, allergies, chronic_diseases, current_medications, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship, weight_kg, height_cm, role, share_with_doctor, access_status, doctor_access_key, created_at, updated_at')
    .eq('user_id', userId)
    .single(); // Utiliser single() au lieu de maybeSingle() pour un profil qui doit exister

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

// Fonctions QR Code améliorées
export const generateQRCodeForUser = async (userId: string): Promise<QRCode> => {
  console.log('🔄 Starting QR code generation for user:', userId);
  
  try {
    // Verify user exists first
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('user_id, name, email')
      .eq('user_id', userId)
      .single();

    if (profileError || !userProfile) {
      console.error('❌ User not found:', profileError);
      throw new Error('User not found');
    }

    console.log('✅ User found:', userProfile.name || userProfile.email);

    // Expire all existing active QR codes for this user
    console.log('🔄 Expiring old QR codes...');
    const { error: expireError } = await supabase
      .from('qr_codes')
      .update({ status: 'expired' })
      .eq('user_id', userId)
      .eq('status', 'active');

    if (expireError) {
      console.error('⚠️ Error expiring old codes:', expireError);
    } else {
      console.log('✅ Old QR codes expired');
    }

    // Generate unique code that will be used for BOTH QR code and access key
    const timestamp = Date.now().toString();
    const randomPart = Math.random().toString(36).substring(2, 15);
    const uniqueCode = `${timestamp}-${randomPart}`;
    
    console.log('🔄 Generated unique code:', uniqueCode);
    
    // Create new QR code record - use the same value for both qr_code and access_key
    const qrCodeData = {
      user_id: userId,
      qr_code: uniqueCode, // Stocker la valeur directe
      access_key: uniqueCode, // La même valeur pour la clé d'accès
      status: 'active' as const,
      expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
      created_by: userId
    };

    console.log('🔄 Inserting QR code into database:', qrCodeData);
    
    const { data: newQrCode, error: insertError } = await supabase
      .from('qr_codes')
      .insert(qrCodeData)
      .select()
      .single();
      
    if (insertError) {
      console.error('❌ Error inserting QR code:', insertError);
      throw new Error(`Cannot create QR code: ${insertError.message}`);
    }
    
    console.log('✅ QR code created successfully:', newQrCode);
    
    // Log de création réussie
    await logAccess({
      patient_id: userId,
      admin_id: userId, // Assumant que l'admin génère le code
      action: 'qr_code_generated',
      details: {
        qr_code_id: newQrCode.id,
        timestamp: new Date().toISOString(),
        method: 'admin_dashboard'
      },
      ip_address: 'admin_dashboard'
    });
    
    // Chiffrer la valeur pour l'URL seulement
    const encryptedForUrl = encryptQRCode(uniqueCode);
    
    return {
      ...newQrCode,
      qr_code: encryptedForUrl, // Retourner la version chiffrée pour l'affichage dans l'URL
      status: (newQrCode.status ?? 'active') as 'active' | 'expired' | 'used',
    };
    
  } catch (error) {
    console.error('❌ Complete QR generation error:', error);
    throw error;
  }
};

export const getQRCodesForUser = async (userId: string): Promise<QRCode[]> => {
  console.log('🔄 Fetching QR codes for user:', userId);
  
  const { data, error } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error fetching QR codes:', error);
    throw error;
  }

  console.log('✅ QR codes fetched:', data?.length || 0, 'codes');
  return (data || []).map((q: any) => ({
    ...q,
    status: (q.status ?? 'active') as 'active' | 'expired' | 'used',
  }));
};

export const validateQRCode = async (qrCodeData: string): Promise<{
  valid: boolean;
  userId?: string;
  qrCodeId?: string;
  error?: string;
}> => {
  try {
    console.log('🔄 Validating QR code with unified logic...');
    console.log('🔍 Received QR data:', qrCodeData);
    
    let decryptedCode: string | null = null;
    
    // Essayer de déchiffrer avec le nouveau système d'abord
    try {
      decryptedCode = decryptQRCode(qrCodeData);
      console.log('✅ QR code decrypted with new system:', decryptedCode ? 'success' : 'failed');
    } catch (error) {
      console.log('⚠️ New decryption failed, trying old system...');
    }
    
    // Si le nouveau système échoue, essayer l'ancien
    if (!decryptedCode) {
      try {
        decryptedCode = decodeQRKey(qrCodeData);
        console.log('✅ QR code decrypted with legacy system:', decryptedCode ? 'success' : 'failed');
      } catch (error) {
        console.log('⚠️ Legacy decryption also failed');
      }
    }
    
    // Si les deux systèmes échouent, essayer une validation directe
    if (!decryptedCode) {
      console.log('🔄 Trying direct validation without decryption...');
      decryptedCode = qrCodeData;
    }

    if (!decryptedCode) {
      console.log('❌ All decryption methods failed');
      return { valid: false, error: 'QR code invalide ou corrompu' };
    }

    console.log('🔄 Using decrypted code for validation:', decryptedCode);

    // Chercher par qr_code OU par access_key (puisqu'ils sont maintenant identiques)
    const { data: qrCodeRecord, error: dbError } = await supabase
      .from('qr_codes')
      .select('id, user_id, status, expires_at')
      .or(`qr_code.eq.${decryptedCode},access_key.eq.${decryptedCode}`)
      .eq('status', 'active')
      .maybeSingle(); // Utiliser maybeSingle au lieu de single pour éviter les erreurs

    if (dbError) {
      console.error('❌ Database error:', dbError);
      return { valid: false, error: 'Erreur lors de la validation' };
    }

    if (!qrCodeRecord) {
      console.log('❌ QR code not found in database');
      return { valid: false, error: 'QR code invalide ou expiré' };
    }

    // Check if QR code is expired
    const isExpired = new Date(qrCodeRecord.expires_at) < new Date();
    if (isExpired) {
      console.log('❌ QR code expired');
      // Marquer comme expiré dans la base
      await supabase
        .from('qr_codes')
        .update({ status: 'expired' })
        .eq('id', qrCodeRecord.id);
      
      return { valid: false, error: 'QR code expiré' };
    }

    console.log('✅ QR code validation successful:', {
      userId: qrCodeRecord.user_id,
      qrCodeId: qrCodeRecord.id
    });

    return {
      valid: true,
      userId: qrCodeRecord.user_id,
      qrCodeId: qrCodeRecord.id
    };

  } catch (error: any) {
    console.error('❌ Error validating QR code:', error);
    return { valid: false, error: error.message };
  }
};

export const validateAccessKey = async (accessKey: string): Promise<{ valid: boolean; userId?: string; qrCodeId?: string }> => {
  console.log('🔄 Validating access key:', accessKey);
  
  // Maintenant que qr_code et access_key sont identiques, on peut utiliser la même logique
  return await validateQRCode(accessKey);
};

// Fonctions de session d'accès médecin améliorées
export const createDoctorSession = async (
  patientId: string, 
  doctorId: string, 
  qrCodeId?: string
): Promise<{ id: string; expires_at: string }> => {
  console.log('🔄 Creating doctor session with security service...');
  
  try {
    const sessionId = await securityService.createSession(patientId, doctorId, qrCodeId);
    
    if (!sessionId) {
      throw new Error('Impossible de créer la session sécurisée');
    }

    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    
    console.log('✅ Secure doctor session created:', sessionId);
    
    return {
      id: sessionId,
      expires_at: expiresAt.toISOString()
    };
  } catch (error) {
    console.error('❌ Error creating secure doctor session:', error);
    throw error;
  }
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

// Vérifier si un médecin a accès à un patient
export const hasActiveSession = async (doctorId: string, patientId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('doctor_access_sessions')
    .select('id')
    .eq('doctor_id', doctorId)
    .eq('patient_id', patientId)
    .eq('is_active', true)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();
    
  if (error) {
    console.error('Error checking active session:', error);
    return false;
  }
  
  return !!data;
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

// Nouvelle fonction pour valider les sessions avec sécurité renforcée
export const validateDoctorSession = async (sessionId: string): Promise<boolean> => {
  return await securityService.validateSession(sessionId);
};

// Nouvelle fonction pour révoquer une session
export const revokeDoctorSession = async (sessionId: string): Promise<void> => {
  await securityService.revokeSession(sessionId);
};
