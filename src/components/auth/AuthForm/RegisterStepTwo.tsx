
import React from 'react';
import { Button } from '@/components/ui/button';
import EmergencyContactFields from './EmergencyContactFields';
import MedicalInfoFields from './MedicalInfoFields';

interface RegisterStepTwoProps {
  bloodType: string;
  setBloodType: (value: string) => void;
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
  emergencyContactName: string;
  setEmergencyContactName: (value: string) => void;
  emergencyContactPhone: string;
  setEmergencyContactPhone: (value: string) => void;
  emergencyContactRelationship: string;
  setEmergencyContactRelationship: (value: string) => void;
  allergies: string;
  setAllergies: (value: string) => void;
  chronicDiseases: string;
  setChronicDiseases: (value: string) => void;
  medications: string;
  setMedications: (value: string) => void;
  handleBack: () => void;
  handleSubmit: (e: React.FormEvent) => void;
  loading: boolean;
}

const RegisterStepTwo: React.FC<RegisterStepTwoProps> = ({
  bloodType,
  setBloodType,
  phoneNumber,
  setPhoneNumber,
  emergencyContactName,
  setEmergencyContactName,
  emergencyContactPhone,
  setEmergencyContactPhone,
  emergencyContactRelationship,
  setEmergencyContactRelationship,
  allergies,
  setAllergies,
  chronicDiseases,
  setChronicDiseases,
  medications,
  setMedications,
  handleBack,
  handleSubmit,
  loading
}) => {
  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-center mb-4">
        <Button 
          type="button" 
          variant="ghost" 
          className="px-2" 
          onClick={handleBack}
        >
          ← Retour
        </Button>
        <h3 className="text-lg font-medium ml-2">Informations médicales</h3>
      </div>

      <MedicalInfoFields 
        bloodType={bloodType}
        setBloodType={setBloodType}
        phoneNumber={phoneNumber}
        setPhoneNumber={setPhoneNumber}
        allergies={allergies}
        setAllergies={setAllergies}
        chronicDiseases={chronicDiseases}
        setChronicDiseases={setChronicDiseases}
        medications={medications}
        setMedications={setMedications}
      />

      <EmergencyContactFields
        emergencyContactName={emergencyContactName}
        setEmergencyContactName={setEmergencyContactName}
        emergencyContactPhone={emergencyContactPhone}
        setEmergencyContactPhone={setEmergencyContactPhone}
        emergencyContactRelationship={emergencyContactRelationship}
        setEmergencyContactRelationship={setEmergencyContactRelationship}
      />

      <Button 
        type="submit" 
        className="w-full mt-6" 
        disabled={loading}
      >
        {loading ? 'Création en cours...' : "Créer mon compte"}
      </Button>
    </form>
  );
};

export default RegisterStepTwo;
