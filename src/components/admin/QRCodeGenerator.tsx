
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, Download, User } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import * as QRCode from 'qrcode';
import { generateQRCodeForUser } from '@/services/supabaseService';

interface QRCodeGeneratorProps {
  userId: string;
  userName: string;
  userEmail: string;
  isOpen: boolean;
  onClose: () => void;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ 
  userId, 
  userName, 
  userEmail, 
  isOpen, 
  onClose 
}) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [qrCodeText, setQrCodeText] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateQRCode = async () => {
    try {
      setLoading(true);
      
      // Générer le code QR dans la base de données
      const qrCodeRecord = await generateQRCodeForUser(userId);
      setQrCodeText(qrCodeRecord.qr_code);
      
      // Générer l'image QR code
      const qrCodeImage = await QRCode.toDataURL(qrCodeRecord.qr_code, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      setQrCodeDataUrl(qrCodeImage);
      
      toast({
        title: "QR Code généré",
        description: "Le code QR a été généré avec succès."
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de générer le code QR."
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeDataUrl) return;
    
    const link = document.createElement('a');
    link.download = `qr-code-${userName || userEmail}.png`;
    link.href = qrCodeDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "QR Code téléchargé",
      description: "Le code QR a été téléchargé avec succès."
    });
  };

  const handleClose = () => {
    setQrCodeDataUrl('');
    setQrCodeText('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode size={20} />
            Générer un QR Code
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <User size={16} />
                Informations du patient
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-1 text-sm">
                <p><strong>Nom :</strong> {userName || 'Non renseigné'}</p>
                <p><strong>Email :</strong> {userEmail}</p>
                <p><strong>ID :</strong> {userId}</p>
              </div>
            </CardContent>
          </Card>

          {!qrCodeDataUrl ? (
            <Button 
              onClick={generateQRCode} 
              disabled={loading}
              className="w-full"
            >
              <QrCode size={16} className="mr-2" />
              {loading ? 'Génération...' : 'Générer le QR Code'}
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-center">
                <img 
                  src={qrCodeDataUrl} 
                  alt="QR Code" 
                  className="border rounded-lg"
                />
              </div>
              
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Code QR valide pour 24h
                </p>
                <p className="text-xs font-mono bg-muted p-2 rounded">
                  {qrCodeText}
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={downloadQRCode}
                  className="flex-1"
                >
                  <Download size={16} className="mr-2" />
                  Télécharger
                </Button>
                <Button 
                  onClick={generateQRCode}
                  variant="outline"
                  className="flex-1"
                >
                  <QrCode size={16} className="mr-2" />
                  Régénérer
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeGenerator;
