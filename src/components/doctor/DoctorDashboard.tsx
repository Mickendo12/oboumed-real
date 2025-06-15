
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
      <div className="flex justify-center items-center py-6 xs:py-8 sm:py-12">
        <div className="animate-pulse text-xs xs:text-sm sm:text-base">Chargement du tableau de bord médecin...</div>
      </div>
    );
  }

  return (
    <div className="container py-2 xs:py-3 sm:py-4 lg:py-6 space-y-2 xs:space-y-3 sm:space-y-4 lg:space-y-6 px-2 xs:px-3 sm:px-4">
      <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 xs:gap-3 sm:gap-4">
        <h1 className="text-sm xs:text-base sm:text-lg lg:text-xl xl:text-2xl font-bold">Tableau de bord Médecin</h1>
      </div>

      <Tabs defaultValue="sessions" value={selectedPatientId ? "patient" : "sessions"}>
        <TabsList className="grid w-full grid-cols-2 h-auto p-0.5 xs:p-1 gap-0.5 xs:gap-1">
          <TabsTrigger value="sessions" className="text-[8px] xs:text-[9px] sm:text-[10px] lg:text-xs py-1.5 xs:py-2 sm:py-2.5 px-1 xs:px-1.5 sm:px-2 flex flex-col xs:flex-row items-center gap-0.5 xs:gap-1 sm:gap-1.5">
            <Clock size={10} className="xs:w-3 xs:h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" />
            <span className="hidden xxs:inline">Sessions actives</span>
            <span className="xxs:hidden">Sessions</span>
          </TabsTrigger>
          {selectedPatientId && (
            <TabsTrigger value="patient" className="text-[8px] xs:text-[9px] sm:text-[10px] lg:text-xs py-1.5 xs:py-2 sm:py-2.5 px-1 xs:px-1.5 sm:px-2 flex flex-col xs:flex-row items-center gap-0.5 xs:gap-1 sm:gap-1.5">
              <User size={10} className="xs:w-3 xs:h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" />
              <span className="hidden xxs:inline">Dossier patient</span>
              <span className="xxs:hidden">Dossier</span>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="sessions" className="mt-2 xs:mt-3 sm:mt-4 lg:mt-6">
          <div className="space-y-2 xs:space-y-3 sm:space-y-4 lg:space-y-6">
            <AccessKeyVerification 
              onAccessGranted={handleAccessGranted}
              doctorId={userId}
            />

            <Card className="dark-container">
              <CardHeader className="pb-2 xs:pb-3 sm:pb-4">
                <CardTitle className="text-sm xs:text-base sm:text-lg">Sessions d'accès actives (30 minutes)</CardTitle>
              </CardHeader>
              <CardContent className="px-2 xs:px-3 sm:px-6">
                {activeSessions.length === 0 ? (
                  <div className="text-center py-4 xs:py-6 sm:py-8">
                    <Stethoscope size={32} className="xs:w-10 xs:h-10 sm:w-12 sm:h-12 mx-auto mb-2 xs:mb-3 sm:mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground text-[10px] xs:text-xs sm:text-sm">
                      Aucune session active. Utilisez la clé d'accès ou scannez un QR code pour accéder à un dossier médical.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 xs:space-y-3 sm:space-y-4">
                    {activeSessions.map((session) => {
                      const status = getSessionStatus(session);
                      const isExpired = status.text === 'Expiré';
                      
                      return (
                        <div key={session.id} className={`flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 xs:gap-3 sm:gap-4 p-2 xs:p-3 sm:p-4 border rounded-lg ${isExpired ? 'opacity-60 border-destructive' : ''}`}>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-[10px] xs:text-xs sm:text-sm lg:text-base break-all">Patient ID: {session.patient_id}</p>
                            <p className="text-[9px] xs:text-[10px] sm:text-xs lg:text-sm text-muted-foreground">
                              Accès accordé: {new Date(session.access_granted_at).toLocaleString('fr-FR')}
                            </p>
                            <p className="text-[8px] xs:text-[9px] sm:text-[10px] lg:text-xs text-muted-foreground">
                              Expire à: {new Date(session.expires_at).toLocaleString('fr-FR')}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 xs:gap-3 sm:gap-4 w-full xs:w-auto justify-between xs:justify-end">
                            <Badge variant={status.variant} className="flex items-center gap-1 text-[8px] xs:text-[9px] sm:text-[10px] px-1 xs:px-1.5 sm:px-2 py-0.5 xs:py-1">
                              <Clock size={10} className="xs:w-3 xs:h-3" />
                              {status.text}
                              {isExpired && <AlertTriangle size={10} className="xs:w-3 xs:h-3" />}
                            </Badge>
                            <Button 
                              size="sm"
                              disabled={isExpired}
                              onClick={() => setSelectedPatientId(session.patient_id)}
                              className="text-[9px] xs:text-[10px] sm:text-xs px-2 xs:px-3 py-1 xs:py-1.5 sm:py-2"
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
          <TabsContent value="patient" className="mt-2 xs:mt-3 sm:mt-4 lg:mt-6">
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
