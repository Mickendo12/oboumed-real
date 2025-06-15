
import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, Copy, CheckCircle, Download } from 'lucide-react';
import QRCodeDisplay from '../QRCodeDisplay';
import { QRCode } from '@/services/supabaseService';
import { generateSecureQRUrl } from '@/utils/urlEncryption';

interface QRCodeCardProps {
  qrCode: QRCode;
  userName: string;
  userEmail: string;
  onCopy: (text: string, type: string) => void;
}

const QRCodeCard: React.FC<QRCodeCardProps> = ({ qrCode, userName, userEmail, onCopy }) => {
  const qrCardRef = useRef<HTMLDivElement>(null);
  const secureUrl = generateSecureQRUrl(qrCode.qr_code);

  const downloadQRCode = async () => {
    if (!qrCardRef.current) return;

    try {
      // Utilisation de html2canvas pour capturer le contenu
      const html2canvas = await import('html2canvas');
      const canvas = await html2canvas.default(qrCardRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true
      });

      // Créer un lien de téléchargement
      const link = document.createElement('a');
      link.download = `qr-code-${userName || userEmail}-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode size={20} />
            Code QR généré
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={downloadQRCode}
            className="flex items-center gap-1"
          >
            <Download size={14} />
            Télécharger PNG
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div ref={qrCardRef} className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-center gap-6">
            {/* Informations à gauche */}
            <div className="flex flex-col justify-center text-left space-y-1 min-w-0 flex-1">
              <div className="text-xs font-medium text-gray-900 truncate">
                {userName || 'Nom non renseigné'}
              </div>
              <div className="text-[10px] text-gray-600 truncate">
                {userEmail}
              </div>
            </div>

            {/* QR Code au centre */}
            <div className="flex-shrink-0">
              <QRCodeDisplay 
                value={secureUrl}
                size={160}
              />
            </div>

            {/* Clé d'accès à droite */}
            <div className="flex flex-col justify-center text-right space-y-1 min-w-0 flex-1">
              <div className="text-[10px] text-gray-500">
                Clé d'accès
              </div>
              <div className="text-xs font-mono text-gray-800 bg-gray-100 px-1 py-0.5 rounded text-center">
                {qrCode.access_key}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">URL du QR Code:</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs break-all">
              {secureUrl}
            </code>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onCopy(secureUrl, 'URL')}
            >
              <Copy size={14} />
            </Button>
          </div>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
          <div className="flex items-start gap-2">
            <CheckCircle size={16} className="text-green-600 mt-0.5" />
            <p className="text-sm text-green-800 dark:text-green-200">
              Scanner ce QR code donne accès au dossier médical public du patient.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QRCodeCard;
