
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus } from 'lucide-react';

const relationshipTypes = ['Conjoint(e)', 'Parent', 'Enfant', 'Ami(e)', 'Autre'];

interface EmergencyContactFieldsProps {
  emergencyContactName: string;
  setEmergencyContactName: (value: string) => void;
  emergencyContactPhone: string;
  setEmergencyContactPhone: (value: string) => void;
  emergencyContactRelationship: string;
  setEmergencyContactRelationship: (value: string) => void;
}

const EmergencyContactFields: React.FC<EmergencyContactFieldsProps> = ({
  emergencyContactName,
  setEmergencyContactName,
  emergencyContactPhone,
  setEmergencyContactPhone,
  emergencyContactRelationship,
  setEmergencyContactRelationship
}) => {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <UserPlus size={16} />
        <Label>Contact d'urgence</Label>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="emergencyName" className="text-xs">Nom et prénom</Label>
          <Input 
            id="emergencyName"
            placeholder="Nom de la personne"
            value={emergencyContactName}
            onChange={(e) => setEmergencyContactName(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="emergencyPhone" className="text-xs">Téléphone</Label>
          <Input 
            id="emergencyPhone"
            type="tel"
            placeholder="Numéro de téléphone"
            value={emergencyContactPhone}
            onChange={(e) => setEmergencyContactPhone(e.target.value)}
          />
        </div>
      </div>
      <div className="mt-2">
        <Label htmlFor="relationship" className="text-xs">Lien avec vous</Label>
        <Select 
          value={emergencyContactRelationship} 
          onValueChange={setEmergencyContactRelationship}
        >
          <SelectTrigger id="relationship">
            <SelectValue placeholder="Sélectionnez" />
          </SelectTrigger>
          <SelectContent>
            {relationshipTypes.map(type => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default EmergencyContactFields;
