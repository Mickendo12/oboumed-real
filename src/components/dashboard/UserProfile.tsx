
import React, { useState, useEffect } from 'react';
import { getUserProfile, updateUserProfile } from '@/services/supabaseService';
import { Profile } from '@/services/supabaseService';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { User, Heart, Phone, Shield } from 'lucide-react';

interface UserProfileProps {
  userId: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ userId }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!userId) return;
        
        const userProfile = await getUserProfile(userId);
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

  return (
    <div className="space-y-6">
      {/* Informations personnelles */}
      <Card className="dark-container">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User size={20} />
            Informations personnelles
          </CardTitle>
          <CardDescription>
            Vos informations de base et de contact
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Nom complet</TableCell>
                <TableCell>{profile.name || 'Non renseigné'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Email</TableCell>
                <TableCell>{profile.email}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Téléphone</TableCell>
                <TableCell>{profile.phone_number || 'Non renseigné'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Rôle</TableCell>
                <TableCell>
                  <Badge variant={getRoleBadgeVariant(profile.role)}>
                    {profile.role === 'admin' ? 'Administrateur' : 
                     profile.role === 'doctor' ? 'Médecin' : 'Utilisateur'}
                  </Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Statut d'accès</TableCell>
                <TableCell>
                  <Badge variant={profile.access_status === 'active' ? 'default' : 'destructive'}>
                    {profile.access_status === 'active' ? 'Actif' : 
                     profile.access_status === 'restricted' ? 'Restreint' : 'Expiré'}
                  </Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
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
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Groupe sanguin</TableCell>
                <TableCell>
                  {profile.blood_type ? (
                    <Badge variant="outline">{profile.blood_type}</Badge>
                  ) : (
                    'Non renseigné'
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Allergies</TableCell>
                <TableCell>{profile.allergies || 'Aucune allergie connue'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Maladies chroniques</TableCell>
                <TableCell>{profile.chronic_diseases || 'Aucune maladie chronique'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Traitements actuels</TableCell>
                <TableCell>{profile.current_medications || 'Aucun traitement en cours'}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
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
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Nom du contact</TableCell>
                <TableCell>{profile.emergency_contact_name || 'Non renseigné'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Téléphone</TableCell>
                <TableCell>{profile.emergency_contact_phone || 'Non renseigné'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Relation</TableCell>
                <TableCell>{profile.emergency_contact_relationship || 'Non renseigné'}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <Button variant="outline" size="sm">
            Modifier mes informations
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default UserProfile;
