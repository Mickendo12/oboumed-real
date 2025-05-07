
import React from 'react';
import { Input } from '@/components/ui/input';

interface PrescriptionDetailsProps {
  hospitalName: string;
  setHospitalName: (value: string) => void;
  doctorName: string;
  setDoctorName: (value: string) => void;
  prescriptionDate: string;
  setPrescriptionDate: (value: string) => void;
  pharmacyName: string;
  setPharmacyName: (value: string) => void;
}

const PrescriptionDetails: React.FC<PrescriptionDetailsProps> = ({
  hospitalName,
  setHospitalName,
  doctorName,
  setDoctorName,
  prescriptionDate,
  setPrescriptionDate,
  pharmacyName,
  setPharmacyName
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="hospital" className="text-sm font-medium">
          Nom de l'hôpital
        </label>
        <Input
          id="hospital" 
          value={hospitalName}
          onChange={(e) => setHospitalName(e.target.value)}
          placeholder="Entrez le nom de l'hôpital"
          required
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="doctor" className="text-sm font-medium">
          Nom du médecin
        </label>
        <Input
          id="doctor" 
          value={doctorName}
          onChange={(e) => setDoctorName(e.target.value)}
          placeholder="Entrez le nom du médecin"
          required
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="date" className="text-sm font-medium">
          Date de l'ordonnance
        </label>
        <Input
          id="date" 
          type="date"
          value={prescriptionDate}
          onChange={(e) => setPrescriptionDate(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="pharmacy" className="text-sm font-medium">
          Pharmacie
        </label>
        <Input
          id="pharmacy" 
          value={pharmacyName}
          onChange={(e) => setPharmacyName(e.target.value)}
          placeholder="Entrez le nom de la pharmacie"
          required
        />
      </div>
    </div>
  );
};

export default PrescriptionDetails;
