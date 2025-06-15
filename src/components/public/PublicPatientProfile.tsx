
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { User, Pill, Clock, AlertTriangle, Timer, Weight, Ruler, Activity } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { 
  getUserProfileWithBMI, 
  getMedicationsForUser, 
  getRemindersForUser,
  ProfileWithBMI, 
  Medication 
} from '@/services/supabaseService';
import { ReminderDB } from '@/types/reminder';

const PublicPatientProfile: React.FC = () => {
  const { qrCode } = useParams<{ qrCode: string }>();
  const [profile, setProfile] = useState<ProfileWithBMI | null>(null);
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

      // Charger les données du patient avec l'IMC
      const [profileData, medicationsData, remindersData] = await Promise.all([
        getUserProfileWithBMI(validationResult.userId),
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
      <div className="container mx-auto py-3 xs:py-4 sm:py-6 lg:py-12 px-2 xs:px-3 sm:px-4">
        <div className="flex justify-center items-center">
          <div className="animate-pulse text-xs xs:text-sm sm:text-base">Validation du QR code et chargement du dossier...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-3 xs:py-4 sm:py-6 lg:py-12 px-2 xs:px-3 sm:px-4">
        <Card className="max-w-xs xs:max-w-sm sm:max-w-md mx-auto">
          <CardContent className="text-center py-4 xs:py-6 sm:py-8 px-3 xs:px-4 sm:px-6">
            <AlertTriangle size={32} className="xs:w-10 xs:h-10 sm:w-12 sm:h-12 mx-auto mb-2 xs:mb-3 sm:mb-4 text-destructive" />
            <h2 className="text-sm xs:text-base sm:text-lg lg:text-xl font-semibold mb-1 xs:mb-2">Accès refusé</h2>
            <p className="text-xs xs:text-sm sm:text-base text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto py-3 xs:py-4 sm:py-6 lg:py-12 px-2 xs:px-3 sm:px-4">
        <Card className="max-w-xs xs:max-w-sm sm:max-w-md mx-auto">
          <CardContent className="text-center py-4 xs:py-6 sm:py-8 px-3 xs:px-4 sm:px-6">
            <p className="text-xs xs:text-sm sm:text-base text-muted-foreground">Dossier médical non trouvé.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-2 xs:py-3 sm:py-4 lg:py-6 space-y-2 xs:space-y-3 sm:space-y-4 lg:space-y-6 px-2 xs:px-3 sm:px-4">
      <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 xs:gap-3 sm:gap-4">
        <h1 className="text-sm xs:text-base sm:text-lg lg:text-xl xl:text-2xl font-bold">Dossier médical d'urgence</h1>
        <Badge variant="destructive" className="flex items-center gap-1 xs:gap-2 text-[9px] xs:text-[10px] sm:text-xs px-1.5 xs:px-2 sm:px-3 py-1 xs:py-1.5">
          <Timer size={12} className="xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4" />
          {timeRemaining}
        </Badge>
      </div>

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
                  <TableCell className="font-medium text-[10px] xs:text-xs sm:text-sm py-1 xs:py-2">Email</TableCell>
                  <TableCell className="text-[10px] xs:text-xs sm:text-sm py-1 xs:py-2 break-all">{profile.email}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-[10px] xs:text-xs sm:text-sm py-1 xs:py-2">Téléphone</TableCell>
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
          <CardTitle className="text-sm xs:text-base sm:text-lg">Informations médicales d'urgence</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 xs:space-y-3 sm:space-y-4 px-2 xs:px-3 sm:px-6">
          <div>
            <h4 className="font-medium mb-1 xs:mb-2 text-red-700 dark:text-red-400 text-xs xs:text-sm sm:text-base">⚠️ Allergies</h4>
            <p className="text-[10px] xs:text-xs sm:text-sm lg:text-base font-medium bg-red-50 dark:bg-red-950/50 text-red-900 dark:text-red-100 p-2 xs:p-3 rounded border border-red-200 dark:border-red-800">
              {profile.allergies || 'Aucune allergie connue'}
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-1 xs:mb-2 text-slate-700 dark:text-slate-300 text-xs xs:text-sm sm:text-base">Maladies chroniques</h4>
            <p className="text-[10px] xs:text-xs sm:text-sm lg:text-base bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 xs:p-3 rounded border border-gray-200 dark:border-gray-700">
              {profile.chronic_diseases || 'Aucune maladie chronique'}
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-1 xs:mb-2 text-blue-700 dark:text-blue-400 text-xs xs:text-sm sm:text-base">Traitements actuels</h4>
            <p className="text-[10px] xs:text-xs sm:text-sm lg:text-base bg-blue-50 dark:bg-blue-950/50 text-blue-900 dark:text-blue-100 p-2 xs:p-3 rounded border border-blue-200 dark:border-blue-800">
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
              <p className="text-[10px] xs:text-xs sm:text-sm text-muted-foreground">Aucun médicament enregistré</p>
            ) : (
              <div className="space-y-2 xs:space-y-3">
                {medications.map((med) => (
                  <div key={med.id} className="border rounded p-2 xs:p-3">
                    <h5 className="font-medium text-[10px] xs:text-xs sm:text-sm lg:text-base">{med.name}</h5>
                    <p className="text-[9px] xs:text-[10px] sm:text-xs lg:text-sm text-muted-foreground">{med.dosage}</p>
                    <p className="text-[8px] xs:text-[9px] sm:text-[10px] lg:text-xs">{med.frequency}</p>
                    {med.posology && (
                      <p className="text-[8px] xs:text-[9px] sm:text-[10px] lg:text-xs mt-1">
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
              <p className="text-[10px] xs:text-xs sm:text-sm text-muted-foreground">Aucun rappel configuré</p>
            ) : (
              <div className="space-y-2 xs:space-y-3">
                {reminders.map((reminder) => (
                  <div key={reminder.id} className="border rounded p-2 xs:p-3">
                    <h5 className="font-medium text-[10px] xs:text-xs sm:text-sm lg:text-base">{reminder.medication_name}</h5>
                    <p className="text-[9px] xs:text-[10px] sm:text-xs lg:text-sm text-muted-foreground">
                      {reminder.time} - {reminder.frequency}
                    </p>
                    <p className="text-[8px] xs:text-[9px] sm:text-[10px] lg:text-xs">Dosage: {reminder.dosage}</p>
                    <Badge variant={reminder.is_active ? "default" : "secondary"} className="mt-1 text-[8px] xs:text-[9px] sm:text-[10px] px-1 xs:px-1.5 py-0.5">
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
