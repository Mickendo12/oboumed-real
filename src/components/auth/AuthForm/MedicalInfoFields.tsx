
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Droplet, Phone, Pill, Stethoscope, Weight, Ruler } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

interface MedicalInfoFieldsProps {
  bloodType: string;
  setBloodType: (value: string) => void;
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
  weightKg: string;
  setWeightKg: (value: string) => void;
  heightCm: string;
  setHeightCm: (value: string) => void;
  allergies: string;
  setAllergies: (value: string) => void;
  chronicDiseases: string;
  setChronicDiseases: (value: string) => void;
  medications: string;
  setMedications: (value: string) => void;
}

const MedicalInfoFields: React.FC<MedicalInfoFieldsProps> = ({
  bloodType,
  setBloodType,
  phoneNumber,
  setPhoneNumber,
  weightKg,
  setWeightKg,
  heightCm,
  setHeightCm,
  allergies,
  setAllergies,
  chronicDiseases,
  setChronicDiseases,
  medications,
  setMedications
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Droplet size={16} />
            <Label htmlFor="bloodType">Groupe sanguin</Label>
          </div>
          <Select value={bloodType} onValueChange={setBloodType}>
            <SelectTrigger id="bloodType">
              <SelectValue placeholder="Sélectionnez" />
            </SelectTrigger>
            <SelectContent>
              {bloodTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Phone size={16} />
            <Label htmlFor="phoneNumber">Numéro de téléphone</Label>
          </div>
          <Input 
            id="phoneNumber"
            type="tel" 
            value={phoneNumber} 
            onChange={(e) => setPhoneNumber(e.target.value)} 
            placeholder="Ex: 06 12 34 56 78" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Weight size={16} />
            <Label htmlFor="weightKg">Poids (kg)</Label>
          </div>
          <Input 
            id="weightKg"
            type="number" 
            value={weightKg} 
            onChange={(e) => setWeightKg(e.target.value)} 
            placeholder="Ex: 70" 
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Ruler size={16} />
            <Label htmlFor="heightCm">Taille (cm)</Label>
          </div>
          <Input 
            id="heightCm"
            type="number" 
            value={heightCm} 
            onChange={(e) => setHeightCm(e.target.value)} 
            placeholder="Ex: 175" 
          />
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle size={16} />
          <Label htmlFor="allergies">Allergies</Label>
        </div>
        <Textarea 
          id="allergies"
          value={allergies} 
          onChange={(e) => setAllergies(e.target.value)} 
          placeholder="Médicaments, aliments, substances..." 
          rows={2}
        />
      </div>

      <div>
        <div className="flex items-center gap-2 mb-2">
          <Stethoscope size={16} />
          <Label htmlFor="chronicDiseases">Maladies chroniques</Label>
        </div>
        <Textarea 
          id="chronicDiseases"
          value={chronicDiseases} 
          onChange={(e) => setChronicDiseases(e.target.value)} 
          placeholder="Diabète, hypertension, asthme..." 
          rows={2}
        />
      </div>

      <div>
        <div className="flex items-center gap-2 mb-2">
          <Pill size={16} />
          <Label htmlFor="medications">Traitements en cours</Label>
        </div>
        <Textarea 
          id="medications"
          value={medications} 
          onChange={(e) => setMedications(e.target.value)} 
          placeholder="Médicaments pris régulièrement..." 
          rows={2}
        />
      </div>
    </div>
  );
};

export default MedicalInfoFields;
