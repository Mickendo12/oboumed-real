
// Ce service utilise l'API Open FDA (Food and Drug Administration) pour récupérer des informations sur les médicaments
// Documentation: https://open.fda.gov/apis/

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
    // Dans un environnement réel, on ferait un appel à l'API Open FDA avec le code-barres
    // Exemple d'URL: https://api.fda.gov/drug/ndc.json?search=product_ndc:"barcode"
    
    // Simuler un délai de réseau
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Simuler une base de données de médicaments par code-barres
    const medicationDatabase: Record<string, MedicationApiResult> = {
      // Codes-barres simulés pour démonstration
      '0123456789': {
        id: '0123456789',
        name: 'Doliprane',
        dosage: '1000mg',
        activeIngredient: 'Paracétamol',
        manufacturer: 'Sanofi',
        description: 'Traitement de la douleur et/ou fièvre',
        frequency: '1 comprimé toutes les 6 heures (max 4 par jour)'
      },
      '9876543210': {
        id: '9876543210',
        name: 'Advil',
        dosage: '400mg',
        activeIngredient: 'Ibuprofène',
        manufacturer: 'Pfizer',
        description: 'Anti-inflammatoire non stéroïdien',
        frequency: '1 comprimé toutes les 8 heures pendant les repas'
      },
      '1234567890': {
        id: '1234567890',
        name: 'Spasfon',
        dosage: '80mg',
        activeIngredient: 'Phloroglucinol',
        manufacturer: 'Teva',
        description: 'Traitement des douleurs spasmodiques',
        frequency: '2 comprimés 3 fois par jour'
      },
      '2345678901': {
        id: '2345678901',
        name: 'Amoxicilline',
        dosage: '500mg',
        activeIngredient: 'Amoxicilline',
        manufacturer: 'Biogaran',
        description: 'Antibiotique de la famille des bêta-lactamines',
        frequency: '1 gélule 3 fois par jour pendant 7 jours'
      },
      '3456789012': {
        id: '3456789012',
        name: 'Forlax',
        dosage: '10g',
        activeIngredient: 'Macrogol 4000',
        manufacturer: 'Ipsen Pharma',
        description: 'Traitement de la constipation occasionnelle',
        frequency: '1 sachet par jour le matin'
      },
      '4567890123': {
        id: '4567890123',
        name: 'Xanax',
        dosage: '0.25mg',
        activeIngredient: 'Alprazolam',
        manufacturer: 'Pfizer',
        description: 'Traitement des troubles anxieux',
        frequency: '1 comprimé 3 fois par jour'
      }
    };
    
    // Si le code-barres est "random", retourner un médicament aléatoire de la base de données
    if (barcode === 'random') {
      const barcodes = Object.keys(medicationDatabase);
      const randomBarcode = barcodes[Math.floor(Math.random() * barcodes.length)];
      return medicationDatabase[randomBarcode];
    }
    
    // Chercher le médicament par son code-barres
    return medicationDatabase[barcode] || null;
  } catch (error) {
    console.error('Erreur lors de la récupération du médicament:', error);
    return null;
  }
}

// Fonction pour rechercher un médicament par nom
export async function searchMedicationByName(name: string): Promise<MedicationApiResult[]> {
  try {
    // Dans un environnement réel, on ferait un appel à l'API Open FDA avec le nom
    // Exemple d'URL: https://api.fda.gov/drug/ndc.json?search=brand_name:"name"
    
    // Simuler un délai de réseau
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Base de données simulée pour la recherche par nom (pour démonstration)
    const medicationDatabase: MedicationApiResult[] = [
      {
        id: '0123456789',
        name: 'Doliprane',
        dosage: '1000mg',
        activeIngredient: 'Paracétamol',
        manufacturer: 'Sanofi',
        description: 'Traitement de la douleur et/ou fièvre',
        frequency: '1 comprimé toutes les 6 heures (max 4 par jour)'
      },
      {
        id: '0123456790',
        name: 'Doliprane',
        dosage: '500mg',
        activeIngredient: 'Paracétamol',
        manufacturer: 'Sanofi',
        description: 'Traitement de la douleur et/ou fièvre',
        frequency: '1-2 comprimés toutes les 6 heures (max 8 par jour)'
      },
      {
        id: '9876543210',
        name: 'Advil',
        dosage: '400mg',
        activeIngredient: 'Ibuprofène',
        manufacturer: 'Pfizer',
        frequency: '1 comprimé toutes les 8 heures pendant les repas'
      }
    ];
    
    // Filtrer les résultats par nom (case insensitive)
    const normalizedName = name.toLowerCase();
    return medicationDatabase.filter(med => 
      med.name.toLowerCase().includes(normalizedName) || 
      (med.activeIngredient && med.activeIngredient.toLowerCase().includes(normalizedName))
    );
  } catch (error) {
    console.error('Erreur lors de la recherche de médicaments:', error);
    return [];
  }
}
