
// This is a mock database of medications
interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency?: string;
  barcode?: string;
}

const medicationsDatabase: Medication[] = [
  { id: '1', name: 'Doliprane', dosage: '1000mg', barcode: '3400936710955' },
  { id: '2', name: 'Efferalgan', dosage: '500mg', barcode: '3400933578787' },
  { id: '3', name: 'Advil', dosage: '200mg', barcode: '3400935955845' },
  { id: '4', name: 'Spasfon', dosage: '80mg', barcode: '3400930568842' },
  { id: '5', name: 'Smecta', dosage: '3g', barcode: '3400935328830' },
  { id: '6', name: 'Vogalib', dosage: '7,5mg', barcode: '3400937453257' },
  { id: '7', name: 'Gaviscon', dosage: '500mg', barcode: '3400930087114' },
  { id: '8', name: 'Imodium', dosage: '2mg', barcode: '3400930087671' },
  { id: '9', name: 'Daflon', dosage: '500mg', barcode: '3400935745675' },
  { id: '10', name: 'Levothyrox', dosage: '100μg', barcode: '3400930075333' },
];

export function getMedicationByBarcode(barcode: string): Medication | null {
  // If the exact barcode exists, return it
  const exactMatch = medicationsDatabase.find((med) => med.barcode === barcode);
  if (exactMatch) return exactMatch;
  
  // For demo/simulation purposes, return a random medication
  const randomIndex = Math.floor(Math.random() * medicationsDatabase.length);
  return medicationsDatabase[randomIndex];
}

export function searchMedications(query: string): Medication[] {
  if (!query || query.trim() === '') return [];
  
  const lowerCaseQuery = query.toLowerCase();
  return medicationsDatabase.filter(
    (med) => med.name.toLowerCase().includes(lowerCaseQuery)
  );
}
