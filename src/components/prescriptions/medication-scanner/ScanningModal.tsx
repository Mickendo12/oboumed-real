
import React, { useState, useRef, MutableRefObject } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Camera } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { getMedicationByBarcode, MedicationApiResult } from '@/services/medicationApiService';

interface ScanningModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onScan: (medication: {
    id: string;
    name: string;
    dosage: string;
    frequency: string;
  }) => void;
  onManualEntry: () => void;
  onClose: () => void;
  scanIntervalRef: MutableRefObject<number | null>;
}

export const ScanningModal: React.FC<ScanningModalProps> = ({ 
  isOpen, 
  onOpenChange, 
  onScan, 
  onManualEntry, 
  onClose,
  scanIntervalRef
}) => {
  const [isScanningAnimation, setIsScanningAnimation] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const [medicationName, setMedicationName] = useState('');
  const [medicationDosage, setMedicationDosage] = useState('');
  const [medicationFrequency, setMedicationFrequency] = useState('');
  const [scannedMedication, setScannedMedication] = useState<MedicationApiResult | null>(null);
  const { toast } = useToast();

  // Simuler le scan d'un code-barres
  const simulateBarcodeScanning = () => {
    setIsScanningAnimation(true);
    
    // Simuler plusieurs tentatives de scan pour un effet réaliste
    let scanAttempts = 0;
    
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }
    
    // Simuler le balayage du scanner
    scanIntervalRef.current = window.setInterval(() => {
      scanAttempts++;
      
      // Après quelques tentatives, "trouver" un médicament
      if (scanAttempts >= 3) {
        clearInterval(scanIntervalRef.current!);
        scanIntervalRef.current = null;
        
        // Générer un code-barres aléatoire ou utiliser celui saisi manuellement
        const barcodeToUse = manualBarcode || 'random';
        
        // Simuler la récupération du médicament
        getMedicationByBarcode(barcodeToUse)
          .then(medication => {
            setIsScanningAnimation(false);
            
            if (medication) {
              setScannedMedication(medication);
              setMedicationName(medication.name);
              setMedicationDosage(medication.dosage);
              setMedicationFrequency(medication.frequency || '');
              
              toast({
                title: "Médicament détecté",
                description: `${medication.name} (${medication.dosage}) a été identifié.`
              });
            } else {
              toast({
                variant: "destructive",
                title: "Médicament non reconnu",
                description: "Le code-barres n'a pas pu être identifié. Essayez à nouveau ou utilisez la saisie manuelle."
              });
            }
          });
      }
    }, 700);
  };

  const handleManualBarcodeScan = () => {
    if (!manualBarcode.trim()) {
      toast({
        variant: "destructive",
        title: "Code-barres requis",
        description: "Veuillez entrer un code-barres valide."
      });
      return;
    }
    
    setIsScanningAnimation(true);
    
    // Simuler le délai de scan
    setTimeout(async () => {
      try {
        const medication = await getMedicationByBarcode(manualBarcode);
        setIsScanningAnimation(false);
        
        if (medication) {
          setScannedMedication(medication);
          setMedicationName(medication.name);
          setMedicationDosage(medication.dosage);
          setMedicationFrequency(medication.frequency || '');
          
          toast({
            title: "Médicament détecté",
            description: `${medication.name} (${medication.dosage}) a été identifié.`
          });
        } else {
          toast({
            variant: "destructive",
            title: "Médicament non reconnu",
            description: "Le code-barres n'a pas pu être identifié. Essayez à nouveau ou utilisez la saisie manuelle."
          });
        }
      } catch (error) {
        setIsScanningAnimation(false);
        toast({
          variant: "destructive",
          title: "Erreur de scan",
          description: "Une erreur s'est produite lors du scan. Veuillez réessayer."
        });
      }
    }, 1000);
  };

  const handleConfirmMedication = () => {
    onScan({
      id: scannedMedication?.id || Date.now().toString(),
      name: medicationName,
      dosage: medicationDosage,
      frequency: medicationFrequency,
    });
    
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setMedicationName('');
    setMedicationDosage('');
    setMedicationFrequency('');
    setScannedMedication(null);
    setManualBarcode('');
  };

  // Start scanning when the modal opens
  React.useEffect(() => {
    if (isOpen) {
      resetForm();
      // Commencer le scan après un court délai
      setTimeout(() => {
        simulateBarcodeScanning();
      }, 500);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        if (scanIntervalRef.current) {
          clearInterval(scanIntervalRef.current);
          scanIntervalRef.current = null;
        }
      }
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scanner un médicament</DialogTitle>
          <DialogDescription>
            Placez le code-barres du médicament dans la zone de scan ou entrez-le manuellement.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center p-4 space-y-4">
          {/* Zone de scan simulée */}
          <div className={`border-2 border-dashed rounded-lg p-8 relative ${isScanningAnimation ? 'border-primary' : 'border-muted'}`}>
            <div className="w-full h-40 bg-muted/30 flex items-center justify-center rounded">
              {isScanningAnimation ? (
                <div className="w-full h-1 bg-primary animate-pulse absolute"></div>
              ) : (
                <Camera size={48} className="text-muted-foreground/50" />
              )}
            </div>
          </div>

          {/* Option pour entrer le code-barres manuellement */}
          {!scannedMedication && (
            <div className="w-full flex flex-col gap-2">
              <div className="text-sm font-medium">Code-barres</div>
              <div className="flex gap-2">
                <Input
                  placeholder="Entrez le code-barres"
                  value={manualBarcode}
                  onChange={(e) => setManualBarcode(e.target.value)}
                  disabled={isScanningAnimation}
                />
                <Button 
                  variant="secondary" 
                  onClick={handleManualBarcodeScan}
                  disabled={!manualBarcode.trim() || isScanningAnimation}
                >
                  Valider
                </Button>
              </div>
            </div>
          )}
          
          {/* Affichage des informations du médicament scanné */}
          {!isScanningAnimation && scannedMedication && (
            <div className="w-full space-y-4">
              <div className="p-4 border rounded-lg bg-muted/30">
                <h4 className="font-medium text-primary">{scannedMedication.name}</h4>
                <p className="text-sm text-muted-foreground mt-1">{scannedMedication.dosage}</p>
                {scannedMedication.activeIngredient && (
                  <p className="text-xs mt-2">{scannedMedication.activeIngredient}</p>
                )}
                {scannedMedication.manufacturer && (
                  <p className="text-xs text-muted-foreground">Fabricant: {scannedMedication.manufacturer}</p>
                )}
              </div>
              
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
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
          ) : scannedMedication ? (
            <>
              <Button variant="outline" onClick={onManualEntry}>
                Saisie manuelle
              </Button>
              <Button onClick={handleConfirmMedication} disabled={!medicationName}>
                Confirmer
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button variant="outline" onClick={onManualEntry}>
                Saisie manuelle
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
