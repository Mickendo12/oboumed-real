
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key size={20} />
          Clé d'accès médecin
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Clé d'accès:</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 p-3 bg-blue-50 dark:bg-blue-900/20 rounded font-mono text-sm break-all border-2 border-blue-200 dark:border-blue-700">
              {qrCode.access_key}
            </code>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onCopy(qrCode.access_key, 'Clé d\'accès')}
            >
              <Copy size={14} />
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            <strong>Créé le:</strong> {new Date(qrCode.created_at).toLocaleString('fr-FR')}
          </p>
          <p className="text-xs text-muted-foreground">
            <strong>Expire le:</strong> {new Date(qrCode.expires_at).toLocaleString('fr-FR')}
          </p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle size={16} className="text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium mb-1">Pour les médecins uniquement:</p>
              <p>Cette clé permet d'accéder au dossier médical complet du patient depuis l'interface médecin.</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccessKeyCard;
