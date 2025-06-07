
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Users, QrCode, Activity } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import QRCodeScanner from './QRCodeScanner';
import QRCodeCameraScanner from './QRCodeCameraScanner';
import PatientProfile from './PatientProfile';
import { getUserProfile, validateQRCode, createDoctorSession, logAccess } from '@/services/supabaseService';

interface DoctorDashboardProps {
  userId: string;
}

const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ userId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Charger les sessions actives du médecin
    loadActiveSessions();
  }, [userId]);

  const loadActiveSessions = async () => {
    try {
      // Charger les sessions actives depuis Supabase
      // Implementation selon votre logique métier
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const handlePatientFound = async (patientId: string) => {
    try {
      // Créer une session d'accès médecin
      await createDoctorSession(patientId, userId);
      
      // Logger l'accès
      await logAccess({
        patient_id: patientId,
        doctor_id: userId,
        action: 'QR_CODE_ACCESS',
        details: { access_method: 'qr_scan' }
      });

      setSelectedPatientId(patientId);
      
      toast({
        title: "Accès patient accordé",
        description: "Vous pouvez maintenant consulter le dossier du patient."
      });
    } catch (error) {
      console.error('Error creating doctor session:', error);
      toast({
        variant: "destructive",
        title: "Erreur d'accès",
        description: "Impossible d'accéder au dossier patient."
      });
    }
  };

  const handleManualSearch = async () => {
    // Implémentation de la recherche manuelle de patients
    // Selon vos règles métier pour l'accès médecin
    toast({
      title: "Recherche manuelle",
      description: "Fonctionnalité en cours de développement."
    });
  };

  if (selectedPatientId) {
    return (
      <div>
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => setSelectedPatientId(null)}
          >
            ← Retour au tableau de bord médecin
          </Button>
        </div>
        <PatientProfile patientId={selectedPatientId} doctorId={userId} />
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tableau de bord Médecin</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Activity size={20} />
            <span className="text-sm text-muted-foreground">
              {sessions.length} sessions actives
            </span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="access">
        <TabsList>
          <TabsTrigger value="access">
            <QrCode size={16} className="mr-2" />
            Accès Patient
          </TabsTrigger>
          <TabsTrigger value="sessions">
            <Users size={16} className="mr-2" />
            Sessions Actives
          </TabsTrigger>
        </TabsList>

        <TabsContent value="access">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Scanner QR Code avec caméra */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="w-5 h-5" />
                  Scanner QR Code (Caméra)
                </CardTitle>
                <CardDescription>
                  Utilisez la caméra pour scanner le QR code du patient
                </CardDescription>
              </CardHeader>
              <CardContent>
                <QRCodeCameraScanner onPatientFound={handlePatientFound} />
              </CardContent>
            </Card>

            {/* Scanner QR Code classique */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="w-5 h-5" />
                  Scanner QR Code (Upload)
                </CardTitle>
                <CardDescription>
                  Téléchargez une image contenant le QR code
                </CardDescription>
              </CardHeader>
              <CardContent>
                <QRCodeScanner onPatientFound={handlePatientFound} />
              </CardContent>
            </Card>

            {/* Recherche manuelle */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Recherche Manuelle
                </CardTitle>
                <CardDescription>
                  Rechercher un patient par identifiant ou clé d'accès
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Input
                    placeholder="ID patient ou clé d'accès..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleManualSearch}
                    disabled={!searchTerm.trim()}
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Rechercher
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle>Sessions d'accès actives</CardTitle>
              <CardDescription>
                Patients actuellement accessibles
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Aucune session active. Scannez un QR code pour accéder à un patient.
                </div>
              ) : (
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div 
                      key={session.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">Patient ID: {session.patient_id}</p>
                        <p className="text-sm text-muted-foreground">
                          Expire le: {new Date(session.expires_at).toLocaleString('fr-FR')}
                        </p>
                      </div>
                      <Button 
                        variant="outline"
                        onClick={() => setSelectedPatientId(session.patient_id)}
                      >
                        Accéder
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DoctorDashboard;
