
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

interface ManualEntryModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (medication: {
    id: string;
    name: string;
    dosage: string;
    frequency: string;
  }) => void;
}

export const ManualEntryModal: React.FC<ManualEntryModalProps> = ({ 
  isOpen, 
  onOpenChange, 
  onSubmit 
}) => {
  const [medicationName, setMedicationName] = useState('');
  const [medicationDosage, setMedicationDosage] = useState('');
  const [medicationFrequency, setMedicationFrequency] = useState('');

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      id: Date.now().toString(),
      name: medicationName,
      dosage: medicationDosage,
      frequency: medicationFrequency,
    });
    
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setMedicationName('');
    setMedicationDosage('');
    setMedicationFrequency('');
  };

  // Reset form when modal opens
  React.useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter un médicament</DialogTitle>
          <DialogDescription>
            Entrez les informations du médicament manuellement.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmitForm} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nom du médicament</label>
            <Input 
              value={medicationName}
              onChange={(e) => setMedicationName(e.target.value)}
              placeholder="Ex: Doliprane"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Dosage</label>
            <Input 
              value={medicationDosage}
              onChange={(e) => setMedicationDosage(e.target.value)}
              placeholder="Ex: 1000mg"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Fréquence</label>
            <Input 
              value={medicationFrequency}
              onChange={(e) => setMedicationFrequency(e.target.value)}
              placeholder="Ex: 1 comprimé 3 fois par jour"
              required
            />
          </div>
          
          <DialogFooter>
            <Button type="submit" disabled={!medicationName || !medicationDosage}>
              Ajouter
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
