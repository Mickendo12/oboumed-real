
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { 
  getAllProfiles, 
  generateQRCodeForUser, 
  getQRCodesForUser,
  Profile,
  QRCode
} from '@/services/supabaseService';

export const useQRCodeGenerator = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadProfiles();
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      loadQRCodes();
    }
  }, [selectedUserId]);

  const loadProfiles = async () => {
    try {
      const allProfiles = await getAllProfiles();
      setProfiles(allProfiles);
    } catch (error) {
      console.error('Error loading profiles:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les profils utilisateurs."
      });
    } finally {
      setLoadingProfiles(false);
    }
  };

  const loadQRCodes = async () => {
    try {
      const userQrCodes = await getQRCodesForUser(selectedUserId);
      setQrCodes(userQrCodes);
    } catch (error) {
      console.error('Error loading QR codes:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les codes QR."
      });
    }
  };

  const handleGenerateQR = async () => {
    if (!selectedUserId) {
      toast({
        variant: "destructive",
        title: "Sélection requise",
        description: "Veuillez sélectionner un utilisateur."
      });
      return;
    }

    try {
      setLoading(true);
      const qrCode = await generateQRCodeForUser(selectedUserId);
      await loadQRCodes();
      
      toast({
        title: "Code QR généré",
        description: "Le code QR et la clé d'accès ont été générés avec succès."
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de générer le code QR."
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copié",
        description: `${type} copié dans le presse-papiers.`
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de copier le texte."
      });
    }
  };

  const selectedProfile = profiles.find(p => p.user_id === selectedUserId);
  const activeQrCode = qrCodes.find(qr => qr.status === 'active');

  return {
    profiles,
    selectedUserId,
    setSelectedUserId,
    qrCodes,
    loading,
    loadingProfiles,
    selectedProfile,
    activeQrCode,
    handleGenerateQR,
    copyToClipboard
  };
};
