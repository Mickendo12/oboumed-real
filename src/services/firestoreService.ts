
import { 
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  DocumentData,
  QuerySnapshot,
  DocumentReference
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Reminder } from "@/components/reminders/ReminderForm";

// Define collection names
export const COLLECTIONS = {
  MEDICATIONS: "medications",
  REMINDERS: "reminders",
  PRESCRIPTIONS: "prescriptions"
};

// Generic CRUD operations
export const addDocument = <T extends DocumentData>(
  collectionName: string, 
  data: T
): Promise<DocumentReference> => {
  return addDoc(collection(db, collectionName), data);
};

export const getDocument = async <T>(
  collectionName: string,
  docId: string
): Promise<T | null> => {
  const docRef = doc(db, collectionName, docId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as unknown as T;
  } else {
    return null;
  }
};

export const updateDocument = (
  collectionName: string,
  docId: string,
  data: Partial<DocumentData>
): Promise<void> => {
  const docRef = doc(db, collectionName, docId);
  return updateDoc(docRef, data);
};

export const deleteDocument = (
  collectionName: string,
  docId: string
): Promise<void> => {
  const docRef = doc(db, collectionName, docId);
  return deleteDoc(docRef);
};

export const getDocumentsForUser = async <T>(
  collectionName: string,
  userId: string
): Promise<T[]> => {
  const q = query(
    collection(db, collectionName),
    where("userId", "==", userId)
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...doc.data() 
  })) as unknown as T[];
};

// Specialized functions for reminders
export const addReminder = (
  reminder: Omit<Reminder, "id">, 
  userId: string
): Promise<DocumentReference> => {
  return addDocument(COLLECTIONS.REMINDERS, {
    ...reminder,
    userId
  });
};

export const getRemindersForUser = (
  userId: string
): Promise<Reminder[]> => {
  return getDocumentsForUser<Reminder>(COLLECTIONS.REMINDERS, userId);
};

export const deleteReminder = (
  reminderId: string
): Promise<void> => {
  return deleteDocument(COLLECTIONS.REMINDERS, reminderId);
};
