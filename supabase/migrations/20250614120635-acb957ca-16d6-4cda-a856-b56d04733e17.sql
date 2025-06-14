
-- Ajouter les colonnes poids et taille à la table profiles
ALTER TABLE public.profiles 
ADD COLUMN weight_kg NUMERIC(5,2),
ADD COLUMN height_cm NUMERIC(5,2);

-- Ajouter des commentaires pour la documentation
COMMENT ON COLUMN public.profiles.weight_kg IS 'Poids de l utilisateur en kilogrammes';
COMMENT ON COLUMN public.profiles.height_cm IS 'Taille de l utilisateur en centimètres';

-- Créer une fonction pour calculer l'IMC
CREATE OR REPLACE FUNCTION public.calculate_bmi(weight_kg NUMERIC, height_cm NUMERIC)
RETURNS NUMERIC
LANGUAGE sql
STABLE
AS $$
  SELECT 
    CASE 
      WHEN weight_kg IS NULL OR height_cm IS NULL OR height_cm = 0 THEN NULL
      ELSE ROUND(weight_kg / POWER(height_cm / 100.0, 2), 2)
    END;
$$;

-- Créer une vue pour inclure l'IMC calculé
CREATE OR REPLACE VIEW public.profiles_with_bmi AS
SELECT 
  p.*,
  public.calculate_bmi(p.weight_kg, p.height_cm) as bmi,
  CASE 
    WHEN public.calculate_bmi(p.weight_kg, p.height_cm) IS NULL THEN 'Non calculable'
    WHEN public.calculate_bmi(p.weight_kg, p.height_cm) < 18.5 THEN 'Insuffisance pondérale'
    WHEN public.calculate_bmi(p.weight_kg, p.height_cm) < 25 THEN 'Poids normal'
    WHEN public.calculate_bmi(p.weight_kg, p.height_cm) < 30 THEN 'Surpoids'
    ELSE 'Obésité'
  END as bmi_category
FROM public.profiles p;
