
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { QrCode, Camera, Type, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { validateQRCode, getUserProfile } from '@/services/supabaseService';

interface QRCodeScannerProps {
  onScanSuccess: (patientData: any) => void;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onScanSuccess }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [loading, setLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
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
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        variant: "destructive",
        title: "Erreur caméra",
        description: "Impossible d'accéder à la caméra. Veuillez utiliser la saisie manuelle."
      });
    }
  };

  const processQRCode = async (qrCodeValue: string) => {
    try {
      setLoading(true);
      
      // Nettoyer le code QR (enlever les préfixes d'URL si présents)
      let cleanCode = qrCodeValue.trim();
      
      // Si c'est une URL de notre système, extraire le code
      if (cleanCode.includes('/qr/')) {
        const parts = cleanCode.split('/qr/');
        cleanCode = parts[parts.length - 1];
      }
      
      console.log('Code QR à traiter:', cleanCode);
      
      // Valider le QR code en base de données
      const validation = await validateQRCode(cleanCode);
      
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
      
      if (!profile) {
        toast({
          variant: "destructive",
          title: "Patient introuvable",
          description: "Impossible de trouver les informations du patient."
        });
        return;
      }
      
      // Vérifier si l'accès du patient n'est pas restreint
      if (profile.access_status === 'restricted') {
        toast({
          variant: "destructive",
          title: "Accès restreint",
          description: "L'accès au dossier de ce patient a été restreint par l'administration."
        });
        return;
      }
      
      // Données du patient pour l'accès
      const patientData = {
        profile: profile,
        qrCodeId: cleanCode
      };
      
      // Arrêter la caméra si elle était active
      stopCamera();
      
      // Notifier le composant parent
      onScanSuccess(patientData);
      
      toast({
        title: "Code QR valide",
        description: `Accès accordé au dossier de ${profile.name || profile.email}`
      });
      
    } catch (error) {
      console.error('Erreur lors du traitement du QR code:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de traiter le code QR."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = () => {
    if (!manualCode.trim()) {
      toast({
        variant: "destructive",
        title: "Code requis",
        description: "Veuillez saisir un code QR."
      });
      return;
    }
    
    processQRCode(manualCode.trim());
  };

  // Simulation d'un scan depuis la vidéo (pour demo - en production, utilisez une vraie librairie de scan)
  const simulateScan = () => {
    // En production, intégrez ici une vraie librairie de scan QR comme zxing-js
    toast({
      variant: "destructive",
      title: "Scanner non implémenté",
      description: "Veuillez utiliser la saisie manuelle pour le moment."
    });
    stopCamera();
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
                <label className="text-sm font-medium">Saisie manuelle du code :</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Saisissez le code QR..."
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleManualSubmit()}
                  />
                  <Button 
                    onClick={handleManualSubmit}
                    disabled={loading || !manualCode.trim()}
                  >
                    <Type size={16} className="mr-2" />
                    Scanner
                  </Button>
                </div>
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
              
              <div className="flex gap-2">
                <Button 
                  onClick={simulateScan}
                  className="flex-1"
                  disabled={loading}
                >
                  Scanner maintenant
                </Button>
                <Button 
                  onClick={stopCamera}
                  variant="outline"
                  disabled={loading}
                >
                  Arrêter
                </Button>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle size={16} className="text-blue-600 mt-0.5" />
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Positionnez le code QR dans le cadre blanc pour le scanner.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {loading && (
            <div className="text-center py-4">
              <div className="animate-pulse">Traitement du code QR...</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QRCodeScanner;
