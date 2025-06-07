import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { ReminderForm } from '@/types/reminder';
import { addReminder, getRemindersForUser } from '@/services/supabaseService';
import { convertFormReminderToDB, convertDBReminderToForm } from '@/services/reminderService';
import { scheduleReminderNotification } from '@/services/notificationService';

interface DashboardProps {
  userId: string;
}

const Dashboard: React.FC<DashboardProps> = ({ userId }) => {
  const [reminders, setReminders] = useState<ReminderForm[]>([]);
  const [showReminderForm, setShowReminderForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadReminders();
  }, [userId]);

  const loadReminders = async () => {
    try {
      const dbReminders = await getRemindersForUser(userId);
      const formReminders = dbReminders.map(convertDBReminderToForm);
      setReminders(formReminders);
    } catch (error) {
      console.error('Error fetching reminders:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les rappels."
      });
    }
  };

  const handleAddReminder = async (reminderData: Omit<ReminderForm, 'id'>) => {
    try {
      const dbReminder = convertFormReminderToDB(reminderData, userId);
      const newReminder = await addReminder(dbReminder);
      
      // Programmer la notification
      const notificationData = {
        id: parseInt(newReminder.id),
        title: `Rappel: ${reminderData.medicationName}`,
        body: `Il est temps de prendre votre médicament: ${reminderData.medicationName}`,
        schedule: {
          at: new Date(`${new Date().toDateString()} ${reminderData.time}`),
          repeats: true,
          every: 'day' as const
        }
      };
      
      await scheduleReminderNotification(notificationData);
      
      await loadReminders();
      setShowReminderForm(false);
      
      toast({
        title: "Rappel ajouté",
        description: "Le rappel a été créé avec succès."
      });
    } catch (error) {
      console.error('Error adding reminder:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'ajouter le rappel."
      });
    }
  };

  const ReminderFormSchema = z.object({
    title: z.string().min(2, {
      message: "Le titre doit contenir au moins 2 caractères.",
    }),
    medicationName: z.string().min(2, {
      message: "Le nom du médicament doit contenir au moins 2 caractères.",
    }),
    time: z.string().min(5, {
      message: "L'heure doit être au format HH:MM.",
    }),
    days: z.array(z.string()).min(1, {
      message: "Vous devez sélectionner au moins un jour.",
    }),
    notes: z.string().optional(),
  })

  const form = useForm<z.infer<typeof ReminderFormSchema>>({
    resolver: zodResolver(ReminderFormSchema),
    defaultValues: {
      title: "",
      medicationName: "",
      time: "08:00",
      days: [],
      notes: "",
    },
  })

  function onSubmit(values: z.infer<typeof ReminderFormSchema>) {
    handleAddReminder(values);
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        <Button onClick={() => setShowReminderForm(true)}>Ajouter un rappel</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vos rappels</CardTitle>
          <CardDescription>Voici vos rappels de médicaments.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Heure</TableHead>
                <TableHead>Médicament</TableHead>
                <TableHead>Jours</TableHead>
                <TableHead>Dosage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reminders.map((reminder) => (
                <TableRow key={reminder.id}>
                  <TableCell className="font-medium">{reminder.time}</TableCell>
                  <TableCell>{reminder.medicationName}</TableCell>
                  <TableCell>{reminder.days.join(', ')}</TableCell>
                  <TableCell>{reminder.notes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showReminderForm} onOpenChange={setShowReminderForm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Ajouter un rappel</DialogTitle>
            <DialogDescription>
              Créer un nouveau rappel de médicament.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titre</FormLabel>
                    <FormControl>
                      <Input placeholder="Rappel médicament" {...field} />
                    </FormControl>
                    <FormDescription>
                      Ce titre sera affiché dans la notification.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="medicationName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom du médicament</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom du médicament" {...field} />
                    </FormControl>
                    <FormDescription>
                      Entrez le nom du médicament à prendre.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Heure</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormDescription>
                      Choisissez l'heure à laquelle vous souhaitez recevoir le rappel.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jours</FormLabel>
                    <div className="flex flex-wrap gap-2">
                      <Label htmlFor="monday" className="peer-checked:bg-sky-700 peer-checked:text-sky-100">
                        <Input type="checkbox" id="monday" value="monday" className="peer sr-only" {...field} />
                        Lundi
                      </Label>
                      <Label htmlFor="tuesday" className="peer-checked:bg-sky-700 peer-checked:text-sky-100">
                        <Input type="checkbox" id="tuesday" value="tuesday" className="peer sr-only" {...field} />
                        Mardi
                      </Label>
                      <Label htmlFor="wednesday" className="peer-checked:bg-sky-700 peer-checked:text-sky-100">
                        <Input type="checkbox" id="wednesday" value="wednesday" className="peer sr-only" {...field} />
                        Mercredi
                      </Label>
                      <Label htmlFor="thursday" className="peer-checked:bg-sky-700 peer-checked:text-sky-100">
                        <Input type="checkbox" id="thursday" value="thursday" className="peer sr-only" {...field} />
                        Jeudi
                      </Label>
                      <Label htmlFor="friday" className="peer-checked:bg-sky-700 peer-checked:text-sky-100">
                        <Input type="checkbox" id="friday" value="friday" className="peer sr-only" {...field} />
                        Vendredi
                      </Label>
                      <Label htmlFor="saturday" className="peer-checked:bg-sky-700 peer-checked:text-sky-100">
                        <Input type="checkbox" id="saturday" value="saturday" className="peer sr-only" {...field} />
                        Samedi
                      </Label>
                      <Label htmlFor="sunday" className="peer-checked:bg-sky-700 peer-checked:text-sky-100">
                        <Input type="checkbox" id="sunday" value="sunday" className="peer sr-only" {...field} />
                        Dimanche
                      </Label>
                    </div>
                    <FormDescription>
                      Sélectionnez les jours où vous souhaitez recevoir le rappel.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dosage</FormLabel>
                    <FormControl>
                      <Input placeholder="Dosage" {...field} />
                    </FormControl>
                    <FormDescription>
                      Ajouter le dosage du médicament.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">Ajouter</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
