
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, RefreshCw, AlertCircle } from 'lucide-react';
import { useQRCodeGenerator } from './hooks/useQRCodeGenerator';
import UserSelector from './components/UserSelector';
import QRCodeCard from './components/QRCodeCard';
import AccessKeyCard from './components/AccessKeyCard';

const QRCodeGenerator: React.FC = () => {
  const {
    profiles,
    selectedUserId,
    setSelectedUserId,
    loading,
    loadingProfiles,
    selectedProfile,
    activeQrCode,
    handleGenerateQR,
    copyToClipboard,
    loadProfiles
  } = useQRCodeGenerator();

  if (loadingProfiles) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-300 rounded w-1/4"></div>
            <div className="h-10 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (profiles.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode size={20} />
            Génération de codes QR et clés d'accès
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <AlertCircle size={16} className="text-yellow-600" />
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Aucun profil utilisateur trouvé. Vérifiez que des utilisateurs sont enregistrés.
            </p>
          </div>
          <Button 
            onClick={loadProfiles}
            variant="outline"
            className="w-full"
          >
            <RefreshCw size={16} className="mr-2" />
            Actualiser les profils
          </Button>
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
          <UserSelector
            profiles={profiles}
            selectedUserId={selectedUserId}
            onUserSelect={setSelectedUserId}
            selectedProfile={selectedProfile}
          />

          <div className="flex gap-2">
            <Button 
              onClick={handleGenerateQR}
              disabled={!selectedUserId || loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="mr-2 animate-spin" />
                  Génération...
                </>
              ) : (
                <>
                  <QrCode size={16} className="mr-2" />
                  Générer Code QR et Clé d'accès
                </>
              )}
            </Button>
            
            <Button 
              onClick={loadProfiles}
              variant="outline"
              disabled={loadingProfiles}
              size="icon"
              title="Actualiser les profils"
            >
              <RefreshCw size={16} className={loadingProfiles ? "animate-spin" : ""} />
            </Button>
          </div>

          {selectedProfile && (
            <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <p className="font-medium">Utilisateur sélectionné :</p>
              <p>{selectedProfile.name || 'Nom non renseigné'}</p>
              <p>{selectedProfile.email}</p>
              <p>Rôle : {selectedProfile.role}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {activeQrCode && (
        <div className="grid md:grid-cols-2 gap-6">
          <QRCodeCard 
            qrCode={activeQrCode}
            onCopy={copyToClipboard}
          />
          <AccessKeyCard 
            qrCode={activeQrCode}
            onCopy={copyToClipboard}
          />
        </div>
      )}

      {selectedUserId && !activeQrCode && !loading && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
              <QrCode size={48} className="mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Aucun code QR actif pour cet utilisateur.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Cliquez sur "Générer Code QR et Clé d'accès" pour en créer un.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QRCodeGenerator;
