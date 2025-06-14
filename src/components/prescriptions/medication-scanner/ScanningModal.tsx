import React, { useState, useRef, MutableRefObject, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Camera, Upload, X } from 'lucide-react';
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
  const [cameraActive, setCameraActive] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [processingImage, setProcessingImage] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Initialiser et gérer l'accès à la caméra
  const initCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (error) {
      console.error('Erreur d\'accès à la caméra:', error);
      toast({
        variant: "destructive",
        title: "Erreur d'accès à la caméra",
        description: "Impossible d'accéder à la caméra. Veuillez vérifier les permissions."
      });
    }
  };

  // Fermer la caméra
  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  };

  // Prendre une photo avec la caméra
  const captureImage = () => {
    if (!videoRef.current) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    
    if (ctx && videoRef.current) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const imageDataUrl = canvas.toDataURL('image/jpeg');
      setImagePreview(imageDataUrl);
      processImage(imageDataUrl);
    }
  };

  // Gérer l'importation d'une image
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageDataUrl = event.target?.result as string;
      setImagePreview(imageDataUrl);
      processImage(imageDataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Ouvrir la boîte de dialogue pour sélectionner une image
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  // Traiter l'image (simulation de traitement d'image et reconnaissance de médicament)
  const processImage = (imageData: string) => {
    setProcessingImage(true);
    
    // Simuler le traitement d'image avec un délai
    setTimeout(async () => {
      try {
        // Générer un code-barres simulé ou utiliser celui saisi manuellement
        const barcodeToUse = manualBarcode || 'random';
        
        // Récupérer les informations du médicament
        const medication = await getMedicationByBarcode(barcodeToUse);
        setProcessingImage(false);
        
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
            description: "Le médicament n'a pas pu être identifié. Essayez à nouveau ou utilisez la saisie manuelle."
          });
        }
      } catch (error) {
        setProcessingImage(false);
        toast({
          variant: "destructive",
          title: "Erreur de traitement",
          description: "Une erreur s'est produite lors du traitement de l'image."
        });
      }
    }, 1500);
  };

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
    setImagePreview(null);
    stopCamera();
  };

  // Clear scanning interval and camera when modal closes
  useEffect(() => {
    if (!isOpen) {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = null;
      }
      stopCamera();
      setImagePreview(null);
    } else {
      resetForm();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        if (scanIntervalRef.current) {
          clearInterval(scanIntervalRef.current);
          scanIntervalRef.current = null;
        }
        stopCamera();
      }
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scanner un médicament</DialogTitle>
          <DialogDescription>
            {!cameraActive && !imagePreview && !scannedMedication ? 
              "Utilisez la caméra ou importez une image du médicament." :
              cameraActive ? "Placez le médicament au centre du cadre." :
              imagePreview ? "Traitement de l'image en cours..." :
              "Vérifiez les informations du médicament détecté."
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center p-4 space-y-4">
          {/* Zone de scan avec caméra ou aperçu d'image */}
          <div className={`border-2 border-dashed rounded-lg p-2 relative ${
            processingImage || isScanningAnimation ? 'border-primary' : 'border-muted'
          }`}>
            {cameraActive && !imagePreview && (
              <div className="w-full relative">
                <video 
                  ref={videoRef} 
                  className="w-full h-48 object-cover rounded" 
                  autoPlay 
                  playsInline
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-64 h-48 border-2 border-primary/50 rounded-lg"></div>
                </div>
              </div>
            )}

            {imagePreview && (
              <div className="w-full relative">
                <img 
                  src={imagePreview} 
                  className="w-full h-48 object-cover rounded" 
                  alt="Aperçu du médicament" 
                />
                {processingImage && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
            )}

            {!cameraActive && !imagePreview && !scannedMedication && (
              <div className="w-full h-40 bg-muted/30 flex flex-col items-center justify-center rounded gap-4 p-4">
                <Camera size={48} className="text-muted-foreground/50" />
                <div className="flex gap-2">
                  <Button onClick={initCamera} size="sm" className="flex items-center gap-1">
                    <Camera size={16} />
                    Utiliser la caméra
                  </Button>
                  <Button onClick={triggerFileUpload} variant="outline" size="sm" className="flex items-center gap-1">
                    <Upload size={16} />
                    Importer une image
                  </Button>
                  <input 
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>
              </div>
            )}

            {isScanningAnimation && (
              <div className="w-full h-1 bg-primary animate-pulse absolute"></div>
            )}
          </div>

          {/* Contrôles de caméra */}
          {cameraActive && !imagePreview && (
            <div className="flex gap-2 w-full">
              <Button onClick={captureImage} className="flex-1">
                Capturer
              </Button>
              <Button variant="outline" onClick={stopCamera} size="icon">
                <X size={18} />
              </Button>
            </div>
          )}

          {/* Option pour entrer le code-barres manuellement */}
          {!scannedMedication && !cameraActive && !processingImage && (
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
          {!isScanningAnimation && !processingImage && scannedMedication && (
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
          {cameraActive || processingImage ? (
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
          ) : isScanningAnimation ? (
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
