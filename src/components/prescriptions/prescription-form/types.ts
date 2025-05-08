

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
}

export interface Prescription {
  hospitalName: string;
  doctorName: string;
  pharmacyName: string;
  prescriptionDate: string;
  medications: Medication[];
  userId: string;
  createdAt: number;
  imageUrl?: string; // URL pour l'image de l'ordonnance stockée dans Firebase
  prescriptionImage?: string; // Base64 de l'image de l'ordonnance (temporaire)
  imageStoragePath?: string; // Chemin de stockage dans Firebase
}

export interface OcrResult {
  medications: Medication[];
  hospitalName?: string;
  doctorName?: string;
  prescriptionDate?: string;
}

