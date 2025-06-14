
-- Ajouter la colonne role à la table profiles avec une valeur par défaut (si elle n'existe pas déjà)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role public.user_role NOT NULL DEFAULT 'user';

-- Créer des fonctions utilitaires pour vérifier les rôles (avec SECURITY DEFINER pour éviter les problèmes RLS)
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS public.user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM public.profiles WHERE user_id = user_uuid;
$$;

CREATE OR REPLACE FUNCTION public.is_doctor(user_uuid UUID)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role = 'doctor' FROM public.profiles WHERE user_id = user_uuid;
$$;

CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role = 'admin' FROM public.profiles WHERE user_id = user_uuid;
$$;

-- Mettre à jour le trigger pour inclure le rôle par défaut lors de la création d'un utilisateur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
    'user'::public.user_role
  );
  RETURN NEW;
END;
$$;

-- Ajouter des commentaires pour la documentation
COMMENT ON COLUMN public.profiles.role IS 'Rôle de l utilisateur: user, doctor ou admin';
