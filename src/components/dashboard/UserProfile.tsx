import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Save, Phone, Mail, Heart, AlertTriangle, Pill, Users } from 'lucide-react';
import { getUserProfile, updateUserProfile } from '@/services/supabaseService';

interface UserProfileProps {
  userId: string;
}

interface ProfileState {
  name: string | null;
  email: string;
  phone_number: string | null;
  blood_type: string | null;
  allergies: string | null;
  chronic_diseases: string | null;
  current_medications: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  emergency_contact_relationship: string | null;
}

const UserProfile: React.FC<UserProfileProps> = ({ userId }) => {
  const [profile, setProfile] = useState<ProfileState | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadUserProfile();
  }, [userId]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const userProfile = await getUserProfile(userId);
      if (userProfile) {
        setProfile({
          name: userProfile.name || null,
          email: userProfile.email,
          phone_number: userProfile.phone_number || null,
          blood_type: userProfile.blood_type || null,
          allergies: userProfile.allergies || null,
          chronic_diseases: userProfile.chronic_diseases || null,
          current_medications: userProfile.current_medications || null,
          emergency_contact_name: userProfile.emergency_contact_name || null,
          emergency_contact_phone: userProfile.emergency_contact_phone || null,
          emergency_contact_relationship: userProfile.emergency_contact_relationship || null,
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger le profil utilisateur."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!profile) {
        throw new Error("No profile data available to update.");
      }
      
      await updateUserProfile(userId, profile);
      toast({
        title: "Profil mis à jour",
        description: "Votre profil a été mis à jour avec succès."
      });
      setEditing(false);
    } catch (error) {
      console.error('Error updating user profile:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour le profil utilisateur."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile(prevProfile => ({
      ...prevProfile,
      [name]: value,
    } as ProfileState));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-pulse">Chargement du profil...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <Card className="dark-container">
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">Impossible de charger le profil utilisateur.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="dark-container">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User size={20} />
          {editing ? 'Modifier le profil' : 'Votre profil'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {editing ? (
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nom complet</Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={profile.name || ''}
                  onChange={handleChange}
                  placeholder="Votre nom complet"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={profile.email}
                  placeholder="Votre adresse email"
                  readOnly
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone_number">Numéro de téléphone</Label>
                <Input
                  type="tel"
                  id="phone_number"
                  name="phone_number"
                  value={profile.phone_number || ''}
                  onChange={handleChange}
                  placeholder="Votre numéro de téléphone"
                />
              </div>
              <div>
                <Label htmlFor="blood_type">Groupe sanguin</Label>
                <Select onValueChange={(value) => setProfile(prev => ({ ...prev, blood_type: value }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner" defaultValue={profile.blood_type || undefined} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="emergency_contact_name">Contact d'urgence - Nom</Label>
                <Input
                  type="text"
                  id="emergency_contact_name"
                  name="emergency_contact_name"
                  value={profile.emergency_contact_name || ''}
                  onChange={handleChange}
                  placeholder="Nom du contact d'urgence"
                />
              </div>
              <div>
                <Label htmlFor="emergency_contact_phone">Contact d'urgence - Téléphone</Label>
                <Input
                  type="tel"
                  id="emergency_contact_phone"
                  name="emergency_contact_phone"
                  value={profile.emergency_contact_phone || ''}
                  onChange={handleChange}
                  placeholder="Téléphone du contact d'urgence"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="emergency_contact_relationship">Contact d'urgence - Relation</Label>
              <Input
                type="text"
                id="emergency_contact_relationship"
                name="emergency_contact_relationship"
                value={profile.emergency_contact_relationship || ''}
                onChange={handleChange}
                placeholder="Relation avec le contact d'urgence"
              />
            </div>
            <div>
              <Label htmlFor="allergies">Allergies</Label>
              <Textarea
                id="allergies"
                name="allergies"
                value={profile.allergies || ''}
                onChange={handleChange}
                placeholder="Vos allergies"
              />
            </div>
            <div>
              <Label htmlFor="chronic_diseases">Maladies chroniques</Label>
              <Textarea
                id="chronic_diseases"
                name="chronic_diseases"
                value={profile.chronic_diseases || ''}
                onChange={handleChange}
                placeholder="Vos maladies chroniques"
              />
            </div>
            <div>
              <Label htmlFor="current_medications">Traitements actuels</Label>
              <Textarea
                id="current_medications"
                name="current_medications"
                value={profile.current_medications || ''}
                onChange={handleChange}
                placeholder="Vos traitements actuels"
              />
            </div>
            <Button disabled={loading} className="w-full">
              <Save size={16} className="mr-2" />
              {loading ? 'Mise à jour...' : 'Mettre à jour le profil'}
            </Button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-200 dark:border-700">
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-muted-foreground" />
                    <h3 className="text-sm font-medium">Informations personnelles</h3>
                  </div>
                  <div className="text-sm">
                    <p><strong>Nom:</strong> {profile.name || 'Non renseigné'}</p>
                    <p><strong>Email:</strong> {profile.email}</p>
                    <p><strong>Téléphone:</strong> {profile.phone_number || 'Non renseigné'}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-200 dark:border-700">
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Heart size={16} className="text-muted-foreground" />
                    <h3 className="text-sm font-medium">Informations médicales</h3>
                  </div>
                  <div className="text-sm">
                    <p><strong>Groupe sanguin:</strong> {profile.blood_type || 'Non renseigné'}</p>
                    <p><strong>Allergies:</strong> {profile.allergies || 'Aucune'}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
            <Card className="border-200 dark:border-700">
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-muted-foreground" />
                  <h3 className="text-sm font-medium">Contact d'urgence</h3>
                </div>
                <div className="text-sm">
                  <p><strong>Nom:</strong> {profile.emergency_contact_name || 'Non renseigné'}</p>
                  <p><strong>Téléphone:</strong> {profile.emergency_contact_phone || 'Non renseigné'}</p>
                  <p><strong>Relation:</strong> {profile.emergency_contact_relationship || 'Non renseigné'}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-200 dark:border-700">
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <Pill size={16} className="text-muted-foreground" />
                  <h3 className="text-sm font-medium">Traitements</h3>
                </div>
                <div className="text-sm">
                  <p><strong>Maladies chroniques:</strong> {profile.chronic_diseases || 'Aucune'}</p>
                  <p><strong>Médicaments actuels:</strong> {profile.current_medications || 'Aucun'}</p>
                </div>
              </CardContent>
            </Card>
            <Button onClick={() => setEditing(true)} className="w-full">
              <Users size={16} className="mr-2" />
              Modifier le profil
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserProfile;
