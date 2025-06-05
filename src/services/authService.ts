
import { supabase } from '@/integrations/supabase/client';

export interface SignUpData {
  email: string;
  password: string;
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
  const { data: authData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        name: data.name
      }
    }
  });
  
  if (error) {
    throw error;
  }
  
  // Le profil sera créé automatiquement par le trigger
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
