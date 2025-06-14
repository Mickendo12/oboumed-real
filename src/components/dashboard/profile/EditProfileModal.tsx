
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateUserProfile, ProfileWithBMI } from "@/services/supabaseService";
import { useToast } from "@/components/ui/use-toast";

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: ProfileWithBMI;
  userId: string;
  onSuccess: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  open,
  onOpenChange,
  profile,
  userId,
  onSuccess,
}) => {
  const { toast } = useToast();
  
  // States synchronisés sur le profil
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [allergies, setAllergies] = useState("");
  const [chronicDiseases, setChronicDiseases] = useState("");
  const [currentMedications, setCurrentMedications] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [emergencyRelation, setEmergencyRelation] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [loading, setLoading] = useState(false);

  // Synchroniser l'état local avec le profil à chaque ouverture du modal
  useEffect(() => {
    if (open && profile) {
      console.log('Setting modal values from profile:', profile);
      setName(profile.name || "");
      setPhone(profile.phone_number || "");
      setBloodType(profile.blood_type || "");
      setAllergies(profile.allergies || "");
      setChronicDiseases(profile.chronic_diseases || "");
      setCurrentMedications(profile.current_medications || "");
      setEmergencyName(profile.emergency_contact_name || "");
      setEmergencyPhone(profile.emergency_contact_phone || "");
      setEmergencyRelation(profile.emergency_contact_relationship || "");
      setWeightKg(profile.weight_kg ? profile.weight_kg.toString() : "");
      setHeightCm(profile.height_cm ? profile.height_cm.toString() : "");
    }
  }, [open, profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updates = {
        name: name.trim() || null,
        phone_number: phone.trim() || null,
        blood_type: bloodType.trim() || null,
        allergies: allergies.trim() || null,
        chronic_diseases: chronicDiseases.trim() || null,
        current_medications: currentMedications.trim() || null,
        emergency_contact_name: emergencyName.trim() || null,
        emergency_contact_phone: emergencyPhone.trim() || null,
        emergency_contact_relationship: emergencyRelation.trim() || null,
        weight_kg: weightKg ? parseFloat(weightKg) : null,
        height_cm: heightCm ? parseFloat(heightCm) : null,
      };
      
      console.log('Updating profile with:', updates);
      await updateUserProfile(userId, updates);
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      console.error('Error updating profile:', err);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur s'est produite lors de la mise à jour du profil."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier mon profil</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom complet</Label>
            <Input 
              id="name"
              placeholder="Votre nom complet" 
              value={name} 
              onChange={e => setName(e.target.value)} 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input 
              id="phone"
              placeholder="Numéro de téléphone" 
              value={phone} 
              onChange={e => setPhone(e.target.value)} 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bloodType">Groupe sanguin</Label>
            <Input 
              id="bloodType"
              placeholder="Ex: A+, B-, O+..." 
              value={bloodType} 
              onChange={e => setBloodType(e.target.value)} 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="weight">Poids (kg)</Label>
            <Input 
              id="weight"
              type="number"
              placeholder="Votre poids en kg" 
              value={weightKg} 
              onChange={e => setWeightKg(e.target.value)} 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="height">Taille (cm)</Label>
            <Input 
              id="height"
              type="number"
              placeholder="Votre taille en cm" 
              value={heightCm} 
              onChange={e => setHeightCm(e.target.value)} 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="allergies">Allergies</Label>
            <Input 
              id="allergies"
              placeholder="Vos allergies connues" 
              value={allergies} 
              onChange={e => setAllergies(e.target.value)} 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="chronicDiseases">Maladies chroniques</Label>
            <Input 
              id="chronicDiseases"
              placeholder="Maladies chroniques" 
              value={chronicDiseases} 
              onChange={e => setChronicDiseases(e.target.value)} 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="currentMedications">Traitements actuels</Label>
            <Input 
              id="currentMedications"
              placeholder="Traitements en cours" 
              value={currentMedications} 
              onChange={e => setCurrentMedications(e.target.value)} 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="emergencyName">Contact d'urgence (nom)</Label>
            <Input 
              id="emergencyName"
              placeholder="Nom du contact d'urgence" 
              value={emergencyName} 
              onChange={e => setEmergencyName(e.target.value)} 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="emergencyPhone">Contact d'urgence (téléphone)</Label>
            <Input 
              id="emergencyPhone"
              placeholder="Téléphone du contact d'urgence" 
              value={emergencyPhone} 
              onChange={e => setEmergencyPhone(e.target.value)} 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="emergencyRelation">Relation contact d'urgence</Label>
            <Input 
              id="emergencyRelation"
              placeholder="Ex: Conjoint, Parent, Ami..." 
              value={emergencyRelation} 
              onChange={e => setEmergencyRelation(e.target.value)} 
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={loading}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileModal;
