
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  UserCredential,
  updateProfile
} from "firebase/auth";
import { auth } from "@/lib/firebase";

export interface SignUpData {
  email: string;
  password: string;
  name?: string;
}

export interface SignInData {
  email: string;
  password: string;
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
  
  return userCredential;
};

export const signIn = (data: SignInData): Promise<UserCredential> => {
  return signInWithEmailAndPassword(auth, data.email, data.password);
};

export const logOut = (): Promise<void> => {
  return signOut(auth);
};
