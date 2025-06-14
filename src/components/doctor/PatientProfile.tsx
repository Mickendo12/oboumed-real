import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { ArrowLeft, User, Pill, FileText, Weight, Ruler, Activity } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { 
  getUserProfileWithBMI, 
  getMedicationsForUser, 
  logAccess,
  ProfileWithBMI, 
  Medication 
} from '@/services/supabaseService';

interface PatientProfileProps {
  patientId: string;
  doctorId: string;
  onBack: () => void;
}

const PatientProfile: React.FC<PatientProfileProps> = ({ patientId, doctorId, onBack }) => {
  const [profile, setProfile] = useState<ProfileWithBMI | null>(null);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadPatientData();
  }, [patientId]);

  const loadPatientData = async () => {
    try {
      setLoading(true);
      const [profileData, medicationsData] = await Promise.all([
        getUserProfileWithBMI(patientId),
        getMedicationsForUser(patientId)
      ]);

      setProfile(profileData);
      setMedications(medicationsData);

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
        <Badge variant="outline">Accès temporaire (30 min)</Badge>
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

      <Card className="dark-container">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill size={20} />
            Ordonnances et médicaments ({medications.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {medications.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun médicament enregistré</p>
          ) : (
            <div className="space-y-3">
              {medications.map((med) => (
                <div key={med.id} className="border rounded p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h5 className="font-medium">{med.name}</h5>
                      {med.dosage && <p className="text-sm text-muted-foreground">{med.dosage}</p>}
                      {med.frequency && <p className="text-xs">{med.frequency}</p>}
                      {med.posology && <p className="text-xs text-muted-foreground">Posologie: {med.posology}</p>}
                      {med.treatment_duration && <p className="text-xs">Durée: {med.treatment_duration}</p>}
                      {med.doctor_prescribed && <p className="text-xs">Prescrit par: Dr. {med.doctor_prescribed}</p>}
                      {med.comments && <p className="text-xs text-muted-foreground">Commentaires: {med.comments}</p>}
                    </div>
                    {med.prescription_id && (
                      <Badge variant="secondary" className="ml-2">
                        <FileText size={12} className="mr-1" />
                        Ordonnance
                      </Badge>
                    )}
                  </div>
                  {(med.start_date || med.end_date) && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      {med.start_date && `Début: ${new Date(med.start_date).toLocaleDateString('fr-FR')}`}
                      {med.start_date && med.end_date && ' - '}
                      {med.end_date && `Fin: ${new Date(med.end_date).toLocaleDateString('fr-FR')}`}
                    </div>
                  )}
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
