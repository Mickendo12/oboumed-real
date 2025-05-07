
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import MedicationScanner from './medication-scanner';
import { addDocument, COLLECTIONS } from '@/services/firestoreService';
import PrescriptionDetails from './prescription-form/PrescriptionDetails';
import MedicationList from './prescription-form/MedicationList';
import { Medication, Prescription } from './prescription-form/types';

interface NewPrescriptionFormProps {
  onComplete: () => void;
  userId: string;
}

const NewPrescriptionForm: React.FC<NewPrescriptionFormProps> = ({ onComplete, userId }) => {
  const [step, setStep] = useState<'details' | 'medications'>('details');
  const [hospitalName, setHospitalName] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [pharmacyName, setPharmacyName] = useState('');
  const [prescriptionDate, setPrescriptionDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [medications, setMedications] = useState<Medication[]>([]);
  const [saving, setSaving] = useState(false);
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

  const handleSavePrescription = async () => {
    try {
      setSaving(true);
      
      const prescriptionData: Prescription = {
        hospitalName,
        doctorName,
        pharmacyName,
        prescriptionDate,
        medications,
        userId,
        createdAt: Date.now()
      };
      
      await addDocument(COLLECTIONS.PRESCRIPTIONS, prescriptionData);
      
      toast({
        title: "Ordonnance enregistrée",
        description: "Votre ordonnance a été enregistrée avec succès.",
      });
      
      onComplete();
    } catch (error) {
      console.error("Error saving prescription:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'enregistrement de l'ordonnance."
      });
    } finally {
      setSaving(false);
    }
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
            <PrescriptionDetails 
              hospitalName={hospitalName}
              setHospitalName={setHospitalName}
              doctorName={doctorName}
              setDoctorName={setDoctorName}
              prescriptionDate={prescriptionDate}
              setPrescriptionDate={setPrescriptionDate}
              pharmacyName={pharmacyName}
              setPharmacyName={setPharmacyName}
            />
            
            <Button type="submit" className="w-full">
              Continuer
            </Button>
          </form>
        ) : (
          <div className="space-y-6">
            <MedicationScanner onScan={handleAddMedication} />
            
            <div className="space-y-4">
              <h3 className="font-medium">Médicaments ajoutés ({medications.length})</h3>
              <MedicationList medications={medications} />
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
            disabled={medications.length === 0 || saving}
          >
            {saving ? "Enregistrement..." : "Enregistrer l'ordonnance"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default NewPrescriptionForm;
