
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { searchMedicationByName, MedicationApiResult } from '@/services/medicationApiService';

interface SearchModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (medication: {
    id: string;
    name: string;
    dosage: string;
    frequency: string;
  }) => void;
  onManualEntry: () => void;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ 
  isOpen, 
  onOpenChange, 
  onSelect, 
  onManualEntry, 
  onClose 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<MedicationApiResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await searchMedicationByName(searchTerm);
      setSearchResults(results);
      
      if (results.length === 0) {
        toast({
          title: "Aucun résultat",
          description: "Aucun médicament correspondant trouvé. Essayez un autre terme ou utilisez la saisie manuelle."
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur de recherche",
        description: "Impossible de rechercher des médicaments. Veuillez réessayer."
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (medication: MedicationApiResult) => {
    onSelect({
      id: medication.id,
      name: medication.name,
      dosage: medication.dosage,
      frequency: medication.frequency || '',
    });
    
    toast({
      title: "Médicament ajouté",
      description: `${medication.name} a été ajouté à votre ordonnance.`
    });
    
    onClose();
  };

  // Reset search when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setSearchResults([]);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rechercher un médicament</DialogTitle>
          <DialogDescription>
            Entrez le nom du médicament ou sa substance active.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Ex: Doliprane, Paracétamol..."
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={isSearching || !searchTerm.trim()}>
              {isSearching ? 'Recherche...' : 'Rechercher'}
            </Button>
          </div>
          
          {searchResults.length > 0 && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {searchResults.map((med) => (
                <div 
                  key={med.id}
                  className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                  onClick={() => handleSelectSearchResult(med)}
                >
                  <div className="font-medium">{med.name}</div>
                  <div className="text-sm text-muted-foreground">{med.dosage}</div>
                  {med.activeIngredient && (
                    <div className="text-xs mt-1">{med.activeIngredient}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button variant="outline" onClick={onManualEntry}>
            Saisie manuelle
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
