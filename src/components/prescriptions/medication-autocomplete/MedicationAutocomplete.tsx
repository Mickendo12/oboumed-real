
import React, { useState, useEffect, useRef } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { searchMedicationByName, MedicationApiResult } from '@/services/medicationApiService';
import { Medication } from '@/components/prescriptions/prescription-form/types';
import { useToast } from '@/components/ui/use-toast';

interface MedicationAutocompleteProps {
  onMedicationSelect: (medication: Medication) => void;
}

const MedicationAutocomplete: React.FC<MedicationAutocompleteProps> = ({ onMedicationSelect }) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MedicationApiResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<MedicationApiResult | null>(null);
  const [frequency, setFrequency] = useState('');
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Effectuer la recherche avec un délai
  useEffect(() => {
    // Annuler la recherche précédente
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    // Configurer un nouveau délai pour la recherche
    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchMedicationByName(searchQuery);
        // S'assurer que results est toujours un tableau
        setSearchResults(Array.isArray(results) ? results : []);
      } catch (error) {
        console.error('Erreur lors de la recherche:', error);
        setSearchResults([]); // Définir un tableau vide en cas d'erreur
        toast({
          variant: "destructive",
          title: "Erreur de recherche",
          description: "Impossible de rechercher des médicaments. Veuillez réessayer."
        });
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, toast]);

  const handleSelectMedication = (medication: MedicationApiResult) => {
    setSelectedMedication(medication);
    setOpen(false);
  };

  const handleSubmit = () => {
    if (!selectedMedication) {
      toast({
        variant: "destructive",
        title: "Médicament requis",
        description: "Veuillez sélectionner un médicament dans la liste."
      });
      return;
    }

    const newMedication: Medication = {
      id: selectedMedication.id,
      name: selectedMedication.name,
      dosage: selectedMedication.dosage,
      frequency: frequency || 'À déterminer selon prescription'
    };

    onMedicationSelect(newMedication);
    toast({
      title: "Médicament ajouté",
      description: `${selectedMedication.name} a été ajouté à l'ordonnance.`
    });

    // Réinitialiser le formulaire
    setSelectedMedication(null);
    setFrequency('');
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="medication" className="text-sm font-medium">
          Rechercher un médicament
        </label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              role="combobox" 
              aria-expanded={open}
              className="w-full justify-between"
            >
              {selectedMedication ? selectedMedication.name : "Sélectionner un médicament..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0">
            <Command>
              <CommandInput 
                placeholder="Rechercher un médicament..." 
                value={searchQuery}
                onValueChange={setSearchQuery}
              />
              {isSearching && (
                <div className="flex items-center justify-center p-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="ml-2 text-sm text-muted-foreground">Recherche...</span>
                </div>
              )}
              <CommandEmpty>
                {searchQuery.length < 2 
                  ? "Tapez au moins 2 caractères pour rechercher" 
                  : "Aucun médicament trouvé"}
              </CommandEmpty>
              <CommandGroup>
                {searchResults && searchResults.length > 0 && searchResults.map((med) => (
                  <CommandItem
                    key={med.id}
                    onSelect={() => handleSelectMedication(med)}
                    className="flex flex-col items-start py-2"
                  >
                    <div className="flex w-full items-center justify-between">
                      <span>{med.name}</span>
                      {selectedMedication?.id === med.id && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{med.dosage}</div>
                    {med.activeIngredient && (
                      <div className="text-xs mt-1">{med.activeIngredient}</div>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {selectedMedication && (
        <>
          <div className="space-y-2">
            <label htmlFor="dosage" className="text-sm font-medium">
              Dosage
            </label>
            <Input 
              id="dosage"
              value={selectedMedication.dosage}
              readOnly
              className="bg-muted/30"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="frequency" className="text-sm font-medium">
              Fréquence de prise
            </label>
            <Input 
              id="frequency"
              placeholder="Ex: 1 comprimé matin et soir"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
            />
          </div>
          <Button onClick={handleSubmit} className="w-full">
            Ajouter à l'ordonnance
          </Button>
        </>
      )}
    </div>
  );
};

export default MedicationAutocomplete;
