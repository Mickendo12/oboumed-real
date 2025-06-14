
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { QrCode, Key, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import QRCodeDisplay from './QRCodeDisplay';
import { 
  getAllProfiles, 
  generateQRCodeForUser, 
  getQRCodesForUser,
  Profile,
  QRCode
} from '@/services/supabaseService';

const QRCodeGenerator: React.FC = () => {
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

  if (loadingProfiles) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-300 rounded w-1/4"></div>
            <div className="h-10 bg-gray-300 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode size={20} />
            Génération de codes QR et clés d'accès
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Sélectionner un utilisateur</label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un utilisateur" />
              </SelectTrigger>
              <SelectContent>
                {profiles.map((profile) => (
                  <SelectItem key={profile.user_id} value={profile.user_id}>
                    <div className="flex items-center gap-2">
                      <span>{profile.name || profile.email}</span>
                      <Badge variant={profile.role === 'admin' ? 'destructive' : 
                                   profile.role === 'doctor' ? 'default' : 'secondary'}>
                        {profile.role}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedProfile && (
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Utilisateur sélectionné</h4>
              <div className="space-y-1">
                <p className="text-sm"><strong>Nom:</strong> {selectedProfile.name || 'Non renseigné'}</p>
                <p className="text-sm"><strong>Email:</strong> {selectedProfile.email}</p>
                <p className="text-sm"><strong>Rôle:</strong> {selectedProfile.role}</p>
                <p className="text-sm">
                  <strong>Statut:</strong> 
                  <Badge variant={selectedProfile.access_status === 'active' ? 'default' : 'destructive'} className="ml-1">
                    {selectedProfile.access_status}
                  </Badge>
                </p>
              </div>
            </div>
          )}

          <Button 
            onClick={handleGenerateQR}
            disabled={!selectedUserId || loading}
            className="w-full"
          >
            {loading ? 'Génération...' : 'Générer Code QR et Clé d\'accès'}
          </Button>
        </CardContent>
      </Card>

      {activeQrCode && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Code QR */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode size={20} />
                Code QR généré
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <QRCodeDisplay 
                value={`${window.location.origin}/qr/${activeQrCode.qr_code}`}
                size={200}
              />
              <div className="space-y-2">
                <p className="text-sm font-medium">URL du QR Code:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs break-all">
                    {window.location.origin}/qr/{activeQrCode.qr_code}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(`${window.location.origin}/qr/${activeQrCode.qr_code}`, 'URL')}
                  >
                    <Copy size={14} />
                  </Button>
                </div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                <div className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-600 mt-0.5" />
                  <p className="text-sm text-green-800 dark:text-green-200">
                    Scanner ce QR code donne accès au dossier médical public du patient.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Clé d'accès */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key size={20} />
                Clé d'accès médecin
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Clé d'accès:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-3 bg-blue-50 dark:bg-blue-900/20 rounded font-mono text-sm break-all border-2 border-blue-200 dark:border-blue-700">
                    {activeQrCode.access_key}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(activeQrCode.access_key, 'Clé d\'accès')}
                  >
                    <Copy size={14} />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  <strong>Créé le:</strong> {new Date(activeQrCode.created_at).toLocaleString('fr-FR')}
                </p>
                <p className="text-xs text-muted-foreground">
                  <strong>Expire le:</strong> {new Date(activeQrCode.expires_at).toLocaleString('fr-FR')}
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle size={16} className="text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <p className="font-medium mb-1">Pour les médecins uniquement:</p>
                    <p>Cette clé permet d'accéder au dossier médical complet du patient depuis l'interface médecin.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default QRCodeGenerator;
