
-- Supprimer les politiques RLS existantes sur access_logs
DROP POLICY IF EXISTS "Doctors can view own access logs" ON public.access_logs;
DROP POLICY IF EXISTS "Admins can view all access logs" ON public.access_logs;
DROP POLICY IF EXISTS "Users can view their own access logs" ON public.access_logs;

-- Modifier les types de colonnes dans access_logs pour correspondre au type uuid
ALTER TABLE public.access_logs 
ALTER COLUMN patient_id TYPE uuid USING patient_id::uuid;

ALTER TABLE public.access_logs 
ALTER COLUMN doctor_id TYPE uuid USING doctor_id::uuid;

ALTER TABLE public.access_logs 
ALTER COLUMN admin_id TYPE uuid USING admin_id::uuid;

-- Ajouter les clés étrangères
ALTER TABLE public.access_logs 
ADD CONSTRAINT access_logs_patient_id_fkey 
FOREIGN KEY (patient_id) REFERENCES public.profiles(user_id);

ALTER TABLE public.access_logs 
ADD CONSTRAINT access_logs_doctor_id_fkey 
FOREIGN KEY (doctor_id) REFERENCES public.profiles(user_id);

ALTER TABLE public.access_logs 
ADD CONSTRAINT access_logs_admin_id_fkey 
FOREIGN KEY (admin_id) REFERENCES public.profiles(user_id);

-- Recréer les politiques RLS
CREATE POLICY "Admins can view all access logs" 
ON public.access_logs 
FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Doctors can view own access logs" 
ON public.access_logs 
FOR SELECT 
TO authenticated 
USING (
  doctor_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Users can view their own access logs" 
ON public.access_logs 
FOR SELECT 
TO authenticated 
USING (
  patient_id = auth.uid() OR
  doctor_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);
