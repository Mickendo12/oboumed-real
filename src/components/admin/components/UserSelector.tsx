
import React, { useState, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import { Profile } from '@/services/supabaseService';

interface UserSelectorProps {
  profiles: Profile[];
  selectedUserId: string | null;
  onUserSelect: (userId: string) => void;
  selectedProfile: Profile | null;
}

const UserSelector: React.FC<UserSelectorProps> = ({
  profiles,
  selectedUserId,
  onUserSelect,
  selectedProfile
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

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Filtrer par nom..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Filtrer par email..."
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div>
        <label htmlFor="user-select" className="block text-sm font-medium mb-2">
          Sélectionner un utilisateur
        </label>
        <Select value={selectedUserId || ""} onValueChange={onUserSelect}>
          <SelectTrigger>
            <SelectValue placeholder="Choisir un utilisateur..." />
          </SelectTrigger>
          <SelectContent>
            {filteredProfiles.map((profile) => (
              <SelectItem key={profile.user_id} value={profile.user_id}>
                <div className="flex items-center gap-2 w-full">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">
                      {profile.name || 'Nom non renseigné'}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {profile.email}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Badge variant="outline" className="text-xs">
                      {profile.role}
                    </Badge>
                  </div>
                </div>
              </SelectItem>
            ))}
            {filteredProfiles.length === 0 && profiles.length > 0 && (
              <div className="p-2 text-sm text-muted-foreground text-center">
                Aucun utilisateur trouvé avec ces critères
              </div>
            )}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default UserSelector;
