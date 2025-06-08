
import React, { useState, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check, ChevronsUpDown, Plus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { searchMedicationByName } from '@/services/medicationApiService';

interface Medication {
  id: string;
  name: string;
  dosage?: string;
  form?: string;
  activeIngredient?: string;
  manufacturer?: string;
}

interface MedicationAutocompleteProps {
  value?: string;
  onSelect: (medication: Medication) => void;
  placeholder?: string;
}

const MedicationAutocomplete: React.FC<MedicationAutocompleteProps> = ({
  value,
  onSelect,
  placeholder = "Rechercher un médicament..."
}) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const searchMedications = async () => {
      if (searchValue.length < 2) {
        setMedications([]);
        return;
      }

      setLoading(true);
      try {
        const results = await searchMedicationByName(searchValue);
        setMedications(results);
      } catch (error) {
        console.error('Error searching medications:', error);
        setMedications([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchMedications, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchValue]);

  const selectedMedication = medications.find(med => med.name === value);

  const handleAddNewMedication = () => {
    if (searchValue.trim()) {
      const newMedication: Medication = {
        id: `custom_${Date.now()}`,
        name: searchValue.trim(),
        dosage: "",
        form: "Non spécifié"
      };
      onSelect(newMedication);
      setOpen(false);
      setSearchValue("");
    }
  };

  const showAddButton = searchValue.length > 2 && 
    !medications.some(med => med.name.toLowerCase() === searchValue.toLowerCase()) &&
    !loading;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedMedication ? selectedMedication.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput 
            placeholder="Tapez pour rechercher..." 
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            <CommandEmpty>
              {loading ? (
                <div className="flex items-center justify-center py-2">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Recherche en cours...
                </div>
              ) : (
                "Aucun médicament trouvé."
              )}
            </CommandEmpty>
            {medications && medications.length > 0 && (
              <CommandGroup heading="Médicaments trouvés">
                {medications.map((medication) => (
                  <CommandItem
                    key={medication.id}
                    value={medication.name}
                    onSelect={() => {
                      onSelect(medication);
                      setOpen(false);
                      setSearchValue("");
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === medication.name ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col flex-1">
                      <span className="font-medium">{medication.name}</span>
                      <div className="text-sm text-muted-foreground space-y-1">
                        {medication.dosage && medication.form && (
                          <div>{medication.dosage} - {medication.form}</div>
                        )}
                        {medication.activeIngredient && (
                          <div className="text-xs">PA: {medication.activeIngredient}</div>
                        )}
                        {medication.manufacturer && (
                          <div className="text-xs">Lab: {medication.manufacturer}</div>
                        )}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {showAddButton && (
              <CommandGroup heading="Nouveau médicament">
                <CommandItem onSelect={handleAddNewMedication}>
                  <Plus className="mr-2 h-4 w-4" />
                  <span>Ajouter "{searchValue}"</span>
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default MedicationAutocomplete;
