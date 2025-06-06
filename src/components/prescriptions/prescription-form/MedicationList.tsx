
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  posology?: string;
  comments?: string;
  treatment_duration?: string;
}

interface MedicationListProps {
  medications: Medication[];
}

const MedicationList: React.FC<MedicationListProps> = ({ medications }) => {
  if (medications.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        Aucun médicament ajouté à cette ordonnance
      </p>
    );
  }
  
  return (
    <div className="space-y-3">
      {medications.map((med) => (
        <Card key={med.id} className="border-l-4 border-l-primary/30">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <h4 className="font-semibold text-lg">{med.name}</h4>
                {med.treatment_duration && (
                  <Badge variant="secondary">{med.treatment_duration}</Badge>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                {med.dosage && (
                  <div>
                    <span className="font-medium text-muted-foreground">Dosage:</span>
                    <span className="ml-2">{med.dosage}</span>
                  </div>
                )}
                {med.frequency && (
                  <div>
                    <span className="font-medium text-muted-foreground">Fréquence:</span>
                    <span className="ml-2">{med.frequency}</span>
                  </div>
                )}
              </div>
              
              {med.posology && (
                <div className="text-sm">
                  <span className="font-medium text-muted-foreground">Posologie:</span>
                  <p className="mt-1 text-sm bg-muted/30 p-2 rounded">{med.posology}</p>
                </div>
              )}
              
              {med.comments && (
                <div className="text-sm">
                  <span className="font-medium text-muted-foreground">Commentaires:</span>
                  <p className="mt-1 text-sm text-muted-foreground italic">{med.comments}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MedicationList;
