
// Fichier de compatibilité - redirige vers le nouveau système de chiffrement
export { 
  encryptQRCode as encodeQRKey,
  decryptQRCode as decodeQRKey,
  generateSecureQRUrl
} from './encryption';

// Garder les anciennes fonctions pour la compatibilité
import { encryptQRCode, decryptQRCode } from './encryption';

// Simple encoding/decoding pour masquer les clés dans les URLs
// Note: Maintenant utilise un vrai chiffrement AES via encryption.ts

export const encodeQRKeyLegacy = (qrCode: string): string => {
  // Utilise maintenant le nouveau système de chiffrement
  return encryptQRCode(qrCode);
};

export const decodeQRKeyLegacy = (encodedKey: string): string | null => {
  // Utilise maintenant le nouveau système de déchiffrement
  return decryptQRCode(encodedKey);
};
