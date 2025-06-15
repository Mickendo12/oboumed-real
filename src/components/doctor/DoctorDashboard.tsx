
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, User, Stethoscope, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import AccessKeyVerification from './AccessKeyVerification';
import PatientProfile from './PatientProfile';
import { 
  getActiveDoctorSessions, 
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
  const [sessionCountdowns, setSessionCountdowns] = useState<{ [sessionId: string]: string }>({});
  const { toast } = useToast();

  useEffect(() => {
    loadActiveSessions();
    const interval = setInterval(loadActiveSessions, 30000);
    return () => clearInterval(interval);
  }, []);

  // Compte à rebours en temps réel
  useEffect(() => {
    const countdownInterval = setInterval(() => {
      const now = new Date();
      const newCountdowns: { [sessionId: string]: string } = {};
      let hasExpiredSessions = false;

      activeSessions.forEach((session) => {
        const expiry = new Date(session.expires_at);
        const diff = expiry.getTime() - now.getTime();
        
        if (diff <= 0) {
          newCountdowns[session.id] = 'Expiré';
          hasExpiredSessions = true;
          
          // Si la session sélectionnée est expirée, on retourne à la liste
          if (selectedPatientId === session.patient_id) {
            setSelectedPatientId(null);
            toast({
              variant: "destructive",
              title: "Session expirée",
              description: "Votre accès au dossier médical a expiré. Veuillez rescanner ou réentrer la clé d'accès."
            });
          }
        } else {
          const minutes = Math.floor(diff / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          newCountdowns[session.id] = `${minutes}m ${seconds}s`;
        }
      });

      setSessionCountdowns(newCountdowns);

      // Recharger les sessions si certaines ont expiré
      if (hasExpiredSessions) {
        loadActiveSessions();
      }
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [activeSessions, selectedPatientId, toast]);

  const loadActiveSessions = async () => {
    try {
      const sessions = await getActiveDoctorSessions(userId);
      console.log('Loaded active sessions:', sessions);
      
      // Filtrer les sessions qui ne sont pas encore expirées côté client
      const now = new Date();
      const validSessions = sessions.filter(session => {
        const expiry = new Date(session.expires_at);
        return expiry > now;
      });
      
      setActiveSessions(validSessions);
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

  const handleAccessGranted = async (patientData: any) => {
    try {
      console.log('Received patient data in dashboard:', patientData);
      
      if (!patientData?.profile?.user_id) {
        console.error('Invalid patient data - missing user_id:', patientData);
        toast({
          variant: "destructive",
          title: "Données invalides",
          description: "Les données du patient sont incomplètes."
        });
        return;
      }

      const { profile } = patientData;
      const patientUserId = profile.user_id;
      
      console.log('Access granted for patient:', patientUserId);
      
      // Actualiser les sessions
      await loadActiveSessions();
      
      // Sélectionner le patient
      setSelectedPatientId(patientUserId);
      
      toast({
        title: "Accès accordé",
        description: `Session d'accès de 30 minutes démarrée pour ${profile.name || profile.email}`
      });
      
    } catch (error) {
      console.error('Error processing access grant:', error);
      toast({
        variant: "destructive",
        title: "Erreur de traitement",
        description: `Impossible de traiter l'accès patient: ${error.message || 'Erreur inconnue'}`
      });
    }
  };

  const handleSessionExpiry = (sessionId: string) => {
    const expiredSession = activeSessions.find(s => s.id === sessionId);
    if (expiredSession && selectedPatientId === expiredSession.patient_id) {
      setSelectedPatientId(null);
      toast({
        variant: "destructive",
        title: "Session expirée",
        description: "Votre accès au dossier médical a expiré. Veuillez rescanner ou réentrer la clé d'accès."
      });
    }
    loadActiveSessions();
  };

  const getSessionStatus = (session: DoctorAccessSession) => {
    const countdown = sessionCountdowns[session.id];
    const isExpired = countdown === 'Expiré';
    const isExpiring = countdown && countdown.includes('m') && parseInt(countdown) < 5;

    if (isExpired) {
      return { variant: 'destructive' as const, text: 'Expiré' };
    } else if (isExpiring) {
      return { variant: 'secondary' as const, text: countdown };
    } else {
      return { variant: 'default' as const, text: countdown || 'Chargement...' };
    }
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
            <AccessKeyVerification 
              onAccessGranted={handleAccessGranted}
              doctorId={userId}
            />

            <Card className="dark-container">
              <CardHeader>
                <CardTitle>Sessions d'accès actives (30 minutes)</CardTitle>
              </CardHeader>
              <CardContent>
                {activeSessions.length === 0 ? (
                  <div className="text-center py-8">
                    <Stethoscope size={48} className="mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Aucune session active. Utilisez la clé d'accès ou scannez un QR code pour accéder à un dossier médical.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeSessions.map((session) => {
                      const status = getSessionStatus(session);
                      const isExpired = status.text === 'Expiré';
                      
                      return (
                        <div key={session.id} className={`flex items-center justify-between p-4 border rounded-lg ${isExpired ? 'opacity-60 border-destructive' : ''}`}>
                          <div>
                            <p className="font-medium">Patient ID: {session.patient_id}</p>
                            <p className="text-sm text-muted-foreground">
                              Accès accordé: {new Date(session.access_granted_at).toLocaleString('fr-FR')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Expire à: {new Date(session.expires_at).toLocaleString('fr-FR')}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge variant={status.variant} className="flex items-center gap-1">
                              <Clock size={14} />
                              {status.text}
                              {isExpired && <AlertTriangle size={14} />}
                            </Badge>
                            <Button 
                              size="sm"
                              disabled={isExpired}
                              onClick={() => setSelectedPatientId(session.patient_id)}
                            >
                              {isExpired ? 'Session expirée' : 'Voir le dossier'}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
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
              onSessionExpired={() => handleSessionExpiry(activeSessions.find(s => s.patient_id === selectedPatientId)?.id || '')}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default DoctorDashboard;
