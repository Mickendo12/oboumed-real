
import React from 'react';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
}

interface MedicationListProps {
  medications: Medication[];
}

const MedicationList: React.FC<MedicationListProps> = ({ medications }) => {
  if (medications.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Aucun médicament ajouté à cette ordonnance
      </p>
    );
  }
  
  return (
    <ul className="space-y-2">
      {medications.map((med) => (
        <li key={med.id} className="p-3 border rounded-md bg-muted/30">
          <div className="font-medium">{med.name}</div>
          <div className="text-sm text-muted-foreground">
            {med.dosage} - {med.frequency}
          </div>
        </li>
      ))}
    </ul>
  );
};

export default MedicationList;
