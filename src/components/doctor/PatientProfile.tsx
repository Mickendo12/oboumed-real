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
        <CardContent className="text-center py-4 xs:py-6 sm:py-8 px-3 xs:px-4 sm:px-6">
          <Timer size={32} className="xs:w-10 xs:h-10 sm:w-12 sm:h-12 mx-auto mb-2 xs:mb-3 sm:mb-4 text-destructive" />
          <h2 className="text-sm xs:text-base sm:text-lg lg:text-xl font-semibold mb-1 xs:mb-2">Session expirée</h2>
          <p className="text-xs xs:text-sm sm:text-base text-muted-foreground mb-2 xs:mb-3 sm:mb-4">
            Votre accès au dossier médical a expiré après 30 minutes.
          </p>
          <Button onClick={onBack} size="sm" className="text-xs xs:text-sm">
            Retour au tableau de bord
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-6 xs:py-8 sm:py-12">
        <div className="animate-pulse text-xs xs:text-sm sm:text-base">Chargement du dossier patient...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="text-center py-4 xs:py-6 sm:py-8 px-3 xs:px-4 sm:px-6">
          <AlertTriangle size={32} className="xs:w-10 xs:h-10 sm:w-12 sm:h-12 mx-auto mb-2 xs:mb-3 sm:mb-4 text-destructive" />
          <h2 className="text-sm xs:text-base sm:text-lg lg:text-xl font-semibold mb-1 xs:mb-2">Patient non trouvé</h2>
          <p className="text-xs xs:text-sm sm:text-base text-muted-foreground">
            Impossible de charger les informations du patient.
          </p>
          <Button onClick={onBack} className="mt-2 xs:mt-3 sm:mt-4" size="sm">
            <ArrowLeft size={14} className="mr-1 xs:mr-1.5 sm:mr-2" />
            Retour
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2 xs:space-y-3 sm:space-y-4 lg:space-y-6 px-2 xs:px-3 sm:px-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 xs:gap-3 sm:gap-4">
        <Button variant="outline" onClick={onBack} size="sm" className="text-[10px] xs:text-xs sm:text-sm px-2 xs:px-3 py-1 xs:py-1.5 sm:py-2">
          <ArrowLeft size={12} className="mr-1 xs:mr-1.5 sm:mr-2 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4" />
          Retour aux sessions
        </Button>
        <div className="flex flex-col xs:flex-row items-start xs:items-center gap-2 xs:gap-3 sm:gap-4 w-full xs:w-auto">
          <div className="flex border rounded-lg overflow-hidden">
            <Button
              variant={activeTab === 'overview' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('overview')}
              className="rounded-r-none text-[9px] xs:text-[10px] sm:text-xs px-2 xs:px-3 py-1 xs:py-1.5 sm:py-2"
            >
              <User size={12} className="mr-1 xs:mr-1.5 sm:mr-2 xs:w-3 xs:h-3 sm:w-3.5 sm:h-3.5" />
              <span className="hidden xxs:inline">Vue d'ensemble</span>
              <span className="xxs:hidden">Vue</span>
            </Button>
            <Button
              variant={activeTab === 'prescriptions' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('prescriptions')}
              className="rounded-l-none text-[9px] xs:text-[10px] sm:text-xs px-2 xs:px-3 py-1 xs:py-1.5 sm:py-2"
            >
              <FileText size={12} className="mr-1 xs:mr-1.5 sm:mr-2 xs:w-3 xs:h-3 sm:w-3.5 sm:h-3.5" />
              <span className="hidden xxs:inline">Ordonnances ({prescriptions.length})</span>
              <span className="xxs:hidden">Ord. ({prescriptions.length})</span>
            </Button>
          </div>
          <Badge variant="default" className="flex items-center gap-1 xs:gap-2 text-[8px] xs:text-[9px] sm:text-[10px] px-1.5 xs:px-2 sm:px-3 py-1 xs:py-1.5">
            <Clock size={10} className="xs:w-3 xs:h-3 sm:w-3.5 sm:h-3.5" />
            <span className="hidden xs:inline">Session active (30 min)</span>
            <span className="xs:hidden">30min</span>
          </Badge>
        </div>
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="grid gap-2 xs:gap-3 sm:gap-4 lg:gap-6 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2 xs:pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-1 xs:gap-1.5 sm:gap-2 text-sm xs:text-base sm:text-lg">
                  <User size={14} className="xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
                  Informations personnelles
                </CardTitle>
              </CardHeader>
              <CardContent className="px-2 xs:px-3 sm:px-6">
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium text-[10px] xs:text-xs sm:text-sm py-1 xs:py-2">Nom</TableCell>
                      <TableCell className="text-[10px] xs:text-xs sm:text-sm py-1 xs:py-2">{profile.name || 'Non renseigné'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium flex items-center text-[10px] xs:text-xs sm:text-sm py-1 xs:py-2">
                        <Mail className="mr-1 xs:mr-1.5 sm:mr-2" size={12} />
                        Email
                      </TableCell>
                      <TableCell className="text-[10px] xs:text-xs sm:text-sm py-1 xs:py-2 break-all">{profile.email}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium flex items-center text-[10px] xs:text-xs sm:text-sm py-1 xs:py-2">
                        <Phone className="mr-1 xs:mr-1.5 sm:mr-2" size={12} />
                        Téléphone
                      </TableCell>
                      <TableCell className="text-[10px] xs:text-xs sm:text-sm py-1 xs:py-2">{profile.phone_number || 'Non renseigné'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-[10px] xs:text-xs sm:text-sm py-1 xs:py-2">Groupe sanguin</TableCell>
                      <TableCell className="py-1 xs:py-2">
                        {profile.blood_type ? (
                          <Badge variant="outline" className="text-[9px] xs:text-[10px] sm:text-xs px-1 xs:px-1.5 sm:px-2 py-0.5 xs:py-1">{profile.blood_type}</Badge>
                        ) : (
                          <span className="text-[10px] xs:text-xs sm:text-sm">Non renseigné</span>
                        )}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2 xs:pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-1 xs:gap-1.5 sm:gap-2 text-sm xs:text-base sm:text-lg">
                  <Activity size={14} className="xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
                  Données physiques
                </CardTitle>
              </CardHeader>
              <CardContent className="px-2 xs:px-3 sm:px-6">
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium flex items-center text-[10px] xs:text-xs sm:text-sm py-1 xs:py-2">
                        <Weight className="mr-1 xs:mr-1.5 sm:mr-2" size={12} />
                        Poids
                      </TableCell>
                      <TableCell className="text-[10px] xs:text-xs sm:text-sm py-1 xs:py-2">
                        {profile.weight_kg ? `${profile.weight_kg} kg` : 'Non renseigné'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium flex items-center text-[10px] xs:text-xs sm:text-sm py-1 xs:py-2">
                        <Ruler className="mr-1 xs:mr-1.5 sm:mr-2" size={12} />
                        Taille
                      </TableCell>
                      <TableCell className="text-[10px] xs:text-xs sm:text-sm py-1 xs:py-2">
                        {profile.height_cm ? `${profile.height_cm} cm` : 'Non renseigné'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-[10px] xs:text-xs sm:text-sm py-1 xs:py-2">IMC</TableCell>
                      <TableCell className="py-1 xs:py-2">
                        {profile.bmi ? (
                          <div className="flex flex-col xs:flex-row items-start xs:items-center gap-1 xs:gap-2">
                            <Badge variant={getBMIBadgeVariant(profile.bmi)} className="text-[9px] xs:text-[10px] sm:text-xs px-1 xs:px-1.5 sm:px-2 py-0.5 xs:py-1">
                              {profile.bmi}
                            </Badge>
                            <span className={`text-[9px] xs:text-[10px] sm:text-xs ${getBMICategoryColor(profile.bmi_category)}`}>
                              {profile.bmi_category}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] xs:text-xs sm:text-sm text-muted-foreground">Non calculable</span>
                        )}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2 xs:pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-1 xs:gap-1.5 sm:gap-2 text-sm xs:text-base sm:text-lg">
                <Heart size={14} className="xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
                Informations médicales d'urgence
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 xs:space-y-3 sm:space-y-4 px-2 xs:px-3 sm:px-6">
              <div>
                <h4 className="font-medium mb-1 xs:mb-2 text-red-600 flex items-center gap-1 xs:gap-2 text-xs xs:text-sm sm:text-base">
                  <AlertTriangle size={12} className="xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4" />
                  Allergies
                </h4>
                <p className="text-[10px] xs:text-xs sm:text-sm lg:text-base bg-red-50 p-2 xs:p-3 rounded border border-red-200 font-medium">
                  {profile.allergies || 'Aucune allergie connue'}
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-1 xs:mb-2 text-xs xs:text-sm sm:text-base">Maladies chroniques</h4>
                <p className="text-[10px] xs:text-xs sm:text-sm lg:text-base bg-gray-50 p-2 xs:p-3 rounded border">
                  {profile.chronic_diseases || 'Aucune maladie chronique'}
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-1 xs:mb-2 text-xs xs:text-sm sm:text-base">Traitements actuels</h4>
                <p className="text-[10px] xs:text-xs sm:text-sm lg:text-base bg-blue-50 p-2 xs:p-3 rounded border border-blue-200">
                  {profile.current_medications || 'Aucun traitement en cours'}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-2 xs:gap-3 sm:gap-4 lg:gap-6 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2 xs:pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-1 xs:gap-1.5 sm:gap-2 text-sm xs:text-base sm:text-lg">
                  <Pill size={14} className="xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
                  Médicaments ({medications.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="px-2 xs:px-3 sm:px-6">
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
              <CardHeader className="pb-2 xs:pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-1 xs:gap-1.5 sm:gap-2 text-sm xs:text-base sm:text-lg">
                  <Clock size={14} className="xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
                  Rappels de prise ({reminders.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="px-2 xs:px-3 sm:px-6">
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
            <CardHeader className="pb-2 xs:pb-3 sm:pb-4">
              <CardTitle className="text-sm xs:text-base sm:text-lg">Contact d'urgence</CardTitle>
            </CardHeader>
            <CardContent className="px-2 xs:px-3 sm:px-6">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium text-[10px] xs:text-xs sm:text-sm py-1 xs:py-2">Nom</TableCell>
                    <TableCell className="text-[10px] xs:text-xs sm:text-sm py-1 xs:py-2">{profile.emergency_contact_name || 'Non renseigné'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium text-[10px] xs:text-xs sm:text-sm py-1 xs:py-2">Téléphone</TableCell>
                    <TableCell className="py-1 xs:py-2">
                      {profile.emergency_contact_phone ? (
                        <a 
                          href={`tel:${profile.emergency_contact_phone}`}
                          className="text-blue-600 hover:underline flex items-center gap-2 text-[10px] xs:text-xs sm:text-sm"
                        >
                          <Phone size={12} className="xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4" />
                          {profile.emergency_contact_phone}
                        </a>
                      ) : (
                        <span className="text-[10px] xs:text-xs sm:text-sm">Non renseigné</span>
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium text-[10px] xs:text-xs sm:text-sm py-1 xs:py-2">Relation</TableCell>
                    <TableCell className="text-[10px] xs:text-xs sm:text-sm py-1 xs:py-2">{profile.emergency_contact_relationship || 'Non renseigné'}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === 'prescriptions' && (
        <Card>
          <CardHeader className="pb-2 xs:pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-1 xs:gap-1.5 sm:gap-2 text-sm xs:text-base sm:text-lg">
              <FileText size={14} className="xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
              Ordonnances du patient ({prescriptions.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 xs:px-3 sm:px-6">
            <PrescriptionsList prescriptions={prescriptions} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PatientProfile;
