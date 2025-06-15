
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, FileText, Pill, Clock, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { 
  getUserProfileWithBMI, 
  getMedicationsForUser, 
  getRemindersForUser,
  hasActiveSession,
  logAccess,
  ProfileWithBMI, 
  Medication 
} from '@/services/supabaseService';
import { ReminderDB } from '@/types/reminder';

interface PatientProfileProps {
  patientId: string;
  doctorId: string;
  onBack: () => void;
}

const PatientProfile: React.FC<PatientProfileProps> = ({ patientId, doctorId, onBack }) => {
  const [profile, setProfile] = useState<ProfileWithBMI | null>(null);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [reminders, setReminders] = useState<ReminderDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPatientData();
  }, [patientId, doctorId]);

  const loadPatientData = async () => {
    try {
      setLoading(true);
      
      // Vérifier si le médecin a une session active pour ce patient
      console.log('Checking access for doctor:', doctorId, 'patient:', patientId);
      const accessGranted = await hasActiveSession(doctorId, patientId);
      console.log('Access granted:', accessGranted);
      
      if (!accessGranted) {
        setHasAccess(false);
        toast({
          variant: "destructive",
          title: "Accès expiré",
          description: "Votre session d'accès à ce dossier a expiré."
        });
        return;
      }
      
      setHasAccess(true);
      
      // Charger les données du patient
      console.log('Loading patient data for:', patientId);
      const [profileData, medicationsData, remindersData] = await Promise.all([
        getUserProfileWithBMI(patientId),
        getMedicationsForUser(patientId),
        getRemindersForUser(patientId)
      ]);

      console.log('Patient data loaded:', { profileData, medicationsData, remindersData });

      setProfile(profileData);
      setMedications(medicationsData);
      setReminders(remindersData);

      // Logger l'accès au dossier
      await logAccess({
        patient_id: patientId,
        doctor_id: doctorId,
        action: 'profile_accessed',
        details: { 
          sections_accessed: ['profile', 'medications', 'reminders'],
          access_time: new Date().toISOString()
        }
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

  const getBMICategory = (bmi?: number): { label: string; color: string } => {
    if (!bmi) return { label: 'Non calculé', color: 'secondary' };
    
    if (bmi < 18.5) return { label: 'Insuffisance pondérale', color: 'blue' };
    if (bmi < 25) return { label: 'Poids normal', color: 'green' };
    if (bmi < 30) return { label: 'Surpoids', color: 'yellow' };
    return { label: 'Obésité', color: 'red' };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-pulse">Chargement du dossier patient...</div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <AlertTriangle size={48} className="mx-auto text-amber-500" />
            <div>
              <h3 className="font-semibold text-lg">Accès non autorisé</h3>
              <p className="text-muted-foreground">
                Vous n'avez pas d'accès actif à ce dossier patient.
              </p>
            </div>
            <Button onClick={onBack} className="w-full">
              <ArrowLeft size={16} className="mr-2" />
              Retour
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <AlertTriangle size={48} className="mx-auto text-red-500" />
            <div>
              <h3 className="font-semibold text-lg">Patient introuvable</h3>
              <p className="text-muted-foreground">
                Impossible de trouver les informations de ce patient.
              </p>
            </div>
            <Button onClick={onBack} className="w-full">
              <ArrowLeft size={16} className="mr-2" />
              Retour
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const bmiInfo = getBMICategory(profile.bmi);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button onClick={onBack} variant="outline" size="sm">
          <ArrowLeft size={16} className="mr-2" />
          Retour
        </Button>
        <h1 className="text-2xl font-bold">Dossier Patient</h1>
      </div>

      {/* Informations personnelles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User size={20} />
            Informations personnelles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nom</p>
              <p className="font-medium">{profile.name || 'Non renseigné'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="font-medium">{profile.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Téléphone</p>
              <p className="font-medium">{profile.phone_number || 'Non renseigné'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Groupe sanguin</p>
              <p className="font-medium">{profile.blood_type || 'Non renseigné'}</p>
            </div>
          </div>

          {/* Mesures corporelles */}
          {(profile.weight_kg || profile.height_cm) && (
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-3">Mesures corporelles</h4>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Poids</p>
                  <p className="font-medium">{profile.weight_kg ? `${profile.weight_kg} kg` : 'Non renseigné'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Taille</p>
                  <p className="font-medium">{profile.height_cm ? `${profile.height_cm} cm` : 'Non renseigné'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">IMC</p>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{profile.bmi ? profile.bmi.toString() : 'Non calculé'}</p>
                    <Badge variant={bmiInfo.color as any}>{bmiInfo.label}</Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informations médicales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText size={20} />
            Informations médicales
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Allergies</p>
            <p className="text-sm">{profile.allergies || 'Aucune allergie connue'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Maladies chroniques</p>
            <p className="text-sm">{profile.chronic_diseases || 'Aucune maladie chronique connue'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Traitements actuels</p>
            <p className="text-sm">{profile.current_medications || 'Aucun traitement en cours'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Contact d'urgence */}
      {(profile.emergency_contact_name || profile.emergency_contact_phone) && (
        <Card>
          <CardHeader>
            <CardTitle>Contact d'urgence</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nom</p>
                <p className="font-medium">{profile.emergency_contact_name || 'Non renseigné'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Téléphone</p>
                <p className="font-medium">{profile.emergency_contact_phone || 'Non renseigné'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Relation</p>
                <p className="font-medium">{profile.emergency_contact_relationship || 'Non renseigné'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Médicaments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill size={20} />
            Médicaments ({medications.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {medications.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Aucun médicament enregistré
            </p>
          ) : (
            <div className="space-y-3">
              {medications.map((medication) => (
                <div key={medication.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{medication.name}</h4>
                      {medication.dosage && (
                        <p className="text-sm text-muted-foreground">Dosage: {medication.dosage}</p>
                      )}
                      {medication.frequency && (
                        <p className="text-sm text-muted-foreground">Fréquence: {medication.frequency}</p>
                      )}
                      {medication.doctor_prescribed && (
                        <p className="text-sm text-muted-foreground">Prescrit par: {medication.doctor_prescribed}</p>
                      )}
                    </div>
                  </div>
                  {medication.comments && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Commentaires: {medication.comments}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rappels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock size={20} />
            Rappels de médicaments ({reminders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reminders.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Aucun rappel configuré
            </p>
          ) : (
            <div className="space-y-3">
              {reminders.map((reminder) => (
                <div key={reminder.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{reminder.medication_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Heure: {reminder.time}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Fréquence: {reminder.frequency || 'Non définie'}
                      </p>
                      {reminder.dosage && (
                        <p className="text-sm text-muted-foreground">
                          Dosage: {reminder.dosage}
                        </p>
                      )}
                    </div>
                    <Badge variant={reminder.is_active ? "default" : "secondary"}>
                      {reminder.is_active ? "Actif" : "Inactif"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientProfile;
