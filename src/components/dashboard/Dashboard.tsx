import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import NewPrescriptionForm from '../prescriptions/NewPrescriptionForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Bell, UserRound, Shield, Stethoscope, FileText, Pill } from 'lucide-react';
import ReminderForm from '../reminders/ReminderForm';
import { type ReminderForm as FormReminder } from '@/types/reminder';
import RemindersList from '../reminders/RemindersList';
import UserProfile from './UserProfile';
import AdminDashboard from '../admin/AdminDashboard';
import DoctorDashboard from '../doctor/DoctorDashboard';
import { getRemindersForUser, addReminder, deleteReminder, getUserProfile, getMedicationsForUser } from '@/services/supabaseService';
import { convertDBReminderToForm, convertFormReminderToDB } from '@/services/reminderService';
import { useToast } from '@/components/ui/use-toast';
import PrescriptionsList from '../prescriptions/PrescriptionsList';

interface DashboardProps {
  userName: string;
  userId: string;
}

const Dashboard: React.FC<DashboardProps> = ({ userName, userId }) => {
  const [isCreatingPrescription, setIsCreatingPrescription] = useState(false);
  const [isCreatingReminder, setIsCreatingReminder] = useState(false);
  const [reminders, setReminders] = useState<FormReminder[]>([]);
  const [medications, setMedications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'user' | 'doctor' | 'admin'>('user');
  const [activeView, setActiveView] = useState<'dashboard' | 'admin' | 'doctor'>('dashboard');
  const [userProfile, setUserProfile] = useState<any>(null);
  const { toast } = useToast();
  
  // Load user profile, reminders, and medications
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!userId) return;
        
        setLoading(true);
        const [profile, userReminders, userMedications] = await Promise.all([
          getUserProfile(userId),
          getRemindersForUser(userId),
          getMedicationsForUser(userId)
        ]);
        
        if (profile) {
          setUserRole(profile.role);
          setUserProfile(profile);
        }
        
        // Convert DB reminders to form reminders
        const formReminders = userReminders.map(convertDBReminderToForm);
        setReminders(formReminders);
        setMedications(userMedications);
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
      toast({
        title: "Rappel supprimé",
        description: "Le rappel a été supprimé avec succès."
      });
    } catch (error) {
      console.error("Error deleting reminder:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur s'est produite lors de la suppression du rappel."
      });
    }
  };

  const refreshData = async () => {
    try {
      const [userReminders, userMedications] = await Promise.all([
        getRemindersForUser(userId),
        getMedicationsForUser(userId)
      ]);
      
      const formReminders = userReminders.map(convertDBReminderToForm);
      setReminders(formReminders);
      setMedications(userMedications);
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  };

  // Check subscription status for access restrictions
  const hasActiveSubscription = userProfile?.access_status === 'active';

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
            onComplete={() => {
              setIsCreatingPrescription(false);
              refreshData();
            }}
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
              {!hasActiveSubscription && (
                <div className="mt-2 p-2 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-md">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    ⚠️ Accès restreint - Veuillez renouveler votre abonnement
                  </p>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              {hasActiveSubscription && (
                <Button onClick={() => setIsCreatingPrescription(true)}>
                  <Plus size={18} className="mr-2" />
                  Nouvelle ordonnance
                </Button>
              )}
            </div>
          </div>

          {/* Boutons de rôles spéciaux */}
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
              <TabsTrigger value="prescriptions">
                <FileText size={16} className="mr-2" />
                Ordonnances
              </TabsTrigger>
              <TabsTrigger value="medications">
                <Pill size={16} className="mr-2" />
                Médicaments
              </TabsTrigger>
              <TabsTrigger value="reminders">
                <Bell size={16} className="mr-2" />
                Rappels
              </TabsTrigger>
              <TabsTrigger value="profile">
                <UserRound size={16} className="mr-2" /> 
                Mon profil
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="prescriptions">
              {hasActiveSubscription ? (
                <PrescriptionsList userId={userId} />
              ) : (
                <Card className="dark-container">
                  <CardHeader>
                    <CardTitle>Ordonnances</CardTitle>
                    <CardDescription>
                      Vos ordonnances enregistrées
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      Accès restreint - Abonnement requis pour voir vos ordonnances
                    </p>
                    <Button variant="outline" disabled>
                      Renouveler l'abonnement
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="medications">
              <Card className="dark-container">
                <CardHeader>
                  <CardTitle>Mes médicaments</CardTitle>
                  <CardDescription>
                    Liste de tous vos médicaments enregistrés ({medications.length})
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="py-4 text-center">
                      <div className="animate-pulse">Chargement des médicaments...</div>
                    </div>
                  ) : medications.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Vous n'avez pas encore de médicaments enregistrés.
                    </p>
                  ) : hasActiveSubscription ? (
                    <div className="space-y-4">
                      {medications.map((medication) => (
                        <div key={medication.id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold">{medication.name}</h4>
                              {medication.dosage && (
                                <p className="text-sm text-muted-foreground">Dosage: {medication.dosage}</p>
                              )}
                              {medication.frequency && (
                                <p className="text-sm text-muted-foreground">Fréquence: {medication.frequency}</p>
                              )}
                              {medication.posology && (
                                <p className="text-sm text-muted-foreground mt-2">Posologie: {medication.posology}</p>
                              )}
                            </div>
                            {medication.treatment_duration && (
                              <span className="text-xs bg-muted px-2 py-1 rounded">
                                {medication.treatment_duration}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">
                        Accès restreint - Abonnement requis pour voir vos médicaments
                      </p>
                      <Button variant="outline" disabled>
                        Renouveler l'abonnement
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reminders" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Mes rappels ({reminders.length})</h3>
                {hasActiveSubscription && (
                  <Button onClick={() => setIsCreatingReminder(true)}>
                    <Bell size={16} className="mr-2" />
                    Ajouter un rappel
                  </Button>
                )}
              </div>
              
              {loading ? (
                <div className="py-4 text-center">
                  <div className="animate-pulse">Chargement des rappels...</div>
                </div>
              ) : hasActiveSubscription ? (
                <RemindersList 
                  reminders={reminders} 
                  onDelete={handleDeleteReminder}
                />
              ) : (
                <Card className="dark-container">
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      Accès restreint - Abonnement requis pour gérer vos rappels
                    </p>
                    <Button variant="outline" disabled>
                      Renouveler l'abonnement
                    </Button>
                  </CardContent>
                </Card>
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
