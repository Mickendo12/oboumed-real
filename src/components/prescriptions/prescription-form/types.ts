
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
}
