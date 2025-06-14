
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Plus, 
  Bell, 
  User, 
  Stethoscope,
  Shield,
  Users,
  Clock,
  Settings 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import NewPrescriptionForm from '@/components/prescriptions/NewPrescriptionForm';
import PrescriptionsList from '@/components/prescriptions/PrescriptionsList';
import ReminderForm from '@/components/reminders/ReminderForm';
import RemindersList from '@/components/reminders/RemindersList';
import UserProfile from './UserProfile';
import DoctorDashboard from '@/components/doctor/DoctorDashboard';
import AdminDashboard from '@/components/admin/AdminDashboard';
import { supabase } from '@/integrations/supabase/client';

interface DashboardProps {
  userName: string;
  userId: string;
}

const Dashboard: React.FC<DashboardProps> = ({ userName, userId }) => {
  const [isNewPrescriptionOpen, setIsNewPrescriptionOpen] = useState(false);
  const [isReminderFormOpen, setIsReminderFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'prescriptions' | 'reminders' | 'profile' | 'doctor' | 'admin'>('prescriptions');
  const [userRole, setUserRole] = useState<string>('user');
  const [reminders, setReminders] = useState<any[]>([]);
  const { toast } = useToast();
  
  React.useEffect(() => {
    fetchUserProfile();
    loadReminders();
  }, []);
  
  const fetchUserProfile = async () => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        throw error;
      }
      
      if (profile) {
        setUserRole(profile.role);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger votre profil."
      });
    }
  };

  const loadReminders = async () => {
    try {
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setReminders(data || []);
    } catch (error) {
      console.error('Error loading reminders:', error);
    }
  };

  const handleReminderSave = async (reminder: any) => {
    try {
      const { data, error } = await supabase
        .from('reminders')
        .insert({
          user_id: userId,
          medication_name: reminder.medicationName,
          time: reminder.time,
          dosage: '1 comprimé',
          frequency: reminder.days.length === 7 ? 'daily' : 'every_other_day'
        })
        .select()
        .single();

      if (error) throw error;
      
      await loadReminders();
      setIsReminderFormOpen(false);
      toast({
        title: "Rappel créé",
        description: "Votre rappel a été créé avec succès."
      });
    } catch (error) {
      console.error('Error saving reminder:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de créer le rappel."
      });
    }
  };

  const handleReminderDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadReminders();
    } catch (error) {
      console.error('Error deleting reminder:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer le rappel."
      });
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'prescriptions' | 'reminders' | 'profile' | 'doctor' | 'admin');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Bonjour, {userName}
        </h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Users size={20} />
            <span className="text-sm text-muted-foreground">
              {userRole}
            </span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="prescriptions" value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="prescriptions" className="flex items-center gap-2">
            <FileText size={16} />
            Ordonnances
          </TabsTrigger>
          <TabsTrigger value="reminders" className="flex items-center gap-2">
            <Bell size={16} />
            Rappels
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User size={16} />
            Profil
          </TabsTrigger>
          {userRole === 'doctor' && (
            <TabsTrigger value="doctor" className="flex items-center gap-2">
              <Stethoscope size={16} />
              Médecin
            </TabsTrigger>
          )}
          {userRole === 'admin' && (
            <TabsTrigger value="admin" className="flex items-center gap-2">
              <Shield size={16} />
              Admin
            </TabsTrigger>
          )}
        </TabsList>
        <div className="pt-4">
          <TabsContent value="prescriptions" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Vos ordonnances</h2>
              <Button onClick={() => setIsNewPrescriptionOpen(true)}>
                <Plus size={16} className="mr-2" />
                Nouvelle ordonnance
              </Button>
            </div>
            <PrescriptionsList userId={userId} />
          </TabsContent>

          <TabsContent value="reminders" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Vos rappels</h2>
              <Button onClick={() => setIsReminderFormOpen(true)}>
                <Plus size={16} className="mr-2" />
                Nouveau rappel
              </Button>
            </div>
            <RemindersList reminders={reminders} onDelete={handleReminderDelete} />
          </TabsContent>

          <TabsContent value="profile" className="space-y-4">
            <h2 className="text-xl font-semibold">Votre profil</h2>
            <UserProfile userId={userId} />
          </TabsContent>

          {userRole === 'doctor' && (
            <TabsContent value="doctor" className="space-y-4">
              <DoctorDashboard userId={userId} />
            </TabsContent>
          )}
          
          {userRole === 'admin' && (
            <TabsContent value="admin" className="space-y-4">
              <AdminDashboard />
            </TabsContent>
          )}
        </div>
      </Tabs>

      {/* Modals */}
      {isNewPrescriptionOpen && (
        <NewPrescriptionForm
          userId={userId}
          onComplete={() => setIsNewPrescriptionOpen(false)}
        />
      )}

      {isReminderFormOpen && (
        <ReminderForm
          onSave={handleReminderSave}
          onCancel={() => setIsReminderFormOpen(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
