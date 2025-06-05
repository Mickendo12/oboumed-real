import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { ArrowLeft, User, Pill, FileText, Clock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { 
  getUserProfile, 
  getMedicationsForUser, 
  getRemindersForUser,
  logAccess,
  Profile, 
  Medication 
} from '@/services/supabaseService';
import { ReminderDB } from '@/types/reminder';

interface PatientProfileProps {
  patientId: string;
  doctorId: string;
  onBack: () => void;
}

const PatientProfile: React.FC<PatientProfileProps> = ({ patientId, doctorId, onBack }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [reminders, setReminders] = useState<ReminderDB[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadPatientData();
  }, [patientId]);

  const loadPatientData = async () => {
    try {
      setLoading(true);
      const [profileData, medicationsData, remindersData] = await Promise.all([
        getUserProfile(patientId),
        getMedicationsForUser(patientId),
        getRemindersForUser(patientId)
      ]);

      setProfile(profileData);
      setMedications(medicationsData);
      setReminders(remindersData);

      // Log profile view
      await logAccess({
        patient_id: patientId,
        doctor_id: doctorId,
        action: 'profile_view',
        details: { timestamp: new Date().toISOString() }
      });
    } catch (error) {
      console.error('Error loading patient data:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les données du patient."
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-pulse">Chargement du dossier patient...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <Card className="dark-container">
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">Impossible de charger le profil du patient.</p>
          <Button onClick={onBack} className="mt-4">
            <ArrowLeft size={16} className="mr-2" />
            Retour
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft size={16} className="mr-2" />
          Retour
        </Button>
        <h2 className="text-xl font-semibold">Dossier médical</h2>
        <Badge variant="outline">Accès temporaire</Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="dark-container">
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

        <Card className="dark-container">
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

      <Card className="dark-container">
        <CardHeader>
          <CardTitle>Informations médicales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Allergies</h4>
            <p className="text-sm">{profile.allergies || 'Aucune allergie connue'}</p>
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
        <Card className="dark-container">
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
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="dark-container">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock size={20} />
              Rappels ({reminders.length})
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

export default PatientProfile;
