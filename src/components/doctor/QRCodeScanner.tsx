
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, X, Scan } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { validateQRCode, getUserProfile, createDoctorSession } from '@/services/supabaseService';
import jsQR from 'jsqr';

interface QRCodeScannerProps {
  onScanSuccess: (patientData: any) => void;
  doctorId: string;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onScanSuccess, doctorId }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [loading, setLoading] = useState(false);
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
      setIsScanning(true);
      setLoading(true);
      
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
      toast({
        variant: "destructive",
        title: "Erreur caméra",
        description: "Impossible d'accéder à la caméra. Vérifiez les permissions."
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

      const validation = await validateQRCode(qrCodeData);
      console.log('✅ QR code validation result:', validation);

      if (!validation.valid || !validation.userId) {
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
        toast({
          variant: "destructive",
          title: "Patient introuvable",
          description: "Impossible de trouver les informations du patient."
        });
        return;
      }

      if (profile.access_status === 'restricted') {
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
          Démarrer le scan vidéo
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
