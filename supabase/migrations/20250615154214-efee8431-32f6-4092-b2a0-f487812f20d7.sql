
-- Create a security definer function to safely check user roles
-- This prevents infinite recursion in RLS policies
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid uuid)
RETURNS user_role
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT role FROM public.profiles WHERE user_id = user_uuid;
$$;

-- Create helper functions for role checking
CREATE OR REPLACE FUNCTION public.is_doctor(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT role = 'doctor'::public.user_role FROM public.profiles WHERE user_id = user_uuid;
$$;

CREATE OR REPLACE FUNCTION public.is_admin(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT role = 'admin'::public.user_role FROM public.profiles WHERE user_id = user_uuid;
$$;

-- Drop the problematic policy and recreate it using the security definer functions
DROP POLICY IF EXISTS "Medical access to patient profiles" ON public.profiles;

-- Create a safer policy that doesn't cause recursion
CREATE POLICY "Medical access to patient profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (
  user_id = auth.uid() OR
  public.is_doctor(auth.uid()) OR
  public.is_admin(auth.uid())
);

-- Also update other policies to use the security definer functions
DROP POLICY IF EXISTS "Admins can manage all QR codes" ON public.qr_codes;
CREATE POLICY "Admins can manage all QR codes" 
ON public.qr_codes 
FOR ALL
TO authenticated 
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Doctors can read QR codes for validation" ON public.qr_codes;
CREATE POLICY "Doctors can read QR codes for validation" 
ON public.qr_codes 
FOR SELECT
TO authenticated 
USING (
  public.is_doctor(auth.uid()) OR
  public.is_admin(auth.uid())
);

DROP POLICY IF EXISTS "Doctors can manage access sessions" ON public.doctor_access_sessions;
CREATE POLICY "Doctors can manage access sessions" 
ON public.doctor_access_sessions 
FOR ALL
TO authenticated 
USING (
  doctor_id = auth.uid()::text OR
  public.is_doctor(auth.uid()) OR
  public.is_admin(auth.uid())
)
WITH CHECK (
  public.is_doctor(auth.uid()) OR
  public.is_admin(auth.uid())
);

DROP POLICY IF EXISTS "Medical access to patient medications" ON public.medications;
CREATE POLICY "Medical access to patient medications" 
ON public.medications 
FOR SELECT 
TO authenticated 
USING (
  user_id = auth.uid() OR
  public.is_doctor(auth.uid()) OR
  public.is_admin(auth.uid())
);

DROP POLICY IF EXISTS "Medical staff can manage access logs" ON public.access_logs;
CREATE POLICY "Medical staff can manage access logs" 
ON public.access_logs 
FOR ALL
TO authenticated 
USING (
  doctor_id = auth.uid() OR
  admin_id = auth.uid() OR
  public.is_doctor(auth.uid()) OR
  public.is_admin(auth.uid())
)
WITH CHECK (
  public.is_doctor(auth.uid()) OR
  public.is_admin(auth.uid())
);
