
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Clock, Calendar, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { type Reminder } from './ReminderForm';
import { useToast } from '@/hooks/use-toast';

interface RemindersListProps {
  reminders: Reminder[];
  onDelete: (id: string) => void;
}

const getDayLabel = (day: string) => {
  const dayMap: Record<string, string> = {
    monday: 'Lun',
    tuesday: 'Mar',
    wednesday: 'Mer',
    thursday: 'Jeu',
    friday: 'Ven',
    saturday: 'Sam',
    sunday: 'Dim'
  };
  
  return dayMap[day] || day;
};

const RemindersList: React.FC<RemindersListProps> = ({ reminders, onDelete }) => {
  const { toast } = useToast();
  
  const handleDelete = (id: string, medicationName: string) => {
    onDelete(id);
    toast({
      title: "Rappel supprimé",
      description: `Le rappel pour ${medicationName} a été supprimé.`
    });
  };
  
  if (reminders.length === 0) {
    return (
      <Card className="bg-white/10">
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">Vous n'avez pas encore de rappels configurés</p>
          <p className="text-sm text-muted-foreground mt-2">
            Créez un rappel pour ne pas oublier de prendre vos médicaments
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      {reminders.map((reminder) => (
        <Card key={reminder.id} className="bg-white/10 backdrop-blur-sm hover:bg-white/15 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex justify-between">
              <span>{reminder.title}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                onClick={() => handleDelete(reminder.id, reminder.medicationName)}
              >
                <Trash2 size={16} />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4">
              <div className="bg-primary/20 p-2 rounded-md">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              
              <div className="space-y-2 flex-1">
                <div className="text-sm font-medium">{reminder.medicationName}</div>
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock size={14} />
                  <span>{reminder.time}</span>
                  <Separator orientation="vertical" className="h-3" />
                  <Calendar size={14} />
                  <span>{reminder.days.map(day => getDayLabel(day)).join(', ')}</span>
                </div>
                
                {reminder.notes && (
                  <div className="text-xs text-muted-foreground">
                    {reminder.notes}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default RemindersList;
