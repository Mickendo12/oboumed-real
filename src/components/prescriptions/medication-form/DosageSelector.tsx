
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface DosageSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const DOSAGE_UNITS = [
  { value: 'mg', label: 'mg (milligrammes)' },
  { value: 'g', label: 'g (grammes)' },
  { value: 'ml', label: 'ml (millilitres)' },
  { value: 'cl', label: 'cl (centilitres)' },
  { value: 'cuillere_cafe', label: 'cuillère à café' },
  { value: 'cuillere_soupe', label: 'cuillère à soupe' },
  { value: 'comprime', label: 'comprimé(s)' },
  { value: 'gelule', label: 'gélule(s)' },
  { value: 'capsule', label: 'capsule(s)' },
  { value: 'suppositoire', label: 'suppositoire(s)' },
  { value: 'gouttes', label: 'goutte(s)' },
  { value: 'spray', label: 'pulvérisation(s)' },
  { value: 'sachet', label: 'sachet(s)' },
  { value: 'ampoule', label: 'ampoule(s)' },
  { value: 'patch', label: 'patch(es)' },
  { value: 'ui', label: 'UI (unités internationales)' }
];

const DosageSelector: React.FC<DosageSelectorProps> = ({ value, onChange }) => {
  const [amount, setAmount] = React.useState('');
  const [unit, setUnit] = React.useState('');

  React.useEffect(() => {
    // Parse existing value
    if (value) {
      const parts = value.split(' ');
      if (parts.length >= 2) {
        setAmount(parts[0]);
        setUnit(parts.slice(1).join(' '));
      } else {
        setAmount(value);
      }
    }
  }, [value]);

  const handleAmountChange = (newAmount: string) => {
    setAmount(newAmount);
    updateValue(newAmount, unit);
  };

  const handleUnitChange = (newUnit: string) => {
    setUnit(newUnit);
    updateValue(amount, newUnit);
  };

  const updateValue = (newAmount: string, newUnit: string) => {
    if (newAmount && newUnit) {
      onChange(`${newAmount} ${newUnit}`);
    } else if (newAmount) {
      onChange(newAmount);
    } else {
      onChange('');
    }
  };

  return (
    <div className="flex gap-2">
      <Input
        placeholder="Quantité"
        value={amount}
        onChange={(e) => handleAmountChange(e.target.value)}
        className="flex-1"
      />
      <Select value={unit} onValueChange={handleUnitChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Unité" />
        </SelectTrigger>
        <SelectContent>
          {DOSAGE_UNITS.map((unitOption) => (
            <SelectItem key={unitOption.value} value={unitOption.label}>
              {unitOption.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default DosageSelector;
