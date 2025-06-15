
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check, ChevronsUpDown, Plus, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { searchMedicationByName } from '@/services/medicationApiService';
import { supabase } from '@/integrations/supabase/client';

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
  const [manualValue, setManualValue] = useState("");
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(false);
  const [useManualEntry, setUseManualEntry] = useState(false);

  useEffect(() => {
    const searchMedications = async () => {
      if (searchValue.length < 2 || useManualEntry) {
        setMedications([]);
        return;
      }

      setLoading(true);
      try {
        // Rechercher dans l'API externe
        const apiResults = await searchMedicationByName(searchValue);
        
        // Rechercher dans les médicaments personnalisés
        const { data: customMeds, error } = await supabase
          .from('custom_medications')
          .select('*')
          .or(`name.ilike.%${searchValue}%, active_ingredient.ilike.%${searchValue}%`)
          .order('usage_count', { ascending: false })
          .limit(5);

        let customResults: Medication[] = [];
        if (!error && customMeds) {
          customResults = customMeds.map(med => ({
            id: med.id,
            name: med.name,
            dosage: med.dosage || '',
            form: med.form || '',
            activeIngredient: med.active_ingredient || '',
            manufacturer: med.manufacturer || ''
          }));
        }

        // Combiner les résultats
        const allResults = [...customResults, ...apiResults];
        setMedications(allResults);
      } catch (error) {
        console.error('Error searching medications:', error);
        setMedications([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchMedications, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchValue, useManualEntry]);

  const handleManualSubmit = () => {
    if (manualValue.trim()) {
      const manualMedication: Medication = {
        id: `manual_${Date.now()}`,
        name: manualValue.trim(),
        dosage: "",
        form: "Saisie manuelle"
      };
      onSelect(manualMedication);
      setManualValue("");
      setUseManualEntry(false);
    }
  };

  const handleSelectMedication = async (medication: Medication) => {
    // Incrémenter le compteur d'usage si c'est un médicament personnalisé
    if (medication.id.length === 36) { // UUID format
      try {
        const { data: currentMed } = await supabase
          .from('custom_medications')
          .select('usage_count')
          .eq('id', medication.id)
          .single();

        if (currentMed) {
          await supabase
            .from('custom_medications')
            .update({ usage_count: currentMed.usage_count + 1 })
            .eq('id', medication.id);
        }
      } catch (error) {
        console.error('Error incrementing usage count:', error);
      }
    }
    
    onSelect(medication);
    setOpen(false);
    setSearchValue("");
  };

  if (useManualEntry) {
    return (
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            value={manualValue}
            onChange={(e) => setManualValue(e.target.value)}
            placeholder="Tapez le nom du médicament..."
            className="flex-1"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleManualSubmit();
              }
            }}
          />
          <Button onClick={handleManualSubmit} disabled={!manualValue.trim()}>
            Valider
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              setUseManualEntry(false);
              setManualValue("");
            }}
          >
            <X size={16} />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Saisissez le nom du médicament manuellement et cliquez sur "Valider"
        </p>
      </div>
    );
  }

  const selectedMedication = medications.find(med => med.name === value);

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="flex-1 justify-between"
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
                        onSelect={() => handleSelectMedication(medication)}
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
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        
        <Button 
          variant="outline" 
          onClick={() => setUseManualEntry(true)}
          className="shrink-0"
        >
          <Plus size={16} className="mr-1" />
          Manuel
        </Button>
      </div>
      
      <p className="text-sm text-muted-foreground">
        Recherchez dans la base ou cliquez sur "Manuel" pour saisir directement
      </p>
    </div>
  );
};

export default MedicationAutocomplete;
