
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Camera, Upload, X, Loader2 } from 'lucide-react';
import { OcrResult } from './types';

interface PrescriptionScannerProps {
  onScanComplete: (result: OcrResult, imageData: string) => void;
}

const PrescriptionScanner: React.FC<PrescriptionScannerProps> = ({ onScanComplete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Initialiser la caméra
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

  // Arrêter la caméra
  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  };

  // Capturer une image
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

  // Simuler le traitement OCR
  const processImage = (imageData: string) => {
    setIsProcessing(true);
    
    // Simuler un délai de traitement
    setTimeout(() => {
      // Simuler un résultat d'OCR
      const mockOcrResult: OcrResult = {
        medications: [
          { 
            id: Date.now().toString(), 
            name: 'Doliprane', 
            dosage: '1000mg', 
            frequency: '3 fois par jour'
          },
          {
            id: (Date.now() + 1).toString(),
            name: 'Efferalgan',
            dosage: '500mg',
            frequency: '2 fois par jour'
          }
        ],
        hospitalName: 'Hôpital Universitaire',
        doctorName: 'Dr. Martin',
        prescriptionDate: new Date().toISOString().split('T')[0]
      };
      
      setIsProcessing(false);
      onScanComplete(mockOcrResult, imageData);
      setIsOpen(false);
      
      toast({
        title: "Ordonnance analysée",
        description: `${mockOcrResult.medications.length} médicaments ont été détectés.`
      });
      
      // Nettoyer
      setImagePreview(null);
      stopCamera();
    }, 3000);
  };

  const handleOpenDialog = () => {
    setIsOpen(true);
    setImagePreview(null);
  };

  const handleCloseDialog = () => {
    setIsOpen(false);
    stopCamera();
    setImagePreview(null);
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <Button 
        onClick={handleOpenDialog} 
        className="w-full flex items-center gap-2"
        variant="outline"
      >
        <Camera size={20} />
        Scanner une ordonnance
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Scanner votre ordonnance</DialogTitle>
            <DialogDescription>
              {isProcessing ? 'Analyse de l\'ordonnance en cours...' : 
                'Prenez en photo votre ordonnance ou importez une image'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center justify-center p-2 space-y-4">
            {isProcessing ? (
              <div className="flex flex-col items-center justify-center p-8 space-y-4">
                <Loader2 size={48} className="animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Analyse de l'image en cours...</p>
              </div>
            ) : cameraActive && !imagePreview ? (
              <div className="w-full relative">
                <video 
                  ref={videoRef} 
                  className="w-full h-64 object-cover rounded" 
                  autoPlay 
                  playsInline
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-64 h-48 border-2 border-primary/50 rounded-lg"></div>
                </div>
                <div className="mt-4 flex justify-center gap-2">
                  <Button onClick={captureImage}>Capturer</Button>
                  <Button variant="outline" onClick={stopCamera} size="icon">
                    <X size={18} />
                  </Button>
                </div>
              </div>
            ) : imagePreview ? (
              <div className="w-full">
                <img 
                  src={imagePreview} 
                  alt="Aperçu" 
                  className="w-full h-64 object-contain rounded" 
                />
              </div>
            ) : (
              <div className="w-full h-48 bg-muted/30 flex flex-col items-center justify-center rounded gap-6 p-4">
                <Camera size={48} className="text-muted-foreground/50" />
                <div className="flex gap-2">
                  <Button onClick={initCamera} className="flex items-center gap-1">
                    <Camera size={16} />
                    Utiliser la caméra
                  </Button>
                  <Button onClick={triggerFileUpload} variant="outline" className="flex items-center gap-1">
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
          </div>
          
          <DialogFooter className="flex justify-end">
            {!isProcessing && (
              <Button variant="outline" onClick={handleCloseDialog}>
                Annuler
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PrescriptionScanner;
