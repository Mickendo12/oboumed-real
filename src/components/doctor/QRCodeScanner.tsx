import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, X, Scan } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { validateQRCode, getUserProfile, createDoctorSession, logAccess } from '@/services/supabaseService';
import { Camera as CapacitorCamera } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import jsQR from 'jsqr';

interface QRCodeScannerProps {
  onScanSuccess: (patientData: any) => void;
  doctorId: string;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onScanSuccess, doctorId }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  // Vérifier et demander les permissions caméra
  const checkCameraPermissions = async (): Promise<boolean> => {
    if (Capacitor.isNativePlatform()) {
      try {
        const permissions = await CapacitorCamera.checkPermissions();
        console.log('Camera permissions status:', permissions);
        
        if (permissions.camera !== 'granted') {
          const requestResult = await CapacitorCamera.requestPermissions();
          console.log('Permission request result:', requestResult);
          
          if (requestResult.camera !== 'granted') {
            toast({
              variant: "destructive",
              title: "Permission refusée",
              description: "L'accès à la caméra est nécessaire pour scanner les QR codes. Veuillez autoriser l'accès dans les paramètres de l'application."
            });
            return false;
          }
        }
        
        setPermissionGranted(true);
        return true;
      } catch (error) {
        console.error('Error checking camera permissions:', error);
        toast({
          variant: "destructive",
          title: "Erreur de permissions",
          description: "Impossible de vérifier les permissions caméra."
        });
        return false;
      }
    } else {
      // Pour le web, on assume que les permissions seront demandées par getUserMedia
      setPermissionGranted(true);
      return true;
    }
  };

  const extractQRCodeFromUrl = (url: string): string => {
    console.log('🔍 Extracting QR code from URL:', url);
    
    // Chercher le pattern /qr/[code] dans l'URL
    const qrMatch = url.match(/\/qr\/([^\/\?#]+)/);
    if (qrMatch && qrMatch[1]) {
      const extractedCode = qrMatch[1];
      console.log('✅ QR code extracted from URL:', extractedCode);
      return extractedCode;
    }
    
    // Si pas de pattern trouvé, retourner l'URL telle quelle
    console.log('⚠️ No QR pattern found, using full URL');
    return url;
  };

  const startVideoScanning = async () => {
    try {
      setLoading(true);
      
      // Vérifier les permissions d'abord
      const hasPermission = await checkCameraPermissions();
      if (!hasPermission) {
        setLoading(false);
        return;
      }

      setIsScanning(true);
      
      // Essayer d'abord la caméra arrière pour mobile et web
      let stream: MediaStream;
      
      try {
        // Première tentative avec la caméra arrière (mobile)
        stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: { exact: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });
      } catch (error) {
        console.log('⚠️ Caméra arrière non disponible, utilisation de la caméra par défaut');
        // Fallback vers la caméra par défaut
        stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });
      }

      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        
        videoRef.current.onloadedmetadata = () => {
          setLoading(false);
          startQRDetection();
        };
      }
    } catch (error) {
      console.error('Erreur accès caméra:', error);
      
      let errorMessage = "Impossible d'accéder à la caméra.";
      
      if (error.name === 'NotAllowedError') {
        errorMessage = "Permission d'accès à la caméra refusée. Veuillez autoriser l'accès dans les paramètres de votre navigateur ou appareil.";
      } else if (error.name === 'NotFoundError') {
        errorMessage = "Aucune caméra trouvée sur cet appareil.";
      } else if (error.name === 'NotReadableError') {
        errorMessage = "La caméra est utilisée par une autre application.";
      }
      
      toast({
        variant: "destructive",
        title: "Erreur caméra",
        description: errorMessage
      });
      setIsScanning(false);
      setLoading(false);
    }
  };

  const startQRDetection = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }

    scanIntervalRef.current = window.setInterval(() => {
      scanForQRCode();
    }, 100); // Scan toutes les 100ms pour une détection fluide
  };

  const scanForQRCode = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      return;
    }

    const context = canvas.getContext('2d');
    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);

    if (code) {
      console.log('🔍 QR Code détecté:', code.data);
      const qrCodeValue = extractQRCodeFromUrl(code.data);
      handleQRCodeDetected(qrCodeValue);
    }
  };

  const handleQRCodeDetected = async (qrCodeData: string) => {
    if (loading) return;
    
    try {
      setLoading(true);
      stopScanning();

      console.log('🔄 Processing QR code:', qrCodeData);

      // Log de tentative de scan
      await logAccess({
        patient_id: 'unknown', // Sera mis à jour après validation
        doctor_id: doctorId,
        action: 'qr_scan_attempt',
        details: {
          qr_code_data: qrCodeData,
          timestamp: new Date().toISOString(),
          method: 'camera_scan'
        },
        ip_address: 'camera_scan'
      });

      const validation = await validateQRCode(qrCodeData);
      console.log('✅ QR code validation result:', validation);

      if (!validation.valid || !validation.userId) {
        // Log d'échec de validation
        await logAccess({
          patient_id: 'unknown',
          doctor_id: doctorId,
          action: 'qr_scan_failed',
          details: {
            error: validation.error || 'QR code invalide',
            qr_code_data: qrCodeData,
            timestamp: new Date().toISOString()
          },
          ip_address: 'camera_scan'
        });

        toast({
          variant: "destructive",
          title: "QR Code invalide",
          description: validation.error || "Ce QR code n'est pas valide ou a expiré."
        });
        return;
      }

      const profile = await getUserProfile(validation.userId);
      console.log('✅ Patient profile retrieved:', profile);

      if (!profile) {
        // Log d'échec de récupération du profil
        await logAccess({
          patient_id: validation.userId,
          doctor_id: doctorId,
          action: 'profile_fetch_failed',
          details: {
            error: 'Patient profile not found',
            patient_id: validation.userId,
            timestamp: new Date().toISOString()
          },
          ip_address: 'camera_scan'
        });

        toast({
          variant: "destructive",
          title: "Patient introuvable",
          description: "Impossible de trouver les informations du patient."
        });
        return;
      }

      if (profile.access_status === 'restricted') {
        // Log d'accès restreint
        await logAccess({
          patient_id: validation.userId,
          doctor_id: doctorId,
          action: 'access_restricted',
          details: {
            patient_name: profile.name || profile.email,
            access_status: profile.access_status,
            timestamp: new Date().toISOString()
          },
          ip_address: 'camera_scan'
        });

        toast({
          variant: "destructive",
          title: "Accès restreint",
          description: "L'accès au dossier de ce patient a été restreint."
        });
        return;
      }

      console.log('🔄 Creating doctor session...');
      const session = await createDoctorSession(validation.userId, doctorId, validation.qrCodeId);
      console.log('✅ Doctor session created:', session);

      // Log de succès d'accès
      await logAccess({
        patient_id: validation.userId,
        doctor_id: doctorId,
        action: 'qr_access_granted',
        details: {
          patient_name: profile.name || profile.email,
          session_id: session.id,
          qr_code_id: validation.qrCodeId,
          access_method: 'qr_scan',
          session_duration: '30_minutes',
          timestamp: new Date().toISOString()
        },
        ip_address: 'camera_scan'
      });

      const patientData = {
        profile: {
          ...profile,
          user_id: validation.userId
        },
        qrCodeId: validation.qrCodeId,
        sessionId: session.id
      };

      console.log('✅ Sending patient data to parent:', patientData);

      onScanSuccess(patientData);

      toast({
        title: "QR Code scanné avec succès",
        description: `Accès accordé à ${profile.name || profile.email} pour 30 minutes`
      });

    } catch (error: any) {
      console.error('❌ Error processing QR code:', error);
      
      // Log d'erreur système
      await logAccess({
        patient_id: 'unknown',
        doctor_id: doctorId,
        action: 'qr_scan_error',
        details: {
          error: error?.message || 'Erreur inconnue',
          qr_code_data: qrCodeData,
          timestamp: new Date().toISOString()
        },
        ip_address: 'camera_scan'
      });

      toast({
        variant: "destructive",
        title: "Erreur de scan",
        description: `Impossible de traiter le QR code: ${error?.message || 'Erreur inconnue'}`
      });
    } finally {
      setLoading(false);
    }
  };

  const stopScanning = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsScanning(false);
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      {!isScanning ? (
        <Button 
          onClick={startVideoScanning}
          className="w-full flex items-center gap-2"
          disabled={loading}
        >
          <Camera size={16} />
          {loading ? 'Vérification des permissions...' : 'Démarrer le scan vidéo'}
        </Button>
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Scan size={16} />
              Scanner en cours...
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={stopScanning}
              disabled={loading}
            >
              <X size={16} />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full h-64 bg-black rounded object-cover"
                playsInline
                muted
                autoPlay
              />
              <canvas
                ref={canvasRef}
                className="hidden"
              />
              {loading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded">
                  <div className="text-white text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                    <p>Initialisation de la caméra...</p>
                  </div>
                </div>
              )}
              {/* Cadre de visée pour le QR code */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 border-2 border-white rounded-lg relative">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground text-center mt-2">
              Pointez la caméra vers le QR code du patient
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QRCodeScanner;
