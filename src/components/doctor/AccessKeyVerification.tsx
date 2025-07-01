
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { QrCode, Key } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import QRCodeScanner from './QRCodeScanner';
import { validateAccessKey, getUserProfile, createDoctorSession, logAccess } from '@/services/supabaseService';

interface AccessKeyVerificationProps {
  onAccessGranted: (patientData: any) => void;
  doctorId: string;
}

const AccessKeyVerification: React.FC<AccessKeyVerificationProps> = ({ onAccessGranted, doctorId }) => {
  const [accessKey, setAccessKey] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAccessKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessKey.trim()) return;

    try {
      setLoading(true);
      console.log('🔄 Validating access key:', accessKey);

      // Log de tentative d'accès par clé
      await logAccess({
        patient_id: 'unknown',
        doctor_id: doctorId,
        action: 'access_key_attempt',
        details: {
          access_key: accessKey.substring(0, 6) + '***', // Masquer une partie de la clé
          timestamp: new Date().toISOString(),
          method: 'manual_entry'
        },
        ip_address: 'manual_entry'
      });

      const validation = await validateAccessKey(accessKey);
      
      if (!validation.valid || !validation.userId) {
        // Log d'échec de validation
        await logAccess({
          patient_id: 'unknown',
          doctor_id: doctorId,
          action: 'access_key_failed',
          details: {
            error: 'Clé d\'accès invalide',
            access_key: accessKey.substring(0, 6) + '***',
            timestamp: new Date().toISOString()
          },
          ip_address: 'manual_entry'
        });

        toast({
          variant: "destructive",
          title: "Clé d'accès invalide",
          description: "Cette clé d'accès n'est pas valide ou a expiré."
        });
        return;
      }

      const profile = await getUserProfile(validation.userId);
      
      if (!profile) {
        // Log d'échec de récupération du profil
        await logAccess({
          patient_id: validation.userId,
          doctor_id: doctorId,
          action: 'profile_fetch_failed',
          details: {
            error: 'Patient profile not found',
            patient_id: validation.userId,
            timestamp: new Date().toISOString()
          },
          ip_address: 'manual_entry'
        });

        toast({
          variant: "destructive",
          title: "Patient introuvable",
          description: "Impossible de trouver les informations du patient."
        });
        return;
      }

      if (profile.access_status === 'restricted') {
        // Log d'accès restreint
        await logAccess({
          patient_id: validation.userId,
          doctor_id: doctorId,
          action: 'access_restricted',
          details: {
            patient_name: profile.name || profile.email,
            access_status: profile.access_status,
            access_method: 'access_key',
            timestamp: new Date().toISOString()
          },
          ip_address: 'manual_entry'
        });

        toast({
          variant: "destructive",
          title: "Accès restreint",
          description: "L'accès au dossier de ce patient a été restreint."
        });
        return;
      }

      const session = await createDoctorSession(validation.userId, doctorId, validation.qrCodeId);

      // Log de succès d'accès
      await logAccess({
        patient_id: validation.userId,
        doctor_id: doctorId,
        action: 'access_key_granted',
        details: {
          patient_name: profile.name || profile.email,
          session_id: session.id,
          qr_code_id: validation.qrCodeId,
          access_method: 'access_key',
          session_duration: '30_minutes',
          timestamp: new Date().toISOString()
        },
        ip_address: 'manual_entry'
      });

      const patientData = {
        profile: {
          ...profile,
          user_id: validation.userId
        },
        qrCodeId: validation.qrCodeId,
        sessionId: session.id
      };

      onAccessGranted(patientData);
      setAccessKey('');

      toast({
        title: "Accès accordé",
        description: `Session de 30 minutes démarrée pour ${profile.name || profile.email}`
      });

    } catch (error: any) {
      console.error('❌ Error validating access key:', error);
      
      // Log d'erreur système
      await logAccess({
        patient_id: 'unknown',
        doctor_id: doctorId,
        action: 'access_key_error',
        details: {
          error: error?.message || 'Erreur inconnue',
          access_key: accessKey.substring(0, 6) + '***',
          timestamp: new Date().toISOString()
        },
        ip_address: 'manual_entry'
      });

      toast({
        variant: "destructive",
        title: "Erreur de validation",
        description: `Impossible de valider la clé d'accès: ${error?.message || 'Erreur inconnue'}`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 xs:space-y-6">
      <QRCodeScanner 
        onScanSuccess={onAccessGranted}
        doctorId={doctorId}
      />
      
      <Card>
        <CardHeader className="pb-2 xs:pb-3 sm:pb-4">
          <CardTitle className="text-sm xs:text-base sm:text-lg flex items-center gap-2">
            <Key size={16} className="xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
            Accès par clé
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAccessKeySubmit} className="space-y-3 xs:space-y-4">
            <Input
              type="text"
              placeholder="Entrez la clé d'accès patient"
              value={accessKey}
              onChange={(e) => setAccessKey(e.target.value)}
              disabled={loading}
              className="text-xs xs:text-sm"
            />
            <Button 
              type="submit" 
              disabled={!accessKey.trim() || loading}
              className="w-full text-xs xs:text-sm"
            >
              {loading ? 'Vérification...' : 'Accéder au dossier'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessKeyVerification;
