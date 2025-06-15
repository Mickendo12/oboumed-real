
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Activity, QrCode } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import UserList from './components/UserList';
import AccessLogsList from './components/AccessLogsList';
import QRCodeGenerator from './QRCodeGenerator';
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
      <div className="flex justify-center items-center py-8 sm:py-12">
        <div className="animate-pulse text-sm sm:text-base">Chargement des données admin...</div>
      </div>
    );
  }

  return (
    <div className="container py-4 sm:py-6 space-y-4 sm:space-y-6 px-2 sm:px-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold">Tableau de bord Admin</h1>
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Users size={16} className="sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm text-muted-foreground">
              {profiles.length} utilisateur{profiles.length > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="users" className="text-xs sm:text-sm py-2 sm:py-2.5">
            <Users size={14} className="mr-1 sm:mr-2 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Utilisateurs</span>
            <span className="xs:hidden">Users</span>
          </TabsTrigger>
          <TabsTrigger value="qrcodes" className="text-xs sm:text-sm py-2 sm:py-2.5">
            <QrCode size={14} className="mr-1 sm:mr-2 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Codes QR</span>
            <span className="xs:hidden">QR</span>
          </TabsTrigger>
          <TabsTrigger value="logs" className="text-xs sm:text-sm py-2 sm:py-2.5">
            <Activity size={14} className="mr-1 sm:mr-2 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Logs d'accès</span>
            <span className="xs:hidden">Logs</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-4 sm:mt-6">
          <UserList
            profiles={profiles}
            userActionLoading={userActionLoading}
            onToggleAccess={handleToggleAccess}
            onGenerateQRAndKey={handleGenerateQRAndKey}
            onGrantDoctorAccess={handleGrantDoctorAccess}
          />
        </TabsContent>

        <TabsContent value="qrcodes" className="mt-4 sm:mt-6">
          <QRCodeGenerator />
        </TabsContent>

        <TabsContent value="logs" className="mt-4 sm:mt-6">
          <AccessLogsList accessLogs={accessLogs} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
