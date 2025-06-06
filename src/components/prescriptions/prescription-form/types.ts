
export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  posology?: string;
  comments?: string;
  treatment_duration?: string;
}

export interface Prescription {
  hospitalName: string;
  doctorName: string;
  pharmacyName: string;
  prescriptionDate: string;
  medications: Medication[];
  userId: string;
  createdAt: number;
  imageUrl?: string;
  prescriptionImage?: string;
  imageStoragePath?: string;
}

export interface OcrResult {
  medications: Medication[];
  hospitalName?: string;
  doctorName?: string;
  prescriptionDate?: string;
}
