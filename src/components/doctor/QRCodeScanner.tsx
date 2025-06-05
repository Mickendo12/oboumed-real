
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QrCode, Type } from 'lucide-react';

interface QRCodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (qrCode: string) => void;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ isOpen, onClose, onScan }) => {
  const [manualCode, setManualCode] = useState('');
  const [mode, setMode] = useState<'scan' | 'manual'>('manual');

  const handleManualSubmit = () => {
    if (manualCode.trim()) {
      onScan(manualCode.trim());
      setManualCode('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scanner un code QR</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={mode === 'scan' ? 'default' : 'outline'}
              onClick={() => setMode('scan')}
              className="flex-1"
            >
              <QrCode size={16} className="mr-2" />
              Scanner
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
              <QrCode size={64} className="mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                Fonctionnalité de scan en cours de développement.
                Utilisez la saisie manuelle pour le moment.
              </p>
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeScanner;
