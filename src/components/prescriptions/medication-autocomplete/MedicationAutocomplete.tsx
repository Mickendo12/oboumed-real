
import React, { useState, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Medication {
  id: string;
  name: string;
  dosage?: string;
  form?: string;
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

  // Mock medication data - in a real app, this would come from an API
  const mockMedications: Medication[] = [
    { id: "1", name: "Paracétamol", dosage: "500mg", form: "Comprimé" },
    { id: "2", name: "Ibuprofène", dosage: "200mg", form: "Comprimé" },
    { id: "3", name: "Aspirin", dosage: "100mg", form: "Comprimé" },
    { id: "4", name: "Amoxicilline", dosage: "500mg", form: "Gélule" },
    { id: "5", name: "Doliprane", dosage: "1000mg", form: "Comprimé" },
    { id: "6", name: "Efferalgan", dosage: "500mg", form: "Comprimé effervescent" },
    { id: "7", name: "Dafalgan", dosage: "1000mg", form: "Comprimé" },
    { id: "8", name: "Advil", dosage: "400mg", form: "Comprimé" },
    { id: "9", name: "Nurofen", dosage: "200mg", form: "Comprimé" },
    { id: "10", name: "Augmentin", dosage: "500mg", form: "Comprimé" }
  ];

  useEffect(() => {
    setMedications([]);
    
    if (searchValue.length > 0) {
      setLoading(true);
      const timer = setTimeout(() => {
        const filtered = mockMedications.filter(med =>
          med.name.toLowerCase().includes(searchValue.toLowerCase())
        );
        setMedications(filtered || []);
        setLoading(false);
      }, 200);

      return () => clearTimeout(timer);
    } else {
      setMedications([]);
    }
  }, [searchValue]);

  const selectedMedication = medications.find(med => med.name === value);

  const handleAddNewMedication = () => {
    if (searchValue.trim()) {
      const newMedication: Medication = {
        id: `new_${Date.now()}`,
        name: searchValue.trim(),
        dosage: "",
        form: ""
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
              {loading ? "Recherche en cours..." : "Aucun médicament trouvé."}
            </CommandEmpty>
            {medications && medications.length > 0 && (
              <CommandGroup>
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
                    <div className="flex flex-col">
                      <span>{medication.name}</span>
                      {medication.dosage && medication.form && (
                        <span className="text-sm text-muted-foreground">
                          {medication.dosage} - {medication.form}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {showAddButton && (
              <CommandGroup>
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
