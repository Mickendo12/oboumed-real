
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
      <CardHeader className="pb-2 sm:pb-3 md:pb-4 px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 md:pt-6">
        <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base">
          <Key size={16} className="sm:w-4 sm:h-4 md:w-5 md:h-5" />
          <span className="font-medium">Clé d'accès médecin</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 sm:space-y-3 md:space-y-4 px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
        <div className="space-y-1.5 sm:space-y-2">
          <p className="text-[10px] sm:text-xs md:text-sm font-medium">Clé d'accès:</p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 sm:gap-2">
            <code className="flex-1 p-2 sm:p-3 bg-blue-50 dark:bg-blue-900/20 rounded font-mono text-[10px] sm:text-xs md:text-sm break-all border-2 border-blue-200 dark:border-blue-700 min-h-[2.5rem] sm:min-h-0 leading-tight">
              {qrCode.access_key}
            </code>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onCopy(qrCode.access_key, 'Clé d\'accès')}
              className="w-full sm:w-auto px-2 sm:px-3 py-1 sm:py-1.5 h-auto text-[10px] sm:text-xs"
            >
              <Copy size={10} className="sm:w-3 sm:h-3 md:w-3.5 md:h-3.5" />
              <span className="ml-1 sm:hidden">Copier</span>
            </Button>
          </div>
        </div>
        
        <div className="space-y-1 sm:space-y-2">
          <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground leading-tight">
            <strong>Créé le:</strong> {new Date(qrCode.created_at).toLocaleString('fr-FR')}
          </p>
          <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground leading-tight">
            <strong>Expire le:</strong> {new Date(qrCode.expires_at).toLocaleString('fr-FR')}
          </p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-2 sm:p-3 rounded-lg">
          <div className="flex items-start gap-1.5 sm:gap-2">
            <AlertCircle size={12} className="text-blue-600 mt-0.5 flex-shrink-0 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
            <div className="text-[10px] sm:text-xs md:text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium mb-1 leading-tight">Pour les médecins uniquement:</p>
              <p className="leading-relaxed">Cette clé permet d'accéder au dossier médical complet du patient depuis l'interface médecin.</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccessKeyCard;
