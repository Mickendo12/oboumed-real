
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode } from 'lucide-react';
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
    copyToClipboard
  } = useQRCodeGenerator();

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
          <UserSelector
            profiles={profiles}
            selectedUserId={selectedUserId}
            onUserSelect={setSelectedUserId}
            selectedProfile={selectedProfile}
          />

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
    </div>
  );
};

export default QRCodeGenerator;
