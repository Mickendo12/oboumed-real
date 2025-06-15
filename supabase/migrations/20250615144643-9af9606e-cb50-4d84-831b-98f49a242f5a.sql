
-- Supprimer les anciennes politiques qui posent problème
DROP POLICY IF EXISTS "Admins can create QR codes" ON public.qr_codes;
DROP POLICY IF EXISTS "Users can update their own QR codes" ON public.qr_codes;

-- Créer une nouvelle politique pour permettre aux admins de créer des codes QR pour n'importe quel utilisateur
CREATE POLICY "Admins can create QR codes for any user" 
ON public.qr_codes 
FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Politique pour permettre aux admins et aux utilisateurs de mettre à jour les codes QR
CREATE POLICY "Admins and users can update QR codes" 
ON public.qr_codes 
FOR UPDATE 
TO authenticated 
USING (
  user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);
