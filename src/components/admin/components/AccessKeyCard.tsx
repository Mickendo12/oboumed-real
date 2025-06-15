
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Key, Copy, AlertCircle } from 'lucide-react';
import { QRCode } from '@/services/supabaseService';

interface AccessKeyCardProps {
  qrCode: QRCode;
  onCopy: (text: string, type: string) => void;
}

const AccessKeyCard: React.FC<AccessKeyCardProps> = ({ qrCode, onCopy }) => {
  return (
    <Card className="w-full">
      <CardHeader className="pb-1 xs:pb-2 sm:pb-3 lg:pb-4 px-2 xs:px-3 sm:px-4 lg:px-6 pt-2 xs:pt-3 sm:pt-4 lg:pt-6">
        <CardTitle className="flex items-center gap-1 xs:gap-1.5 sm:gap-2">
          <Key size={12} className="xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
          <span className="font-medium text-[10px] xs:text-xs sm:text-sm lg:text-base">Clé d'accès médecin</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1.5 xs:space-y-2 sm:space-y-3 lg:space-y-4 px-2 xs:px-3 sm:px-4 lg:px-6 pb-2 xs:pb-3 sm:pb-4 lg:pb-6">
        <div className="space-y-1 xs:space-y-1.5 sm:space-y-2">
          <p className="text-[8px] xs:text-[9px] sm:text-[10px] lg:text-xs font-medium">Clé d'accès:</p>
          <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-1 xs:gap-1.5 sm:gap-2">
            <code className="flex-1 p-1.5 xs:p-2 sm:p-3 bg-blue-50 dark:bg-blue-900/20 rounded font-mono text-[7px] xs:text-[8px] sm:text-[9px] lg:text-[10px] break-all border-2 border-blue-200 dark:border-blue-700 min-h-[2rem] xs:min-h-[2.5rem] sm:min-h-0 leading-tight">
              {qrCode.access_key}
            </code>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onCopy(qrCode.access_key, 'Clé d\'accès')}
              className="w-full xs:w-auto px-1.5 xs:px-2 sm:px-3 py-1 xs:py-1.5 h-auto text-[8px] xs:text-[9px] sm:text-[10px]"
            >
              <Copy size={8} className="xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 lg:w-3.5 lg:h-3.5" />
              <span className="ml-0.5 xs:hidden">Copier</span>
            </Button>
          </div>
        </div>
        
        <div className="space-y-0.5 xs:space-y-1 sm:space-y-2">
          <p className="text-[7px] xs:text-[8px] sm:text-[9px] lg:text-[10px] text-muted-foreground leading-tight">
            <strong>Créé le:</strong> {new Date(qrCode.created_at).toLocaleString('fr-FR')}
          </p>
          <p className="text-[7px] xs:text-[8px] sm:text-[9px] lg:text-[10px] text-muted-foreground leading-tight">
            <strong>Expire le:</strong> {new Date(qrCode.expires_at).toLocaleString('fr-FR')}
          </p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-1.5 xs:p-2 sm:p-3 rounded">
          <div className="flex items-start gap-1 xs:gap-1.5 sm:gap-2">
            <AlertCircle size={10} className="text-blue-600 mt-0.5 flex-shrink-0 xs:w-3 xs:h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" />
            <div className="text-[8px] xs:text-[9px] sm:text-[10px] lg:text-xs text-blue-800 dark:text-blue-200">
              <p className="font-medium mb-0.5 xs:mb-1 leading-tight">Pour les médecins uniquement:</p>
              <p className="leading-relaxed">Cette clé permet d'accéder au dossier médical complet du patient depuis l'interface médecin.</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccessKeyCard;
