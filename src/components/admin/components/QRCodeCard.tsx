
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
      <CardHeader className="pb-1 xs:pb-2 sm:pb-3 lg:pb-4 px-2 xs:px-3 sm:px-4 lg:px-6 pt-2 xs:pt-3 sm:pt-4 lg:pt-6">
        <CardTitle className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-1.5 xs:gap-2">
          <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2">
            <QrCode size={12} className="xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
            <span className="text-[10px] xs:text-xs sm:text-sm lg:text-base font-medium">Code QR généré</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={downloadQRCode}
            className="flex items-center gap-0.5 xs:gap-1 text-[8px] xs:text-[9px] sm:text-[10px] lg:text-xs w-full xs:w-auto px-1.5 xs:px-2 sm:px-3 py-1 xs:py-1.5 h-auto"
          >
            <Download size={8} className="xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 lg:w-3.5 lg:h-3.5" />
            <span className="hidden xxs:inline">Télécharger PNG</span>
            <span className="xxs:hidden">PNG</span>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1.5 xs:space-y-2 sm:space-y-3 lg:space-y-4 px-2 xs:px-3 sm:px-4 lg:px-6 pb-2 xs:pb-3 sm:pb-4 lg:pb-6">
        <div ref={qrCardRef} className="bg-white rounded border inline-block w-full flex justify-center">
          <div className="flex flex-col items-center text-center p-1.5 xs:p-2 sm:p-3 lg:p-4">
            <div className="w-16 h-16 xs:w-20 xs:h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 xl:w-32 xl:h-32">
              <QRCodeDisplay 
                value={secureUrl}
                size={64}
              />
            </div>
            
            <div className="px-0.5 xs:px-1 sm:px-2 pb-0.5 xs:pb-1 space-y-0 mt-0.5 xs:mt-1 sm:mt-2">
              <div className="text-[6px] xs:text-[7px] sm:text-[8px] lg:text-[9px] xl:text-[10px] font-medium text-blue-600 uppercase tracking-wide break-words max-w-[60px] xs:max-w-[80px] sm:max-w-[100px] lg:max-w-[120px]">
                {userName || 'NOM NON RENSEIGNÉ'}
              </div>
              <div className="text-[5px] xs:text-[6px] sm:text-[7px] lg:text-[8px] text-gray-600">
                Dossier Médical - ObouMed
              </div>
              <div className="text-[5px] xs:text-[6px] sm:text-[7px] lg:text-[8px] font-mono text-gray-800 break-all max-w-[60px] xs:max-w-[80px] sm:max-w-[100px] lg:max-w-[120px]">
                {qrCode.access_key}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-1 xs:space-y-1.5 sm:space-y-2">
          <p className="text-[8px] xs:text-[9px] sm:text-[10px] lg:text-xs font-medium">URL du QR Code:</p>
          <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-1 xs:gap-1.5 sm:gap-2">
            <code className="flex-1 p-1 xs:p-1.5 sm:p-2 bg-gray-100 dark:bg-gray-800 rounded text-[6px] xs:text-[7px] sm:text-[8px] lg:text-[10px] break-all min-h-[1.5rem] xs:min-h-[2rem] sm:min-h-[2.5rem] overflow-hidden leading-tight">
              {secureUrl}
            </code>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onCopy(secureUrl, 'URL')}
              className="w-full xs:w-auto px-1.5 xs:px-2 sm:px-3 py-1 xs:py-1.5 h-auto text-[8px] xs:text-[9px] sm:text-[10px]"
            >
              <Copy size={8} className="xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3" />
              <span className="ml-0.5 xs:hidden">Copier</span>
            </Button>
          </div>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 p-1.5 xs:p-2 sm:p-3 rounded">
          <div className="flex items-start gap-1 xs:gap-1.5 sm:gap-2">
            <CheckCircle size={10} className="text-green-600 mt-0.5 flex-shrink-0 xs:w-3 xs:h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" />
            <p className="text-[8px] xs:text-[9px] sm:text-[10px] lg:text-xs text-green-800 dark:text-green-200 leading-relaxed">
              Scanner ce QR code donne accès au dossier médical public du patient.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QRCodeCard;
