
import React from 'react';
import QRCode from 'qrcode';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ value, size = 200 }) => {
  const [qrCodeUrl, setQrCodeUrl] = React.useState<string>('');

  React.useEffect(() => {
    QRCode.toDataURL(value, {
      width: size,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
    .then(url => setQrCodeUrl(url))
    .catch(err => console.error('Error generating QR code:', err));
  }, [value, size]);

  if (!qrCodeUrl) {
    return (
      <div 
        className="bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <span className="text-sm text-muted-foreground">Génération...</span>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <img 
        src={qrCodeUrl} 
        alt="QR Code" 
        className="rounded-lg border"
        style={{ width: size, height: size }}
      />
    </div>
  );
};

export default QRCodeDisplay;
