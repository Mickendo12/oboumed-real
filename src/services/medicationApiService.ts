
// Ce service utilise l'API Open FDA (Food and Drug Administration) pour récupérer des informations sur les médicaments
// Documentation: https://open.fda.gov/apis/drug/

export interface MedicationApiResult {
  id: string;
  name: string;
  dosage: string;
  activeIngredient?: string;
  manufacturer?: string;
  description?: string;
  frequency?: string;
}

// Fonction pour récupérer un médicament par code-barres (NDC - National Drug Code)
export async function getMedicationByBarcode(barcode: string): Promise<MedicationApiResult | null> {
  try {
    // Si c'est un test avec "random", on utilise un fallback
    if (barcode === 'random') {
      return await getFallbackMedication();
    }
    
    // URL de l'API Open FDA pour rechercher par code NDC
    const apiUrl = `https://api.fda.gov/drug/ndc.json?search=product_ndc:"${barcode}"&limit=1`;
    
    const response = await fetch(apiUrl);
    
    // Si la réponse n'est pas OK, on utilise un fallback
    if (!response.ok) {
      console.warn(`La recherche par code-barres ${barcode} a échoué, utilisation du fallback`);
      return await getFallbackMedication();
    }
    
    const data = await response.json();
    
    // Si aucun résultat n'est trouvé, on utilise un fallback
    if (!data.results || data.results.length === 0) {
      console.warn(`Aucun médicament trouvé pour le code-barres ${barcode}, utilisation du fallback`);
      return await getFallbackMedication();
    }
    
    // Transformer les données de l'API en format MedicationApiResult
    const result = data.results[0];
    return {
      id: result.product_ndc || barcode,
      name: result.brand_name || result.generic_name || "Médicament inconnu",
      dosage: result.dosage_form || "Non spécifié",
      activeIngredient: result.active_ingredients ? result.active_ingredients[0]?.name : undefined,
      manufacturer: result.manufacturer_name,
      description: result.product_type || result.pharm_class || undefined,
      frequency: "À déterminer selon prescription"
    };
  } catch (error) {
    console.error('Erreur lors de la récupération du médicament:', error);
    // En cas d'erreur, on utilise un fallback
    return await getFallbackMedication();
  }
}

// Fonction pour rechercher un médicament par nom
export async function searchMedicationByName(name: string): Promise<MedicationApiResult[]> {
  try {
    // URL de l'API Open FDA pour rechercher par nom de marque ou générique
    const apiUrl = `https://api.fda.gov/drug/ndc.json?search=(brand_name:"${name}"+generic_name:"${name}")&limit=10`;
    
    const response = await fetch(apiUrl);
    
    // Si la réponse n'est pas OK, on utilise un fallback
    if (!response.ok) {
      console.warn(`La recherche par nom ${name} a échoué, utilisation du fallback`);
      return await getFallbackMedicationList(name);
    }
    
    const data = await response.json();
    
    // Si aucun résultat n'est trouvé, on utilise un fallback
    if (!data.results || data.results.length === 0) {
      console.warn(`Aucun médicament trouvé pour le nom ${name}, utilisation du fallback`);
      return await getFallbackMedicationList(name);
    }
    
    // Transformer les données de l'API en format MedicationApiResult[]
    return data.results.map((result: any) => ({
      id: result.product_ndc || String(Math.random()),
      name: result.brand_name || result.generic_name || "Médicament inconnu",
      dosage: result.dosage_form || "Non spécifié",
      activeIngredient: result.active_ingredients ? result.active_ingredients[0]?.name : undefined,
      manufacturer: result.manufacturer_name,
      description: result.product_type || result.pharm_class || undefined,
      frequency: "À déterminer selon prescription"
    }));
  } catch (error) {
    console.error('Erreur lors de la recherche de médicaments:', error);
    // En cas d'erreur, on utilise un fallback
    return await getFallbackMedicationList(name);
  }
}

// Fonction de fallback pour obtenir un médicament par défaut en cas d'échec de l'API
async function getFallbackMedication(): Promise<MedicationApiResult> {
  // Utilisation de la base de données locale comme fallback
  const { getMedicationByBarcode } = await import('@/utils/medicationData');
  const medication = getMedicationByBarcode('random');
  
  return {
    id: medication?.id || String(Date.now()),
    name: medication?.name || "Médicament non identifié",
    dosage: medication?.dosage || "Dosage inconnu",
    frequency: medication?.frequency || "À déterminer selon prescription"
  };
}

// Fonction de fallback pour obtenir une liste de médicaments par défaut en cas d'échec de l'API
async function getFallbackMedicationList(query: string): Promise<MedicationApiResult[]> {
  // Utilisation de la base de données locale comme fallback
  const { searchMedications } = await import('@/utils/medicationData');
  const medications = searchMedications(query);
  
  return medications.map(med => ({
    id: med.id || String(Date.now()),
    name: med.name || "Médicament non identifié",
    dosage: med.dosage || "Dosage inconnu",
    frequency: med.frequency || "À déterminer selon prescription"
  }));
}
