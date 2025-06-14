
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
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-300 rounded w-1/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded w-5/6"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card className="dark-container">
        <CardContent className="pt-6">
          <p className="text-muted-foreground">Impossible de charger le profil.</p>
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
    <div className="space-y-6">
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
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User size={20} />
            Informations personnelles
          </CardTitle>
          <CardDescription>
            Vos informations de base, contact et données physiques
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <span className="font-medium">Nom complet:</span>
                <p className="text-sm text-gray-600">
                  {profile.name || 'Non renseigné'}
                </p>
              </div>
              <div>
                <span className="font-medium">Email:</span>
                <p className="text-sm text-gray-600">{profile.email}</p>
              </div>
              <div>
                <span className="font-medium">Téléphone:</span>
                <p className="text-sm text-gray-600">
                  {profile.phone_number || 'Non renseigné'}
                </p>
              </div>
              <div>
                <span className="font-medium">Groupe sanguin:</span>
                <p className="text-sm text-gray-600">
                  {profile.blood_type || 'Non renseigné'}
                </p>
              </div>
              <div>
                <span className="font-medium">Rôle:</span>
                <div className="mt-1">
                  <Badge variant={getRoleBadgeVariant(profile.role)}>
                    {getRoleDisplayName(profile.role)}
                  </Badge>
                </div>
              </div>
              <div>
                <span className="font-medium">Statut d'accès:</span>
                <div className="mt-1">
                  <Badge variant={profile.access_status === 'active' ? 'default' : 'destructive'}>
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
        <CardFooter>
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            Modifier mes informations
          </Button>
        </CardFooter>
      </Card>

      {/* Informations médicales */}
      <Card className="dark-container">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart size={20} />
            Informations médicales
          </CardTitle>
          <CardDescription>
            Vos informations de santé importantes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Allergies</h4>
              <p className="text-sm text-gray-600">
                {profile.allergies || 'Aucune allergie connue'}
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Maladies chroniques</h4>
              <p className="text-sm text-gray-600">
                {profile.chronic_diseases || 'Aucune maladie chronique'}
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Traitements actuels</h4>
              <p className="text-sm text-gray-600">
                {profile.current_medications || 'Aucun traitement en cours'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact d'urgence */}
      <Card className="dark-container">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone size={20} />
            Contact d'urgence
          </CardTitle>
          <CardDescription>
            Personne à contacter en cas d'urgence médicale
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <span className="font-medium">Nom du contact:</span>
              <p className="text-sm text-gray-600">
                {profile.emergency_contact_name || 'Non renseigné'}
              </p>
            </div>
            <div>
              <span className="font-medium">Téléphone:</span>
              <p className="text-sm text-gray-600">
                {profile.emergency_contact_phone || 'Non renseigné'}
              </p>
            </div>
            <div>
              <span className="font-medium">Relation:</span>
              <p className="text-sm text-gray-600">
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
