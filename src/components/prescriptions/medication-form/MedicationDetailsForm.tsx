
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Plus, X } from 'lucide-react';
import MedicationAutocomplete from '../medication-autocomplete/MedicationAutocomplete';

interface MedicationDetails {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  posology?: string;
  comments?: string;
  treatment_duration?: string;
}

interface MedicationDetailsFormProps {
  onAddMedication: (medication: MedicationDetails) => void;
}

const MedicationDetailsForm: React.FC<MedicationDetailsFormProps> = ({ onAddMedication }) => {
  const [selectedMedicationName, setSelectedMedicationName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [posology, setPosology] = useState('');
  const [comments, setComments] = useState('');
  const [treatmentDuration, setTreatmentDuration] = useState('');
  const [isFormVisible, setIsFormVisible] = useState(false);

  const handleMedicationSelect = (medication: { id: string; name: string; dosage?: string; form?: string }) => {
    setSelectedMedicationName(medication.name);
    if (medication.dosage) {
      setDosage(medication.dosage);
    }
    setIsFormVisible(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMedicationName.trim()) return;

    const medicationDetails: MedicationDetails = {
      id: `med_${Date.now()}`,
      name: selectedMedicationName,
      dosage: dosage || '',
      frequency: frequency || '',
      posology: posology || undefined,
      comments: comments || undefined,
      treatment_duration: treatmentDuration || undefined,
    };

    onAddMedication(medicationDetails);
    
    // Reset form
    setSelectedMedicationName('');
    setDosage('');
    setFrequency('');
    setPosology('');
    setComments('');
    setTreatmentDuration('');
    setIsFormVisible(false);
  };

  const handleCancel = () => {
    setSelectedMedicationName('');
    setDosage('');
    setFrequency('');
    setPosology('');
    setComments('');
    setTreatmentDuration('');
    setIsFormVisible(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus size={20} />
          Ajouter un médicament
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="medication-search">Rechercher un médicament</Label>
          <MedicationAutocomplete
            value={selectedMedicationName}
            onSelect={handleMedicationSelect}
            placeholder="Rechercher ou saisir un médicament..."
          />
        </div>

        {isFormVisible && (
          <form onSubmit={handleSubmit} className="space-y-4 border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dosage">Dosage</Label>
                <Input
                  id="dosage"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  placeholder="ex: 500mg, 1 comprimé"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="frequency">Fréquence</Label>
                <Input
                  id="frequency"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  placeholder="ex: 3 fois par jour"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="posology">Posologie détaillée</Label>
              <Textarea
                id="posology"
                value={posology}
                onChange={(e) => setPosology(e.target.value)}
                placeholder="ex: 1 comprimé matin, midi et soir au cours des repas"
                className="min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="treatment_duration">Durée du traitement</Label>
                <Input
                  id="treatment_duration"
                  value={treatmentDuration}
                  onChange={(e) => setTreatmentDuration(e.target.value)}
                  placeholder="ex: 7 jours, 2 semaines"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="comments">Commentaires</Label>
                <Input
                  id="comments"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Notes particulières"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" className="flex-1">
                Ajouter le médicament
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel}>
                <X size={16} />
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default MedicationDetailsForm;
