
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, X, Scan, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { validateQRCode, getUserProfile, createDoctorSession } from '@/services/supabaseService';
import jsQR from 'jsqr';
import { Camera as CapacitorCamera, CameraResultType, CameraSource } from '@capacitor/camera';

interface QRCodeScannerProps {
  onScanSuccess: (patientData: any) => void;
  doctorId: string;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onScanSuccess, doctorId }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [useWebCamera, setUseWebCamera] = useState(false);
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

  const takePictureWithCapacitor = async () => {
    try {
      setLoading(true);
      
      const image = await CapacitorCamera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        saveToGallery: false
      });

      if (image.dataUrl) {
        await processImageForQR(image.dataUrl);
      }
    } catch (error: any) {
      console.error('Erreur Capacitor Camera:', error);
      
      // Fallback vers la caméra web si Capacitor échoue
      if (error.message?.includes('not available') || error.message?.includes('not implemented')) {
        toast({
          title: "Utilisation de la caméra web",
          description: "Passage à la caméra web..."
        });
        setUseWebCamera(true);
        startWebCameraScanning();
      } else {
        toast({
          variant: "destructive",
          title: "Erreur caméra",
          description: "Impossible d'accéder à la caméra. Vérifiez les permissions."
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const processImageForQR = async (imageDataUrl: string) => {
    try {
      setLoading(true);
      
      // Créer un canvas pour traiter l'image
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) return;
        
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        
        if (code) {
          console.log('QR Code détecté:', code.data);
          handleQRCodeDetected(code.data);
        } else {
          toast({
            variant: "destructive",
            title: "QR Code non détecté",
            description: "Aucun QR code trouvé dans l'image. Essayez à nouveau."
          });
          setLoading(false);
        }
      };
      
      img.src = imageDataUrl;
    } catch (error) {
      console.error('Erreur traitement image:', error);
      toast({
        variant: "destructive",
        title: "Erreur de traitement",
        description: "Impossible de traiter l'image."
      });
      setLoading(false);
    }
  };

  const startWebCameraScanning = async () => {
    try {
      setIsScanning(true);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        
        videoRef.current.onloadedmetadata = () => {
          startQRDetection();
        };
      }
    } catch (error) {
      console.error('Erreur accès caméra web:', error);
      toast({
        variant: "destructive",
        title: "Erreur caméra web",
        description: "Impossible d'accéder à la caméra web. Vérifiez les permissions."
      });
      setIsScanning(false);
      setUseWebCamera(false);
    }
  };

  const startQRDetection = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }

    scanIntervalRef.current = window.setInterval(() => {
      scanForQRCode();
    }, 100);
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
      console.log('QR Code détecté:', code.data);
      handleQRCodeDetected(code.data);
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
          description: "Ce QR code n'est pas valide ou a expiré."
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
    setUseWebCamera(false);
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      {!isScanning && !loading ? (
        <div className="space-y-3">
          <Button 
            onClick={takePictureWithCapacitor}
            className="w-full flex items-center gap-2"
            disabled={loading}
          >
            <Camera size={16} />
            Scanner avec la caméra
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => {
              setUseWebCamera(true);
              startWebCameraScanning();
            }}
            className="w-full flex items-center gap-2"
            disabled={loading}
          >
            <Scan size={16} />
            Utiliser la caméra web
          </Button>
        </div>
      ) : loading && !isScanning ? (
        <Card>
          <CardContent className="flex items-center justify-center p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm">Traitement de l'image...</p>
            </div>
          </CardContent>
        </Card>
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
              />
              <canvas
                ref={canvasRef}
                className="hidden"
              />
              {loading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded">
                  <div className="text-white text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                    <p>Traitement du QR code...</p>
                  </div>
                </div>
              )}
              <div className="absolute inset-0 border-2 border-white rounded opacity-50 pointer-events-none">
                <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-primary"></div>
                <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-primary"></div>
                <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-primary"></div>
                <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-primary"></div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground text-center mt-2">
              {useWebCamera ? 
                "Pointez la caméra vers le QR code du patient" : 
                "Mode caméra web - Pointez vers le QR code"
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QRCodeScanner;
