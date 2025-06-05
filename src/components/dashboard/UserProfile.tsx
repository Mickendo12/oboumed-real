
import React, { useState, useEffect } from 'react';
import { getUserProfile, updateUserProfile } from '@/services/supabaseService';
import { Profile } from '@/services/supabaseService';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import ProfileHeader from './profile/ProfileHeader';
import ProfileInfoTable from './profile/ProfileInfoTable';
import ProfileFooter from './profile/ProfileFooter';
import LoadingProfileSkeleton from './profile/LoadingProfileSkeleton';

interface UserProfileProps {
  userId: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ userId }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSharingEnabled, setIsSharingEnabled] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!userId) return;
        
        const userProfile = await getUserProfile(userId);
        setProfile(userProfile);
        setIsSharingEnabled(userProfile?.share_with_doctor || false);
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

  const handleToggleSharing = async () => {
    try {
      if (!profile?.user_id) return;
      
      const newSharingState = !isSharingEnabled;
      await updateUserProfile(profile.user_id, {
        share_with_doctor: newSharingState
      });
      
      setIsSharingEnabled(newSharingState);
      toast({
        title: "Paramètres mis à jour",
        description: newSharingState 
          ? "Vos informations peuvent maintenant être partagées avec les médecins." 
          : "Vos informations ne seront plus partagées avec les médecins."
      });
    } catch (error) {
      console.error("Error updating sharing preferences:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour vos préférences de partage."
      });
    }
  };

  if (loading) {
    return <LoadingProfileSkeleton />;
  }

  return (
    <Card className="dark-container">
      <ProfileHeader 
        isSharingEnabled={isSharingEnabled}
        onToggleSharing={handleToggleSharing}
      />
      <CardContent>
        <ProfileInfoTable profile={profile} />
      </CardContent>
      <ProfileFooter 
        isSharingEnabled={isSharingEnabled} 
      />
    </Card>
  );
};

export default UserProfile;
