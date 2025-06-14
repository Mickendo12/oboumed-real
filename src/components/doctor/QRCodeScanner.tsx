
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, Camera, Upload, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { validateQRCode, getUserProfile } from '@/services/supabaseService';
import jsQR from 'jsqr';

interface QRCodeScannerProps {
  onScanSuccess: (patientData: any) => void;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onScanSuccess }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    setIsScanning(false);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsScanning(true);
        
        // Démarrer le scan automatique
        videoRef.current.onloadedmetadata = () => {
          startAutoScan();
        };
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        variant: "destructive",
        title: "Erreur caméra",
        description: "Impossible d'accéder à la caméra. Veuillez utiliser l'importation de fichier."
      });
    }
  };

  const startAutoScan = () => {
    if (!videoRef.current) return;
    
    scanIntervalRef.current = setInterval(() => {
      if (!videoRef.current || !isScanning) return;
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      ctx.drawImage(videoRef.current, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const qrCode = jsQR(imageData.data, imageData.width, imageData.height);
      
      if (qrCode) {
        console.log('QR Code détecté via caméra:', qrCode.data);
        processQRCode(qrCode.data);
      }
    }, 1000); // Scanner toutes les secondes
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "Fichier invalide",
        description: "Veuillez sélectionner une image contenant un QR code."
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageSrc = e.target?.result as string;
      await processQRCodeFromImage(imageSrc);
    };
    reader.readAsDataURL(file);
  };

  const processQRCodeFromImage = async (imageSrc: string) => {
    try {
      setLoading(true);
      
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          toast({
            variant: "destructive",
            title: "Erreur",
            description: "Impossible de traiter l'image."
          });
          setLoading(false);
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const qrCode = jsQR(imageData.data, imageData.width, imageData.height);
        
        if (qrCode) {
          console.log('QR Code détecté dans l\'image:', qrCode.data);
          await processQRCode(qrCode.data);
        } else {
          toast({
            variant: "destructive",
            title: "Aucun QR code détecté",
            description: "Aucun code QR n'a été trouvé dans cette image."
          });
        }
        setLoading(false);
      };
      
      img.onerror = () => {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger l'image."
        });
        setLoading(false);
      };
      
      img.src = imageSrc;
    } catch (error) {
      console.error('Erreur lors du traitement de l\'image:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de traiter l'image."
      });
      setLoading(false);
    }
  };

  const processQRCode = async (qrCodeValue: string) => {
    try {
      setLoading(true);
      
      // Nettoyer et extraire le code QR
      let cleanCode = qrCodeValue.trim();
      
      // Si c'est une URL de notre système, extraire le code
      if (cleanCode.includes('/qr/')) {
        const parts = cleanCode.split('/qr/');
        cleanCode = parts[parts.length - 1];
      }
      
      console.log('Processing cleaned QR code:', cleanCode);
      
      // Valider le QR code
      const validation = await validateQRCode(cleanCode);
      console.log('QR validation result:', validation);
      
      if (!validation.valid || !validation.userId) {
        toast({
          variant: "destructive",
          title: "Code QR invalide",
          description: "Ce code QR n'est pas valide ou a expiré."
        });
        return;
      }
      
      // Récupérer le profil du patient
      const profile = await getUserProfile(validation.userId);
      console.log('Patient profile retrieved:', profile);
      
      if (!profile) {
        toast({
          variant: "destructive",
          title: "Patient introuvable",
          description: "Impossible de trouver les informations du patient."
        });
        return;
      }
      
      // Vérifier l'accès
      if (profile.access_status === 'restricted') {
        toast({
          variant: "destructive",
          title: "Accès restreint",
          description: "L'accès au dossier de ce patient a été restreint."
        });
        return;
      }
      
      // Préparer les données dans le format attendu
      const patientData = {
        profile: {
          ...profile,
          user_id: validation.userId // S'assurer que user_id est présent
        },
        qrCodeId: cleanCode
      };
      
      console.log('Sending patient data to parent:', patientData);
      
      // Arrêter la caméra
      stopCamera();
      
      // Envoyer les données au composant parent
      onScanSuccess(patientData);
      
      toast({
        title: "Accès accordé",
        description: `Code QR valide pour ${profile.name || profile.email}`
      });
      
    } catch (error) {
      console.error('Erreur lors du traitement du QR code:', error);
      toast({
        variant: "destructive",
        title: "Erreur de traitement",
        description: `Impossible de traiter le code QR: ${error.message || 'Erreur inconnue'}`
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode size={20} />
            Scanner QR Code Patient
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isScanning ? (
            <div className="space-y-4">
              <Button 
                onClick={startCamera}
                className="w-full"
                disabled={loading}
              >
                <Camera size={16} className="mr-2" />
                Activer la caméra
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Ou
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="w-full"
                  disabled={loading}
                >
                  <Upload size={16} className="mr-2" />
                  Importer une image QR
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-64 bg-black rounded-lg"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-white rounded-lg"></div>
                </div>
              </div>
              
              <Button 
                onClick={stopCamera}
                variant="outline"
                disabled={loading}
                className="w-full"
              >
                Arrêter la caméra
              </Button>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle size={16} className="text-blue-600 mt-0.5" />
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Positionnez le code QR dans le cadre. Le scan se fait automatiquement.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {loading && (
            <div className="text-center py-4">
              <div className="animate-pulse">Traitement du code QR en cours...</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QRCodeScanner;
