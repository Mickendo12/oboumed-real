import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import NewPrescriptionForm from '../prescriptions/NewPrescriptionForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Bell, UserRound, Shield, Stethoscope } from 'lucide-react';
import ReminderForm from '../reminders/ReminderForm';
import { type ReminderForm as FormReminder } from '@/types/reminder';
import RemindersList from '../reminders/RemindersList';
import UserProfile from './UserProfile';
import AdminDashboard from '../admin/AdminDashboard';
import DoctorDashboard from '../doctor/DoctorDashboard';
import { getRemindersForUser, addReminder, deleteReminder, getUserProfile } from '@/services/supabaseService';
import { convertDBReminderToForm, convertFormReminderToDB } from '@/services/reminderService';
import { useToast } from '@/components/ui/use-toast';

interface DashboardProps {
  userName: string;
  userId: string;
}

const Dashboard: React.FC<DashboardProps> = ({ userName, userId }) => {
  const [isCreatingPrescription, setIsCreatingPrescription] = useState(false);
  const [isCreatingReminder, setIsCreatingReminder] = useState(false);
  const [reminders, setReminders] = useState<FormReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'user' | 'doctor' | 'admin'>('user');
  const [activeView, setActiveView] = useState<'dashboard' | 'admin' | 'doctor'>('dashboard');
  const { toast } = useToast();
  
  // Load user profile and reminders
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!userId) return;
        
        setLoading(true);
        const [profile, userReminders] = await Promise.all([
          getUserProfile(userId),
          getRemindersForUser(userId)
        ]);
        
        if (profile) {
          setUserRole(profile.role);
        }
        
        // Convert DB reminders to form reminders
        const formReminders = userReminders.map(convertDBReminderToForm);
        setReminders(formReminders);
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger vos données."
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [userId, toast]);
  
  const handleSaveReminder = async (reminder: Omit<FormReminder, "id">) => {
    try {
      const dbReminderInput = convertFormReminderToDB(reminder, userId);
      const newDBReminder = await addReminder(dbReminderInput);
      const newFormReminder = convertDBReminderToForm(newDBReminder);
      
      setReminders([...reminders, newFormReminder]);
      setIsCreatingReminder(false);
      
      toast({
        title: "Rappel ajouté",
        description: `Rappel pour ${reminder.medicationName} créé avec succès.`
      });
    } catch (error) {
      console.error("Error saving reminder:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'ajout du rappel."
      });
    }
  };
  
  const handleDeleteReminder = async (id: string) => {
    try {
      await deleteReminder(id);
      setReminders(reminders.filter(reminder => reminder.id !== id));
    } catch (error) {
      console.error("Error deleting reminder:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur s'est produite lors de la suppression du rappel."
      });
    }
  };

  // Show admin dashboard
  if (activeView === 'admin' && userRole === 'admin') {
    return (
      <div>
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => setActiveView('dashboard')}
          >
            ← Retour au tableau de bord
          </Button>
        </div>
        <AdminDashboard />
      </div>
    );
  }

  // Show doctor dashboard
  if (activeView === 'doctor' && (userRole === 'doctor' || userRole === 'admin')) {
    return (
      <div>
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => setActiveView('dashboard')}
          >
            ← Retour au tableau de bord
          </Button>
        </div>
        <DoctorDashboard userId={userId} />
      </div>
    );
  }
  
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
            userId={userId}
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
            <div className="flex items-center gap-4">
              <Button onClick={() => setIsCreatingPrescription(true)}>
                <Plus size={18} className="mr-2" />
                Nouvelle ordonnance
              </Button>
            </div>
          </div>

          {/* Boutons de rôles spéciaux - toujours visible quand applicable */}
          {(userRole === 'admin' || userRole === 'doctor') && (
            <Card className="border-2 border-blue-200 dark:border-blue-800">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-blue-900 dark:text-blue-100 flex items-center gap-2">
                  <Shield size={20} />
                  Accès privilégiés
                </CardTitle>
                <CardDescription>
                  Interfaces spécialisées pour votre rôle
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  {userRole === 'admin' && (
                    <Button 
                      size="lg" 
                      variant="default"
                      className="bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => setActiveView('admin')}
                    >
                      <Shield size={20} className="mr-2" />
                      Interface Administration
                    </Button>
                  )}
                  {(userRole === 'doctor' || userRole === 'admin') && (
                    <Button 
                      size="lg" 
                      variant="default"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => setActiveView('doctor')}
                    >
                      <Stethoscope size={20} className="mr-2" />
                      Interface Médecin
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          
          <Tabs defaultValue="prescriptions">
            <TabsList>
              <TabsTrigger value="prescriptions">Ordonnances</TabsTrigger>
              <TabsTrigger value="medications">Médicaments</TabsTrigger>
              <TabsTrigger value="reminders">Rappels</TabsTrigger>
              <TabsTrigger value="profile">
                <UserRound size={16} className="mr-2" /> 
                Mon profil
              </TabsTrigger>
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
              
              {loading ? (
                <div className="py-4 text-center">
                  <div className="animate-pulse">Chargement des rappels...</div>
                </div>
              ) : (
                <RemindersList 
                  reminders={reminders} 
                  onDelete={handleDeleteReminder}
                />
              )}
            </TabsContent>

            <TabsContent value="profile">
              <UserProfile userId={userId} />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default Dashboard;
