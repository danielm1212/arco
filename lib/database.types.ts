export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
      body_metrics: {
        Row: {
          body_fat: number | null
          created_at: string
          date: string
          id: string
          notes: string | null
          user_id: string
          weight: number | null
        }
        Insert: {
          body_fat?: number | null
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          user_id: string
          weight?: number | null
        }
        Update: {
          body_fat?: number | null
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          user_id?: string
          weight?: number | null
        }
        Relationships: []
      }
      exercises: {
        Row: {
          category: string | null
          equipment: string | null
          exercise_type: Database["public"]["Enums"]["exercise_type"]
          force: string | null
          id: string
          images: string[]
          instructions: string[]
          level: string | null
          mechanic: Database["public"]["Enums"]["mechanic_type"] | null
          movement_pattern:
            | Database["public"]["Enums"]["movement_pattern"]
            | null
          name: string
          primary_muscles: string[]
          secondary_muscles: string[]
        }
        Insert: {
          category?: string | null
          equipment?: string | null
          exercise_type: Database["public"]["Enums"]["exercise_type"]
          force?: string | null
          id: string
          images?: string[]
          instructions?: string[]
          level?: string | null
          mechanic?: Database["public"]["Enums"]["mechanic_type"] | null
          movement_pattern?:
            | Database["public"]["Enums"]["movement_pattern"]
            | null
          name: string
          primary_muscles?: string[]
          secondary_muscles?: string[]
        }
        Update: {
          category?: string | null
          equipment?: string | null
          exercise_type?: Database["public"]["Enums"]["exercise_type"]
          force?: string | null
          id?: string
          images?: string[]
          instructions?: string[]
          level?: string | null
          mechanic?: Database["public"]["Enums"]["mechanic_type"] | null
          movement_pattern?:
            | Database["public"]["Enums"]["movement_pattern"]
            | null
          name?: string
          primary_muscles?: string[]
          secondary_muscles?: string[]
        }
        Relationships: []
      }
      personal_records: {
        Row: {
          achieved_at: string
          exercise_id: string
          id: string
          record_type: Database["public"]["Enums"]["record_type"]
          reps_context: number | null
          session_set_id: string | null
          user_id: string
          value: number
        }
        Insert: {
          achieved_at?: string
          exercise_id: string
          id?: string
          record_type: Database["public"]["Enums"]["record_type"]
          reps_context?: number | null
          session_set_id?: string | null
          user_id: string
          value: number
        }
        Update: {
          achieved_at?: string
          exercise_id?: string
          id?: string
          record_type?: Database["public"]["Enums"]["record_type"]
          reps_context?: number | null
          session_set_id?: string | null
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "personal_records_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personal_records_session_set_id_fkey"
            columns: ["session_set_id"]
            isOneToOne: false
            referencedRelation: "session_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      program_day_slots: {
        Row: {
          default_exercise_id: string
          id: string
          notes: string | null
          position: number
          program_day_id: string
          rest_seconds: number
          superset_group: number | null
          target_reps_max: number | null
          target_reps_min: number | null
          target_sets: number
        }
        Insert: {
          default_exercise_id: string
          id?: string
          notes?: string | null
          position: number
          program_day_id: string
          rest_seconds: number
          superset_group?: number | null
          target_reps_max?: number | null
          target_reps_min?: number | null
          target_sets: number
        }
        Update: {
          default_exercise_id?: string
          id?: string
          notes?: string | null
          position?: number
          program_day_id?: string
          rest_seconds?: number
          superset_group?: number | null
          target_reps_max?: number | null
          target_reps_min?: number | null
          target_sets?: number
        }
        Relationships: [
          {
            foreignKeyName: "program_day_slots_default_exercise_id_fkey"
            columns: ["default_exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_day_slots_program_day_id_fkey"
            columns: ["program_day_id"]
            isOneToOne: false
            referencedRelation: "program_days"
            referencedColumns: ["id"]
          },
        ]
      }
      program_days: {
        Row: {
          id: string
          label: string
          position: number
          program_id: string
        }
        Insert: {
          id?: string
          label: string
          position: number
          program_id: string
        }
        Update: {
          id?: string
          label?: string
          position?: number
          program_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "program_days_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      programs: {
        Row: {
          days_per_week: number
          description: string | null
          id: string
          is_default: boolean
          name: string
          user_id: string | null
        }
        Insert: {
          days_per_week: number
          description?: string | null
          id?: string
          is_default?: boolean
          name: string
          user_id?: string | null
        }
        Update: {
          days_per_week?: number
          description?: string | null
          id?: string
          is_default?: boolean
          name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      session_exercises: {
        Row: {
          exercise_id: string
          id: string
          position: number
          session_id: string
          slot_id: string | null
          superset_group: number | null
        }
        Insert: {
          exercise_id: string
          id?: string
          position: number
          session_id: string
          slot_id?: string | null
          superset_group?: number | null
        }
        Update: {
          exercise_id?: string
          id?: string
          position?: number
          session_id?: string
          slot_id?: string | null
          superset_group?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "session_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_exercises_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_exercises_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "program_day_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      session_sets: {
        Row: {
          added_weight: number | null
          completed: boolean
          duration_seconds: number | null
          id: string
          reps: number | null
          rpe: number | null
          session_exercise_id: string
          set_index: number
          set_type: Database["public"]["Enums"]["set_type"]
          weight: number | null
        }
        Insert: {
          added_weight?: number | null
          completed?: boolean
          duration_seconds?: number | null
          id?: string
          reps?: number | null
          rpe?: number | null
          session_exercise_id: string
          set_index: number
          set_type?: Database["public"]["Enums"]["set_type"]
          weight?: number | null
        }
        Update: {
          added_weight?: number | null
          completed?: boolean
          duration_seconds?: number | null
          id?: string
          reps?: number | null
          rpe?: number | null
          session_exercise_id?: string
          set_index?: number
          set_type?: Database["public"]["Enums"]["set_type"]
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "session_sets_session_exercise_id_fkey"
            columns: ["session_exercise_id"]
            isOneToOne: false
            referencedRelation: "session_exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          date: string
          finished_at: string | null
          id: string
          notes: string | null
          program_day_id: string | null
          started_at: string
          user_id: string
        }
        Insert: {
          date?: string
          finished_at?: string | null
          id?: string
          notes?: string | null
          program_day_id?: string | null
          started_at?: string
          user_id: string
        }
        Update: {
          date?: string
          finished_at?: string | null
          id?: string
          notes?: string | null
          program_day_id?: string | null
          started_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_program_day_id_fkey"
            columns: ["program_day_id"]
            isOneToOne: false
            referencedRelation: "program_days"
            referencedColumns: ["id"]
          },
        ]
      }
      user_active_program: {
        Row: {
          program_id: string
          user_id: string
        }
        Insert: {
          program_id: string
          user_id: string
        }
        Update: {
          program_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_active_program_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          available_equipment: string[]
          available_plates: number[]
          bar_weight: number
          created_at: string
          default_rest_seconds: number
          unit_system: Database["public"]["Enums"]["unit_system"]
          updated_at: string
          user_id: string
        }
        Insert: {
          available_equipment?: string[]
          available_plates?: number[]
          bar_weight?: number
          created_at?: string
          default_rest_seconds?: number
          unit_system?: Database["public"]["Enums"]["unit_system"]
          updated_at?: string
          user_id: string
        }
        Update: {
          available_equipment?: string[]
          available_plates?: number[]
          bar_weight?: number
          created_at?: string
          default_rest_seconds?: number
          unit_system?: Database["public"]["Enums"]["unit_system"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      previous_working_set: {
        Args: { p_exercise: string; p_session: string; p_slot: string }
        Returns: {
          added_weight: number
          duration_seconds: number
          reps: number
          weight: number
        }[]
      }
      recompute_personal_records: { Args: never; Returns: undefined }
    }
    Enums: {
      exercise_type: "weighted" | "bodyweight" | "timed"
      mechanic_type: "compound" | "isolation"
      movement_pattern:
        | "push"
        | "pull"
        | "squat"
        | "hinge"
        | "lunge"
        | "carry"
        | "core"
      record_type: "max_weight" | "max_e1rm" | "max_reps" | "max_duration"
      set_type: "warmup" | "working" | "drop"
      unit_system: "kg" | "lbs"
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
      exercise_type: ["weighted", "bodyweight", "timed"],
      mechanic_type: ["compound", "isolation"],
      movement_pattern: [
        "push",
        "pull",
        "squat",
        "hinge",
        "lunge",
        "carry",
        "core",
      ],
      record_type: ["max_weight", "max_e1rm", "max_reps", "max_duration"],
      set_type: ["warmup", "working", "drop"],
      unit_system: ["kg", "lbs"],
    },
  },
} as const

