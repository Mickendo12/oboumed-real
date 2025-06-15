
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { QrCode, Key, Shield, UserX, UserCheck, Search } from 'lucide-react';
import { Profile } from '@/services/supabaseService';

interface UserListProps {
  profiles: Profile[];
  userActionLoading: string | null;
  onToggleAccess: (userId: string, currentStatus: string) => void;
  onGenerateQRAndKey: (userId: string) => void;
  onGrantDoctorAccess: (userId: string) => void;
}

const UserList: React.FC<UserListProps> = ({
  profiles,
  userActionLoading,
  onToggleAccess,
  onGenerateQRAndKey,
  onGrantDoctorAccess
}) => {
  const [searchName, setSearchName] = useState('');
  const [searchEmail, setSearchEmail] = useState('');

  const filteredProfiles = useMemo(() => {
    return profiles.filter(profile => {
      const nameMatch = !searchName || 
        (profile.name && profile.name.toLowerCase().includes(searchName.toLowerCase()));
      const emailMatch = !searchEmail || 
        profile.email.toLowerCase().includes(searchEmail.toLowerCase());
      
      return nameMatch && emailMatch;
    });
  }, [profiles, searchName, searchEmail]);

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestion des utilisateurs</CardTitle>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher par email..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredProfiles.map((profile) => (
            <div key={profile.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <div>
                    <h3 className="font-medium text-lg">
                      {profile.name || 'Nom non renseigné'}
                    </h3>
                    <p className="text-sm text-muted-foreground">{profile.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={getRoleBadgeVariant(profile.role)}>
                      {profile.role}
                    </Badge>
                    <Badge variant={getAccessStatusBadgeVariant(profile.access_status)}>
                      {profile.access_status}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                {/* Génération QR Code et Clé */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onGenerateQRAndKey(profile.user_id)}
                  disabled={userActionLoading === profile.user_id}
                  className="flex items-center gap-1"
                >
                  <QrCode size={14} />
                  QR & Clé
                </Button>

                {/* Toggle Access */}
                <Button
                  size="sm"
                  variant={profile.access_status === 'restricted' ? 'default' : 'destructive'}
                  onClick={() => onToggleAccess(profile.user_id, profile.access_status)}
                  disabled={userActionLoading === profile.user_id}
                  className="flex items-center gap-1"
                >
                  {profile.access_status === 'restricted' ? (
                    <>
                      <UserCheck size={14} />
                      Activer
                    </>
                  ) : (
                    <>
                      <UserX size={14} />
                      Restreindre
                    </>
                  )}
                </Button>

                {/* Grant Doctor Access (only for regular users) */}
                {profile.role === 'user' && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onGrantDoctorAccess(profile.user_id)}
                    disabled={userActionLoading === profile.user_id}
                    className="flex items-center gap-1"
                  >
                    <Shield size={14} />
                    Promouvoir
                  </Button>
                )}
              </div>
            </div>
          ))}
          
          {filteredProfiles.length === 0 && profiles.length > 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Aucun utilisateur trouvé avec ces critères de recherche
            </div>
          )}
          
          {profiles.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Aucun utilisateur trouvé
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserList;
