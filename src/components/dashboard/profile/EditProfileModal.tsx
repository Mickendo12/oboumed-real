
// Un simple modal pour éditer les informations du profil utilisateur

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateUserProfile, ProfileWithBMI } from "@/services/supabaseService";

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
  // States synchronisés sur le profil
  const [name, setName] = useState(profile?.name || "");
  const [phone, setPhone] = useState(profile?.phone_number || "");
  const [bloodType, setBloodType] = useState(profile?.blood_type || "");
  const [allergies, setAllergies] = useState(profile?.allergies || "");
  const [chronicDiseases, setChronicDiseases] = useState(profile?.chronic_diseases || "");
  const [currentMedications, setCurrentMedications] = useState(profile?.current_medications || "");
  const [emergencyName, setEmergencyName] = useState(profile?.emergency_contact_name || "");
  const [emergencyPhone, setEmergencyPhone] = useState(profile?.emergency_contact_phone || "");
  const [emergencyRelation, setEmergencyRelation] = useState(profile?.emergency_contact_relationship || "");
  const [loading, setLoading] = useState(false);

  // Lorsque le modal s'ouvre, resynchroniser l'état local avec le profil
  React.useEffect(() => {
    setName(profile?.name || "");
    setPhone(profile?.phone_number || "");
    setBloodType(profile?.blood_type || "");
    setAllergies(profile?.allergies || "");
    setChronicDiseases(profile?.chronic_diseases || "");
    setCurrentMedications(profile?.current_medications || "");
    setEmergencyName(profile?.emergency_contact_name || "");
    setEmergencyPhone(profile?.emergency_contact_phone || "");
    setEmergencyRelation(profile?.emergency_contact_relationship || "");
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateUserProfile(userId, {
        name,
        phone_number: phone,
        blood_type: bloodType,
        allergies,
        chronic_diseases: chronicDiseases,
        current_medications: currentMedications,
        emergency_contact_name: emergencyName,
        emergency_contact_phone: emergencyPhone,
        emergency_contact_relationship: emergencyRelation,
      });
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      // Message d'erreur traité par le parent
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier mon profil</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input placeholder="Nom complet" value={name} onChange={e => setName(e.target.value)} required />
          <Input placeholder="Téléphone" value={phone} onChange={e => setPhone(e.target.value)} />
          <Input placeholder="Groupe sanguin" value={bloodType} onChange={e => setBloodType(e.target.value)} />
          <Input placeholder="Allergies" value={allergies} onChange={e => setAllergies(e.target.value)} />
          <Input placeholder="Maladies chroniques" value={chronicDiseases} onChange={e => setChronicDiseases(e.target.value)} />
          <Input placeholder="Traitements actuels" value={currentMedications} onChange={e => setCurrentMedications(e.target.value)} />
          <Input placeholder="Contact d'urgence (nom)" value={emergencyName} onChange={e => setEmergencyName(e.target.value)} />
          <Input placeholder="Contact d'urgence (téléphone)" value={emergencyPhone} onChange={e => setEmergencyPhone(e.target.value)} />
          <Input placeholder="Relation contact d'urgence" value={emergencyRelation} onChange={e => setEmergencyRelation(e.target.value)} />
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
