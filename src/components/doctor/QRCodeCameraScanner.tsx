
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Square } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { validateQRCode } from '@/services/supabaseService';

interface QRCodeCameraScannerProps {
  onScanResult: (patientId: string) => void;
}

const QRCodeCameraScanner: React.FC<QRCodeCameraScannerProps> = ({ onScanResult }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      setIsScanning(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        variant: "destructive",
        title: "Erreur caméra",
        description: "Impossible d'accéder à la caméra."
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsScanning(false);
  };

  const captureAndAnalyze = async () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) return;

    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0);

    // Simuler l'analyse du QR code (dans une vraie app, utiliser une lib de scan QR)
    const imageData = canvas.toDataURL();
    
    // Pour la démo, on simule un QR code valide
    toast({
      title: "Scan en cours...",
      description: "Analyse de l'image en cours."
    });

    // Simuler une analyse
    setTimeout(async () => {
      try {
        // Dans une vraie implémentation, extraire le QR code de l'image
        const mockQRCode = "sample_qr_code_123";
        const validation = await validateQRCode(mockQRCode);
        
        if (validation.valid && validation.userId) {
          onScanResult(validation.userId);
          stopCamera();
        } else {
          toast({
            variant: "destructive",
            title: "QR Code invalide",
            description: "Le QR code scanné n'est pas valide ou a expiré."
          });
        }
      } catch (error) {
        console.error('Error analyzing QR code:', error);
        toast({
          variant: "destructive",
          title: "Erreur d'analyse",
          description: "Impossible d'analyser le QR code."
        });
      }
    }, 2000);
  };

  return (
    <div className="space-y-4">
      {!isScanning ? (
        <Button onClick={startCamera} className="w-full">
          <Camera className="w-4 h-4 mr-2" />
          Démarrer la caméra
        </Button>
      ) : (
        <div className="space-y-4">
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-64 object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Square className="w-32 h-32 text-white opacity-50" strokeWidth={2} />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={captureAndAnalyze} className="flex-1">
              <Square className="w-4 h-4 mr-2" />
              Scanner QR Code
            </Button>
            <Button onClick={stopCamera} variant="outline">
              Arrêter
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRCodeCameraScanner;
