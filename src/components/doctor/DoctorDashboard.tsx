
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QrCode, Clock, User, Stethoscope } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import QRCodeScanner from './QRCodeScanner';
import PatientProfile from './PatientProfile';
import { 
  getActiveDoctorSessions, 
  createDoctorSession,
  logAccess,
  DoctorAccessSession 
} from '@/services/supabaseService';

interface DoctorDashboardProps {
  userId: string;
}

const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ userId }) => {
  const [activeSessions, setActiveSessions] = useState<DoctorAccessSession[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadActiveSessions();
    const interval = setInterval(loadActiveSessions, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadActiveSessions = async () => {
    try {
      const sessions = await getActiveDoctorSessions(userId);
      setActiveSessions(sessions);
    } catch (error) {
      console.error('Error loading active sessions:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les sessions actives."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQRCodeScan = async (patientData: any) => {
    try {
      console.log('Received patient data in dashboard:', patientData);
      
      // Vérifier que les données sont valides
      if (!patientData || !patientData.profile) {
        console.error('Invalid patient data structure:', patientData);
        toast({
          variant: "destructive",
          title: "Données invalides",
          description: "Les données du patient ne sont pas dans le bon format."
        });
        return;
      }

      const { profile, qrCodeId } = patientData;
      
      if (!profile.user_id) {
        console.error('Missing user_id in profile:', profile);
        toast({
          variant: "destructive",
          title: "Données incomplètes",
          description: "L'identifiant du patient est manquant."
        });
        return;
      }

      console.log('Creating doctor session for patient:', profile.user_id);
      
      // Créer une session d'accès
      const session = await createDoctorSession(profile.user_id, userId);
      console.log('Doctor session created:', session);
      
      // Enregistrer l'accès
      await logAccess({
        patient_id: profile.user_id,
        doctor_id: userId,
        action: 'qr_scan',
        details: { 
          qr_code_id: qrCodeId,
          patient_name: profile.name || profile.email,
          access_type: 'doctor_dashboard_scan'
        }
      });

      // Actualiser les sessions
      await loadActiveSessions();
      
      // Sélectionner le patient
      setSelectedPatientId(profile.user_id);

      toast({
        title: "Accès accordé",
        description: `Accès au dossier de ${profile.name || profile.email} pour 30 minutes.`
      });
      
    } catch (error) {
      console.error('Error processing QR code scan:', error);
      toast({
        variant: "destructive",
        title: "Erreur de traitement",
        description: `Impossible de traiter les données du patient: ${error.message || 'Erreur inconnue'}`
      });
    }
  };

  const getTimeRemaining = (expiresAt: string): string => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expiré';
    
    const minutes = Math.floor(diff / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${minutes}m ${seconds}s`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-pulse">Chargement du tableau de bord médecin...</div>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tableau de bord Médecin</h1>
      </div>

      <Tabs defaultValue="sessions" value={selectedPatientId ? "patient" : "sessions"}>
        <TabsList>
          <TabsTrigger value="sessions">
            <Clock size={16} className="mr-2" />
            Sessions actives
          </TabsTrigger>
          {selectedPatientId && (
            <TabsTrigger value="patient">
              <User size={16} className="mr-2" />
              Dossier patient
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="sessions">
          <div className="space-y-6">
            <Card className="dark-container">
              <CardHeader>
                <CardTitle>Scanner QR Code Patient</CardTitle>
              </CardHeader>
              <CardContent>
                <QRCodeScanner onScanSuccess={handleQRCodeScan} />
              </CardContent>
            </Card>

            <Card className="dark-container">
              <CardHeader>
                <CardTitle>Sessions d'accès actives</CardTitle>
              </CardHeader>
              <CardContent>
                {activeSessions.length === 0 ? (
                  <div className="text-center py-8">
                    <Stethoscope size={48} className="mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Aucune session active. Scannez un code QR pour accéder à un dossier médical.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeSessions.map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">Patient ID: {session.patient_id}</p>
                          <p className="text-sm text-muted-foreground">
                            Accès accordé: {new Date(session.access_granted_at).toLocaleString('fr-FR')}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant="secondary">
                            <Clock size={14} className="mr-1" />
                            {getTimeRemaining(session.expires_at)}
                          </Badge>
                          <Button 
                            size="sm"
                            onClick={() => setSelectedPatientId(session.patient_id)}
                          >
                            Voir le dossier
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {selectedPatientId && (
          <TabsContent value="patient">
            <PatientProfile 
              patientId={selectedPatientId} 
              doctorId={userId}
              onBack={() => setSelectedPatientId(null)}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default DoctorDashboard;
