
-- Fix RLS policies for doctor access functionality with proper type casting

-- First, drop existing problematic policies if they exist
DROP POLICY IF EXISTS "Doctors can create access sessions" ON public.doctor_access_sessions;
DROP POLICY IF EXISTS "Doctors can view their own sessions" ON public.doctor_access_sessions;
DROP POLICY IF EXISTS "Doctors can view patient profiles with active session" ON public.profiles;
DROP POLICY IF EXISTS "Doctors can view patient medications with active session" ON public.medications;
DROP POLICY IF EXISTS "Doctors can view their access logs" ON public.access_logs;
DROP POLICY IF EXISTS "Doctors can create access logs" ON public.access_logs;
DROP POLICY IF EXISTS "Authenticated users can view QR codes for validation" ON public.qr_codes;
DROP POLICY IF EXISTS "Users can view their own QR codes" ON public.qr_codes;
DROP POLICY IF EXISTS "Users can create their own QR codes" ON public.qr_codes;

-- Enable RLS on all tables
ALTER TABLE public.doctor_access_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;

-- 1. Allow authenticated users to create doctor sessions (any authenticated user can become a "doctor")
CREATE POLICY "Authenticated users can create doctor sessions" 
ON public.doctor_access_sessions 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = doctor_id::uuid);

-- 2. Allow users to view their own doctor sessions
CREATE POLICY "Users can view their own doctor sessions" 
ON public.doctor_access_sessions 
FOR SELECT 
TO authenticated 
USING (auth.uid() = doctor_id::uuid);

-- 3. Allow users to view their own profile OR doctors with active sessions can view patient profiles
CREATE POLICY "Users can view profiles with valid access" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM public.doctor_access_sessions 
    WHERE doctor_id::uuid = auth.uid()
    AND patient_id::uuid = user_id 
    AND is_active = true 
    AND expires_at > now()
  )
);

-- 4. Allow users to view their own medications OR doctors with active sessions
CREATE POLICY "Users can view medications with valid access" 
ON public.medications 
FOR SELECT 
TO authenticated 
USING (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM public.doctor_access_sessions 
    WHERE doctor_id::uuid = auth.uid()
    AND patient_id::uuid = user_id 
    AND is_active = true 
    AND expires_at > now()
  )
);

-- 5. Allow users to create and view access logs they are involved in
CREATE POLICY "Users can create access logs" 
ON public.access_logs 
FOR INSERT 
TO authenticated 
WITH CHECK (
  auth.uid() = doctor_id::uuid
  OR auth.uid() = admin_id::uuid
  OR auth.uid() = patient_id::uuid
);

CREATE POLICY "Users can view relevant access logs" 
ON public.access_logs 
FOR SELECT 
TO authenticated 
USING (
  auth.uid() = doctor_id::uuid
  OR auth.uid() = admin_id::uuid
  OR auth.uid() = patient_id::uuid
);

-- 6. Allow authenticated users to view QR codes for validation (needed for doctors)
CREATE POLICY "Authenticated users can view QR codes for validation" 
ON public.qr_codes 
FOR SELECT 
TO authenticated 
USING (true);

-- 7. Allow users to manage their own QR codes
CREATE POLICY "Users can manage their own QR codes" 
ON public.qr_codes 
FOR ALL 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
