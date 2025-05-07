
import React, { useState, useRef } from 'react';
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
import { Camera, Pill, ScanBarcode, Search } from 'lucide-react';
import { getMedicationByBarcode, MedicationApiResult, searchMedicationByName } from '@/services/medicationApiService';
import { useToast } from '@/components/ui/use-toast';

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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScanningAnimation, setIsScanningAnimation] = useState(false);
  const [medicationName, setMedicationName] = useState('');
  const [medicationDosage, setMedicationDosage] = useState('');
  const [medicationFrequency, setMedicationFrequency] = useState('');
  const [manualBarcode, setManualBarcode] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<MedicationApiResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [scannedMedication, setScannedMedication] = useState<MedicationApiResult | null>(null);
  const { toast } = useToast();

  // Minuteur pour simuler le scan continu
  const scanIntervalRef = useRef<number | null>(null);
  
  // Fonction pour simuler le scan d'un code-barres
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

  const handleStartScan = () => {
    setIsScannerOpen(true);
    setManualBarcode('');
    setScannedMedication(null);
    resetForm();
    
    // Commencer le scan après un court délai
    setTimeout(() => {
      simulateBarcodeScanning();
    }, 500);
  };

  const handleConfirmMedication = () => {
    onScan({
      id: scannedMedication?.id || Date.now().toString(),
      name: medicationName,
      dosage: medicationDosage,
      frequency: medicationFrequency,
    });
    
    resetForm();
    closeAllDialogs();
  };

  const handleManualEntry = () => {
    setIsManualEntryOpen(true);
    setIsScannerOpen(false);
    setIsSearchOpen(false);
    resetForm();
  };

  const handleOpenSearch = () => {
    setIsSearchOpen(true);
    setIsScannerOpen(false);
    setIsManualEntryOpen(false);
    setSearchTerm('');
    setSearchResults([]);
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
    closeAllDialogs();
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await searchMedicationByName(searchTerm);
      setSearchResults(results);
      
      if (results.length === 0) {
        toast({
          title: "Aucun résultat",
          description: "Aucun médicament correspondant trouvé. Essayez un autre terme ou utilisez la saisie manuelle."
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur de recherche",
        description: "Impossible de rechercher des médicaments. Veuillez réessayer."
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (medication: MedicationApiResult) => {
    onScan({
      id: medication.id,
      name: medication.name,
      dosage: medication.dosage,
      frequency: medication.frequency || '',
    });
    
    toast({
      title: "Médicament ajouté",
      description: `${medication.name} a été ajouté à votre ordonnance.`
    });
    
    resetForm();
    closeAllDialogs();
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

  const resetForm = () => {
    setMedicationName('');
    setMedicationDosage('');
    setMedicationFrequency('');
    setScannedMedication(null);
  };

  const closeAllDialogs = () => {
    setIsScannerOpen(false);
    setIsManualEntryOpen(false);
    setIsSearchOpen(false);
    
    // Nettoyer tout intervalle actif
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
        <Button 
          onClick={handleStartScan}
          className="flex-1 flex items-center justify-center gap-2"
        >
          <ScanBarcode size={18} />
          Scanner un médicament
        </Button>
        <Button 
          variant="outline" 
          onClick={handleOpenSearch}
          className="flex-1 flex items-center justify-center gap-2"
        >
          <Search size={18} />
          Rechercher
        </Button>
        <Button 
          variant="outline" 
          onClick={handleManualEntry}
          className="flex-1 flex items-center justify-center gap-2"
        >
          <Pill size={18} />
          Saisie manuelle
        </Button>
      </div>

      {/* Scanner Modal */}
      <Dialog open={isScannerOpen} onOpenChange={(open) => {
        if (!open) {
          if (scanIntervalRef.current) {
            clearInterval(scanIntervalRef.current);
            scanIntervalRef.current = null;
          }
        }
        setIsScannerOpen(open);
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
              <Button variant="outline" onClick={closeAllDialogs}>
                Annuler
              </Button>
            ) : scannedMedication ? (
              <>
                <Button variant="outline" onClick={handleManualEntry}>
                  Saisie manuelle
                </Button>
                <Button onClick={handleConfirmMedication} disabled={!medicationName}>
                  Confirmer
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={closeAllDialogs}>
                  Annuler
                </Button>
                <Button variant="outline" onClick={handleManualEntry}>
                  Saisie manuelle
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de recherche de médicaments */}
      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rechercher un médicament</DialogTitle>
            <DialogDescription>
              Entrez le nom du médicament ou sa substance active.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Ex: Doliprane, Paracétamol..."
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={isSearching || !searchTerm.trim()}>
                {isSearching ? 'Recherche...' : 'Rechercher'}
              </Button>
            </div>
            
            {searchResults.length > 0 && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {searchResults.map((med) => (
                  <div 
                    key={med.id}
                    className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => handleSelectSearchResult(med)}
                  >
                    <div className="font-medium">{med.name}</div>
                    <div className="text-sm text-muted-foreground">{med.dosage}</div>
                    {med.activeIngredient && (
                      <div className="text-xs mt-1">{med.activeIngredient}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={closeAllDialogs}>
              Annuler
            </Button>
            <Button variant="outline" onClick={handleManualEntry}>
              Saisie manuelle
            </Button>
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
