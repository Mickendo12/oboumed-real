
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Key, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { validateAccessKey, getUserProfile, createDoctorSession, logAccess } from '@/services/supabaseService';

interface AccessKeyVerificationProps {
  onAccessGranted: (patientData: any) => void;
  doctorId: string;
}

const AccessKeyVerification: React.FC<AccessKeyVerificationProps> = ({ onAccessGranted, doctorId }) => {
  const [accessKey, setAccessKey] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleVerifyKey = async () => {
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
      
      // Valider la clé d'accès
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
      
      // Récupérer le profil du patient
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
      
      // Vérifier l'accès
      if (profile.access_status === 'restricted') {
        toast({
          variant: "destructive",
          title: "Accès restreint",
          description: "L'accès au dossier de ce patient a été restreint."
        });
        return;
      }
      
      try {
        // Créer une session d'accès
        const session = await createDoctorSession(validation.userId, doctorId, accessKey);
        console.log('Doctor session created successfully:', session);
        
        // Enregistrer l'accès
        await logAccess({
          patient_id: validation.userId,
          doctor_id: doctorId,
          action: 'access_key_verification',
          details: { 
            access_key: accessKey,
            patient_name: profile.name || profile.email,
            access_type: 'doctor_dashboard_key',
            session_id: session.id
          }
        });

        // Préparer les données dans le format attendu
        const patientData = {
          profile: {
            ...profile,
            user_id: validation.userId
          },
          accessKey: accessKey
        };
        
        console.log('Sending patient data to parent:', patientData);
        
        // Envoyer les données au composant parent
        onAccessGranted(patientData);
        
        // Réinitialiser le champ
        setAccessKey('');
        
        toast({
          title: "Accès accordé",
          description: `Accès au dossier de ${profile.name || profile.email} pour 30 minutes.`
        });
        
      } catch (sessionError) {
        console.error('Error creating session:', sessionError);
        toast({
          variant: "destructive",
          title: "Erreur de session",
          description: "Impossible de créer la session d'accès. Vérifiez vos permissions."
        });
      }
      
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleVerifyKey();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key size={20} />
          Vérification par clé d'accès
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="accessKey">Clé d'accès patient</Label>
          <Input
            id="accessKey"
            type="text"
            value={accessKey}
            onChange={(e) => setAccessKey(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Saisissez la clé d'accès du patient"
            disabled={loading}
          />
        </div>
        
        <Button 
          onClick={handleVerifyKey}
          disabled={loading || !accessKey.trim()}
          className="w-full"
        >
          {loading ? 'Vérification...' : 'Vérifier l\'accès'}
        </Button>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle size={16} className="text-blue-600 mt-0.5" />
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Saisissez la clé d'accès fournie par le patient pour accéder à son dossier médical.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccessKeyVerification;
