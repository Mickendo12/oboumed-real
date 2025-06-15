
-- Activer RLS sur la table qr_codes si ce n'est pas déjà fait
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Users can view their own QR codes" ON public.qr_codes;
DROP POLICY IF EXISTS "Admins can manage all QR codes" ON public.qr_codes;
DROP POLICY IF EXISTS "Users can create their own QR codes" ON public.qr_codes;

-- Créer des politiques RLS pour la table qr_codes
-- Les utilisateurs peuvent voir leurs propres codes QR
CREATE POLICY "Users can view their own QR codes" 
ON public.qr_codes 
FOR SELECT 
TO authenticated 
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'doctor')
  )
);

-- Les admins peuvent créer des codes QR pour n'importe quel utilisateur
CREATE POLICY "Admins can create QR codes" 
ON public.qr_codes 
FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Les admins peuvent mettre à jour tous les codes QR
CREATE POLICY "Admins can update QR codes" 
ON public.qr_codes 
FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Les utilisateurs peuvent mettre à jour leurs propres codes QR
CREATE POLICY "Users can update their own QR codes" 
ON public.qr_codes 
FOR UPDATE 
TO authenticated 
USING (
  user_id = auth.uid()
);
