
import { supabase } from '@/integrations/supabase/client';

export interface QRCode {
  id: string;
  user_id: string;
  qr_code: string;
  status: 'active' | 'expired' | 'used';
  expires_at: string;
  created_by?: string;
  created_at: string;
}

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
