
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { CalendarDays, Pill, Hospital, User, Eye } from 'lucide-react';
import { getUserPrescriptions, PrescriptionWithMedications } from '@/services/prescriptionService';
import { getUserProfile } from '@/services/supabaseService';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface PrescriptionsListProps {
  userId: string;
}

const PrescriptionsList: React.FC<PrescriptionsListProps> = ({ userId }) => {
  const [prescriptions, setPrescriptions] = useState<PrescriptionWithMedications[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState<PrescriptionWithMedications | null>(null);
  const [accessRestricted, setAccessRestricted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPrescriptions();
  }, [userId]);

  const loadPrescriptions = async () => {
    try {
      setLoading(true);
      
      // Vérifier le statut d'accès de l'utilisateur
      const profile = await getUserProfile(userId);
      if (profile?.access_status === 'restricted' || profile?.access_status === 'expired') {
        setAccessRestricted(true);
        setLoading(false);
        return;
      }

      const data = await getUserPrescriptions(userId);
      setPrescriptions(data);
    } catch (error) {
      console.error('Error loading prescriptions:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger vos ordonnances."
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (accessRestricted) {
    return (
      <Card className="border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
        <CardHeader>
          <CardTitle className="text-red-900 dark:text-red-100 flex items-center gap-2">
            Accès restreint
          </CardTitle>
          <CardDescription className="text-red-700 dark:text-red-300">
            Votre accès aux ordonnances a été restreint par un administrateur. 
            Veuillez contacter le support pour plus d'informations.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (prescriptions.length === 0) {
    return (
      <Card className="text-center py-8">
        <CardContent>
          <Pill className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Aucune ordonnance
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Vous n'avez pas encore d'ordonnances enregistrées.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {prescriptions.map((prescription) => (
          <Card key={prescription.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Hospital className="w-5 h-5" />
                    {prescription.hospital_name || 'Établissement non renseigné'}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-4 mt-2">
                    {prescription.doctor_name && (
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        Dr. {prescription.doctor_name}
                      </span>
                    )}
                    {prescription.prescription_date && (
                      <span className="flex items-center gap-1">
                        <CalendarDays className="w-4 h-4" />
                        {formatDate(prescription.prescription_date)}
                      </span>
                    )}
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedPrescription(prescription)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Voir
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Pill className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {prescription.medications.length} médicament{prescription.medications.length > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  Ajouté le {formatDate(prescription.created_at)}
                </div>
              </div>
              
              {prescription.medications.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {prescription.medications.slice(0, 3).map((med) => (
                    <Badge key={med.id} variant="secondary" className="text-xs">
                      {med.name}
                    </Badge>
                  ))}
                  {prescription.medications.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{prescription.medications.length - 3} autres
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal de détails de l'ordonnance */}
      <Dialog open={!!selectedPrescription} onOpenChange={() => setSelectedPrescription(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails de l'ordonnance</DialogTitle>
          </DialogHeader>
          
          {selectedPrescription && (
            <div className="space-y-6">
              {/* Image de l'ordonnance */}
              {selectedPrescription.image_url && (
                <div>
                  <h3 className="font-medium mb-2">Image de l'ordonnance</h3>
                  <img 
                    src={selectedPrescription.image_url} 
                    alt="Ordonnance" 
                    className="w-full max-h-64 object-contain border rounded-lg bg-gray-50"
                  />
                </div>
              )}

              {/* Informations générales */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Établissement</h3>
                  <p className="text-sm text-gray-600">
                    {selectedPrescription.hospital_name || 'Non renseigné'}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Médecin</h3>
                  <p className="text-sm text-gray-600">
                    {selectedPrescription.doctor_name || 'Non renseigné'}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Date</h3>
                  <p className="text-sm text-gray-600">
                    {selectedPrescription.prescription_date 
                      ? formatDate(selectedPrescription.prescription_date)
                      : 'Non renseignée'}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Pharmacie</h3>
                  <p className="text-sm text-gray-600">
                    {selectedPrescription.pharmacy_name || 'Non renseignée'}
                  </p>
                </div>
              </div>

              {/* Liste des médicaments */}
              <div>
                <h3 className="font-medium mb-3">Médicaments ({selectedPrescription.medications.length})</h3>
                <div className="space-y-3">
                  {selectedPrescription.medications.map((medication) => (
                    <Card key={medication.id} className="p-4">
                      <div className="space-y-2">
                        <h4 className="font-medium">{medication.name}</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {medication.dosage && (
                            <div>
                              <span className="text-gray-500">Dosage:</span>
                              <span className="ml-2">{medication.dosage}</span>
                            </div>
                          )}
                          {medication.frequency && (
                            <div>
                              <span className="text-gray-500">Fréquence:</span>
                              <span className="ml-2">{medication.frequency}</span>
                            </div>
                          )}
                          {medication.posology && (
                            <div className="col-span-2">
                              <span className="text-gray-500">Posologie:</span>
                              <span className="ml-2">{medication.posology}</span>
                            </div>
                          )}
                          {medication.treatment_duration && (
                            <div>
                              <span className="text-gray-500">Durée:</span>
                              <span className="ml-2">{medication.treatment_duration}</span>
                            </div>
                          )}
                          {medication.comments && (
                            <div className="col-span-2">
                              <span className="text-gray-500">Commentaires:</span>
                              <span className="ml-2">{medication.comments}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PrescriptionsList;
