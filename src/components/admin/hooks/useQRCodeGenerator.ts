
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
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

  const loadProfiles = useCallback(async () => {
    try {
      setLoadingProfiles(true);
      console.log('🔄 Loading profiles for QR generator...');
      const allProfiles = await getAllProfiles();
      console.log('✅ Profiles loaded:', allProfiles.length, 'profiles');
      setProfiles(allProfiles);
    } catch (error: any) {
      console.error('❌ Error loading profiles:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: `Impossible de charger les profils: ${error?.message || 'Erreur inconnue'}`
      });
    } finally {
      setLoadingProfiles(false);
    }
  }, [toast]);

  const loadQRCodes = useCallback(async () => {
    if (!selectedUserId) return;
    
    try {
      console.log('🔄 Loading QR codes for user:', selectedUserId);
      const userQrCodes = await getQRCodesForUser(selectedUserId);
      console.log('✅ QR codes loaded:', userQrCodes.length, 'codes');
      setQrCodes(userQrCodes);
    } catch (error: any) {
      console.error('❌ Error loading QR codes:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: `Impossible de charger les codes QR: ${error?.message || 'Erreur inconnue'}`
      });
      setQrCodes([]);
    }
  }, [selectedUserId, toast]);

  const handleGenerateQR = useCallback(async () => {
    if (!selectedUserId) {
      toast({
        variant: "destructive",
        title: "Sélection requise",
        description: "Veuillez sélectionner un utilisateur."
      });
      return;
    }

    const selectedProfile = profiles.find(p => p.user_id === selectedUserId);
    const userName = selectedProfile?.name || selectedProfile?.email || 'Utilisateur inconnu';

    try {
      setLoading(true);
      console.log('🔄 Generating QR code for:', userName, '(ID:', selectedUserId, ')');
      
      toast({
        title: "Génération en cours",
        description: `Génération du code QR pour ${userName}...`
      });

      const qrCode = await generateQRCodeForUser(selectedUserId);
      console.log('✅ QR code generated successfully:', qrCode);
      
      // Reload QR codes to display the new one
      await loadQRCodes();
      
      toast({
        title: "Succès",
        description: `Code QR et clé d'accès générés pour ${userName}`
      });
      
    } catch (error: any) {
      console.error('❌ Error generating QR code:', error);
      toast({
        variant: "destructive",
        title: "Erreur de génération",
        description: `Impossible de générer le code QR pour ${userName}: ${error?.message || 'Erreur inconnue'}`
      });
    } finally {
      setLoading(false);
    }
  }, [selectedUserId, profiles, toast, loadQRCodes]);

  const copyToClipboard = useCallback(async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copié",
        description: `${type} copié dans le presse-papiers.`
      });
    } catch (error) {
      console.error('❌ Clipboard error:', error);
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        toast({
          title: "Copié",
          description: `${type} copié dans le presse-papiers.`
        });
      } catch (fallbackError) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de copier le texte."
        });
      }
      document.body.removeChild(textArea);
    }
  }, [toast]);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  useEffect(() => {
    if (selectedUserId) {
      loadQRCodes();
    } else {
      setQrCodes([]);
    }
  }, [selectedUserId, loadQRCodes]);

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
    copyToClipboard,
    loadProfiles,
    loadQRCodes
  };
};
