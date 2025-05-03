
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import NewPrescriptionForm from '../prescriptions/NewPrescriptionForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';

interface DashboardProps {
  userName: string;
}

const Dashboard: React.FC<DashboardProps> = ({ userName }) => {
  const [isCreatingPrescription, setIsCreatingPrescription] = useState(false);
  
  return (
    <div className="container py-6 space-y-6">
      {!isCreatingPrescription ? (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Bonjour, {userName}</h1>
              <p className="text-muted-foreground">Bienvenue sur votre tableau de bord ObouMed</p>
            </div>
            <Button onClick={() => setIsCreatingPrescription(true)}>
              <Plus size={18} className="mr-2" />
              Nouvelle ordonnance
            </Button>
          </div>
          
          <Tabs defaultValue="prescriptions">
            <TabsList>
              <TabsTrigger value="prescriptions">Ordonnances</TabsTrigger>
              <TabsTrigger value="medications">Médicaments</TabsTrigger>
              <TabsTrigger value="reminders">Rappels</TabsTrigger>
            </TabsList>
            
            <TabsContent value="prescriptions">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Centre Hospitalier</CardTitle>
                    <CardDescription>Dr. Martin - 12/04/2025</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">3 médicaments</p>
                  </CardContent>
                </Card>
                
                <Button 
                  variant="outline" 
                  className="h-[140px] border-dashed"
                  onClick={() => setIsCreatingPrescription(true)}
                >
                  <Plus size={18} className="mr-2" />
                  Ajouter une ordonnance
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="medications">
              <Card>
                <CardHeader>
                  <CardTitle>Mes médicaments</CardTitle>
                  <CardDescription>
                    Liste de tous vos médicaments enregistrés
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Vous n'avez pas encore de médicaments enregistrés.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reminders">
              <Card>
                <CardHeader>
                  <CardTitle>Mes rappels</CardTitle>
                  <CardDescription>
                    Rappels pour la prise de médicaments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Vous n'avez pas encore de rappels configurés.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <div>
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => setIsCreatingPrescription(false)}
            >
              ← Retour au tableau de bord
            </Button>
          </div>
          <NewPrescriptionForm 
            onComplete={() => setIsCreatingPrescription(false)} 
          />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
