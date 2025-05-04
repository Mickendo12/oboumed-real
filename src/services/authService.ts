
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  UserCredential,
  updateProfile
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { addDocument } from "./firestoreService";

export interface SignUpData {
  email: string;
  password: string;
  name?: string;
  bloodType?: string;
  phoneNumber?: string;
  emergencyContact?: {
    name?: string;
    phoneNumber?: string;
  };
  allergies?: string;
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
  };
  allergies?: string;
  shareWithDoctor: boolean;
}

export const signUp = async (data: SignUpData): Promise<UserCredential> => {
  const userCredential = await createUserWithEmailAndPassword(
    auth, 
    data.email, 
    data.password
  );
  
  // Update user profile with name if provided
  if (data.name && userCredential.user) {
    await updateProfile(userCredential.user, {
      displayName: data.name
    });
  }

  // Store additional user information in Firestore
  if (userCredential.user) {
    const userProfile: UserProfile = {
      userId: userCredential.user.uid,
      email: data.email,
      name: data.name,
      bloodType: data.bloodType,
      phoneNumber: data.phoneNumber,
      emergencyContact: data.emergencyContact,
      allergies: data.allergies,
      shareWithDoctor: false
    };

    await addDocument('users', userProfile);
  }
  
  return userCredential;
};

export const signIn = (data: SignInData): Promise<UserCredential> => {
  return signInWithEmailAndPassword(auth, data.email, data.password);
};

export const logOut = (): Promise<void> => {
  return signOut(auth);
};
