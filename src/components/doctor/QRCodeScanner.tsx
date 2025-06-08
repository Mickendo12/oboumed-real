
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
        startScanning();
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
    // Simulation du scan continu
    const scanInterval = setInterval(() => {
      if (Math.random() > 0.97) { // 3% de chance de "détecter" un QR code
        clearInterval(scanInterval);
        handleQRCodeDetected('demo_qr_code_12345');
      }
    }, 100);

    // Arrêter après 30 secondes si rien n'est détecté
    setTimeout(() => {
      clearInterval(scanInterval);
      if (scanning) {
        setScanning(false);
        toast({
          title: "Scan terminé",
          description: "Aucun QR code détecté. Veuillez réessayer."
        });
      }
    }, 30000);
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
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Pour la démo, on simule la détection d'un QR code
      const mockQRCode = `uploaded_qr_${Date.now()}`;
      await handleQRCodeDetected(mockQRCode);
      
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

  const handleQRCodeDetected = async (qrCode: string) => {
    try {
      setProcessing(true);
      
      // Vérifier que le QR code existe et est valide
      const { data: qrData, error: qrError } = await supabase
        .from('qr_codes')
        .select(`
          *,
          profiles!qr_codes_user_id_fkey (
            id,
            name,
            email,
            phone_number,
            blood_type,
            allergies,
            chronic_diseases,
            current_medications,
            emergency_contact_name,
            emergency_contact_phone,
            emergency_contact_relationship
          )
        `)
        .eq('qr_code', qrCode)
        .eq('status', 'active')
        .gt('expires_at', new Date().toISOString())
        .single();

      if (qrError || !qrData) {
        toast({
          variant: "destructive",
          title: "QR Code invalide",
          description: "Ce QR code n'est pas valide ou a expiré."
        });
        return;
      }

      // Récupérer les ordonnances et médicaments du patient
      const { data: prescriptions, error: prescError } = await supabase
        .from('prescriptions')
        .select(`
          *,
          medications (*)
        `)
        .eq('user_id', qrData.user_id)
        .order('created_at', { ascending: false });

      if (prescError) {
        console.error('Erreur lors de la récupération des ordonnances:', prescError);
      }

      // Enregistrer l'accès dans les logs
      const { error: logError } = await supabase
        .from('access_logs')
        .insert({
          action: 'qr_scan_access',
          patient_id: qrData.user_id,
          doctor_id: null, // TODO: Récupérer l'ID du médecin connecté
          details: { qr_code_id: qrData.id, scan_method: 'camera_or_upload' }
        });

      if (logError) {
        console.error('Erreur lors de l\'enregistrement du log:', logError);
      }

      // Préparer les données du patient
      const patientData = {
        profile: qrData.profiles,
        prescriptions: prescriptions || [],
        qrCodeId: qrData.id
      };

      stopCamera();
      onScanSuccess(patientData);
      
      toast({
        title: "QR Code scanné avec succès",
        description: `Accès autorisé au profil de ${qrData.profiles?.name || 'Patient'}`
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
                Annuler
              </Button>
              {cameraActive && !scanning && (
                <Button onClick={startScanning} className="flex-1">
                  Démarrer le scan
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
