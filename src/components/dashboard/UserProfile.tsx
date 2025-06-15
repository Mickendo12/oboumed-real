
import React, { useState, useEffect } from 'react';
import { getUserProfileWithBMI, updateUserProfile } from '@/services/supabaseService';
import { ProfileWithBMI } from '@/services/supabaseService';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Heart, Phone } from 'lucide-react';
import ProfileInfoTable from './profile/ProfileInfoTable';

// MODAL D'ÉDITION
import EditProfileModal from './profile/EditProfileModal';

interface UserProfileProps {
  userId: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ userId }) => {
  const [profile, setProfile] = useState<ProfileWithBMI | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!userId) return;
        console.log('Fetching profile for user:', userId);
        const userProfile = await getUserProfileWithBMI(userId);
        console.log('Profile data received:', userProfile);
        setProfile(userProfile);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger votre profil."
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId, toast]);

  const refetchProfile = async () => {
    setLoading(true);
    try {
      const userProfile = await getUserProfileWithBMI(userId);
      setProfile(userProfile);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="dark-container">
        <CardContent className="pt-3 xs:pt-4 sm:pt-6 px-2 xs:px-3 sm:px-6">
          <div className="animate-pulse space-y-2 xs:space-y-3 sm:space-y-4">
            <div className="h-3 xs:h-4 bg-gray-300 rounded w-1/4"></div>
            <div className="space-y-1 xs:space-y-2">
              <div className="h-3 xs:h-4 bg-gray-300 rounded"></div>
              <div className="h-3 xs:h-4 bg-gray-300 rounded w-5/6"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card className="dark-container">
        <CardContent className="pt-3 xs:pt-4 sm:pt-6 px-2 xs:px-3 sm:px-6">
          <p className="text-muted-foreground text-xs xs:text-sm sm:text-base">Impossible de charger le profil.</p>
        </CardContent>
      </Card>
    );
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'doctor': return 'default';
      default: return 'secondary';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'doctor': return 'Médecin';
      default: return 'Utilisateur';
    }
  };

  return (
    <div className="space-y-2 xs:space-y-3 sm:space-y-4 lg:space-y-6 px-2 xs:px-3 sm:px-4">
      {/* MODAL édition */}
      <EditProfileModal
        open={editOpen}
        onOpenChange={setEditOpen}
        profile={profile}
        userId={userId}
        onSuccess={() => {
          refetchProfile();
          toast({
            title: "Profil mis à jour",
            description: "Vos informations ont été sauvegardées avec succès.",
          });
        }}
      />
      
      {/* Informations personnelles avec IMC */}
      <Card className="dark-container">
        <CardHeader className="pb-2 xs:pb-3 sm:pb-4">
          <CardTitle className="flex items-center gap-1 xs:gap-1.5 sm:gap-2 text-sm xs:text-base sm:text-lg">
            <User size={14} className="xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
            Informations personnelles
          </CardTitle>
          <CardDescription className="text-[10px] xs:text-xs sm:text-sm">
            Vos informations de base, contact et données physiques
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2 xs:px-3 sm:px-6">
          <div className="grid gap-3 xs:gap-4 sm:gap-6 md:grid-cols-2">
            <div className="space-y-2 xs:space-y-3 sm:space-y-4">
              <div>
                <span className="font-medium text-[10px] xs:text-xs sm:text-sm">Nom complet:</span>
                <p className="text-[10px] xs:text-xs sm:text-sm text-gray-600">
                  {profile.name || 'Non renseigné'}
                </p>
              </div>
              <div>
                <span className="font-medium text-[10px] xs:text-xs sm:text-sm">Email:</span>
                <p className="text-[10px] xs:text-xs sm:text-sm text-gray-600 break-all">{profile.email}</p>
              </div>
              <div>
                <span className="font-medium text-[10px] xs:text-xs sm:text-sm">Téléphone:</span>
                <p className="text-[10px] xs:text-xs sm:text-sm text-gray-600">
                  {profile.phone_number || 'Non renseigné'}
                </p>
              </div>
              <div>
                <span className="font-medium text-[10px] xs:text-xs sm:text-sm">Groupe sanguin:</span>
                <p className="text-[10px] xs:text-xs sm:text-sm text-gray-600">
                  {profile.blood_type || 'Non renseigné'}
                </p>
              </div>
              <div>
                <span className="font-medium text-[10px] xs:text-xs sm:text-sm">Rôle:</span>
                <div className="mt-1">
                  <Badge variant={getRoleBadgeVariant(profile.role)} className="text-[9px] xs:text-[10px] sm:text-xs px-1 xs:px-1.5 sm:px-2 py-0.5 xs:py-1">
                    {getRoleDisplayName(profile.role)}
                  </Badge>
                </div>
              </div>
              <div>
                <span className="font-medium text-[10px] xs:text-xs sm:text-sm">Statut d'accès:</span>
                <div className="mt-1">
                  <Badge variant={profile.access_status === 'active' ? 'default' : 'destructive'} className="text-[9px] xs:text-[10px] sm:text-xs px-1 xs:px-1.5 sm:px-2 py-0.5 xs:py-1">
                    {profile.access_status === 'active' ? 'Actif' : 
                     profile.access_status === 'restricted' ? 'Restreint' : 'Expiré'}
                  </Badge>
                </div>
              </div>
            </div>
            <div>
              <ProfileInfoTable profile={profile} />
            </div>
          </div>
        </CardContent>
        <CardFooter className="px-2 xs:px-3 sm:px-6">
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)} className="text-[10px] xs:text-xs sm:text-sm px-2 xs:px-3 py-1 xs:py-1.5 sm:py-2">
            Modifier mes informations
          </Button>
        </CardFooter>
      </Card>

      {/* Informations médicales */}
      <Card className="dark-container">
        <CardHeader className="pb-2 xs:pb-3 sm:pb-4">
          <CardTitle className="flex items-center gap-1 xs:gap-1.5 sm:gap-2 text-sm xs:text-base sm:text-lg">
            <Heart size={14} className="xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
            Informations médicales
          </CardTitle>
          <CardDescription className="text-[10px] xs:text-xs sm:text-sm">
            Vos informations de santé importantes
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2 xs:px-3 sm:px-6">
          <div className="space-y-2 xs:space-y-3 sm:space-y-4">
            <div>
              <h4 className="font-medium mb-1 xs:mb-2 text-xs xs:text-sm sm:text-base">Allergies</h4>
              <p className="text-[10px] xs:text-xs sm:text-sm text-gray-600 bg-red-50 p-2 xs:p-3 rounded border border-red-200">
                {profile.allergies || 'Aucune allergie connue'}
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-1 xs:mb-2 text-xs xs:text-sm sm:text-base">Maladies chroniques</h4>
              <p className="text-[10px] xs:text-xs sm:text-sm text-gray-600 bg-gray-50 p-2 xs:p-3 rounded border">
                {profile.chronic_diseases || 'Aucune maladie chronique'}
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-1 xs:mb-2 text-xs xs:text-sm sm:text-base">Traitements actuels</h4>
              <p className="text-[10px] xs:text-xs sm:text-sm text-gray-600 bg-blue-50 p-2 xs:p-3 rounded border border-blue-200">
                {profile.current_medications || 'Aucun traitement en cours'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact d'urgence */}
      <Card className="dark-container">
        <CardHeader className="pb-2 xs:pb-3 sm:pb-4">
          <CardTitle className="flex items-center gap-1 xs:gap-1.5 sm:gap-2 text-sm xs:text-base sm:text-lg">
            <Phone size={14} className="xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
            Contact d'urgence
          </CardTitle>
          <CardDescription className="text-[10px] xs:text-xs sm:text-sm">
            Personne à contacter en cas d'urgence médicale
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2 xs:px-3 sm:px-6">
          <div className="space-y-2 xs:space-y-3 sm:space-y-4">
            <div>
              <span className="font-medium text-[10px] xs:text-xs sm:text-sm">Nom du contact:</span>
              <p className="text-[10px] xs:text-xs sm:text-sm text-gray-600">
                {profile.emergency_contact_name || 'Non renseigné'}
              </p>
            </div>
            <div>
              <span className="font-medium text-[10px] xs:text-xs sm:text-sm">Téléphone:</span>
              <p className="text-[10px] xs:text-xs sm:text-sm text-gray-600">
                {profile.emergency_contact_phone || 'Non renseigné'}
              </p>
            </div>
            <div>
              <span className="font-medium text-[10px] xs:text-xs sm:text-sm">Relation:</span>
              <p className="text-[10px] xs:text-xs sm:text-sm text-gray-600">
                {profile.emergency_contact_relationship || 'Non renseigné'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfile;
