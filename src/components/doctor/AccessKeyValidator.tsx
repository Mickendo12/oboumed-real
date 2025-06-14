
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Key, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { validateAccessKey, getUserProfile, createDoctorSession, logAccess } from '@/services/supabaseService';

interface AccessKeyValidatorProps {
  doctorId: string;
  onAccessGranted: (patientData: any) => void;
}

const AccessKeyValidator: React.FC<AccessKeyValidatorProps> = ({ doctorId, onAccessGranted }) => {
  const [accessKey, setAccessKey] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleValidateKey = async () => {
    if (!accessKey.trim()) {
      toast({
        variant: "destructive",
        title: "Clé requise",
        description: "Veuillez entrer une clé d'accès."
      });
      return;
    }

    try {
      setLoading(true);
      
      // Valider la clé d'accès
      const validation = await validateAccessKey(accessKey);
      
      if (!validation.valid || !validation.userId) {
        toast({
          variant: "destructive",
          title: "Clé d'accès invalide",
          description: "Cette clé d'accès n'est pas valide ou a expiré."
        });
        return;
      }
      
      // Récupérer le profil du patient
      const profile = await getUserProfile(validation.userId);
      
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
      
      // Créer une session d'accès
      const session = await createDoctorSession(validation.userId, doctorId);
      
      // Enregistrer l'accès
      await logAccess({
        patient_id: validation.userId,
        doctor_id: doctorId,
        action: 'access_key_entry',
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
      
      onAccessGranted(patientData);
      setAccessKey('');
      
      toast({
        title: "Accès accordé",
        description: `Accès au dossier de ${profile.name || profile.email} pour 30 minutes.`
      });
      
    } catch (error) {
      console.error('Error validating access key:', error);
      toast({
        variant: "destructive",
        title: "Erreur de validation",
        description: `Impossible de valider la clé d'accès: ${error.message || 'Erreur inconnue'}`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleValidateKey();
    }
  };

  return (
    <Card className="dark-container">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key size={20} />
          Accès par clé médical
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle size={16} className="text-blue-600 mt-0.5" />
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Entrez la clé d'accès fournie par l'administrateur ou le patient pour accéder au dossier médical.
            </p>
          </div>
        </div>
        
        <div className="space-y-3">
          <Input
            placeholder="Entrez la clé d'accès (ex: ABC123DEF456)"
            value={accessKey}
            onChange={(e) => setAccessKey(e.target.value.toUpperCase())}
            onKeyPress={handleKeyPress}
            disabled={loading}
            className="text-center font-mono text-lg"
            maxLength={12}
          />
          
          <Button 
            onClick={handleValidateKey}
            disabled={!accessKey.trim() || loading}
            className="w-full"
          >
            <Key size={16} className="mr-2" />
            {loading ? 'Validation...' : 'Valider l\'accès'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccessKeyValidator;
