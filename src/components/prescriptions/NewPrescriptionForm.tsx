
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import MedicationScanner from './MedicationScanner';

interface NewPrescriptionFormProps {
  onComplete: () => void;
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
}

const NewPrescriptionForm: React.FC<NewPrescriptionFormProps> = ({ onComplete }) => {
  const [step, setStep] = useState<'details' | 'medications'>('details');
  const [hospitalName, setHospitalName] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [pharmacyName, setPharmacyName] = useState('');
  const [prescriptionDate, setPrescriptionDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [medications, setMedications] = useState<Medication[]>([]);
  const { toast } = useToast();

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('medications');
  };

  const handleAddMedication = (medication: Medication) => {
    setMedications([...medications, medication]);
    toast({
      title: "Médicament ajouté",
      description: `${medication.name} a été ajouté à votre ordonnance.`,
    });
  };

  const handleSavePrescription = () => {
    toast({
      title: "Ordonnance enregistrée",
      description: "Votre ordonnance a été enregistrée avec succès.",
    });
    onComplete();
  };

  return (
    <Card className="w-full max-w-3xl mx-auto animate-fade-in">
      <CardHeader>
        <CardTitle>
          {step === 'details' 
            ? 'Enregistrer une nouvelle ordonnance' 
            : 'Ajouter des médicaments à l\'ordonnance'}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {step === 'details' ? (
          <form onSubmit={handleDetailsSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="hospital" className="text-sm font-medium">
                Nom de l'hôpital
              </label>
              <Input
                id="hospital" 
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                placeholder="Entrez le nom de l'hôpital"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="doctor" className="text-sm font-medium">
                Nom du médecin
              </label>
              <Input
                id="doctor" 
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                placeholder="Entrez le nom du médecin"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="date" className="text-sm font-medium">
                Date de l'ordonnance
              </label>
              <Input
                id="date" 
                type="date"
                value={prescriptionDate}
                onChange={(e) => setPrescriptionDate(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="pharmacy" className="text-sm font-medium">
                Pharmacie
              </label>
              <Input
                id="pharmacy" 
                value={pharmacyName}
                onChange={(e) => setPharmacyName(e.target.value)}
                placeholder="Entrez le nom de la pharmacie"
                required
              />
            </div>
            
            <Button type="submit" className="w-full">
              Continuer
            </Button>
          </form>
        ) : (
          <div className="space-y-6">
            <MedicationScanner onScan={handleAddMedication} />
            
            <div className="space-y-4">
              <h3 className="font-medium">Médicaments ajoutés ({medications.length})</h3>
              {medications.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Aucun médicament ajouté à cette ordonnance
                </p>
              ) : (
                <ul className="space-y-2">
                  {medications.map((med) => (
                    <li key={med.id} className="p-3 border rounded-md bg-muted/30">
                      <div className="font-medium">{med.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {med.dosage} - {med.frequency}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </CardContent>
      
      {step === 'medications' && (
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setStep('details')}>
            Retour
          </Button>
          <Button 
            onClick={handleSavePrescription}
            disabled={medications.length === 0}
          >
            Enregistrer l'ordonnance
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default NewPrescriptionForm;
