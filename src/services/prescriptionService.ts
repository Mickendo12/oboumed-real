
import { supabase } from '@/integrations/supabase/client';
import { addMedication } from './supabaseService';

export interface PrescriptionData {
  hospitalName?: string;
  doctorName?: string;
  pharmacyName?: string;
  prescriptionDate?: string;
  imageUrl?: string;
  imageStoragePath?: string;
  userId: string;
}

export interface MedicationData {
  name: string;
  dosage?: string;
  frequency?: string;
  posology?: string;
  comments?: string;
  treatment_duration?: string;
  user_id: string;
  prescription_id?: string;
}

export const createPrescription = async (prescriptionData: PrescriptionData) => {
  const { data, error } = await supabase
    .from('prescriptions')
    .insert({
      user_id: prescriptionData.userId,
      hospital_name: prescriptionData.hospitalName,
      doctor_name: prescriptionData.doctorName,
      pharmacy_name: prescriptionData.pharmacyName,
      prescription_date: prescriptionData.prescriptionDate,
      image_url: prescriptionData.imageUrl,
      image_storage_path: prescriptionData.imageStoragePath,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const createPrescriptionWithMedications = async (
  prescriptionData: PrescriptionData,
  medications: Array<Omit<MedicationData, 'user_id' | 'prescription_id'>>
) => {
  // Créer l'ordonnance
  const prescription = await createPrescription(prescriptionData);

  // Ajouter les médicaments liés à cette ordonnance
  const medicationPromises = medications.map(medication =>
    addMedication({
      ...medication,
      user_id: prescriptionData.userId,
      prescription_id: prescription.id,
    })
  );

  await Promise.all(medicationPromises);

  return prescription;
};

export const uploadPrescriptionImage = async (
  imageData: string,
  userId: string
): Promise<{ url: string; path: string }> => {
  if (!imageData) return { url: '', path: '' };

  try {
    const imagePath = `prescriptions/${userId}/${Date.now()}.jpg`;
    
    // Convertir l'image base64 en blob
    const imageDataForUpload = imageData.startsWith('data:') 
      ? imageData 
      : `data:image/jpeg;base64,${imageData}`;
    
    const response = await fetch(imageDataForUpload);
    const blob = await response.blob();

    const { data, error } = await supabase.storage
      .from('prescriptions')
      .upload(imagePath, blob);

    if (error) {
      throw error;
    }

    const { data: urlData } = supabase.storage
      .from('prescriptions')
      .getPublicUrl(data.path);

    return { url: urlData.publicUrl, path: data.path };
  } catch (error) {
    console.error("Erreur lors du téléversement:", error);
    throw error;
  }
};
