
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
import { Camera, Pill } from 'lucide-react';
import { getMedicationByBarcode } from '@/utils/medicationData';

interface MedicationScannerProps {
  onScan: (medication: {
    id: string;
    name: string;
    dosage: string;
    frequency: string;
  }) => void;
}

const MedicationScanner: React.FC<MedicationScannerProps> = ({ onScan }) => {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);
  const [isScanningAnimation, setIsScanningAnimation] = useState(false);
  const [medicationName, setMedicationName] = useState('');
  const [medicationDosage, setMedicationDosage] = useState('');
  const [medicationFrequency, setMedicationFrequency] = useState('');

  const handleStartScan = () => {
    setIsScannerOpen(true);
    setIsScanningAnimation(true);
    
    // Simulate scanning process
    setTimeout(() => {
      setIsScanningAnimation(false);
      const medication = getMedicationByBarcode('random');
      
      if (medication) {
        setMedicationName(medication.name);
        setMedicationDosage(medication.dosage);
        setMedicationFrequency(medication.frequency || '');
      }
    }, 2000);
  };

  const handleConfirmMedication = () => {
    onScan({
      id: Date.now().toString(),
      name: medicationName,
      dosage: medicationDosage,
      frequency: medicationFrequency,
    });
    
    resetForm();
    setIsScannerOpen(false);
  };

  const handleManualEntry = () => {
    setIsManualEntryOpen(true);
    setIsScannerOpen(false);
  };

  const handleSubmitManual = (e: React.FormEvent) => {
    e.preventDefault();
    onScan({
      id: Date.now().toString(),
      name: medicationName,
      dosage: medicationDosage,
      frequency: medicationFrequency,
    });
    
    resetForm();
    setIsManualEntryOpen(false);
  };

  const resetForm = () => {
    setMedicationName('');
    setMedicationDosage('');
    setMedicationFrequency('');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
        <Button 
          onClick={handleStartScan}
          className="flex-1 flex items-center justify-center gap-2"
        >
          <Camera size={18} />
          Scanner un médicament
        </Button>
        <Button 
          variant="outline" 
          onClick={() => setIsManualEntryOpen(true)}
          className="flex-1 flex items-center justify-center gap-2"
        >
          <Pill size={18} />
          Saisie manuelle
        </Button>
      </div>

      {/* Scanner Modal */}
      <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Scanner un médicament</DialogTitle>
            <DialogDescription>
              Placez le code-barres du médicament dans la zone de scan.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center justify-center p-4 space-y-4">
            <div className={`border-2 border-dashed rounded-lg p-8 relative ${isScanningAnimation ? 'border-primary' : 'border-muted'}`}>
              <div className="w-full h-40 bg-muted/30 flex items-center justify-center rounded">
                {isScanningAnimation ? (
                  <div className="w-full h-1 bg-primary animate-pulse absolute"></div>
                ) : (
                  <Camera size={48} className="text-muted-foreground/50" />
                )}
              </div>
            </div>
            
            {!isScanningAnimation && medicationName && (
              <div className="w-full space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nom du médicament</label>
                  <Input 
                    value={medicationName}
                    onChange={(e) => setMedicationName(e.target.value)} 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Dosage</label>
                  <Input 
                    value={medicationDosage}
                    onChange={(e) => setMedicationDosage(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Fréquence</label>
                  <Input 
                    value={medicationFrequency}
                    onChange={(e) => setMedicationFrequency(e.target.value)}
                    placeholder="Ex: 1 comprimé 3 fois par jour"
                  />
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter className="flex justify-between sm:justify-between">
            {isScanningAnimation ? (
              <Button variant="outline" onClick={() => setIsScannerOpen(false)}>
                Annuler
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={handleManualEntry}>
                  Saisie manuelle
                </Button>
                <Button onClick={handleConfirmMedication} disabled={!medicationName}>
                  Confirmer
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manual Entry Modal */}
      <Dialog open={isManualEntryOpen} onOpenChange={setIsManualEntryOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter un médicament</DialogTitle>
            <DialogDescription>
              Entrez les informations du médicament manuellement.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmitManual} className="space-y-4">
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
    </div>
  );
};

export default MedicationScanner;
