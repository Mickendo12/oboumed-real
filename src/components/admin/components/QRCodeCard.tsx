
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
    <Card className="w-full">
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
          <div className="flex items-center gap-2">
            <QrCode size={18} className="sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">Code QR généré</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={downloadQRCode}
            className="flex items-center gap-1 text-xs sm:text-sm w-full sm:w-auto"
          >
            <Download size={12} className="sm:w-3.5 sm:h-3.5" />
            <span className="hidden xs:inline">Télécharger PNG</span>
            <span className="xs:hidden">PNG</span>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        <div ref={qrCardRef} className="bg-white rounded-lg border inline-block w-full flex justify-center">
          <div className="flex flex-col items-center text-center p-2 sm:p-3">
            {/* QR Code */}
            <QRCodeDisplay 
              value={secureUrl}
              size={100}
              className="sm:w-[120px] sm:h-[120px]"
            />
            
            {/* Informations minimalistes sous le QR code */}
            <div className="px-1 sm:px-2 pb-1 space-y-0 mt-1">
              <div className="text-[8px] sm:text-[9px] font-medium text-blue-600 uppercase tracking-wide break-words">
                {userName || 'NOM NON RENSEIGNÉ'}
              </div>
              <div className="text-[7px] sm:text-[8px] text-gray-600">
                Dossier Médical - ObouMed
              </div>
              <div className="text-[7px] sm:text-[8px] font-mono text-gray-800 break-all">
                {qrCode.access_key}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs sm:text-sm font-medium">URL du QR Code:</p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <code className="flex-1 p-2 bg-gray-100 dark:bg-gray-800 rounded text-[10px] sm:text-xs break-all min-h-[2.5rem] sm:min-h-0 overflow-hidden">
              {secureUrl}
            </code>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onCopy(secureUrl, 'URL')}
              className="w-full sm:w-auto"
            >
              <Copy size={12} className="sm:w-3.5 sm:h-3.5" />
              <span className="ml-1 sm:hidden">Copier</span>
            </Button>
          </div>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
          <div className="flex items-start gap-2">
            <CheckCircle size={14} className="text-green-600 mt-0.5 flex-shrink-0 sm:w-4 sm:h-4" />
            <p className="text-xs sm:text-sm text-green-800 dark:text-green-200 leading-relaxed">
              Scanner ce QR code donne accès au dossier médical public du patient.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QRCodeCard;
