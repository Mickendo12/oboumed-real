
// Système de chiffrement AES sécurisé pour les QR codes
import CryptoJS from 'crypto-js';

// Clé de chiffrement fixe pour la démo - En production, utiliser une variable d'environnement
const ENCRYPTION_KEY = 'ObouMed2024SecureKeyForQRCodeEncryption!';

export const encryptQRCode = (qrCode: string): string => {
  try {
    // Chiffrement AES avec une clé sécurisée
    const encrypted = CryptoJS.AES.encrypt(qrCode, ENCRYPTION_KEY).toString();
    
    // Encoder en base64 URL-safe pour l'URL
    const urlSafe = btoa(encrypted)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    
    return urlSafe;
  } catch (error) {
    console.error('Erreur lors du chiffrement:', error);
    // Fallback vers l'ancien système en cas d'erreur
    return encodeQRKey(qrCode);
  }
};

export const decryptQRCode = (encryptedCode: string): string | null => {
  try {
    // Décoder depuis base64 URL-safe
    let base64 = encryptedCode
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    // Ajouter le padding si nécessaire
    while (base64.length % 4) {
      base64 += '=';
    }
    
    const encrypted = atob(base64);
    
    // Déchiffrement AES
    const decrypted = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY);
    const originalText = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!originalText) {
      // Tentative avec l'ancien système si le nouveau échoue
      return decodeQRKey(encryptedCode);
    }
    
    return originalText;
  } catch (error) {
    console.error('Erreur lors du déchiffrement:', error);
    // Fallback vers l'ancien système
    return decodeQRKey(encryptedCode);
  }
};

export const generateSecureQRUrl = (qrCode: string): string => {
  const encryptedKey = encryptQRCode(qrCode);
  return `${window.location.origin}/qr/${encryptedKey}`;
};

// Fonctions de compatibilité avec l'ancien système (gardées pour la transition)
export const encodeQRKey = (qrCode: string): string => {
  const encoded = btoa(qrCode);
  const reversed = encoded.split('').reverse().join('');
  const randomPrefix = Math.random().toString(36).substring(2, 8);
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `${randomPrefix}${reversed}${randomSuffix}`;
};

export const decodeQRKey = (encodedKey: string): string | null => {
  try {
    if (encodedKey.length <= 12) return null;
    
    const withoutPrefixSuffix = encodedKey.substring(6, encodedKey.length - 6);
    const unreversed = withoutPrefixSuffix.split('').reverse().join('');
    const decoded = atob(unreversed);
    return decoded;
  } catch (error) {
    console.error('Erreur lors du décodage de la clé:', error);
    return null;
  }
};
