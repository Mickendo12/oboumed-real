
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
    } else {
      setQrCodes([]);
    }
  }, [selectedUserId]);

  const loadProfiles = async () => {
    try {
      setLoadingProfiles(true);
      console.log('Loading profiles for QR generator...');
      const allProfiles = await getAllProfiles();
      console.log('Profiles loaded for QR generator:', allProfiles);
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
    if (!selectedUserId) return;
    
    try {
      console.log('Loading QR codes for user:', selectedUserId);
      const userQrCodes = await getQRCodesForUser(selectedUserId);
      console.log('QR codes loaded:', userQrCodes);
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
      console.log('Generating QR code for user:', selectedUserId);
      const qrCode = await generateQRCodeForUser(selectedUserId);
      console.log('QR code generated:', qrCode);
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
      console.error('Error copying to clipboard:', error);
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
