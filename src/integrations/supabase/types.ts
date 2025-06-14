export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      access_logs: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string | null
          details: Json | null
          doctor_id: string | null
          id: string
          ip_address: unknown | null
          patient_id: string
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          doctor_id?: string | null
          id?: string
          ip_address?: unknown | null
          patient_id: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          doctor_id?: string | null
          id?: string
          ip_address?: unknown | null
          patient_id?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      custom_medications: {
        Row: {
          active_ingredient: string | null
          created_at: string | null
          created_by: string
          dosage: string | null
          form: string | null
          id: string
          manufacturer: string | null
          name: string
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          active_ingredient?: string | null
          created_at?: string | null
          created_by: string
          dosage?: string | null
          form?: string | null
          id?: string
          manufacturer?: string | null
          name: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          active_ingredient?: string | null
          created_at?: string | null
          created_by?: string
          dosage?: string | null
          form?: string | null
          id?: string
          manufacturer?: string | null
          name?: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: []
      }
      doctor_access_sessions: {
        Row: {
          access_granted_at: string | null
          created_at: string | null
          doctor_id: string
          expires_at: string
          id: string
          is_active: boolean | null
          patient_id: string
          qr_code_id: string | null
        }
        Insert: {
          access_granted_at?: string | null
          created_at?: string | null
          doctor_id: string
          expires_at: string
          id?: string
          is_active?: boolean | null
          patient_id: string
          qr_code_id?: string | null
        }
        Update: {
          access_granted_at?: string | null
          created_at?: string | null
          doctor_id?: string
          expires_at?: string
          id?: string
          is_active?: boolean | null
          patient_id?: string
          qr_code_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "doctor_access_sessions_qr_code_id_fkey"
            columns: ["qr_code_id"]
            isOneToOne: false
            referencedRelation: "qr_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      medications: {
        Row: {
          comments: string | null
          created_at: string | null
          doctor_prescribed: string | null
          dosage: string | null
          end_date: string | null
          frequency: string | null
          id: string
          name: string
          posology: string | null
          prescription_id: string | null
          start_date: string | null
          treatment_duration: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          comments?: string | null
          created_at?: string | null
          doctor_prescribed?: string | null
          dosage?: string | null
          end_date?: string | null
          frequency?: string | null
          id?: string
          name: string
          posology?: string | null
          prescription_id?: string | null
          start_date?: string | null
          treatment_duration?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          comments?: string | null
          created_at?: string | null
          doctor_prescribed?: string | null
          dosage?: string | null
          end_date?: string | null
          frequency?: string | null
          id?: string
          name?: string
          posology?: string | null
          prescription_id?: string | null
          start_date?: string | null
          treatment_duration?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medications_prescription_id_fkey"
            columns: ["prescription_id"]
            isOneToOne: false
            referencedRelation: "prescriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      prescriptions: {
        Row: {
          created_at: string | null
          doctor_name: string | null
          hospital_name: string | null
          id: string
          image_storage_path: string | null
          image_url: string | null
          pharmacy_name: string | null
          prescription_date: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          doctor_name?: string | null
          hospital_name?: string | null
          id?: string
          image_storage_path?: string | null
          image_url?: string | null
          pharmacy_name?: string | null
          prescription_date?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          doctor_name?: string | null
          hospital_name?: string | null
          id?: string
          image_storage_path?: string | null
          image_url?: string | null
          pharmacy_name?: string | null
          prescription_date?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          access_status: string | null
          allergies: string | null
          blood_type: string | null
          chronic_diseases: string | null
          created_at: string | null
          current_medications: string | null
          doctor_access_key: string | null
          email: string
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relationship: string | null
          height_cm: number | null
          id: string
          name: string | null
          phone_number: string | null
          role: string | null
          share_with_doctor: boolean | null
          updated_at: string | null
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          access_status?: string | null
          allergies?: string | null
          blood_type?: string | null
          chronic_diseases?: string | null
          created_at?: string | null
          current_medications?: string | null
          doctor_access_key?: string | null
          email: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          height_cm?: number | null
          id?: string
          name?: string | null
          phone_number?: string | null
          role?: string | null
          share_with_doctor?: boolean | null
          updated_at?: string | null
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          access_status?: string | null
          allergies?: string | null
          blood_type?: string | null
          chronic_diseases?: string | null
          created_at?: string | null
          current_medications?: string | null
          doctor_access_key?: string | null
          email?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          height_cm?: number | null
          id?: string
          name?: string | null
          phone_number?: string | null
          role?: string | null
          share_with_doctor?: boolean | null
          updated_at?: string | null
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
      qr_codes: {
        Row: {
          access_key: string
          created_at: string | null
          created_by: string | null
          expires_at: string
          id: string
          qr_code: string
          status: string | null
          user_id: string
        }
        Insert: {
          access_key: string
          created_at?: string | null
          created_by?: string | null
          expires_at: string
          id?: string
          qr_code: string
          status?: string | null
          user_id: string
        }
        Update: {
          access_key?: string
          created_at?: string | null
          created_by?: string | null
          expires_at?: string
          id?: string
          qr_code?: string
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      reminders: {
        Row: {
          created_at: string | null
          days_of_week: number[]
          dosage: string | null
          id: string
          is_active: boolean | null
          medication_name: string
          time: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          days_of_week: number[]
          dosage?: string | null
          id?: string
          is_active?: boolean | null
          medication_name: string
          time: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          days_of_week?: number[]
          dosage?: string | null
          id?: string
          is_active?: boolean | null
          medication_name?: string
          time?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      profiles_with_bmi: {
        Row: {
          access_status: string | null
          allergies: string | null
          blood_type: string | null
          bmi: number | null
          bmi_category: string | null
          chronic_diseases: string | null
          created_at: string | null
          current_medications: string | null
          doctor_access_key: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relationship: string | null
          height_cm: number | null
          id: string | null
          name: string | null
          phone_number: string | null
          role: string | null
          share_with_doctor: boolean | null
          updated_at: string | null
          user_id: string | null
          weight_kg: number | null
        }
        Insert: {
          access_status?: string | null
          allergies?: string | null
          blood_type?: string | null
          bmi?: never
          bmi_category?: never
          chronic_diseases?: string | null
          created_at?: string | null
          current_medications?: string | null
          doctor_access_key?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          height_cm?: number | null
          id?: string | null
          name?: string | null
          phone_number?: string | null
          role?: string | null
          share_with_doctor?: boolean | null
          updated_at?: string | null
          user_id?: string | null
          weight_kg?: number | null
        }
        Update: {
          access_status?: string | null
          allergies?: string | null
          blood_type?: string | null
          bmi?: never
          bmi_category?: never
          chronic_diseases?: string | null
          created_at?: string | null
          current_medications?: string | null
          doctor_access_key?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          height_cm?: number | null
          id?: string | null
          name?: string | null
          phone_number?: string | null
          role?: string | null
          share_with_doctor?: boolean | null
          updated_at?: string | null
          user_id?: string | null
          weight_kg?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      cleanup_expired_sessions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_qr_code: {
        Args: { patient_user_id: string }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
