
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
        <div className="mb-3 xs:mb-4 sm:mb-6">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setActiveView('dashboard')}
            className="text-[10px] xs:text-xs sm:text-sm"
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
        <div className="mb-3 xs:mb-4 sm:mb-6">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setActiveView('dashboard')}
            className="text-[10px] xs:text-xs sm:text-sm"
          >
            ← Retour au tableau de bord
          </Button>
        </div>
        <DoctorDashboard userId={userId} />
      </div>
    );
  }
  
  return (
    <div className="container py-2 xs:py-3 sm:py-4 lg:py-6 space-y-2 xs:space-y-3 sm:space-y-4 lg:space-y-6">
      {isCreatingPrescription ? (
        <div>
          <div className="mb-3 xs:mb-4 sm:mb-6">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsCreatingPrescription(false)}
              className="text-[10px] xs:text-xs sm:text-sm"
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
          <div className="mb-3 xs:mb-4 sm:mb-6">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsCreatingReminder(false)}
              className="text-[10px] xs:text-xs sm:text-sm"
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 xs:gap-3 sm:gap-4">
            <div className="w-full sm:w-auto">
              <h1 className="text-sm xs:text-base sm:text-lg lg:text-xl xl:text-2xl font-bold">Bonjour, {userName}</h1>
              <p className="text-[10px] xs:text-xs sm:text-sm lg:text-base text-muted-foreground">Bienvenue sur votre tableau de bord ObouMed</p>
              {!hasActiveSubscription && (
                <div className="mt-1 xs:mt-2 p-1.5 xs:p-2 sm:p-3 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded">
                  <p className="text-[9px] xs:text-[10px] sm:text-xs lg:text-sm text-yellow-800 dark:text-yellow-200">
                    ⚠️ Accès restreint - Veuillez renouveler votre abonnement
                  </p>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 xs:gap-2 sm:gap-4 w-full sm:w-auto justify-end">
              {hasActiveSubscription && (
                <Button 
                  onClick={() => setIsCreatingPrescription(true)}
                  size="sm"
                  className="text-[9px] xs:text-[10px] sm:text-xs lg:text-sm px-2 xs:px-3 sm:px-4 py-1 xs:py-1.5 sm:py-2"
                >
                  <Plus size={10} className="mr-1 xs:mr-1.5 sm:mr-2 xs:w-3 xs:h-3 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">Nouvelle ordonnance</span>
                  <span className="xs:hidden">Nouvelle</span>
                </Button>
              )}
            </div>
          </div>

          {/* Boutons de rôles spéciaux */}
          {(userRole === 'admin' || userRole === 'doctor') && (
            <Card className="border-2 border-blue-200 dark:border-blue-800">
              <CardHeader className="pb-2 xs:pb-3 sm:pb-4">
                <CardTitle className="text-sm xs:text-base sm:text-lg lg:text-xl text-blue-900 dark:text-blue-100 flex items-center gap-1 xs:gap-1.5 sm:gap-2">
                  <Shield size={14} className="xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
                  Accès privilégiés
                </CardTitle>
                <CardDescription className="text-[10px] xs:text-xs sm:text-sm">
                  Interfaces spécialisées pour votre rôle
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col xs:flex-row gap-2 xs:gap-3 sm:gap-4">
                  {userRole === 'admin' && (
                    <Button 
                      size="sm"
                      variant="default"
                      className="bg-red-600 hover:bg-red-700 text-white text-[9px] xs:text-[10px] sm:text-xs lg:text-sm px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 sm:py-2.5"
                      onClick={() => setActiveView('admin')}
                    >
                      <Shield size={12} className="mr-1 xs:mr-1.5 sm:mr-2 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4" />
                      <span className="hidden xs:inline">Interface Administration</span>
                      <span className="xs:hidden">Admin</span>
                    </Button>
                  )}
                  {(userRole === 'doctor' || userRole === 'admin') && (
                    <Button 
                      size="sm"
                      variant="default"
                      className="bg-blue-600 hover:bg-blue-700 text-white text-[9px] xs:text-[10px] sm:text-xs lg:text-sm px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 sm:py-2.5"
                      onClick={() => setActiveView('doctor')}
                    >
                      <Stethoscope size={12} className="mr-1 xs:mr-1.5 sm:mr-2 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4" />
                      <span className="hidden xs:inline">Interface Médecin</span>
                      <span className="xs:hidden">Médecin</span>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          
          <Tabs defaultValue="prescriptions" className="w-full">
            <TabsList className="grid w-full grid-cols-4 h-auto p-0.5 xs:p-1 gap-0.5 xs:gap-1">
              <TabsTrigger 
                value="prescriptions" 
                className="text-[8px] xs:text-[9px] sm:text-[10px] lg:text-xs py-1.5 xs:py-2 sm:py-2.5 px-1 xs:px-1.5 sm:px-2 flex flex-col xs:flex-row items-center gap-0.5 xs:gap-1 sm:gap-1.5"
              >
                <FileText size={10} className="xs:w-3 xs:h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" />
                <span className="hidden xxs:inline">Ordonnances</span>
                <span className="xxs:hidden">Ord.</span>
              </TabsTrigger>
              <TabsTrigger 
                value="medications" 
                className="text-[8px] xs:text-[9px] sm:text-[10px] lg:text-xs py-1.5 xs:py-2 sm:py-2.5 px-1 xs:px-1.5 sm:px-2 flex flex-col xs:flex-row items-center gap-0.5 xs:gap-1 sm:gap-1.5"
              >
                <Pill size={10} className="xs:w-3 xs:h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" />
                <span className="hidden xxs:inline">Médicaments</span>
                <span className="xxs:hidden">Méd.</span>
              </TabsTrigger>
              <TabsTrigger 
                value="reminders" 
                className="text-[8px] xs:text-[9px] sm:text-[10px] lg:text-xs py-1.5 xs:py-2 sm:py-2.5 px-1 xs:px-1.5 sm:px-2 flex flex-col xs:flex-row items-center gap-0.5 xs:gap-1 sm:gap-1.5"
              >
                <Bell size={10} className="xs:w-3 xs:h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" />
                <span className="hidden xxs:inline">Rappels</span>
                <span className="xxs:hidden">Rapp.</span>
              </TabsTrigger>
              <TabsTrigger 
                value="profile" 
                className="text-[8px] xs:text-[9px] sm:text-[10px] lg:text-xs py-1.5 xs:py-2 sm:py-2.5 px-1 xs:px-1.5 sm:px-2 flex flex-col xs:flex-row items-center gap-0.5 xs:gap-1 sm:gap-1.5"
              >
                <UserRound size={10} className="xs:w-3 xs:h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" />
                <span className="hidden xxs:inline">Mon profil</span>
                <span className="xxs:hidden">Profil</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="prescriptions" className="mt-2 xs:mt-3 sm:mt-4 lg:mt-6">
              {hasActiveSubscription ? (
                <PrescriptionsList userId={userId} />
              ) : (
                <Card className="dark-container">
                  <CardHeader>
                    <CardTitle className="text-sm xs:text-base sm:text-lg">Ordonnances</CardTitle>
                    <CardDescription className="text-[10px] xs:text-xs sm:text-sm">
                      Vos ordonnances enregistrées
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center py-4 xs:py-6 sm:py-8">
                    <p className="text-[10px] xs:text-xs sm:text-sm text-muted-foreground mb-2 xs:mb-3 sm:mb-4">
                      Accès restreint - Abonnement requis pour voir vos ordonnances
                    </p>
                    <Button variant="outline" disabled size="sm" className="text-[9px] xs:text-[10px] sm:text-xs">
                      Renouveler l'abonnement
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="medications" className="mt-2 xs:mt-3 sm:mt-4 lg:mt-6">
              <Card className="dark-container">
                <CardHeader>
                  <CardTitle className="text-sm xs:text-base sm:text-lg">Mes médicaments</CardTitle>
                  <CardDescription className="text-[10px] xs:text-xs sm:text-sm">
                    Liste de tous vos médicaments enregistrés ({medications.length})
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="py-2 xs:py-3 sm:py-4 text-center">
                      <div className="animate-pulse text-[10px] xs:text-xs sm:text-sm">Chargement des médicaments...</div>
                    </div>
                  ) : medications.length === 0 ? (
                    <p className="text-[10px] xs:text-xs sm:text-sm text-muted-foreground text-center py-4 xs:py-6 sm:py-8">
                      Vous n'avez pas encore de médicaments enregistrés.
                    </p>
                  ) : hasActiveSubscription ? (
                    <div className="space-y-2 xs:space-y-3 sm:space-y-4">
                      {medications.map((medication) => (
                        <div key={medication.id} className="p-2 xs:p-3 sm:p-4 border rounded">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-[10px] xs:text-xs sm:text-sm lg:text-base">{medication.name}</h4>
                              {medication.dosage && (
                                <p className="text-[9px] xs:text-[10px] sm:text-xs lg:text-sm text-muted-foreground">Dosage: {medication.dosage}</p>
                              )}
                              {medication.frequency && (
                                <p className="text-[9px] xs:text-[10px] sm:text-xs lg:text-sm text-muted-foreground">Fréquence: {medication.frequency}</p>
                              )}
                              {medication.posology && (
                                <p className="text-[9px] xs:text-[10px] sm:text-xs lg:text-sm text-muted-foreground mt-1 xs:mt-2">Posologie: {medication.posology}</p>
                              )}
                            </div>
                            {medication.treatment_duration && (
                              <span className="text-[8px] xs:text-[9px] sm:text-[10px] bg-muted px-1 xs:px-1.5 sm:px-2 py-0.5 xs:py-1 rounded">
                                {medication.treatment_duration}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 xs:py-6 sm:py-8">
                      <p className="text-[10px] xs:text-xs sm:text-sm text-muted-foreground mb-2 xs:mb-3 sm:mb-4">
                        Accès restreint - Abonnement requis pour voir vos médicaments
                      </p>
                      <Button variant="outline" disabled size="sm" className="text-[9px] xs:text-[10px] sm:text-xs">
                        Renouveler l'abonnement
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reminders" className="space-y-2 xs:space-y-3 sm:space-y-4 mt-2 xs:mt-3 sm:mt-4 lg:mt-6">
              <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-2 xs:gap-3 sm:gap-4">
                <h3 className="text-sm xs:text-base sm:text-lg font-medium">Mes rappels ({reminders.length})</h3>
                {hasActiveSubscription && (
                  <Button 
                    onClick={() => setIsCreatingReminder(true)}
                    size="sm"
                    className="text-[9px] xs:text-[10px] sm:text-xs lg:text-sm px-2 xs:px-3 sm:px-4 py-1 xs:py-1.5 sm:py-2"
                  >
                    <Bell size={10} className="mr-1 xs:mr-1.5 sm:mr-2 xs:w-3 xs:h-3 sm:w-3.5 sm:h-3.5" />
                    <span className="hidden xs:inline">Ajouter un rappel</span>
                    <span className="xs:hidden">Ajouter</span>
                  </Button>
                )}
              </div>
              
              {loading ? (
                <div className="py-2 xs:py-3 sm:py-4 text-center">
                  <div className="animate-pulse text-[10px] xs:text-xs sm:text-sm">Chargement des rappels...</div>
                </div>
              ) : hasActiveSubscription ? (
                <RemindersList 
                  reminders={reminders} 
                  onDelete={handleDeleteReminder}
                />
              ) : (
                <Card className="dark-container">
                  <CardContent className="text-center py-4 xs:py-6 sm:py-8">
                    <p className="text-[10px] xs:text-xs sm:text-sm text-muted-foreground mb-2 xs:mb-3 sm:mb-4">
                      Accès restreint - Abonnement requis pour gérer vos rappels
                    </p>
                    <Button variant="outline" disabled size="sm" className="text-[9px] xs:text-[10px] sm:text-xs">
                      Renouveler l'abonnement
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="profile" className="mt-2 xs:mt-3 sm:mt-4 lg:mt-6">
              <UserProfile userId={userId} />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default Dashboard;
