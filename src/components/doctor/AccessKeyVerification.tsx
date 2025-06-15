
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Key, QrCode, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { validateAccessKey, getUserProfile, createDoctorSession } from '@/services/supabaseService';
import QRCodeScanner from './QRCodeScanner';

interface AccessKeyVerificationProps {
  onAccessGranted: (patientData: any) => void;
  doctorId: string;
}

const AccessKeyVerification: React.FC<AccessKeyVerificationProps> = ({ 
  onAccessGranted, 
  doctorId 
}) => {
  const [accessKey, setAccessKey] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleVerifyAccessKey = async () => {
    if (!accessKey.trim()) {
      toast({
        variant: "destructive",
        title: "Clé requise",
        description: "Veuillez saisir une clé d'accès."
      });
      return;
    }

    try {
      setLoading(true);
      console.log('🔄 Verifying access key:', accessKey);

      const validation = await validateAccessKey(accessKey.trim());
      console.log('✅ Access key validation result:', validation);

      if (!validation.valid || !validation.userId) {
        toast({
          variant: "destructive",
          title: "Clé invalide",
          description: "Cette clé d'accès n'est pas valide ou a expiré."
        });
        return;
      }

      const profile = await getUserProfile(validation.userId);
      console.log('✅ Patient profile retrieved:', profile);

      if (!profile) {
        toast({
          variant: "destructive",
          title: "Patient introuvable",
          description: "Impossible de trouver les informations du patient."
        });
        return;
      }

      if (profile.access_status === 'restricted') {
        toast({
          variant: "destructive",
          title: "Accès restreint",
          description: "L'accès au dossier de ce patient a été restreint."
        });
        return;
      }

      // Créer une session d'accès médecin de 30 minutes
      console.log('🔄 Creating doctor session...');
      const session = await createDoctorSession(validation.userId, doctorId, validation.qrCodeId);
      console.log('✅ Doctor session created:', session);

      const patientData = {
        profile: {
          ...profile,
          user_id: validation.userId
        },
        qrCodeId: validation.qrCodeId,
        sessionId: session.id
      };

      console.log('✅ Sending patient data to parent:', patientData);

      onAccessGranted(patientData);
      setAccessKey('');

      toast({
        title: "Accès accordé",
        description: `Session de 30 minutes créée pour ${profile.name || profile.email}`
      });

    } catch (error: any) {
      console.error('❌ Error verifying access key:', error);
      toast({
        variant: "destructive",
        title: "Erreur de vérification",
        description: `Impossible de vérifier la clé d'accès: ${error?.message || 'Erreur inconnue'}`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQRScanSuccess = (patientData: any) => {
    console.log('✅ QR scan success, forwarding data:', patientData);
    onAccessGranted(patientData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Accès aux dossiers patients</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="key" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="key">
              <Key size={16} className="mr-2" />
              Clé d'accès
            </TabsTrigger>
            <TabsTrigger value="qr">
              <QrCode size={16} className="mr-2" />
              Scanner QR
            </TabsTrigger>
          </TabsList>

          <TabsContent value="key" className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="accessKey" className="text-sm font-medium">
                Clé d'accès patient
              </label>
              <Input
                id="accessKey"
                type="text"
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
                placeholder="Saisissez la clé d'accès du patient"
                disabled={loading}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleVerifyAccessKey();
                  }
                }}
              />
            </div>
            
            <Button 
              onClick={handleVerifyAccessKey}
              disabled={loading || !accessKey.trim()}
              className="w-full"
            >
              {loading ? 'Vérification...' : 'Accéder au dossier (30 min)'}
            </Button>
            
            <div className="text-xs text-muted-foreground space-y-1 bg-blue-50 p-3 rounded border border-blue-200">
              <div className="flex items-center gap-2 font-medium text-blue-700">
                <Clock size={14} />
                Session de 30 minutes
              </div>
              <p>• La clé d'accès vous donne accès au dossier médical complet</p>
              <p>• L'accès expire automatiquement après 30 minutes</p>
              <p>• Vous devrez rescanner ou ressaisir la clé après expiration</p>
              <p>• Toute tentative d'accès est enregistrée dans les logs</p>
            </div>
          </TabsContent>

          <TabsContent value="qr" className="space-y-4">
            <QRCodeScanner 
              onScanSuccess={handleQRScanSuccess}
              doctorId={doctorId}
            />
            
            <div className="text-xs text-muted-foreground space-y-1 bg-green-50 p-3 rounded border border-green-200">
              <div className="flex items-center gap-2 font-medium text-green-700">
                <QrCode size={14} />
                Scan QR Code - Session de 30 minutes
              </div>
              <p>• Scannez le QR code affiché sur l'écran du patient</p>
              <p>• Accès automatique au dossier médical complet</p>
              <p>• Session sécurisée de 30 minutes</p>
              <p>• Expiration automatique pour la sécurité</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AccessKeyVerification;
