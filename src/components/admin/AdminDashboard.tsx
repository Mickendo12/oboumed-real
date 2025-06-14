import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Shield, Activity, QrCode } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import QRCodeGenerator from './QRCodeGenerator';
import { 
  getAllProfiles, 
  getAccessLogs, 
  updateUserAccessStatus, 
  generateDoctorAccessKey,
  Profile, 
  AccessLog 
} from '@/services/supabaseService';

const AdminDashboard: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserForQR, setSelectedUserForQR] = useState<Profile | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [profilesData, logsData] = await Promise.all([
        getAllProfiles(),
        getAccessLogs()
      ]);
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

  const handleRestrictAccess = async (userId: string, isRestricted: boolean) => {
    try {
      const newStatus = isRestricted ? 'active' : 'restricted';
      await updateUserAccessStatus(userId, newStatus);
      await loadData();
      toast({
        title: "Statut mis à jour",
        description: `Accès ${isRestricted ? 'activé' : 'restreint'} avec succès.`
      });
    } catch (error) {
      console.error('Error updating access status:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour le statut d'accès."
      });
    }
  };

  const handleGrantDoctorAccess = async (userId: string) => {
    try {
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
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'doctor': return 'default';
      default: return 'secondary';
    }
  };

  const getAccessStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'restricted': return 'destructive';
      case 'expired': return 'secondary';
      default: return 'secondary';
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
        </TabsList>

        <TabsContent value="users">
          <Card className="dark-container">
            <CardHeader>
              <CardTitle>Gestion des utilisateurs</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profiles.map((profile) => (
                    <TableRow key={profile.id}>
                      <TableCell>{profile.name || 'Non renseigné'}</TableCell>
                      <TableCell>{profile.email}</TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(profile.role)}>
                          {profile.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getAccessStatusBadgeVariant(profile.access_status)}>
                          {profile.access_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={profile.access_status === 'restricted' ? 'default' : 'destructive'}
                            onClick={() => handleRestrictAccess(profile.user_id, profile.access_status === 'restricted')}
                          >
                            {profile.access_status === 'restricted' ? 'Activer' : 'Restreindre'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedUserForQR(profile)}
                          >
                            <QrCode size={16} className="mr-1" />
                            QR
                          </Button>
                          {profile.role === 'user' && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleGrantDoctorAccess(profile.user_id)}
                            >
                              <Shield size={16} className="mr-1" />
                              Médecin
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card className="dark-container">
            <CardHeader>
              <CardTitle>Logs d'accès médical</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Médecin</TableHead>
                    <TableHead>Détails</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accessLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        {new Date(log.created_at).toLocaleString('fr-FR')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.action}</Badge>
                      </TableCell>
                      <TableCell>
                        {(log as any).patient?.name || (log as any).patient?.email || 'Inconnu'}
                      </TableCell>
                      <TableCell>
                        {(log as any).doctor?.name || (log as any).doctor?.email || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {log.details ? JSON.stringify(log.details, null, 2) : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedUserForQR && (
        <QRCodeGenerator
          userId={selectedUserForQR.user_id}
          userName={selectedUserForQR.name || ''}
          userEmail={selectedUserForQR.email}
          isOpen={!!selectedUserForQR}
          onClose={() => setSelectedUserForQR(null)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
