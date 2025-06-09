
import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Camera, Upload, ScanQrCode, User, FileImage } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';

interface QRCodeScannerProps {
  onScanSuccess: (patientData: any) => void;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onScanSuccess }) => {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const initCamera = async () => {
    try {
      setIsCameraOpen(true);
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
      setIsCameraOpen(false);
    }
  };

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
      setScanning(false);
    }
    setIsCameraOpen(false);
  }, []);

  const startScanning = () => {
    setScanning(true);
    // Dans un environnement réel, vous utiliseriez une bibliothèque comme jsQR
    // Pour cette démo, on simule la capture d'un QR code de la caméra
    toast({
      title: "Scanner activé",
      description: "Pointez la caméra vers un QR code ou utilisez la saisie manuelle."
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "Format invalide",
        description: "Veuillez sélectionner un fichier image."
      });
      return;
    }

    setProcessing(true);
    
    try {
      // Simuler la lecture du QR code depuis l'image
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Image traitée",
        description: "Veuillez entrer le code QR manuellement si détecté dans l'image."
      });
      
    } catch (error) {
      console.error('Erreur lors du traitement de l\'image:', error);
      toast({
        variant: "destructive",
        title: "Erreur de traitement",
        description: "Impossible de lire le QR code depuis cette image."
      });
    } finally {
      setProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleManualInput = async () => {
    if (!manualInput.trim()) {
      toast({
        variant: "destructive",
        title: "Code requis",
        description: "Veuillez entrer un code QR."
      });
      return;
    }

    setProcessing(true);
    await handleQRCodeDetected(manualInput.trim());
    setProcessing(false);
  };

  const extractQRCodeFromUrl = (text: string): string | null => {
    // Si c'est une URL, extraire le code QR de l'URL
    if (text.includes('/medical-record/')) {
      const parts = text.split('/medical-record/');
      if (parts.length === 2) {
        return parts[1];
      }
    }
    // Sinon, considérer que c'est directement le code QR
    return text;
  };

  const handleQRCodeDetected = async (scannedText: string) => {
    try {
      setProcessing(true);
      
      // Extraire le code QR de l'URL ou utiliser le texte directement
      const qrCode = extractQRCodeFromUrl(scannedText);
      
      if (!qrCode) {
        toast({
          variant: "destructive",
          title: "QR Code invalide",
          description: "Format de QR code non reconnu."
        });
        return;
      }

      console.log('QR Code détecté:', qrCode);
      
      // Valider le QR code directement avec la base de données
      const { data: qrCodeData, error: qrError } = await supabase
        .from('qr_codes')
        .select('*')
        .eq('qr_code', qrCode)
        .eq('status', 'active')
        .single();

      if (qrError || !qrCodeData) {
        console.error('QR code non trouvé:', qrError);
        toast({
          variant: "destructive",
          title: "QR Code invalide",
          description: "Ce QR code n'est pas valide ou a expiré."
        });
        return;
      }

      // Vérifier si le QR code n'a pas expiré
      const now = new Date();
      const expiryDate = new Date(qrCodeData.expires_at);
      if (expiryDate < now) {
        toast({
          variant: "destructive",
          title: "QR Code expiré",
          description: "Ce QR code a expiré."
        });
        return;
      }

      // Récupérer les informations du patient
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', qrCodeData.user_id)
        .single();

      if (profileError || !profileData) {
        console.error('Erreur lors de la récupération du profil:', profileError);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de récupérer les informations du patient."
        });
        return;
      }

      // Récupérer les médicaments du patient
      const { data: medications, error: medicationsError } = await supabase
        .from('medications')
        .select('*')
        .eq('user_id', qrCodeData.user_id)
        .order('created_at', { ascending: false });

      if (medicationsError) {
        console.error('Erreur lors de la récupération des médicaments:', medicationsError);
      }

      // Préparer les données du patient
      const patientData = {
        profile: profileData,
        medications: medications || [],
        qrCodeId: qrCode,
        accessExpiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
      };

      stopCamera();
      onScanSuccess(patientData);
      
      toast({
        title: "QR Code scanné avec succès",
        description: `Accès autorisé au profil de ${profileData.name || 'Patient'} pour 30 minutes`
      });

    } catch (error) {
      console.error('Erreur lors du traitement du QR code:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur s'est produite lors du traitement du QR code."
      });
    } finally {
      setProcessing(false);
      setScanning(false);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ScanQrCode size={20} />
          Scanner QR Code Patient
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          <Button 
            onClick={initCamera}
            className="flex items-center gap-2"
            disabled={processing}
          >
            <Camera size={18} />
            Scanner avec la caméra
          </Button>
          
          <Button 
            variant="outline"
            onClick={triggerFileUpload}
            className="flex items-center gap-2"
            disabled={processing}
          >
            <FileImage size={18} />
            {processing ? 'Traitement...' : 'Importer une image QR'}
          </Button>
          
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Ou entrez le code manuellement :</label>
          <div className="flex gap-2">
            <Input
              placeholder="Code QR ou URL complète"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              disabled={processing}
            />
            <Button 
              onClick={handleManualInput}
              disabled={!manualInput.trim() || processing}
              size="sm"
            >
              Valider
            </Button>
          </div>
        </div>
        
        {processing && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">
              Traitement en cours...
            </p>
          </div>
        )}
      </CardContent>

      {/* Modal de scan caméra */}
      <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Scanner QR Code</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {cameraActive ? (
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-64 object-cover rounded-lg bg-black"
                />
                {scanning && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                    <div className="text-white text-center">
                      <div className="animate-pulse mb-2">
                        <ScanQrCode size={48} className="mx-auto" />
                      </div>
                      <p>Recherche de QR code...</p>
                    </div>
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded text-xs">
                  Pointez vers un QR code ou fermez et utilisez la saisie manuelle
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
                <div className="text-center text-muted-foreground">
                  <Camera size={48} className="mx-auto mb-2" />
                  <p>Initialisation de la caméra...</p>
                </div>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={stopCamera} className="flex-1">
                Fermer
              </Button>
              {cameraActive && !scanning && (
                <Button onClick={startScanning} className="flex-1">
                  Activer le scan
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default QRCodeScanner;
