
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { User, Pill, Clock, AlertTriangle, Timer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { 
  getUserProfile, 
  getMedicationsForUser, 
  getRemindersForUser,
  Profile, 
  Medication 
} from '@/services/supabaseService';
import { ReminderDB } from '@/types/reminder';

const PublicPatientProfile: React.FC = () => {
  const { qrCode } = useParams<{ qrCode: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [reminders, setReminders] = useState<ReminderDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessExpiry, setAccessExpiry] = useState<Date | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    if (qrCode) {
      validateAndLoadData();
    }
  }, [qrCode]);

  useEffect(() => {
    if (accessExpiry) {
      const interval = setInterval(() => {
        const now = new Date();
        const diff = accessExpiry.getTime() - now.getTime();
        
        if (diff <= 0) {
          setTimeRemaining('Accès expiré');
          setError('Votre accès au dossier médical a expiré.');
          clearInterval(interval);
        } else {
          const minutes = Math.floor(diff / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          setTimeRemaining(`${minutes}m ${seconds}s`);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [accessExpiry]);

  const validateAndLoadData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Validating QR code:', qrCode);

      // Valider le QR code en utilisant la fonction edge Supabase
      const { data: validationResult, error: validationError } = await supabase.functions.invoke('validate-qr-access', {
        body: { qrCode }
      });

      console.log('Validation result:', validationResult);
      console.log('Validation error:', validationError);

      if (validationError) {
        console.error('Erreur de validation:', validationError);
        throw new Error('QR code invalide ou expiré');
      }

      if (!validationResult?.accessGranted) {
        console.error('Accès refusé:', validationResult);
        throw new Error('QR code invalide ou expiré');
      }

      setAccessExpiry(new Date(validationResult.expiresAt));

      // Charger les données du patient (toujours à jour)
      const [profileData, medicationsData, remindersData] = await Promise.all([
        getUserProfile(validationResult.userId),
        getMedicationsForUser(validationResult.userId),
        getRemindersForUser(validationResult.userId)
      ]);

      if (!profileData) {
        throw new Error('Profil patient non trouvé');
      }

      setProfile(profileData);
      setMedications(medicationsData);
      setReminders(remindersData);

      toast({
        title: "Dossier médical chargé",
        description: "Accès accordé pour 3 minutes."
      });
    } catch (error) {
      console.error('Error loading patient data:', error);
      setError(error instanceof Error ? error.message : 'Impossible de charger le dossier médical');
      toast({
        variant: "destructive",
        title: "Erreur d'accès",
        description: "QR code invalide ou expiré."
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-12">
        <div className="flex justify-center items-center">
          <div className="animate-pulse">Validation du QR code et chargement du dossier...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-12">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <AlertTriangle size={48} className="mx-auto mb-4 text-destructive" />
            <h2 className="text-xl font-semibold mb-2">Accès refusé</h2>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto py-12">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Dossier médical non trouvé.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dossier médical d'urgence</h1>
        <Badge variant="destructive" className="flex items-center gap-2">
          <Timer size={16} />
          {timeRemaining}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User size={20} />
              Informations personnelles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Nom</TableCell>
                  <TableCell>{profile.name || 'Non renseigné'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Email</TableCell>
                  <TableCell>{profile.email}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Téléphone</TableCell>
                  <TableCell>{profile.phone_number || 'Non renseigné'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Groupe sanguin</TableCell>
                  <TableCell>
                    {profile.blood_type ? (
                      <Badge variant="outline">{profile.blood_type}</Badge>
                    ) : (
                      'Non renseigné'
                    )}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact d'urgence</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Nom</TableCell>
                  <TableCell>{profile.emergency_contact_name || 'Non renseigné'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Téléphone</TableCell>
                  <TableCell>{profile.emergency_contact_phone || 'Non renseigné'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Relation</TableCell>
                  <TableCell>{profile.emergency_contact_relationship || 'Non renseigné'}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations médicales d'urgence</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2 text-red-600">⚠️ Allergies</h4>
            <p className="text-sm font-medium">{profile.allergies || 'Aucune allergie connue'}</p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Maladies chroniques</h4>
            <p className="text-sm">{profile.chronic_diseases || 'Aucune maladie chronique'}</p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Traitements actuels</h4>
            <p className="text-sm">{profile.current_medications || 'Aucun traitement en cours'}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill size={20} />
              Médicaments ({medications.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {medications.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun médicament enregistré</p>
            ) : (
              <div className="space-y-3">
                {medications.map((med) => (
                  <div key={med.id} className="border rounded p-3">
                    <h5 className="font-medium">{med.name}</h5>
                    <p className="text-sm text-muted-foreground">{med.dosage}</p>
                    <p className="text-xs">{med.frequency}</p>
                    {med.posology && (
                      <p className="text-xs mt-1"><strong>Posologie:</strong> {med.posology}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock size={20} />
              Rappels de prise ({reminders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reminders.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun rappel configuré</p>
            ) : (
              <div className="space-y-3">
                {reminders.map((reminder) => (
                  <div key={reminder.id} className="border rounded p-3">
                    <h5 className="font-medium">{reminder.medication_name}</h5>
                    <p className="text-sm text-muted-foreground">
                      {reminder.time} - {reminder.frequency}
                    </p>
                    <p className="text-xs">Dosage: {reminder.dosage}</p>
                    <Badge variant={reminder.is_active ? "default" : "secondary"} className="mt-1">
                      {reminder.is_active ? "Actif" : "Inactif"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PublicPatientProfile;
