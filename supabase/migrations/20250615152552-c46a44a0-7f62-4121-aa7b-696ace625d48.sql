
-- Supprimer les politiques restrictives existantes
DROP POLICY IF EXISTS "Doctors can create access sessions" ON public.doctor_access_sessions;
DROP POLICY IF EXISTS "Doctors can view their own sessions" ON public.doctor_access_sessions;
DROP POLICY IF EXISTS "Doctors can view patient profiles with active session" ON public.profiles;
DROP POLICY IF EXISTS "Doctors can view patient medications with active session" ON public.medications;
DROP POLICY IF EXISTS "Doctors can view their access logs" ON public.access_logs;
DROP POLICY IF EXISTS "Doctors can create access logs" ON public.access_logs;
DROP POLICY IF EXISTS "Authenticated users can view QR codes for validation" ON public.qr_codes;
DROP POLICY IF EXISTS "Users can view their own QR codes" ON public.qr_codes;
DROP POLICY IF EXISTS "Users can create their own QR codes" ON public.qr_codes;
DROP POLICY IF EXISTS "Admins can create QR codes for any user" ON public.qr_codes;
DROP POLICY IF EXISTS "Admins and users can update QR codes" ON public.qr_codes;
DROP POLICY IF EXISTS "Admins can update QR codes" ON public.qr_codes;
DROP POLICY IF EXISTS "Admins can manage all QR codes" ON public.qr_codes;
DROP POLICY IF EXISTS "Doctors can read QR codes for validation" ON public.qr_codes;
DROP POLICY IF EXISTS "Doctors can manage access sessions" ON public.doctor_access_sessions;
DROP POLICY IF EXISTS "Medical access to patient profiles" ON public.profiles;
DROP POLICY IF EXISTS "Medical access to patient medications" ON public.medications;
DROP POLICY IF EXISTS "Medical staff can manage access logs" ON public.access_logs;

-- Politiques simplifiées pour QR codes - permettre aux admins de tout gérer
CREATE POLICY "Admins can manage all QR codes" 
ON public.qr_codes 
FOR ALL
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Permettre aux médecins de lire les codes QR pour validation
CREATE POLICY "Doctors can read QR codes for validation" 
ON public.qr_codes 
FOR SELECT
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('doctor', 'admin')
  )
);

-- Permettre aux utilisateurs de voir leurs propres codes QR
CREATE POLICY "Users can view their own QR codes" 
ON public.qr_codes 
FOR SELECT
TO authenticated 
USING (user_id = auth.uid());

-- Sessions d'accès médecin - permettre aux médecins de créer et gérer
CREATE POLICY "Doctors can manage access sessions" 
ON public.doctor_access_sessions 
FOR ALL
TO authenticated 
USING (
  doctor_id = auth.uid()::text OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('doctor', 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('doctor', 'admin')
  )
);

-- Permettre aux médecins d'accéder aux profils patients avec session active OU pour validation
CREATE POLICY "Medical access to patient profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('doctor', 'admin')
  )
);

-- Permettre aux médecins d'accéder aux médicaments des patients
CREATE POLICY "Medical access to patient medications" 
ON public.medications 
FOR SELECT 
TO authenticated 
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('doctor', 'admin')
  )
);

-- Logs d'accès - permettre création et lecture pour médecins/admins
-- Correction des conversions de type uuid/text
CREATE POLICY "Medical staff can manage access logs" 
ON public.access_logs 
FOR ALL
TO authenticated 
USING (
  doctor_id = auth.uid() OR
  admin_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('doctor', 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('doctor', 'admin')
  )
);
