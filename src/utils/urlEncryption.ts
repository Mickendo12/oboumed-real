
// Simple encoding/decoding pour masquer les clés dans les URLs
// Note: Ce n'est pas un cryptage sécurisé, mais un encodage pour masquer la clé dans l'URL

export const encodeQRKey = (qrCode: string): string => {
  // Convertir en base64 et ajouter un préfixe/suffixe pour masquer la structure
  const encoded = btoa(qrCode);
  // Inverser la chaîne et ajouter des caractères aléatoires
  const reversed = encoded.split('').reverse().join('');
  const randomPrefix = Math.random().toString(36).substring(2, 8);
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `${randomPrefix}${reversed}${randomSuffix}`;
};

export const decodeQRKey = (encodedKey: string): string | null => {
  try {
    // Enlever le préfixe et le suffixe (6 caractères chacun)
    if (encodedKey.length <= 12) return null;
    
    const withoutPrefixSuffix = encodedKey.substring(6, encodedKey.length - 6);
    // Inverser la chaîne
    const unreversed = withoutPrefixSuffix.split('').reverse().join('');
    // Décoder du base64
    const decoded = atob(unreversed);
    return decoded;
  } catch (error) {
    console.error('Erreur lors du décodage de la clé:', error);
    return null;
  }
};

export const generateSecureQRUrl = (qrCode: string): string => {
  const encodedKey = encodeQRKey(qrCode);
  // Utiliser un domaine autonome au lieu de window.location.origin
  return `https://medical-access.micaprod-corporate.com/qr/${encodedKey}`;
};
