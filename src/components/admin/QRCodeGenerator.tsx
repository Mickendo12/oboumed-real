
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, Download, User, ExternalLink, Key } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import QRCode from 'qrcode';
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
  const [accessKey, setAccessKey] = useState<string>('');
  const [publicUrl, setPublicUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateQRCode = async () => {
    try {
      setLoading(true);
      
      // Générer le code QR dans la base de données
      const qrCodeRecord = await generateQRCodeForUser(userId);
      setQrCodeText(qrCodeRecord.qr_code);
      setAccessKey(qrCodeRecord.access_key);
      
      // Créer une URL courte et sécurisée - juste le code sans préfixe
      const shortUrl = `${window.location.origin}/qr/${qrCodeRecord.qr_code}`;
      setPublicUrl(shortUrl);
      
      // Générer l'image QR code avec seulement le code
      const qrCodeImage = await QRCode.toDataURL(qrCodeRecord.qr_code, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });
      
      setQrCodeDataUrl(qrCodeImage);
      
      toast({
        title: "QR Code généré",
        description: "Le code QR d'accès médical a été généré avec succès."
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
    link.download = `qr-medical-record-${userName || userEmail}.png`;
    link.href = qrCodeDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "QR Code téléchargé",
      description: "Le code QR a été téléchargé avec succès."
    });
  };

  const copyAccessKey = async () => {
    if (!accessKey) return;
    
    try {
      await navigator.clipboard.writeText(accessKey);
      toast({
        title: "Clé d'accès copiée",
        description: "La clé d'accès au dossier médical a été copiée."
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de copier la clé d'accès."
      });
    }
  };

  const copyUrl = async () => {
    if (!publicUrl) return;
    
    try {
      await navigator.clipboard.writeText(publicUrl);
      toast({
        title: "Lien copié",
        description: "L'URL d'accès au dossier médical a été copiée."
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de copier le lien."
      });
    }
  };

  const handleClose = () => {
    setQrCodeDataUrl('');
    setQrCodeText('');
    setAccessKey('');
    setPublicUrl('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm sm:text-base">
            <QrCode size={20} />
            Générer un accès médical sécurisé
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
                <p className="break-all"><strong>Nom :</strong> {userName || 'Non renseigné'}</p>
                <p className="break-all"><strong>Email :</strong> {userEmail}</p>
                <p className="break-all text-xs"><strong>ID :</strong> {userId}</p>
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
              {loading ? 'Génération...' : 'Générer l\'accès médical sécurisé'}
            </Button>
          ) : (
            <div className="space-y-4">
              {/* Clé d'accès */}
              <Card className="bg-blue-50 dark:bg-blue-900/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2 text-blue-800 dark:text-blue-200">
                    <Key size={16} />
                    Clé d'accès médical
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-mono font-bold bg-white dark:bg-gray-800 p-3 rounded border">
                      {accessKey}
                    </div>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Cette clé permet aux médecins d'accéder au dossier médical sans scanner le QR code
                    </p>
                    <Button 
                      onClick={copyAccessKey}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      📋 Copier la clé d'accès
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* QR Code */}
              <div className="flex justify-center">
                <img 
                  src={qrCodeDataUrl} 
                  alt="QR Code d'accès médical" 
                  className="border rounded-lg max-w-full h-auto"
                  style={{ maxWidth: '280px' }}
                />
              </div>
              
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  QR Code médical sécurisé - Accès limité aux médecins autorisés (30 min par session)
                </p>
                <div className="text-xs font-mono bg-muted p-2 rounded break-all overflow-wrap-anywhere">
                  {publicUrl}
                </div>
                <p className="text-xs text-muted-foreground break-all">
                  Code: {qrCodeText}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  onClick={downloadQRCode}
                  className="flex-1"
                  size="sm"
                >
                  <Download size={16} className="mr-2" />
                  Télécharger QR
                </Button>
                <Button 
                  onClick={copyUrl}
                  variant="outline"
                  className="flex-1"
                  size="sm"
                >
                  📋 Copier le lien
                </Button>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  onClick={generateQRCode}
                  variant="secondary"
                  className="flex-1"
                  size="sm"
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
