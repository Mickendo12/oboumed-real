
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Profile } from '@/services/supabaseService';

interface UserSelectorProps {
  profiles: Profile[];
  selectedUserId: string;
  onUserSelect: (userId: string) => void;
  selectedProfile?: Profile;
}

const UserSelector: React.FC<UserSelectorProps> = ({
  profiles,
  selectedUserId,
  onUserSelect,
  selectedProfile
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Sélectionner un utilisateur</label>
        <Select value={selectedUserId} onValueChange={onUserSelect}>
          <SelectTrigger>
            <SelectValue placeholder="Choisir un utilisateur" />
          </SelectTrigger>
          <SelectContent>
            {profiles.map((profile) => (
              <SelectItem key={profile.user_id} value={profile.user_id}>
                <div className="flex items-center gap-2">
                  <span>{profile.name || profile.email}</span>
                  <Badge variant={profile.role === 'admin' ? 'destructive' : 
                               profile.role === 'doctor' ? 'default' : 'secondary'}>
                    {profile.role}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedProfile && (
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Utilisateur sélectionné</h4>
          <div className="space-y-1">
            <p className="text-sm"><strong>Nom:</strong> {selectedProfile.name || 'Non renseigné'}</p>
            <p className="text-sm"><strong>Email:</strong> {selectedProfile.email}</p>
            <p className="text-sm"><strong>Rôle:</strong> {selectedProfile.role}</p>
            <p className="text-sm">
              <strong>Statut:</strong> 
              <Badge variant={selectedProfile.access_status === 'active' ? 'default' : 'destructive'} className="ml-1">
                {selectedProfile.access_status}
              </Badge>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSelector;
