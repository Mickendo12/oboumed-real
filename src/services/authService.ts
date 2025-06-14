
import { supabase } from '@/integrations/supabase/client';

export interface SignUpData {
  email: string;
  password: string;
  name?: string;
  bloodType?: string;
  phoneNumber?: string;
  weightKg?: string;
  heightCm?: string;
  emergencyContact?: {
    name?: string;
    phoneNumber?: string;
    relationship?: string;
  };
  allergies?: string;
  chronicDiseases?: string;
  medications?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface UserProfile {
  userId: string;
  email: string;
  name?: string;
  bloodType?: string;
  phoneNumber?: string;
  emergencyContact?: {
    name?: string;
    phoneNumber?: string;
    relationship?: string;
  };
  allergies?: string;
  chronicDiseases?: string;
  medications?: string;
  shareWithDoctor: boolean;
}

export const signUp = async (data: SignUpData) => {
  // Transmet toutes les infos au metadata pour le trigger Supabase
  const { email, password, name, phoneNumber, bloodType, weightKg, heightCm, emergencyContact, allergies, chronicDiseases, medications } = data;
  const user_metadata: Record<string, any> = {
    name,
    phoneNumber,
    bloodType,
    weightKg: weightKg ? parseFloat(weightKg) : null,
    heightCm: heightCm ? parseFloat(heightCm) : null,
    allergies,
    chronicDiseases,
    medications,
    emergencyContactName: emergencyContact?.name || null,
    emergencyContactPhone: emergencyContact?.phoneNumber || null,
    emergencyContactRelationship: emergencyContact?.relationship || null,
  };

  const { data: authData, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: user_metadata
    }
  });

  if (error) {
    throw error;
  }

  // Le profil est créé automatiquement via le trigger handle_new_user
  return authData;
};

export const signIn = async (data: SignInData) => {
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password
  });
  
  if (error) {
    throw error;
  }
  
  return authData;
};

export const logOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
};

export const getCurrentUser = () => {
  return supabase.auth.getUser();
};
