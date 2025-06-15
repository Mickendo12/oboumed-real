
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Activity, QrCode } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import QRCodeGenerator from './QRCodeGenerator';
import UserList from './components/UserList';
import AccessLogsList from './components/AccessLogsList';
import { 
  getAllProfiles, 
  getAccessLogs, 
  updateUserAccessStatus, 
  generateDoctorAccessKey,
  generateQRCodeForUser,
  Profile, 
  AccessLog 
} from '@/services/supabaseService';

const AdminDashboard: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [userActionLoading, setUserActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('Loading admin data...');
      const [profilesData, logsData] = await Promise.all([
        getAllProfiles(),
        getAccessLogs()
      ]);
      console.log('Profiles loaded:', profilesData);
      console.log('Logs loaded:', logsData);
      setProfiles(profilesData);
      setAccessLogs(logsData);
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les données."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAccess = async (userId: string, currentStatus: string) => {
    try {
      setUserActionLoading(userId);
      const newStatus = currentStatus === 'restricted' ? 'active' : 'restricted';
      await updateUserAccessStatus(userId, newStatus);
      await loadData();
      toast({
        title: "Statut mis à jour",
        description: `Accès ${newStatus === 'active' ? 'activé' : 'restreint'} avec succès.`
      });
    } catch (error) {
      console.error('Error updating access status:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour le statut d'accès."
      });
    } finally {
      setUserActionLoading(null);
    }
  };

  const handleGenerateQRAndKey = async (userId: string) => {
    try {
      setUserActionLoading(userId);
      const qrCode = await generateQRCodeForUser(userId);
      await loadData();
      toast({
        title: "Code QR et clé générés",
        description: "Le code QR et la clé d'accès ont été générés avec succès."
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de générer le code QR."
      });
    } finally {
      setUserActionLoading(null);
    }
  };

  const handleGrantDoctorAccess = async (userId: string) => {
    try {
      setUserActionLoading(userId);
      const accessKey = await generateDoctorAccessKey(userId);
      await loadData();
      toast({
        title: "Accès médecin accordé",
        description: `Clé d'accès: ${accessKey}`
      });
    } catch (error) {
      console.error('Error granting doctor access:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'accorder l'accès médecin."
      });
    } finally {
      setUserActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-pulse">Chargement des données admin...</div>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tableau de bord Admin</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Users size={20} />
            <span className="text-sm text-muted-foreground">
              {profiles.length} utilisateurs
            </span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">
            <Users size={16} className="mr-2" />
            Utilisateurs
          </TabsTrigger>
          <TabsTrigger value="logs">
            <Activity size={16} className="mr-2" />
            Logs d'accès
          </TabsTrigger>
          <TabsTrigger value="qr">
            <QrCode size={16} className="mr-2" />
            Générateur QR
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <UserList
            profiles={profiles}
            userActionLoading={userActionLoading}
            onToggleAccess={handleToggleAccess}
            onGenerateQRAndKey={handleGenerateQRAndKey}
            onGrantDoctorAccess={handleGrantDoctorAccess}
          />
        </TabsContent>

        <TabsContent value="logs">
          <AccessLogsList accessLogs={accessLogs} />
        </TabsContent>

        <TabsContent value="qr">
          <QRCodeGenerator />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
