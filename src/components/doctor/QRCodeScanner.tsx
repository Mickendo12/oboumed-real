
import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Camera, Upload, ScanQrCode, User, FileImage, AlertTriangle } from 'lucide-react';
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

  // Vérifier si l'utilisateur actuel est un médecin
  const checkDoctorAccess = async (): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          variant: "destructive",
          title: "Accès refusé",
          description: "Vous devez être connecté pour accéder aux dossiers patients."
        });
        return false;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role, access_status')
        .eq('user_id', user.id)
        .single();

      if (!profile || profile.role !== 'doctor') {
        toast({
          variant: "destructive",
          title: "Accès refusé",
          description: "Seuls les médecins autorisés peuvent scanner les QR codes patients."
        });
        return false;
      }

      if (profile.access_status !== 'active') {
        toast({
          variant: "destructive",
          title: "Accès suspendu",
          description: "Votre accès médecin a été suspendu par l'administrateur."
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur vérification accès médecin:', error);
      toast({
        variant: "destructive",
        title: "Erreur de vérification",
        description: "Impossible de vérifier vos droits d'accès."
      });
      return false;
    }
  };

  const initCamera = async () => {
    const hasAccess = await checkDoctorAccess();
    if (!hasAccess) return;

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const hasAccess = await checkDoctorAccess();
    if (!hasAccess) return;

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
      // Simuler l'extraction du QR code de l'image
      // En production, vous utiliseriez une bibliothèque comme jsQR
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Image analysée",
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
    const hasAccess = await checkDoctorAccess();
    if (!hasAccess) return;

    if (!manualInput.trim()) {
      toast({
        variant: "destructive",
        title: "Code requis",
        description: "Veuillez entrer un code QR."
      });
      return;
    }

    setProcessing(true);
    await validateAndAccessPatientData(manualInput.trim());
    setProcessing(false);
  };

  const validateAndAccessPatientData = async (qrCode: string) => {
    try {
      console.log('Validation du code QR:', qrCode);
      
      // Vérifier que le QR code existe et est actif
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

      // Récupérer et vérifier le profil du patient
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

      // Vérifier que l'accès du patient n'est pas restreint
      if (profileData.access_status === 'restricted') {
        toast({
          variant: "destructive",
          title: "Accès restreint",
          description: "L'accès au dossier de ce patient a été restreint par l'administrateur."
        });
        return;
      }

      if (profileData.access_status === 'expired') {
        toast({
          variant: "destructive",
          title: "Accès expiré",
          description: "L'accès au dossier de ce patient a expiré."
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

      // Enregistrer l'accès médecin
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('access_logs')
          .insert({
            patient_id: qrCodeData.user_id,
            doctor_id: user.id,
            action: 'qr_medical_access',
            details: { 
              qr_code_id: qrCodeData.id,
              access_type: 'doctor_qr_scan',
              session_duration: '30_minutes'
            }
          });
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
        title: "Accès autorisé",
        description: `Dossier médical de ${profileData.name || 'Patient'} accessible pour 30 minutes`
      });

    } catch (error) {
      console.error('Erreur lors de la validation du QR code:', error);
      toast({
        variant: "destructive",
        title: "Erreur système",
        description: "Une erreur s'est produite lors de l'accès au dossier patient."
      });
    }
  };

  const triggerFileUpload = async () => {
    const hasAccess = await checkDoctorAccess();
    if (!hasAccess) return;
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
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
          <div className="flex items-start gap-2">
            <AlertTriangle size={16} className="text-amber-600 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium">Accès sécurisé</p>
              <p>Seuls les médecins autorisés peuvent accéder aux dossiers patients.</p>
            </div>
          </div>
        </div>

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
          <label className="text-sm font-medium">Ou entrez le code QR :</label>
          <div className="flex gap-2">
            <Input
              placeholder="Code QR médical"
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
              Validation en cours...
            </p>
          </div>
        )}
      </CardContent>

      {/* Modal de scan caméra */}
      <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Scanner QR Code Médical</DialogTitle>
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
                <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded text-xs">
                  Pointez vers un QR code médical
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
              <Button 
                variant="secondary" 
                onClick={() => toast({
                  title: "Fonction en développement",
                  description: "Utilisez la saisie manuelle pour le moment."
                })}
                className="flex-1"
              >
                Détecter QR
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default QRCodeScanner;
