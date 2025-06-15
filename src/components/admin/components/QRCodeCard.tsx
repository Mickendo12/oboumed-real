
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, Copy, CheckCircle } from 'lucide-react';
import QRCodeDisplay from '../QRCodeDisplay';
import { QRCode } from '@/services/supabaseService';

interface QRCodeCardProps {
  qrCode: QRCode;
  onCopy: (text: string, type: string) => void;
}

const QRCodeCard: React.FC<QRCodeCardProps> = ({ qrCode, onCopy }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode size={20} />
          Code QR généré
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <QRCodeDisplay 
          value={`${window.location.origin}/qr/${qrCode.qr_code}`}
          size={200}
        />
        <div className="space-y-2">
          <p className="text-sm font-medium">URL du QR Code:</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs break-all">
              {window.location.origin}/qr/{qrCode.qr_code}
            </code>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onCopy(`${window.location.origin}/qr/${qrCode.qr_code}`, 'URL')}
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
