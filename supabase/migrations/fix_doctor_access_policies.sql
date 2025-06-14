
-- Supprimer les politiques existantes si elles existent déjà
DROP POLICY IF EXISTS "Doctors can create access sessions" ON public.doctor_access_sessions;
DROP POLICY IF EXISTS "Doctors can view their own sessions" ON public.doctor_access_sessions;
DROP POLICY IF EXISTS "Doctors can view patient profiles with active session" ON public.profiles;
DROP POLICY IF EXISTS "Doctors can view patient medications with active session" ON public.medications;
DROP POLICY IF EXISTS "Doctors can view their access logs" ON public.access_logs;
DROP POLICY IF EXISTS "Doctors can create access logs" ON public.access_logs;
DROP POLICY IF EXISTS "Authenticated users can view QR codes for validation" ON public.qr_codes;

-- Activer RLS sur toutes les tables nécessaires
ALTER TABLE public.doctor_access_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;

-- 1. Permettre aux médecins de créer des sessions d'accès
CREATE POLICY "Doctors can create access sessions" 
ON public.doctor_access_sessions 
FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'doctor'
  )
);

-- 2. Permettre aux médecins de voir leurs propres sessions actives
CREATE POLICY "Doctors can view their own sessions" 
ON public.doctor_access_sessions 
FOR SELECT 
TO authenticated 
USING (doctor_id = auth.uid()::text);

-- 3. Permettre aux médecins d'accéder aux profils des patients pour lesquels ils ont une session active
CREATE POLICY "Doctors can view patient profiles with active session" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.doctor_access_sessions 
    WHERE doctor_id = auth.uid()::text 
    AND patient_id = user_id::text 
    AND is_active = true 
    AND expires_at > now()
  ) 
  OR user_id = auth.uid()
);

-- 4. Permettre aux médecins d'accéder aux médicaments des patients avec session active
CREATE POLICY "Doctors can view patient medications with active session" 
ON public.medications 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.doctor_access_sessions 
    WHERE doctor_id = auth.uid()::text 
    AND patient_id = user_id::text 
    AND is_active = true 
    AND expires_at > now()
  ) 
  OR user_id = auth.uid()
);

-- 5. Permettre aux médecins d'accéder aux logs d'accès qu'ils ont créés
CREATE POLICY "Doctors can view their access logs" 
ON public.access_logs 
FOR SELECT 
TO authenticated 
USING (doctor_id = auth.uid()::text);

-- 6. Permettre aux médecins de créer des logs d'accès
CREATE POLICY "Doctors can create access logs" 
ON public.access_logs 
FOR INSERT 
TO authenticated 
WITH CHECK (doctor_id = auth.uid()::text);

-- 7. Permettre la validation des QR codes (lecture seule pour tous les utilisateurs authentifiés)
CREATE POLICY "Authenticated users can view QR codes for validation" 
ON public.qr_codes 
FOR SELECT 
TO authenticated 
USING (true);

-- 8. Permettre aux utilisateurs de voir leurs propres QR codes
CREATE POLICY "Users can view their own QR codes" 
ON public.qr_codes 
FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

-- 9. Permettre aux utilisateurs de créer leurs propres QR codes
CREATE POLICY "Users can create their own QR codes" 
ON public.qr_codes 
FOR INSERT 
TO authenticated 
WITH CHECK (user_id = auth.uid());
