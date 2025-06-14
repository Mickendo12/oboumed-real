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
        Relationships: [
          {
            foreignKeyName: "access_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "access_logs_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "access_logs_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      custom_medications: {
        Row: {
          active_ingredient: string | null
          created_at: string
          created_by: string
          dosage: string | null
          form: string | null
          id: string
          manufacturer: string | null
          name: string
          usage_count: number
        }
        Insert: {
          active_ingredient?: string | null
          created_at?: string
          created_by: string
          dosage?: string | null
          form?: string | null
          id?: string
          manufacturer?: string | null
          name: string
          usage_count?: number
        }
        Update: {
          active_ingredient?: string | null
          created_at?: string
          created_by?: string
          dosage?: string | null
          form?: string | null
          id?: string
          manufacturer?: string | null
          name?: string
          usage_count?: number
        }
        Relationships: []
      }
      doctor_access_sessions: {
        Row: {
          access_granted_at: string | null
          created_at: string | null
          doctor_id: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          patient_id: string
          qr_code_id: string | null
        }
        Insert: {
          access_granted_at?: string | null
          created_at?: string | null
          doctor_id: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          patient_id: string
          qr_code_id?: string | null
        }
        Update: {
          access_granted_at?: string | null
          created_at?: string | null
          doctor_id?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          patient_id?: string
          qr_code_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "doctor_access_sessions_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "doctor_access_sessions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
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
            foreignKeyName: "medications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
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
        Relationships: [
          {
            foreignKeyName: "prescriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          access_status: Database["public"]["Enums"]["access_status"] | null
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
          id: string
          name: string | null
          phone_number: string | null
          role: Database["public"]["Enums"]["user_role"]
          share_with_doctor: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_status?: Database["public"]["Enums"]["access_status"] | null
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
          id?: string
          name?: string | null
          phone_number?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          share_with_doctor?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_status?: Database["public"]["Enums"]["access_status"] | null
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
          id?: string
          name?: string | null
          phone_number?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          share_with_doctor?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      qr_codes: {
        Row: {
          access_key: string
          created_at: string | null
          created_by: string | null
          expires_at: string | null
          id: string
          qr_code: string
          status: Database["public"]["Enums"]["qr_status"] | null
          user_id: string
        }
        Insert: {
          access_key: string
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          qr_code: string
          status?: Database["public"]["Enums"]["qr_status"] | null
          user_id: string
        }
        Update: {
          access_key?: string
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          qr_code?: string
          status?: Database["public"]["Enums"]["qr_status"] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "qr_codes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "qr_codes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      reminders: {
        Row: {
          created_at: string | null
          dosage: string
          frequency: string
          id: string
          is_active: boolean | null
          medication_name: string
          time: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          dosage: string
          frequency: string
          id?: string
          is_active?: boolean | null
          medication_name: string
          time: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          dosage?: string
          frequency?: string
          id?: string
          is_active?: boolean | null
          medication_name?: string
          time?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
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
      get_user_role: {
        Args: { user_uuid: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      is_admin: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      is_doctor: {
        Args: { user_uuid: string }
        Returns: boolean
      }
    }
    Enums: {
      access_status: "active" | "restricted" | "expired"
      qr_status: "active" | "expired" | "used"
      user_role: "user" | "doctor" | "admin"
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
    Enums: {
      access_status: ["active", "restricted", "expired"],
      qr_status: ["active", "expired", "used"],
      user_role: ["user", "doctor", "admin"],
    },
  },
} as const
