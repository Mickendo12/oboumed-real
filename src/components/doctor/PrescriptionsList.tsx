
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  FileText, 
  Calendar, 
  Hospital, 
  User, 
  Building2, 
  Eye,
  ChevronDown,
  ChevronUp,
  Pill
} from 'lucide-react';
import { PrescriptionWithMedications } from '@/services/prescriptionService';

interface PrescriptionsListProps {
  prescriptions: PrescriptionWithMedications[];
}

const PrescriptionsList: React.FC<PrescriptionsListProps> = ({ prescriptions }) => {
  const [expandedPrescriptions, setExpandedPrescriptions] = useState<Set<string>>(new Set());

  const togglePrescriptionDetails = (prescriptionId: string) => {
    const newExpanded = new Set(expandedPrescriptions);
    if (newExpanded.has(prescriptionId)) {
      newExpanded.delete(prescriptionId);
    } else {
      newExpanded.add(prescriptionId);
    }
    setExpandedPrescriptions(newExpanded);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (prescriptions.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <FileText size={48} className="mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Aucune ordonnance trouvée</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {prescriptions.map((prescription) => {
        const isExpanded = expandedPrescriptions.has(prescription.id);
        
        return (
          <Card key={prescription.id} className="border-l-4 border-l-blue-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText size={20} />
                  Ordonnance du {prescription.prescription_date 
                    ? formatDate(prescription.prescription_date) 
                    : formatDate(prescription.created_at)}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Pill size={14} />
                    {prescription.medications.length} médicament{prescription.medications.length > 1 ? 's' : ''}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => togglePrescriptionDetails(prescription.id)}
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp size={16} className="mr-1" />
                        Masquer
                      </>
                    ) : (
                      <>
                        <Eye size={16} className="mr-1" />
                        Détails
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {prescription.doctor_name && (
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-muted-foreground" />
                    <span className="text-sm">
                      <strong>Médecin:</strong> {prescription.doctor_name}
                    </span>
                  </div>
                )}
                {prescription.hospital_name && (
                  <div className="flex items-center gap-2">
                    <Hospital size={16} className="text-muted-foreground" />
                    <span className="text-sm">
                      <strong>Hôpital:</strong> {prescription.hospital_name}
                    </span>
                  </div>
                )}
                {prescription.pharmacy_name && (
                  <div className="flex items-center gap-2">
                    <Building2 size={16} className="text-muted-foreground" />
                    <span className="text-sm">
                      <strong>Pharmacie:</strong> {prescription.pharmacy_name}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Calendar size={16} />
                <span>Créée le {formatDate(prescription.created_at)}</span>
              </div>

              {isExpanded && (
                <div className="mt-4 space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Pill size={16} />
                    Médicaments prescrits ({prescription.medications.length})
                  </h4>
                  
                  {prescription.medications.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Médicament</TableHead>
                          <TableHead>Dosage</TableHead>
                          <TableHead>Fréquence</TableHead>
                          <TableHead>Posologie</TableHead>
                          <TableHead>Durée</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {prescription.medications.map((medication) => (
                          <TableRow key={medication.id}>
                            <TableCell className="font-medium">{medication.name}</TableCell>
                            <TableCell>{medication.dosage || '-'}</TableCell>
                            <TableCell>{medication.frequency || '-'}</TableCell>
                            <TableCell>{medication.posology || '-'}</TableCell>
                            <TableCell>{medication.treatment_duration || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-sm text-muted-foreground">Aucun médicament associé à cette ordonnance</p>
                  )}

                  {prescription.image_url && (
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">Image de l'ordonnance</h4>
                      <img 
                        src={prescription.image_url} 
                        alt="Ordonnance" 
                        className="max-w-full h-auto rounded border"
                      />
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default PrescriptionsList;
