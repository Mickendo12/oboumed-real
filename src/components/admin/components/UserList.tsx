
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
        <CardTitle className="text-sm xs:text-base sm:text-lg lg:text-xl">Gestion des utilisateurs</CardTitle>
        <div className="flex flex-col sm:flex-row gap-2 xs:gap-3 sm:gap-4">
          <div className="relative flex-1">
            <Search size={12} className="absolute left-2 xs:left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4" />
            <Input
              placeholder="Rechercher par nom..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="pl-6 xs:pl-8 sm:pl-10 text-[10px] xs:text-xs sm:text-sm h-6 xs:h-7 sm:h-8 lg:h-9"
            />
          </div>
          <div className="relative flex-1">
            <Search size={12} className="absolute left-2 xs:left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4" />
            <Input
              placeholder="Rechercher par email..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className="pl-6 xs:pl-8 sm:pl-10 text-[10px] xs:text-xs sm:text-sm h-6 xs:h-7 sm:h-8 lg:h-9"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 xs:space-y-3 sm:space-y-4">
          {filteredProfiles.map((profile) => (
            <div key={profile.id} className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between p-2 xs:p-3 sm:p-4 border rounded gap-2 xs:gap-3 sm:gap-4">
              <div className="flex-1 space-y-1 xs:space-y-1.5 sm:space-y-2">
                <div className="flex flex-col xs:flex-row xs:items-center gap-1.5 xs:gap-2 sm:gap-3">
                  <div className="min-w-0">
                    <h3 className="font-medium text-xs xs:text-sm sm:text-base lg:text-lg truncate">
                      {profile.name || 'Nom non renseigné'}
                    </h3>
                    <p className="text-[9px] xs:text-[10px] sm:text-xs lg:text-sm text-muted-foreground truncate">{profile.email}</p>
                  </div>
                  <div className="flex gap-1 xs:gap-1.5 sm:gap-2 flex-wrap">
                    <Badge variant={getRoleBadgeVariant(profile.role)} className="text-[7px] xs:text-[8px] sm:text-[9px] lg:text-[10px] px-1 xs:px-1.5 sm:px-2 py-0.5">
                      {profile.role}
                    </Badge>
                    <Badge variant={getAccessStatusBadgeVariant(profile.access_status)} className="text-[7px] xs:text-[8px] sm:text-[9px] lg:text-[10px] px-1 xs:px-1.5 sm:px-2 py-0.5">
                      {profile.access_status}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-1 xs:gap-1.5 sm:gap-2">
                {/* Génération QR Code et Clé */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onGenerateQRAndKey(profile.user_id)}
                  disabled={userActionLoading === profile.user_id}
                  className="flex items-center justify-center gap-0.5 xs:gap-1 text-[8px] xs:text-[9px] sm:text-[10px] lg:text-xs px-1.5 xs:px-2 sm:px-3"
                >
                  <QrCode size={10} className="xs:w-3 xs:h-3 sm:w-3.5 sm:h-3.5" />
                  <span className="hidden xs:inline">QR & Clé</span>
                  <span className="xs:hidden">QR</span>
                </Button>

                {/* Toggle Access */}
                <Button
                  size="sm"
                  variant={profile.access_status === 'restricted' ? 'default' : 'destructive'}
                  onClick={() => onToggleAccess(profile.user_id, profile.access_status)}
                  disabled={userActionLoading === profile.user_id}
                  className="flex items-center justify-center gap-0.5 xs:gap-1 text-[8px] xs:text-[9px] sm:text-[10px] lg:text-xs px-1.5 xs:px-2 sm:px-3"
                >
                  {profile.access_status === 'restricted' ? (
                    <>
                      <UserCheck size={10} className="xs:w-3 xs:h-3 sm:w-3.5 sm:h-3.5" />
                      <span className="hidden xs:inline">Activer</span>
                      <span className="xs:hidden">+</span>
                    </>
                  ) : (
                    <>
                      <UserX size={10} className="xs:w-3 xs:h-3 sm:w-3.5 sm:h-3.5" />
                      <span className="hidden xs:inline">Restreindre</span>
                      <span className="xs:hidden">-</span>
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
                    className="flex items-center justify-center gap-0.5 xs:gap-1 text-[8px] xs:text-[9px] sm:text-[10px] lg:text-xs px-1.5 xs:px-2 sm:px-3"
                  >
                    <Shield size={10} className="xs:w-3 xs:h-3 sm:w-3.5 sm:h-3.5" />
                    <span className="hidden xs:inline">Promouvoir</span>
                    <span className="xs:hidden">↑</span>
                  </Button>
                )}
              </div>
            </div>
          ))}
          
          {filteredProfiles.length === 0 && profiles.length > 0 && (
            <div className="text-center py-6 xs:py-8 text-muted-foreground text-[10px] xs:text-xs sm:text-sm">
              Aucun utilisateur trouvé avec ces critères de recherche
            </div>
          )}
          
          {profiles.length === 0 && (
            <div className="text-center py-6 xs:py-8 text-muted-foreground text-[10px] xs:text-xs sm:text-sm">
              Aucun utilisateur trouvé
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserList;
