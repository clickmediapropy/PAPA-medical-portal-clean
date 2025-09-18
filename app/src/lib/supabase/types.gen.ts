export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          metadata: Json | null
          patient_id: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          patient_id?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          patient_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      biomarkers: {
        Row: {
          category: string
          created_at: string
          critical_max: number | null
          critical_min: number | null
          description: string | null
          display_name: string
          id: string
          lifestyle_notes: string | null
          name: string
          reference_max: number | null
          reference_min: number | null
          unit: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          critical_max?: number | null
          critical_min?: number | null
          description?: string | null
          display_name: string
          id?: string
          lifestyle_notes?: string | null
          name: string
          reference_max?: number | null
          reference_min?: number | null
          unit: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          critical_max?: number | null
          critical_min?: number | null
          description?: string | null
          display_name?: string
          id?: string
          lifestyle_notes?: string | null
          name?: string
          reference_max?: number | null
          reference_min?: number | null
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      care_plans: {
        Row: {
          completion_date: string | null
          created_at: string
          created_by: string | null
          description: string | null
          goal: string
          id: string
          patient_id: string
          priority: string | null
          start_date: string
          status: string | null
          target_date: string | null
          title: string
          updated_at: string
        }
        Insert: {
          completion_date?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          goal: string
          id?: string
          patient_id: string
          priority?: string | null
          start_date?: string
          status?: string | null
          target_date?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          completion_date?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          goal?: string
          id?: string
          patient_id?: string
          priority?: string | null
          start_date?: string
          status?: string | null
          target_date?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "care_plans_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "care_plans_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      care_task_logs: {
        Row: {
          care_task_id: string
          completed_at: string
          completed_by: string | null
          created_at: string
          duration_minutes: number | null
          id: string
          metadata: Json | null
          notes: string | null
          patient_id: string
          status: string | null
        }
        Insert: {
          care_task_id: string
          completed_at?: string
          completed_by?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          patient_id: string
          status?: string | null
        }
        Update: {
          care_task_id?: string
          completed_at?: string
          completed_by?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          patient_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "care_task_logs_care_task_id_fkey"
            columns: ["care_task_id"]
            isOneToOne: false
            referencedRelation: "care_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "care_task_logs_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "care_task_logs_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      care_tasks: {
        Row: {
          care_plan_id: string
          created_at: string
          description: string | null
          estimated_duration_minutes: number | null
          frequency: string
          id: string
          instructions: string | null
          is_active: boolean | null
          priority: string | null
          task_type: string
          title: string
          updated_at: string
        }
        Insert: {
          care_plan_id: string
          created_at?: string
          description?: string | null
          estimated_duration_minutes?: number | null
          frequency: string
          id?: string
          instructions?: string | null
          is_active?: boolean | null
          priority?: string | null
          task_type: string
          title: string
          updated_at?: string
        }
        Update: {
          care_plan_id?: string
          created_at?: string
          description?: string | null
          estimated_duration_minutes?: number | null
          frequency?: string
          id?: string
          instructions?: string | null
          is_active?: boolean | null
          priority?: string | null
          task_type?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "care_tasks_care_plan_id_fkey"
            columns: ["care_plan_id"]
            isOneToOne: false
            referencedRelation: "care_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          ai_extracted_data: Json | null
          created_at: string
          document_type: Database["public"]["Enums"]["document_type"]
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          mime_type: string | null
          update_id: string | null
        }
        Insert: {
          ai_extracted_data?: Json | null
          created_at?: string
          document_type: Database["public"]["Enums"]["document_type"]
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          update_id?: string | null
        }
        Update: {
          ai_extracted_data?: Json | null
          created_at?: string
          document_type?: Database["public"]["Enums"]["document_type"]
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          update_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_update_id_fkey"
            columns: ["update_id"]
            isOneToOne: false
            referencedRelation: "updates"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_parsed_values: {
        Row: {
          biomarker_id: string | null
          confidence_score: number | null
          created_at: string
          extraction_method: string | null
          id: string
          lab_result_id: string
          parsed_value: number | null
          raw_name: string
          raw_value: string
          unit: string | null
        }
        Insert: {
          biomarker_id?: string | null
          confidence_score?: number | null
          created_at?: string
          extraction_method?: string | null
          id?: string
          lab_result_id: string
          parsed_value?: number | null
          raw_name: string
          raw_value: string
          unit?: string | null
        }
        Update: {
          biomarker_id?: string | null
          confidence_score?: number | null
          created_at?: string
          extraction_method?: string | null
          id?: string
          lab_result_id?: string
          parsed_value?: number | null
          raw_name?: string
          raw_value?: string
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lab_parsed_values_biomarker_id_fkey"
            columns: ["biomarker_id"]
            isOneToOne: false
            referencedRelation: "biomarkers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_parsed_values_lab_result_id_fkey"
            columns: ["lab_result_id"]
            isOneToOne: false
            referencedRelation: "lab_results"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_results: {
        Row: {
          created_at: string
          document_id: string | null
          id: string
          is_critical: boolean | null
          patient_id: string
          reference_max: number | null
          reference_min: number | null
          test_code: string | null
          test_date: string
          test_name: string
          unit: string | null
          update_id: string | null
          value: number | null
        }
        Insert: {
          created_at?: string
          document_id?: string | null
          id?: string
          is_critical?: boolean | null
          patient_id: string
          reference_max?: number | null
          reference_min?: number | null
          test_code?: string | null
          test_date: string
          test_name: string
          unit?: string | null
          update_id?: string | null
          value?: number | null
        }
        Update: {
          created_at?: string
          document_id?: string | null
          id?: string
          is_critical?: boolean | null
          patient_id?: string
          reference_max?: number | null
          reference_min?: number | null
          test_code?: string | null
          test_date?: string
          test_name?: string
          unit?: string | null
          update_id?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lab_results_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_results_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_results_update_id_fkey"
            columns: ["update_id"]
            isOneToOne: false
            referencedRelation: "updates"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_sources: {
        Row: {
          created_at: string
          description: string | null
          display_name: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_name: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_name?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      medications: {
        Row: {
          created_at: string
          dosage: string | null
          end_date: string | null
          frequency: string | null
          id: string
          is_active: boolean | null
          name: string
          notes: string | null
          patient_id: string
          route: string | null
          start_date: string | null
          update_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          dosage?: string | null
          end_date?: string | null
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          notes?: string | null
          patient_id: string
          route?: string | null
          start_date?: string | null
          update_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          dosage?: string | null
          end_date?: string | null
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          patient_id?: string
          route?: string | null
          start_date?: string | null
          update_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medications_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medications_update_id_fkey"
            columns: ["update_id"]
            isOneToOne: false
            referencedRelation: "updates"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_memberships: {
        Row: {
          created_at: string
          patient_id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          patient_id: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          patient_id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_memberships_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          address: string | null
          allergies: string | null
          created_at: string
          date_of_birth: string | null
          email: string | null
          emergency_contact: string | null
          external_id: string | null
          full_name: string
          gender: string | null
          id: string
          medical_conditions: string | null
          medications: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          allergies?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          emergency_contact?: string | null
          external_id?: string | null
          full_name: string
          gender?: string | null
          id?: string
          medical_conditions?: string | null
          medications?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          allergies?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          emergency_contact?: string | null
          external_id?: string | null
          full_name?: string
          gender?: string | null
          id?: string
          medical_conditions?: string | null
          medications?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      timeline_events: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          details: string | null
          event_date: string
          event_time: string | null
          event_type: Database["public"]["Enums"]["timeline_event_type"]
          id: string
          patient_id: string
          related_document_id: string | null
          related_update_id: string | null
          severity: Database["public"]["Enums"]["timeline_severity"]
          status: Database["public"]["Enums"]["timeline_status"]
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          details?: string | null
          event_date: string
          event_time?: string | null
          event_type: Database["public"]["Enums"]["timeline_event_type"]
          id?: string
          patient_id: string
          related_document_id?: string | null
          related_update_id?: string | null
          severity?: Database["public"]["Enums"]["timeline_severity"]
          status?: Database["public"]["Enums"]["timeline_status"]
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          details?: string | null
          event_date?: string
          event_time?: string | null
          event_type?: Database["public"]["Enums"]["timeline_event_type"]
          id?: string
          patient_id?: string
          related_document_id?: string | null
          related_update_id?: string | null
          severity?: Database["public"]["Enums"]["timeline_severity"]
          status?: Database["public"]["Enums"]["timeline_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "timeline_events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timeline_events_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timeline_events_related_document_id_fkey"
            columns: ["related_document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timeline_events_related_update_id_fkey"
            columns: ["related_update_id"]
            isOneToOne: false
            referencedRelation: "updates"
            referencedColumns: ["id"]
          },
        ]
      }
      updates: {
        Row: {
          ai_processed: boolean | null
          ai_summary: Json | null
          content_type: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          patient_id: string
          status: string | null
          text_content: string | null
          title: string
          updated_at: string
        }
        Insert: {
          ai_processed?: boolean | null
          ai_summary?: Json | null
          content_type?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          patient_id: string
          status?: string | null
          text_content?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          ai_processed?: boolean | null
          ai_summary?: Json | null
          content_type?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          patient_id?: string
          status?: string | null
          text_content?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "updates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "updates_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      uid: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      document_type:
        | "lab_result"
        | "imaging"
        | "prescription"
        | "medical_report"
        | "other"
      timeline_event_type:
        | "surgery"
        | "procedure"
        | "evaluation"
        | "dialysis"
        | "status"
        | "medication"
        | "lab_result"
        | "imaging"
        | "consultation"
        | "transfer"
        | "admission"
        | "discharge"
      timeline_severity: "critical" | "high" | "medium" | "low" | "info"
      timeline_status: "completed" | "ongoing" | "pending" | "cancelled"
      user_role: "admin" | "clinician" | "family" | "viewer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      document_type: [
        "lab_result",
        "imaging",
        "prescription",
        "medical_report",
        "other",
      ],
      timeline_event_type: [
        "surgery",
        "procedure",
        "evaluation",
        "dialysis",
        "status",
        "medication",
        "lab_result",
        "imaging",
        "consultation",
        "transfer",
        "admission",
        "discharge",
      ],
      timeline_severity: ["critical", "high", "medium", "low", "info"],
      timeline_status: ["completed", "ongoing", "pending", "cancelled"],
      user_role: ["admin", "clinician", "family", "viewer"],
    },
  },
} as const
