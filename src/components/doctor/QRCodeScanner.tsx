
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { QrCode, Type, Camera, AlertCircle } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Camera as CapacitorCamera, CameraResultType, CameraSource } from '@capacitor/camera';

interface QRCodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (qrCode: string) => void;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ isOpen, onClose, onScan }) => {
  const [manualCode, setManualCode] = useState('');
  const [mode, setMode] = useState<'scan' | 'manual'>('scan');
  const [isNative, setIsNative] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    setIsNative(Capacitor.isNativePlatform());
  }, []);

  const handleNativeScan = async () => {
    if (!isNative) {
      setError('Scan natif disponible uniquement sur mobile');
      return;
    }

    try {
      setScanning(true);
      setError('');

      // Demander les permissions de caméra
      const permissions = await CapacitorCamera.checkPermissions();
      if (permissions.camera !== 'granted') {
        const requestResult = await CapacitorCamera.requestPermissions();
        if (requestResult.camera !== 'granted') {
          setError('Permission caméra refusée');
          return;
        }
      }

      // Prendre une photo pour scanner le QR code
      const image = await CapacitorCamera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        promptLabelHeader: 'Scanner QR Code',
        promptLabelPhoto: 'Prendre une photo du QR code',
        promptLabelPicture: 'Choisir depuis la galerie'
      });

      if (image.dataUrl) {
        // Ici, nous devrions normalement décoder le QR code depuis l'image
        // Pour l'instant, on demande à l'utilisateur de saisir manuellement
        setMode('manual');
        setError('Veuillez saisir le code QR manuellement après avoir pris la photo');
      }
    } catch (error) {
      console.error('Erreur lors du scan:', error);
      setError('Erreur lors du scan. Veuillez utiliser la saisie manuelle.');
      setMode('manual');
    } finally {
      setScanning(false);
    }
  };

  const handleWebScan = () => {
    // Pour le web, on redirige vers la saisie manuelle
    setMode('manual');
    setError('Scan web en développement. Utilisez la saisie manuelle.');
  };

  const handleScan = () => {
    if (isNative) {
      handleNativeScan();
    } else {
      handleWebScan();
    }
  };

  const handleManualSubmit = () => {
    if (manualCode.trim()) {
      onScan(manualCode.trim());
      setManualCode('');
      setError('');
    }
  };

  const handleClose = () => {
    setManualCode('');
    setError('');
    setScanning(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scanner un code QR</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle size={16} />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button
              variant={mode === 'scan' ? 'default' : 'outline'}
              onClick={() => setMode('scan')}
              className="flex-1"
            >
              <Camera size={16} className="mr-2" />
              {isNative ? 'Caméra' : 'Scanner'}
            </Button>
            <Button
              variant={mode === 'manual' ? 'default' : 'outline'}
              onClick={() => setMode('manual')}
              className="flex-1"
            >
              <Type size={16} className="mr-2" />
              Manuel
            </Button>
          </div>

          {mode === 'scan' && (
            <div className="text-center py-8">
              {isNative ? (
                <div className="space-y-4">
                  <Camera size={64} className="mx-auto mb-4 text-primary" />
                  <p className="text-muted-foreground mb-4">
                    Appuyez sur le bouton pour ouvrir la caméra et scanner le QR code
                  </p>
                  <Button 
                    onClick={handleScan}
                    disabled={scanning}
                    size="lg"
                  >
                    <Camera size={20} className="mr-2" />
                    {scanning ? 'Scan en cours...' : 'Ouvrir la caméra'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <QrCode size={64} className="mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">
                    Scanner QR web en cours de développement.
                  </p>
                  <Button 
                    onClick={handleScan}
                    variant="outline"
                  >
                    <QrCode size={16} className="mr-2" />
                    Scanner (Web)
                  </Button>
                </div>
              )}
            </div>
          )}

          {mode === 'manual' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="qr-code">Code QR</Label>
                <Input
                  id="qr-code"
                  placeholder="Saisissez le code QR..."
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleManualSubmit()}
                />
              </div>
              <Button onClick={handleManualSubmit} className="w-full">
                Valider
              </Button>
            </div>
          )}

          {isNative && (
            <div className="text-xs text-muted-foreground text-center">
              Application native détectée - Caméra disponible
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeScanner;
