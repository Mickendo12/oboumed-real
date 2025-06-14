
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Eye, Calendar, User, Building } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Prescription {
  id: string;
  hospital_name?: string;
  doctor_name?: string;
  pharmacy_name?: string;
  prescription_date?: string;
  image_url?: string;
  created_at: string;
  medications_count?: number;
}

interface PrescriptionsListProps {
  userId: string;
}

const PrescriptionsList: React.FC<PrescriptionsListProps> = ({ userId }) => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPrescriptions();
  }, [userId]);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      
      // Récupérer les ordonnances
      const { data: prescriptionsData, error: prescriptionsError } = await supabase
        .from('prescriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (prescriptionsError) {
        throw prescriptionsError;
      }

      // Pour chaque ordonnance, compter les médicaments
      const prescriptionsWithCount = await Promise.all(
        (prescriptionsData || []).map(async (prescription) => {
          const { count } = await supabase
            .from('medications')
            .select('*', { count: 'exact', head: true })
            .eq('prescription_id', prescription.id);

          return {
            ...prescription,
            medications_count: count || 0
          };
        })
      );

      setPrescriptions(prescriptionsWithCount);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
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
      <div className="py-4 text-center">
        <div className="animate-pulse">Chargement des ordonnances...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {prescriptions.length === 0 ? (
        <Card className="dark-container">
          <CardHeader>
            <CardTitle>Ordonnances</CardTitle>
            <CardDescription>
              Vos ordonnances enregistrées
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center py-8">
            <FileText size={48} className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">
              Vous n'avez pas encore d'ordonnances enregistrées.
            </p>
            <p className="text-sm text-muted-foreground">
              Cliquez sur "Nouvelle ordonnance" pour commencer.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {prescriptions.map((prescription) => (
            <Card key={prescription.id} className="cursor-pointer hover:shadow-md transition-shadow dark-container">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText size={18} />
                      {prescription.hospital_name || 'Ordonnance'}
                    </CardTitle>
                    {prescription.doctor_name && (
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <User size={14} />
                        Dr. {prescription.doctor_name}
                      </CardDescription>
                    )}
                  </div>
                  {prescription.image_url && (
                    <Badge variant="secondary" className="text-xs">
                      <Eye size={12} className="mr-1" />
                      Image
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar size={14} />
                  {prescription.prescription_date 
                    ? formatDate(prescription.prescription_date)
                    : formatDate(prescription.created_at)
                  }
                </div>
                
                {prescription.pharmacy_name && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building size={14} />
                    {prescription.pharmacy_name}
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-2">
                  <Badge variant="outline">
                    {prescription.medications_count} médicament{(prescription.medications_count || 0) > 1 ? 's' : ''}
                  </Badge>
                  <Button size="sm" variant="ghost">
                    <Eye size={14} className="mr-1" />
                    Voir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PrescriptionsList;
