
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Key, QrCode } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
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
      console.log('Verifying access key:', accessKey);

      const validation = await validateAccessKey(accessKey.trim());
      console.log('Access key validation result:', validation);

      if (!validation.valid || !validation.userId) {
        toast({
          variant: "destructive",
          title: "Clé invalide",
          description: "Cette clé d'accès n'est pas valide ou a expiré."
        });
        return;
      }

      const profile = await getUserProfile(validation.userId);
      console.log('Patient profile retrieved:', profile);

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

      // Créer une session d'accès médecin
      console.log('Creating doctor session...');
      const session = await createDoctorSession(validation.userId, doctorId, validation.qrCodeId);
      console.log('Doctor session created:', session);

      const patientData = {
        profile: {
          ...profile,
          user_id: validation.userId
        },
        qrCodeId: validation.qrCodeId,
        sessionId: session.id
      };

      console.log('Sending patient data to parent:', patientData);

      onAccessGranted(patientData);
      setAccessKey('');

      toast({
        title: "Accès accordé",
        description: `Session d'accès créée pour ${profile.name || profile.email} (30 minutes)`
      });

    } catch (error) {
      console.error('Error verifying access key:', error);
      toast({
        variant: "destructive",
        title: "Erreur de vérification",
        description: `Impossible de vérifier la clé d'accès: ${error.message || 'Erreur inconnue'}`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQRScanSuccess = (patientData: any) => {
    console.log('QR scan success, forwarding data:', patientData);
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
              {loading ? 'Vérification...' : 'Accéder au dossier'}
            </Button>
            
            <div className="text-xs text-muted-foreground">
              <p>• La clé d'accès vous donne accès au dossier médical complet</p>
              <p>• L'accès est valide pendant 30 minutes</p>
              <p>• Toute tentative d'accès est enregistrée</p>
            </div>
          </TabsContent>

          <TabsContent value="qr" className="space-y-4">
            <QRCodeScanner 
              onScanSuccess={handleQRScanSuccess}
              doctorId={doctorId}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AccessKeyVerification;
