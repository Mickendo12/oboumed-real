import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { 
  ArrowLeft, User, Pill, Clock, Heart, Phone, Mail, 
  AlertTriangle, Timer, Weight, Ruler, Activity, FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  getUserProfileWithBMI, 
  getMedicationsForUser, 
  getRemindersForUser,
  hasActiveSession,
  ProfileWithBMI, 
  Medication 
} from '@/services/supabaseService';
import { getPrescriptionsForUser, PrescriptionWithMedications } from '@/services/prescriptionService';
import { ReminderDB } from '@/types/reminder';
import PrescriptionsList from './PrescriptionsList';

interface PatientProfileProps {
  patientId: string;
  doctorId: string;
  onBack: () => void;
  onSessionExpired?: () => void;
}

const PatientProfile: React.FC<PatientProfileProps> = ({ 
  patientId, 
  doctorId, 
  onBack,
  onSessionExpired 
}) => {
  const [profile, setProfile] = useState<ProfileWithBMI | null>(null);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [reminders, setReminders] = useState<ReminderDB[]>([]);
  const [prescriptions, setPrescriptions] = useState<PrescriptionWithMedications[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionValid, setSessionValid] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'prescriptions'>('overview');
  const { toast } = useToast();

  useEffect(() => {
    loadPatientData();
    
    // Vérifier la validité de la session toutes les 30 secondes
    const sessionCheck = setInterval(checkSessionValidity, 30000);
    
    return () => clearInterval(sessionCheck);
  }, [patientId, doctorId]);

  const checkSessionValidity = async () => {
    try {
      const isValid = await hasActiveSession(doctorId, patientId);
      
      if (!isValid && sessionValid) {
        setSessionValid(false);
        toast({
          variant: "destructive",
          title: "Session expirée",
          description: "Votre accès au dossier médical a expiré."
        });
        
        // Appeler le callback d'expiration si fourni
        if (onSessionExpired) {
          onSessionExpired();
        } else {
          onBack();
        }
      }
    } catch (error) {
      console.error('Error checking session validity:', error);
    }
  };

  const loadPatientData = async () => {
    try {
      setLoading(true);
      
      // Vérifier d'abord que la session est valide
      const isValid = await hasActiveSession(doctorId, patientId);
      
      if (!isValid) {
        setSessionValid(false);
        toast({
          variant: "destructive",
          title: "Session expirée",
          description: "Votre accès au dossier médical a expiré."
        });
        onBack();
        return;
      }

      const [profileData, medicationsData, remindersData, prescriptionsData] = await Promise.all([
        getUserProfileWithBMI(patientId),
        getMedicationsForUser(patientId),
        getRemindersForUser(patientId),
        getPrescriptionsForUser(patientId)
      ]);

      if (!profileData) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger le profil du patient."
        });
        onBack();
        return;
      }

      setProfile(profileData);
      setMedications(medicationsData);
      setReminders(remindersData);
      setPrescriptions(prescriptionsData);
      setSessionValid(true);
      
    } catch (error) {
      console.error('Error loading patient data:', error);
      toast({
        variant: "destructive",
        title: "Erreur de chargement",
        description: "Impossible de charger les données du patient."
      });
      onBack();
    } finally {
      setLoading(false);
    }
  };

  const getBMIBadgeVariant = (bmi?: number) => {
    if (!bmi) return 'secondary';
    if (bmi < 18.5) return 'outline';
    if (bmi < 25) return 'default';
    if (bmi < 30) return 'secondary';
    return 'destructive';
  };

  const getBMICategoryColor = (category?: string) => {
    switch (category) {
      case 'Poids normal': return 'text-green-600';
      case 'Insuffisance pondérale': return 'text-blue-600';
      case 'Surpoids': return 'text-yellow-600';
      case 'Obésité': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  if (!sessionValid) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Timer size={48} className="mx-auto mb-4 text-destructive" />
          <h2 className="text-xl font-semibold mb-2">Session expirée</h2>
          <p className="text-muted-foreground mb-4">
            Votre accès au dossier médical a expiré après 30 minutes.
          </p>
          <Button onClick={onBack}>
            Retour au tableau de bord
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-pulse">Chargement du dossier patient...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <AlertTriangle size={48} className="mx-auto mb-4 text-destructive" />
          <h2 className="text-xl font-semibold mb-2">Patient non trouvé</h2>
          <p className="text-muted-foreground">
            Impossible de charger les informations du patient.
          </p>
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
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft size={16} className="mr-2" />
          Retour aux sessions
        </Button>
        <div className="flex items-center gap-4">
          <div className="flex border rounded-lg">
            <Button
              variant={activeTab === 'overview' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('overview')}
              className="rounded-r-none"
            >
              <User size={16} className="mr-2" />
              Vue d'ensemble
            </Button>
            <Button
              variant={activeTab === 'prescriptions' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('prescriptions')}
              className="rounded-l-none"
            >
              <FileText size={16} className="mr-2" />
              Ordonnances ({prescriptions.length})
            </Button>
          </div>
          <Badge variant="default" className="flex items-center gap-2">
            <Clock size={16} />
            Session active (30 min)
          </Badge>
        </div>
      </div>

      {activeTab === 'overview' && (
        <>
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
                      <TableCell className="font-medium flex items-center">
                        <Mail className="mr-2" size={16} />
                        Email
                      </TableCell>
                      <TableCell>{profile.email}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium flex items-center">
                        <Phone className="mr-2" size={16} />
                        Téléphone
                      </TableCell>
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
                <CardTitle className="flex items-center gap-2">
                  <Activity size={20} />
                  Données physiques
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium flex items-center">
                        <Weight className="mr-2" size={16} />
                        Poids
                      </TableCell>
                      <TableCell>
                        {profile.weight_kg ? `${profile.weight_kg} kg` : 'Non renseigné'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium flex items-center">
                        <Ruler className="mr-2" size={16} />
                        Taille
                      </TableCell>
                      <TableCell>
                        {profile.height_cm ? `${profile.height_cm} cm` : 'Non renseigné'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">IMC</TableCell>
                      <TableCell>
                        {profile.bmi ? (
                          <div className="flex items-center gap-2">
                            <Badge variant={getBMIBadgeVariant(profile.bmi)}>
                              {profile.bmi}
                            </Badge>
                            <span className={`text-sm ${getBMICategoryColor(profile.bmi_category)}`}>
                              {profile.bmi_category}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Non calculable</span>
                        )}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart size={20} />
                Informations médicales d'urgence
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2 text-red-600 flex items-center gap-2">
                  <AlertTriangle size={16} />
                  Allergies
                </h4>
                <p className="text-sm bg-red-50 p-3 rounded border border-red-200 font-medium">
                  {profile.allergies || 'Aucune allergie connue'}
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Maladies chroniques</h4>
                <p className="text-sm bg-gray-50 p-3 rounded border">
                  {profile.chronic_diseases || 'Aucune maladie chronique'}
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Traitements actuels</h4>
                <p className="text-sm bg-blue-50 p-3 rounded border border-blue-200">
                  {profile.current_medications || 'Aucun traitement en cours'}
                </p>
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
                          <p className="text-xs mt-1">
                            <strong>Posologie:</strong> {med.posology}
                          </p>
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
                    <TableCell>
                      {profile.emergency_contact_phone ? (
                        <a 
                          href={`tel:${profile.emergency_contact_phone}`}
                          className="text-blue-600 hover:underline flex items-center gap-2"
                        >
                          <Phone size={16} />
                          {profile.emergency_contact_phone}
                        </a>
                      ) : (
                        'Non renseigné'
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Relation</TableCell>
                    <TableCell>{profile.emergency_contact_relationship || 'Non renseigné'}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === 'prescriptions' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText size={20} />
              Ordonnances du patient ({prescriptions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PrescriptionsList prescriptions={prescriptions} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PatientProfile;
