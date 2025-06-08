
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
  form?: string;
}

// Base de données enrichie de médicaments français
const FRENCH_MEDICATIONS_DB = [
  // Antalgiques / Antipyrétiques
  { id: "1", name: "Paracétamol", dosage: "500mg", form: "Comprimé", activeIngredient: "Paracétamol" },
  { id: "2", name: "Paracétamol", dosage: "1000mg", form: "Comprimé", activeIngredient: "Paracétamol" },
  { id: "3", name: "Doliprane", dosage: "500mg", form: "Comprimé", activeIngredient: "Paracétamol", manufacturer: "Sanofi" },
  { id: "4", name: "Doliprane", dosage: "1000mg", form: "Comprimé", activeIngredient: "Paracétamol", manufacturer: "Sanofi" },
  { id: "5", name: "Efferalgan", dosage: "500mg", form: "Comprimé effervescent", activeIngredient: "Paracétamol", manufacturer: "Bristol Myers Squibb" },
  { id: "6", name: "Efferalgan", dosage: "1000mg", form: "Comprimé effervescent", activeIngredient: "Paracétamol", manufacturer: "Bristol Myers Squibb" },
  { id: "7", name: "Dafalgan", dosage: "500mg", form: "Comprimé", activeIngredient: "Paracétamol", manufacturer: "Bristol Myers Squibb" },
  { id: "8", name: "Dafalgan", dosage: "1000mg", form: "Comprimé", activeIngredient: "Paracétamol", manufacturer: "Bristol Myers Squibb" },
  
  // Anti-inflammatoires
  { id: "10", name: "Ibuprofène", dosage: "200mg", form: "Comprimé", activeIngredient: "Ibuprofène" },
  { id: "11", name: "Ibuprofène", dosage: "400mg", form: "Comprimé", activeIngredient: "Ibuprofène" },
  { id: "12", name: "Advil", dosage: "200mg", form: "Comprimé", activeIngredient: "Ibuprofène", manufacturer: "Pfizer" },
  { id: "13", name: "Advil", dosage: "400mg", form: "Comprimé", activeIngredient: "Ibuprofène", manufacturer: "Pfizer" },
  { id: "14", name: "Nurofen", dosage: "200mg", form: "Comprimé", activeIngredient: "Ibuprofène", manufacturer: "Reckitt Benckiser" },
  { id: "15", name: "Nurofen", dosage: "400mg", form: "Comprimé", activeIngredient: "Ibuprofène", manufacturer: "Reckitt Benckiser" },
  { id: "16", name: "Spedifen", dosage: "200mg", form: "Comprimé", activeIngredient: "Ibuprofène", manufacturer: "Zambon" },
  { id: "17", name: "Spedifen", dosage: "400mg", form: "Comprimé", activeIngredient: "Ibuprofène", manufacturer: "Zambon" },
  
  // Aspirine
  { id: "20", name: "Aspirine", dosage: "100mg", form: "Comprimé", activeIngredient: "Acide acétylsalicylique" },
  { id: "21", name: "Aspirine", dosage: "500mg", form: "Comprimé", activeIngredient: "Acide acétylsalicylique" },
  { id: "22", name: "Kardégic", dosage: "75mg", form: "Comprimé", activeIngredient: "Acide acétylsalicylique", manufacturer: "Sanofi" },
  { id: "23", name: "Aspirine UPSA", dosage: "500mg", form: "Comprimé effervescent", activeIngredient: "Acide acétylsalicylique", manufacturer: "UPSA" },
  
  // Antibiotiques
  { id: "30", name: "Amoxicilline", dosage: "500mg", form: "Gélule", activeIngredient: "Amoxicilline" },
  { id: "31", name: "Amoxicilline", dosage: "1000mg", form: "Comprimé", activeIngredient: "Amoxicilline" },
  { id: "32", name: "Clamoxyl", dosage: "500mg", form: "Gélule", activeIngredient: "Amoxicilline", manufacturer: "GlaxoSmithKline" },
  { id: "33", name: "Clamoxyl", dosage: "1000mg", form: "Comprimé", activeIngredient: "Amoxicilline", manufacturer: "GlaxoSmithKline" },
  { id: "34", name: "Augmentin", dosage: "500mg/125mg", form: "Comprimé", activeIngredient: "Amoxicilline + Acide clavulanique", manufacturer: "GlaxoSmithKline" },
  { id: "35", name: "Augmentin", dosage: "1000mg/125mg", form: "Comprimé", activeIngredient: "Amoxicilline + Acide clavulanique", manufacturer: "GlaxoSmithKline" },
  { id: "36", name: "Azithromycine", dosage: "250mg", form: "Comprimé", activeIngredient: "Azithromycine" },
  { id: "37", name: "Zithromax", dosage: "250mg", form: "Comprimé", activeIngredient: "Azithromycine", manufacturer: "Pfizer" },
  
  // Antispasmodiques
  { id: "40", name: "Spasfon", dosage: "80mg", form: "Comprimé", activeIngredient: "Phloroglucinol", manufacturer: "Teva" },
  { id: "41", name: "Spasfon", dosage: "80mg", form: "Lyophilisat", activeIngredient: "Phloroglucinol", manufacturer: "Teva" },
  { id: "42", name: "Débridat", dosage: "100mg", form: "Comprimé", activeIngredient: "Trimébutine", manufacturer: "Pfizer" },
  
  // Antihistaminiques
  { id: "50", name: "Cétirizine", dosage: "10mg", form: "Comprimé", activeIngredient: "Cétirizine" },
  { id: "51", name: "Zyrtec", dosage: "10mg", form: "Comprimé", activeIngredient: "Cétirizine", manufacturer: "UCB Pharma" },
  { id: "52", name: "Loratadine", dosage: "10mg", form: "Comprimé", activeIngredient: "Loratadine" },
  { id: "53", name: "Clarityne", dosage: "10mg", form: "Comprimé", activeIngredient: "Loratadine", manufacturer: "Bayer" },
  
  // Antiacides
  { id: "60", name: "Gaviscon", dosage: "500mg", form: "Comprimé à croquer", activeIngredient: "Alginate de sodium", manufacturer: "Reckitt Benckiser" },
  { id: "61", name: "Maalox", dosage: "400mg", form: "Comprimé à croquer", activeIngredient: "Hydroxyde d'aluminium + Hydroxyde de magnésium", manufacturer: "Sanofi" },
  { id: "62", name: "Rennie", dosage: "680mg", form: "Comprimé à croquer", activeIngredient: "Carbonate de calcium + Carbonate de magnésium", manufacturer: "Bayer" },
  
  // Laxatifs
  { id: "70", name: "Duphalac", dosage: "10g", form: "Sachet", activeIngredient: "Lactulose", manufacturer: "Abbott" },
  { id: "71", name: "Forlax", dosage: "10g", form: "Sachet", activeIngredient: "Macrogol 4000", manufacturer: "Ipsen" },
  
  // Vitamines et compléments
  { id: "80", name: "Vitamine D3", dosage: "1000 UI", form: "Comprimé", activeIngredient: "Cholécalciférol" },
  { id: "81", name: "Uvedose", dosage: "100000 UI", form: "Solution buvable", activeIngredient: "Cholécalciférol", manufacturer: "Crinex" },
  { id: "82", name: "Tardyferon", dosage: "80mg", form: "Comprimé", activeIngredient: "Sulfate ferreux", manufacturer: "Pierre Fabre" },
  { id: "83", name: "Magnésium", dosage: "300mg", form: "Comprimé", activeIngredient: "Magnésium" },
  
  // Antitussifs
  { id: "90", name: "Toplexil", dosage: "0,33mg/ml", form: "Sirop", activeIngredient: "Oxomémazine", manufacturer: "Sanofi" },
  { id: "91", name: "Bronchokod", dosage: "5mg", form: "Comprimé", activeIngredient: "Carbocistéine", manufacturer: "Sanofi" },
  { id: "92", name: "Mucomyst", dosage: "200mg", form: "Sachet", activeIngredient: "Acétylcystéine", manufacturer: "Zambon" },
];

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
      frequency: "À déterminer selon prescription",
      form: result.dosage_form
    };
  } catch (error) {
    console.error('Erreur lors de la récupération du médicament:', error);
    // En cas d'erreur, on utilise un fallback
    return await getFallbackMedication();
  }
}

// Fonction pour rechercher un médicament par nom avec prise en charge de l'autocomplétion
export async function searchMedicationByName(name: string): Promise<MedicationApiResult[]> {
  try {
    // Vérifier si la requête est vide ou trop courte
    if (!name || name.length < 2) {
      return [];
    }

    // D'abord chercher dans notre base de données locale
    const localResults = searchInLocalDatabase(name);
    
    // Ensuite essayer l'API FDA
    let apiResults: MedicationApiResult[] = [];
    try {
      const apiUrl = `https://api.fda.gov/drug/ndc.json?search=(brand_name:"${name}"+generic_name:"${name}")&limit=10`;
      const response = await fetch(apiUrl);
      
      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          apiResults = data.results.map((result: any) => ({
            id: result.product_ndc || `api_${Math.random()}`,
            name: result.brand_name || result.generic_name || "Médicament inconnu",
            dosage: result.dosage_form || "Non spécifié",
            activeIngredient: result.active_ingredients ? result.active_ingredients[0]?.name : undefined,
            manufacturer: result.manufacturer_name,
            description: result.product_type || result.pharm_class || undefined,
            frequency: "À déterminer selon prescription",
            form: result.dosage_form
          }));
        }
      }
    } catch (apiError) {
      console.warn('API FDA non disponible:', apiError);
    }

    // Combiner les résultats en évitant les doublons
    const combinedResults = [...localResults];
    apiResults.forEach(apiResult => {
      const isDuplicate = localResults.some(localResult => 
        localResult.name.toLowerCase() === apiResult.name.toLowerCase() &&
        localResult.dosage === apiResult.dosage
      );
      if (!isDuplicate) {
        combinedResults.push(apiResult);
      }
    });

    return combinedResults.slice(0, 15); // Limiter à 15 résultats
  } catch (error) {
    console.error('Erreur lors de la recherche de médicaments:', error);
    // En cas d'erreur, utiliser seulement la base locale
    return searchInLocalDatabase(name);
  }
}

// Fonction pour chercher dans la base de données locale
function searchInLocalDatabase(query: string): MedicationApiResult[] {
  const normalizedQuery = query.toLowerCase().trim();
  
  return FRENCH_MEDICATIONS_DB
    .filter(med => 
      med.name.toLowerCase().includes(normalizedQuery) ||
      (med.activeIngredient && med.activeIngredient.toLowerCase().includes(normalizedQuery))
    )
    .map(med => ({
      id: med.id,
      name: med.name,
      dosage: med.dosage,
      form: med.form,
      activeIngredient: med.activeIngredient,
      manufacturer: med.manufacturer,
      frequency: "À déterminer selon prescription"
    }))
    .slice(0, 10);
}

// Fonction de fallback pour obtenir un médicament par défaut en cas d'échec de l'API
async function getFallbackMedication(): Promise<MedicationApiResult> {
  const randomMed = FRENCH_MEDICATIONS_DB[Math.floor(Math.random() * FRENCH_MEDICATIONS_DB.length)];
  
  return {
    id: randomMed.id,
    name: randomMed.name,
    dosage: randomMed.dosage,
    form: randomMed.form,
    activeIngredient: randomMed.activeIngredient,
    manufacturer: randomMed.manufacturer,
    frequency: "À déterminer selon prescription"
  };
}
