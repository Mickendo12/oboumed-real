
export interface ReminderDB {
  id: string;
  user_id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  time: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReminderForm {
  id: string;
  title: string;
  medicationName: string;
  time: string;
  days: string[];
  notes: string;
}

export interface ReminderInput {
  medication_name: string;
  dosage: string;
  frequency: string;
  time: string;
  is_active?: boolean;
  user_id: string;
}
