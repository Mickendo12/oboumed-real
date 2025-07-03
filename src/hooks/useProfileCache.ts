import { useState, useEffect, useRef } from 'react';
import { getUserProfile, Profile } from '@/services/supabaseService';

// Cache simple pour éviter les requêtes répétées
const profileCache = new Map<string, { profile: Profile; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useProfileCache = (userId: string | null) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const loadProfile = async () => {
      // Annuler la requête précédente si elle existe
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Vérifier le cache d'abord
      const cached = profileCache.get(userId);
      const now = Date.now();
      
      if (cached && (now - cached.timestamp) < CACHE_DURATION) {
        setProfile(cached.profile);
        setLoading(false);
        return;
      }

      // Créer un nouvel abort controller
      abortControllerRef.current = new AbortController();
      
      try {
        setLoading(true);
        const fetchedProfile = await getUserProfile(userId);
        
        // Vérifier si la requête n'a pas été annulée
        if (!abortControllerRef.current.signal.aborted) {
          if (fetchedProfile) {
            // Mettre en cache le profil
            profileCache.set(userId, {
              profile: fetchedProfile,
              timestamp: now
            });
            setProfile(fetchedProfile);
          }
          setLoading(false);
        }
      } catch (error) {
        if (!abortControllerRef.current.signal.aborted) {
          console.error('Error loading profile:', error);
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [userId]);

  return { profile, loading };
};

// Fonction pour invalider le cache (utile lors des mises à jour)
export const invalidateProfileCache = (userId: string) => {
  profileCache.delete(userId);
};