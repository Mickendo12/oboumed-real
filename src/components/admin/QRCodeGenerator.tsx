
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

  console.log('QRCodeGenerator render - profiles:', profiles.length, 'selectedUserId:', selectedUserId, 'activeQrCode:', !!activeQrCode);

  if (loadingProfiles) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <Card>
          <CardContent className="pt-4 sm:pt-6 px-3 sm:px-4 md:px-6">
            <div className="animate-pulse space-y-3 sm:space-y-4">
              <div className="h-3 sm:h-4 bg-gray-300 rounded w-1/4"></div>
              <div className="h-8 sm:h-10 bg-gray-300 rounded"></div>
              <div className="h-3 sm:h-4 bg-gray-300 rounded w-3/4"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <Card>
          <CardHeader className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6">
            <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base md:text-lg">
              <QrCode size={16} className="sm:w-4 sm:h-4 md:w-5 md:h-5" />
              <span>Génération de codes QR et clés d'accès</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
            <div className="flex items-center gap-2 p-3 sm:p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <AlertCircle size={14} className="text-yellow-600 flex-shrink-0 sm:w-4 sm:h-4" />
              <p className="text-xs sm:text-sm text-yellow-800 dark:text-yellow-200 leading-relaxed">
                Aucun profil utilisateur trouvé. Vérifiez que des utilisateurs sont enregistrés.
              </p>
            </div>
            <Button 
              onClick={loadProfiles}
              variant="outline"
              className="w-full text-xs sm:text-sm py-2 sm:py-2.5"
              disabled={loadingProfiles}
            >
              <RefreshCw size={14} className={`mr-1.5 sm:mr-2 sm:w-4 sm:h-4 ${loadingProfiles ? 'animate-spin' : ''}`} />
              Actualiser les profils
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6">
          <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base md:text-lg">
            <QrCode size={16} className="sm:w-4 sm:h-4 md:w-5 md:h-5" />
            <span>Génération de codes QR et clés d'accès</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
          <UserSelector
            profiles={profiles}
            selectedUserId={selectedUserId}
            onUserSelect={setSelectedUserId}
            selectedProfile={selectedProfile}
          />

          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={handleGenerateQR}
              disabled={!selectedUserId || loading}
              className="flex-1 text-xs sm:text-sm py-2 sm:py-2.5"
            >
              {loading ? (
                <>
                  <RefreshCw size={14} className="mr-1.5 sm:mr-2 sm:w-4 sm:h-4 animate-spin" />
                  <span className="hidden sm:inline">Génération...</span>
                  <span className="sm:hidden">Génération...</span>
                </>
              ) : (
                <>
                  <QrCode size={14} className="mr-1.5 sm:mr-2 sm:w-4 sm:h-4" />
                  <span className="hidden md:inline">Générer Code QR et Clé d'accès</span>
                  <span className="md:hidden">Générer QR + Clé</span>
                </>
              )}
            </Button>
            
            <Button 
              onClick={loadProfiles}
              variant="outline"
              disabled={loadingProfiles}
              size="icon"
              title="Actualiser les profils"
              className="w-auto px-2 sm:px-3 sm:w-10 sm:h-10"
            >
              <RefreshCw size={14} className={`sm:w-4 sm:h-4 ${loadingProfiles ? "animate-spin" : ""}`} />
            </Button>
          </div>

          {selectedProfile && (
            <div className="text-[10px] sm:text-xs text-muted-foreground bg-blue-50 dark:bg-blue-900/20 p-2 sm:p-3 rounded-lg">
              <p className="font-medium mb-1">Utilisateur sélectionné :</p>
              <p className="leading-tight">{selectedProfile.name || 'Nom non renseigné'}</p>
              <p className="leading-tight">{selectedProfile.email}</p>
              <p className="leading-tight">Rôle : {selectedProfile.role}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {activeQrCode && selectedProfile && (
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          <QRCodeCard 
            qrCode={activeQrCode}
            userName={selectedProfile.name || ''}
            userEmail={selectedProfile.email}
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
          <CardContent className="pt-4 sm:pt-6 px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
            <div className="text-center p-3 sm:p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
              <QrCode size={32} className="mx-auto text-gray-400 mb-2 sm:w-12 sm:h-12" />
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-tight">
                Aucun code QR actif pour cet utilisateur.
              </p>
              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-500 mt-1 leading-tight">
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
