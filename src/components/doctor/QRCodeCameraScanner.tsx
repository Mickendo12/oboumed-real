
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Camera, X, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { validateQRCode } from '@/services/supabaseService';
import { Capacitor } from '@capacitor/core';
import { Camera as CapacitorCamera, CameraResultType, CameraSource } from '@capacitor/camera';

interface QRCodeCameraScannerProps {
  onPatientFound: (userId: string) => void;
}

const QRCodeCameraScanner: React.FC<QRCodeCameraScannerProps> = ({ onPatientFound }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  // Scanner QR Code à partir d'une image (simulation OCR)
  const scanQRFromImage = async (imageData: string): Promise<string | null> => {
    // Simulation de scan QR - en réalité, vous utiliseriez une vraie bibliothèque QR
    // comme jsQR ou intégreriez un service OCR spécialisé
    
    // Pour la démo, on simule un QR code valide
    const mockQRCodes = [
      'qr_user_123456',
      'qr_patient_789012',
      'medical_access_345678'
    ];
    
    // Simulation de délai de traitement
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Retourner un QR code simulé (en production, analyser vraiment l'image)
    return mockQRCodes[Math.floor(Math.random() * mockQRCodes.length)];
  };

  const initializeCamera = async () => {
    try {
      setError(null);
      setIsScanning(true);

      if (Capacitor.isNativePlatform()) {
        // Utiliser Capacitor Camera sur mobile
        const image = await CapacitorCamera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.DataUrl,
          source: CameraSource.Camera,
        });

        if (image.dataUrl) {
          setCapturedImage(image.dataUrl);
          await processQRCode(image.dataUrl);
        }
      } else {
        // Utiliser WebRTC sur web
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
        }
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setError('Impossible d\'accéder à la caméra. Vérifiez les permissions.');
      setIsScanning(false);
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    const imageData = canvas.toDataURL('image/jpeg');
    setCapturedImage(imageData);
    await processQRCode(imageData);
  };

  const processQRCode = async (imageData: string) => {
    try {
      setError(null);
      
      // Scanner le QR code depuis l'image
      const qrCode = await scanQRFromImage(imageData);
      
      if (!qrCode) {
        setError('Aucun QR code détecté. Veuillez réessayer.');
        setIsScanning(false);
        return;
      }

      // Valider le QR code avec Supabase
      const validation = await validateQRCode(qrCode);
      
      if (!validation.valid || !validation.userId) {
        setError('QR code invalide ou expiré.');
        setIsScanning(false);
        return;
      }

      // QR code valide, accéder au patient
      toast({
        title: "QR Code scanné",
        description: "Accès patient autorisé."
      });
      
      onPatientFound(validation.userId);
      handleClose();
      
    } catch (error) {
      console.error('Error processing QR code:', error);
      setError('Erreur lors du traitement du QR code.');
      setIsScanning(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsScanning(false);
    setError(null);
    setCapturedImage(null);
    
    // Arrêter le stream vidéo
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const handleStartScan = () => {
    setIsOpen(true);
    initializeCamera();
  };

  return (
    <>
      <Button onClick={handleStartScan} className="w-full">
        <Camera className="w-4 h-4 mr-2" />
        Scanner QR Code Patient
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Scanner QR Code Patient</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-red-800">
                    <AlertCircle className="w-4 h-4" />
                    <p className="text-sm">{error}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {capturedImage ? (
              <div className="space-y-4">
                <div className="text-center">
                  <img 
                    src={capturedImage} 
                    alt="Photo capturée" 
                    className="max-w-full h-48 object-cover rounded-lg mx-auto"
                  />
                </div>
                {isScanning && (
                  <div className="text-center">
                    <div className="animate-pulse text-sm text-gray-600">
                      Analyse du QR code en cours...
                    </div>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setCapturedImage(null);
                      setError(null);
                      initializeCamera();
                    }}
                    disabled={isScanning}
                    className="flex-1"
                  >
                    Reprendre photo
                  </Button>
                  {!isScanning && (
                    <Button 
                      onClick={() => processQRCode(capturedImage)}
                      className="flex-1"
                    >
                      Analyser QR
                    </Button>
                  )}
                </div>
              </div>
            ) : !Capacitor.isNativePlatform() ? (
              <div className="space-y-4">
                <div className="relative">
                  <video 
                    ref={videoRef}
                    autoPlay 
                    playsInline
                    className="w-full h-64 object-cover rounded-lg bg-gray-100"
                  />
                  <canvas 
                    ref={canvasRef}
                    className="hidden"
                  />
                  
                  {/* Overlay de guidage */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="border-2 border-white border-dashed w-48 h-48 rounded-lg"></div>
                  </div>
                </div>
                
                <div className="text-center text-sm text-gray-600">
                  Positionnez le QR code dans le cadre et appuyez sur le bouton
                </div>
                
                <Button 
                  onClick={capturePhoto}
                  disabled={isScanning}
                  className="w-full"
                >
                  {isScanning ? 'Traitement...' : 'Capturer QR Code'}
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <Camera className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-sm text-gray-600">
                  {isScanning ? 'Ouverture de la caméra...' : 'Prêt à scanner'}
                </p>
              </div>
            )}

            <Button variant="outline" onClick={handleClose} className="w-full">
              <X className="w-4 h-4 mr-2" />
              Annuler
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QRCodeCameraScanner;
