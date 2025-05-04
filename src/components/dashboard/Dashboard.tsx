
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import NewPrescriptionForm from '../prescriptions/NewPrescriptionForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Bell } from 'lucide-react';
import ReminderForm, { Reminder } from '../reminders/ReminderForm';
import RemindersList from '../reminders/RemindersList';

interface DashboardProps {
  userName: string;
}

const Dashboard: React.FC<DashboardProps> = ({ userName }) => {
  const [isCreatingPrescription, setIsCreatingPrescription] = useState(false);
  const [isCreatingReminder, setIsCreatingReminder] = useState(false);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  
  const handleSaveReminder = (reminder: Reminder) => {
    setReminders([...reminders, reminder]);
    setIsCreatingReminder(false);
  };
  
  const handleDeleteReminder = (id: string) => {
    setReminders(reminders.filter(reminder => reminder.id !== id));
  };
  
  return (
    <div className="container py-6 space-y-6">
      {isCreatingPrescription ? (
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
      ) : isCreatingReminder ? (
        <div>
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => setIsCreatingReminder(false)}
            >
              ← Retour au tableau de bord
            </Button>
          </div>
          <div className="max-w-2xl mx-auto">
            <ReminderForm 
              onSave={handleSaveReminder}
              onCancel={() => setIsCreatingReminder(false)}
            />
          </div>
        </div>
      ) : (
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
                <Card className="cursor-pointer hover:shadow-md transition-shadow dark-container">
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
                  className="h-[140px] border-dashed dark-container"
                  onClick={() => setIsCreatingPrescription(true)}
                >
                  <Plus size={18} className="mr-2" />
                  Ajouter une ordonnance
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="medications">
              <Card className="dark-container">
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
            
            <TabsContent value="reminders" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Mes rappels</h3>
                <Button onClick={() => setIsCreatingReminder(true)}>
                  <Bell size={16} className="mr-2" />
                  Ajouter un rappel
                </Button>
              </div>
              
              <RemindersList 
                reminders={reminders} 
                onDelete={handleDeleteReminder}
              />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default Dashboard;
