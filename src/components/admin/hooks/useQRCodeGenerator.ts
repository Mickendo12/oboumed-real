
import { useState, useEffect, useCallback } from 'react';
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

  const loadProfiles = useCallback(async () => {
    try {
      setLoadingProfiles(true);
      console.log('🔄 Chargement des profils pour générateur QR...');
      const allProfiles = await getAllProfiles();
      console.log('✅ Profils chargés:', allProfiles.length, 'profils');
      setProfiles(allProfiles);
    } catch (error) {
      console.error('❌ Erreur chargement profils:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: `Impossible de charger les profils: ${error.message || 'Erreur inconnue'}`
      });
    } finally {
      setLoadingProfiles(false);
    }
  }, [toast]);

  const loadQRCodes = useCallback(async () => {
    if (!selectedUserId) return;
    
    try {
      console.log('🔄 Chargement codes QR pour utilisateur:', selectedUserId);
      const userQrCodes = await getQRCodesForUser(selectedUserId);
      console.log('✅ Codes QR chargés:', userQrCodes.length, 'codes');
      setQrCodes(userQrCodes);
    } catch (error) {
      console.error('❌ Erreur chargement codes QR:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: `Impossible de charger les codes QR: ${error.message || 'Erreur inconnue'}`
      });
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
      console.log('🔄 Génération QR code pour:', userName, '(ID:', selectedUserId, ')');
      
      toast({
        title: "Génération en cours",
        description: `Génération du code QR pour ${userName}...`
      });

      const qrCode = await generateQRCodeForUser(selectedUserId);
      console.log('✅ Code QR généré avec succès:', qrCode);
      
      // Recharger les codes QR pour afficher le nouveau
      await loadQRCodes();
      
      toast({
        title: "Succès",
        description: `Code QR et clé d'accès générés pour ${userName}`
      });
      
    } catch (error) {
      console.error('❌ Erreur génération QR code:', error);
      toast({
        variant: "destructive",
        title: "Erreur de génération",
        description: `Impossible de générer le code QR pour ${userName}: ${error.message || 'Erreur inconnue'}`
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
      console.error('❌ Erreur copie presse-papiers:', error);
      // Fallback pour les navigateurs qui ne supportent pas l'API clipboard
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
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
