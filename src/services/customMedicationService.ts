
import { supabase } from '@/integrations/supabase/client';

export interface CustomMedication {
  id: string;
  name: string;
  dosage?: string;
  form?: string;
  activeIngredient?: string;
  manufacturer?: string;
  created_by: string;
  created_at: string;
  usage_count: number;
}

// Ajouter un nouveau médicament personnalisé
export const addCustomMedication = async (
  medicationData: Omit<CustomMedication, 'id' | 'created_at' | 'usage_count'>
): Promise<CustomMedication | null> => {
  try {
    const { data, error } = await supabase
      .from('custom_medications')
      .insert({
        name: medicationData.name,
        dosage: medicationData.dosage,
        form: medicationData.form,
        active_ingredient: medicationData.activeIngredient,
        manufacturer: medicationData.manufacturer,
        created_by: medicationData.created_by,
        usage_count: 1
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      dosage: data.dosage,
      form: data.form,
      activeIngredient: data.active_ingredient,
      manufacturer: data.manufacturer,
      created_by: data.created_by,
      created_at: data.created_at,
      usage_count: data.usage_count
    };
  } catch (error) {
    console.error('Erreur lors de l\'ajout du médicament personnalisé:', error);
    return null;
  }
};

// Rechercher dans les médicaments personnalisés
export const searchCustomMedications = async (query: string): Promise<CustomMedication[]> => {
  try {
    const { data, error } = await supabase
      .from('custom_medications')
      .select('*')
      .or(`name.ilike.%${query}%, active_ingredient.ilike.%${query}%`)
      .order('usage_count', { ascending: false })
      .limit(10);

    if (error) throw error;

    return (data || []).map(item => ({
      id: item.id,
      name: item.name,
      dosage: item.dosage,
      form: item.form,
      activeIngredient: item.active_ingredient,
      manufacturer: item.manufacturer,
      created_by: item.created_by,
      created_at: item.created_at,
      usage_count: item.usage_count
    }));
  } catch (error) {
    console.error('Erreur lors de la recherche de médicaments personnalisés:', error);
    return [];
  }
};

// Incrémenter le compteur d'utilisation d'un médicament
export const incrementMedicationUsage = async (medicationId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('custom_medications')
      .update({ usage_count: supabase.sql`usage_count + 1` })
      .eq('id', medicationId);

    if (error) throw error;
  } catch (error) {
    console.error('Erreur lors de l\'incrémentation du compteur:', error);
  }
};

// Obtenir les médicaments les plus utilisés
export const getPopularMedications = async (limit: number = 10): Promise<CustomMedication[]> => {
  try {
    const { data, error } = await supabase
      .from('custom_medications')
      .select('*')
      .order('usage_count', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).map(item => ({
      id: item.id,
      name: item.name,
      dosage: item.dosage,
      form: item.form,
      activeIngredient: item.active_ingredient,
      manufacturer: item.manufacturer,
      created_by: item.created_by,
      created_at: item.created_at,
      usage_count: item.usage_count
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des médicaments populaires:', error);
    return [];
  }
};
