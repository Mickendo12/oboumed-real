import { useState, useEffect } from 'react';
import { getRemindersForUser, getMedicationsForUser } from '@/services/supabaseService';
import { convertDBReminderToForm } from '@/services/reminderService';
import { type ReminderForm as FormReminder } from '@/types/reminder';
import { useToast } from '@/components/ui/use-toast';

export const useDashboardData = (userId: string) => {
  const [reminders, setReminders] = useState<FormReminder[]>([]);
  const [medications, setMedications] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = async () => {
    if (!userId) return;

    try {
      setDataLoading(true);
      
      // Charger rappels et médicaments en parallèle
      const [userReminders, userMedications] = await Promise.all([
        getRemindersForUser(userId),
        getMedicationsForUser(userId)
      ]);
      
      const formReminders = userReminders.map(convertDBReminderToForm);
      setReminders(formReminders);
      setMedications(userMedications);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger certaines données."
      });
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  const refreshData = () => fetchData();

  return {
    reminders,
    setReminders,
    medications,
    dataLoading,
    refreshData
  };
};