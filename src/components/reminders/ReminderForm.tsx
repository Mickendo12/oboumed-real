
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Bell, Calendar, X } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ReminderFormProps {
  onSave: (reminder: Reminder) => void;
  onCancel: () => void;
}

export interface Reminder {
  id: string;
  title: string;
  medicationName: string;
  time: string;
  days: string[];
  notes: string;
}

const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Lundi' },
  { value: 'tuesday', label: 'Mardi' },
  { value: 'wednesday', label: 'Mercredi' },
  { value: 'thursday', label: 'Jeudi' },
  { value: 'friday', label: 'Vendredi' },
  { value: 'saturday', label: 'Samedi' },
  { value: 'sunday', label: 'Dimanche' },
];

const ReminderForm: React.FC<ReminderFormProps> = ({ onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [medicationName, setMedicationName] = useState('');
  const [time, setTime] = useState('08:00');
  const [selectedDays, setSelectedDays] = useState<string[]>(['monday', 'wednesday', 'friday']);
  const [notes, setNotes] = useState('');
  const { toast } = useToast();

  const handleSaveReminder = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !medicationName || !time || selectedDays.length === 0) {
      toast({
        title: "Information manquante",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }
    
    const newReminder: Reminder = {
      id: Date.now().toString(),
      title,
      medicationName,
      time,
      days: selectedDays,
      notes,
    };
    
    onSave(newReminder);
    toast({
      title: "Rappel créé",
      description: `Rappel pour ${medicationName} programmé pour ${time}`,
    });
  };

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  return (
    <Card className="w-full animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Créer un nouveau rappel
        </CardTitle>
      </CardHeader>
      
      <form onSubmit={handleSaveReminder}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Titre du rappel
            </label>
            <Input
              id="title" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Prise de médicament matinale"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="medication" className="text-sm font-medium">
              Nom du médicament
            </label>
            <Input
              id="medication" 
              value={medicationName}
              onChange={(e) => setMedicationName(e.target.value)}
              placeholder="Ex: Doliprane 1000mg"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="time" className="text-sm font-medium flex items-center gap-1">
              <Clock className="h-4 w-4" /> Heure
            </label>
            <Input
              id="time" 
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1">
              <Calendar className="h-4 w-4" /> Jours
            </label>
            <div className="flex flex-wrap gap-2">
              {DAYS_OF_WEEK.map(day => (
                <Button 
                  key={day.value} 
                  type="button"
                  size="sm"
                  variant={selectedDays.includes(day.value) ? "default" : "outline"}
                  onClick={() => toggleDay(day.value)}
                  className="text-xs"
                >
                  {day.label}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium">
              Notes (optionnel)
            </label>
            <Input
              id="notes" 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Instructions spéciales..."
            />
          </div>
          
          <Alert className="bg-blue-500/10 border-blue-500/20 text-blue-100">
            <AlertDescription className="text-sm">
              Les rappels apparaîtront sur votre tableau de bord et vous recevrez des notifications aux horaires spécifiés.
            </AlertDescription>
          </Alert>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={onCancel}
            className="gap-1"
          >
            <X size={16} /> Annuler
          </Button>
          <Button type="submit" className="gap-1">
            <Bell size={16} /> Enregistrer le rappel
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ReminderForm;
