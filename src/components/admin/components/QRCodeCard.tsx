
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
      const html2canvas = await import('html2canvas');
      const canvas = await html2canvas.default(qrCardRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true
      });

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
      <CardHeader className="pb-2 sm:pb-3 md:pb-4 px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 md:pt-6">
        <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <QrCode size={16} className="sm:w-4 sm:h-4 md:w-5 md:h-5" />
            <span className="text-xs sm:text-sm md:text-base font-medium">Code QR généré</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={downloadQRCode}
            className="flex items-center gap-1 text-[10px] sm:text-xs md:text-sm w-full sm:w-auto px-2 sm:px-3 py-1 sm:py-1.5 h-auto"
          >
            <Download size={10} className="sm:w-3 sm:h-3 md:w-3.5 md:h-3.5" />
            <span className="hidden xs:inline">Télécharger PNG</span>
            <span className="xs:hidden">PNG</span>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 sm:space-y-3 md:space-y-4 px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
        <div ref={qrCardRef} className="bg-white rounded-lg border inline-block w-full flex justify-center">
          <div className="flex flex-col items-center text-center p-2 sm:p-3 md:p-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32">
              <QRCodeDisplay 
                value={secureUrl}
                size={80}
              />
            </div>
            
            <div className="px-1 sm:px-2 pb-1 space-y-0 mt-1 sm:mt-2">
              <div className="text-[7px] sm:text-[8px] md:text-[9px] lg:text-[10px] font-medium text-blue-600 uppercase tracking-wide break-words max-w-[80px] sm:max-w-[100px] md:max-w-[120px]">
                {userName || 'NOM NON RENSEIGNÉ'}
              </div>
              <div className="text-[6px] sm:text-[7px] md:text-[8px] text-gray-600">
                Dossier Médical - ObouMed
              </div>
              <div className="text-[6px] sm:text-[7px] md:text-[8px] font-mono text-gray-800 break-all max-w-[80px] sm:max-w-[100px] md:max-w-[120px]">
                {qrCode.access_key}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-1.5 sm:space-y-2">
          <p className="text-[10px] sm:text-xs md:text-sm font-medium">URL du QR Code:</p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 sm:gap-2">
            <code className="flex-1 p-1.5 sm:p-2 bg-gray-100 dark:bg-gray-800 rounded text-[8px] sm:text-[10px] md:text-xs break-all min-h-[2rem] sm:min-h-[2.5rem] overflow-hidden leading-tight">
              {secureUrl}
            </code>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onCopy(secureUrl, 'URL')}
              className="w-full sm:w-auto px-2 sm:px-3 py-1 sm:py-1.5 h-auto text-[10px] sm:text-xs"
            >
              <Copy size={10} className="sm:w-3 sm:h-3" />
              <span className="ml-1 sm:hidden">Copier</span>
            </Button>
          </div>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 p-2 sm:p-3 rounded-lg">
          <div className="flex items-start gap-1.5 sm:gap-2">
            <CheckCircle size={12} className="text-green-600 mt-0.5 flex-shrink-0 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
            <p className="text-[10px] sm:text-xs md:text-sm text-green-800 dark:text-green-200 leading-relaxed">
              Scanner ce QR code donne accès au dossier médical public du patient.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QRCodeCard;
