
import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Droplet, Phone, UserPlus, Shield } from 'lucide-react';
import { getUserProfile, updateUserProfile, toggleShareWithDoctor } from '@/services/firestoreService';
import { UserProfile as UserProfileType } from '@/services/authService';
import { auth } from "@/lib/firebase";
import { useToast } from '@/components/ui/use-toast';

interface UserProfileProps {
  userId: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ userId }) => {
  const [profile, setProfile] = useState<UserProfileType & {id?: string} | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSharingEnabled, setIsSharingEnabled] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!userId) return;
        
        const userProfile = await getUserProfile(userId);
        setProfile(userProfile);
        setIsSharingEnabled(userProfile?.shareWithDoctor || false);
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
      if (!profile?.id) return;
      
      const newSharingState = !isSharingEnabled;
      await toggleShareWithDoctor(profile.id, newSharingState);
      
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
    return (
      <Card className="dark-container">
        <CardContent className="pt-6">
          <div className="animate-pulse flex flex-col gap-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="dark-container">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Mon profil médical</CardTitle>
            <CardDescription>
              Informations médicales importantes et contacts d'urgence
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-sm text-muted-foreground mr-2">
              Partager avec mes médecins
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Switch
                  checked={isSharingEnabled}
                  onCheckedChange={handleToggleSharing}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>{isSharingEnabled 
                  ? "Désactiver le partage de vos informations médicales"
                  : "Activer le partage de vos informations médicales"}
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium flex items-center">
                <Droplet className="mr-2" size={16} />
                Groupe sanguin
              </TableCell>
              <TableCell>
                {profile?.bloodType ? (
                  <Badge variant="outline">{profile.bloodType}</Badge>
                ) : (
                  <span className="text-muted-foreground text-sm">Non renseigné</span>
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium flex items-center">
                <Phone className="mr-2" size={16} />
                Téléphone
              </TableCell>
              <TableCell>
                {profile?.phoneNumber || <span className="text-muted-foreground text-sm">Non renseigné</span>}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium flex items-center">
                <UserPlus className="mr-2" size={16} />
                Contact d'urgence
              </TableCell>
              <TableCell>
                {profile?.emergencyContact?.name ? (
                  <div>
                    <div>{profile.emergencyContact.name}</div>
                    <div className="text-sm text-muted-foreground">{profile.emergencyContact.phoneNumber}</div>
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">Non renseigné</span>
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium flex items-center align-top">
                <Shield className="mr-2 mt-0.5" size={16} />
                Allergies
              </TableCell>
              <TableCell>
                {profile?.allergies ? (
                  <div className="whitespace-pre-wrap">{profile.allergies}</div>
                ) : (
                  <span className="text-muted-foreground text-sm">Non renseigné</span>
                )}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>

      <CardFooter className="border-t pt-4">
        <div className="flex justify-between w-full">
          <div className="flex items-center">
            {isSharingEnabled ? (
              <Badge className="bg-green-500 hover:bg-green-600">
                Partage activé
              </Badge>
            ) : (
              <Badge variant="outline">
                Partage désactivé
              </Badge>
            )}
          </div>
          <Button variant="outline" size="sm">
            Modifier mes informations
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default UserProfile;
