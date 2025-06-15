
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Shield } from 'lucide-react';
import { decodeQRKey } from '@/utils/urlEncryption';

const SecureQRRedirect: React.FC = () => {
  const { qrCode } = useParams<{ qrCode: string }>();
  const [message, setMessage] = useState('Vérification en cours...');

  useEffect(() => {
    // Décoder la clé pour vérifier sa validité
    if (qrCode) {
      const decodedKey = decodeQRKey(qrCode);
      console.log('QR Code décodé:', decodedKey ? 'valide' : 'invalide');
    }

    // Empêcher l'accès direct aux dossiers médicaux
    const timer = setTimeout(() => {
      setMessage('Accès restreint aux professionnels de santé autorisés uniquement.');
    }, 1000);

    return () => clearTimeout(timer);
  }, [qrCode]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-center">
            <Shield size={20} className="text-blue-600" />
            Accès Médical Sécurisé
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className="text-amber-600 mt-0.5" />
              <div className="space-y-2">
                <h3 className="font-medium text-amber-800">
                  Accès Restreint
                </h3>
                <p className="text-sm text-amber-700">
                  {message}
                </p>
                <div className="text-xs text-amber-600 space-y-1">
                  <p>• Seuls les médecins autorisés peuvent accéder aux dossiers</p>
                  <p>• L'accès se fait uniquement via l'application médicale</p>
                  <p>• Toute tentative d'accès non autorisée est enregistrée</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecureQRRedirect;
