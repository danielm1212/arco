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
          photo_path: string | null
          user_id: string
          weight: number | null
        }
        Insert: {
          body_fat?: number | null
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          photo_path?: string | null
          user_id: string
          weight?: number | null
        }
        Update: {
          body_fat?: number | null
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          photo_path?: string | null
          user_id?: string
          weight?: number | null
        }
        Relationships: []
      }
      body_metric_photos: {
        Row: {
          body_metric_id: string
          created_at: string
          id: string
          path: string
          position: number
          user_id: string
        }
        Insert: {
          body_metric_id: string
          created_at?: string
          id?: string
          path: string
          position: number
          user_id: string
        }
        Update: {
          body_metric_id?: string
          created_at?: string
          id?: string
          path?: string
          position?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "body_metric_photos_metric_owner_fkey"
            columns: ["body_metric_id", "user_id"]
            isOneToOne: false
            referencedRelation: "body_metrics"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      inbox_items: {
        Row: {
          created_at: string
          id: string
          kind: string
          payload: Json
          read_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind: string
          payload: Json
          read_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          payload?: Json
          read_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      activity_events: {
        Row: {
          created_at: string
          id: string
          kind: string
          occurred_on: string
          streak_weeks: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind?: string
          occurred_on: string
          streak_weeks?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          occurred_on?: string
          streak_weeks?: number
          user_id?: string
        }
        Relationships: []
      }
      exercises: {
        Row: {
          category: string | null
          equipment: string | null
          exercise_type: Database["public"]["Enums"]["exercise_type"]
          force: string | null
          hidden: boolean
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
          user_id: string | null
        }
        Insert: {
          category?: string | null
          equipment?: string | null
          exercise_type: Database["public"]["Enums"]["exercise_type"]
          force?: string | null
          hidden?: boolean
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
          user_id?: string | null
        }
        Update: {
          category?: string | null
          equipment?: string | null
          exercise_type?: Database["public"]["Enums"]["exercise_type"]
          force?: string | null
          hidden?: boolean
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
          user_id?: string | null
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
      pod_members: {
        Row: {
          consented_at: string
          joined_at: string
          pod_id: string
          user_id: string
        }
        Insert: {
          consented_at?: string
          joined_at?: string
          pod_id: string
          user_id: string
        }
        Update: {
          consented_at?: string
          joined_at?: string
          pod_id?: string
          user_id?: string
        }
        Relationships: []
      }
      pods: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          invite_code: string
          name: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          invite_code: string
          name?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          invite_code?: string
          name?: string | null
        }
        Relationships: []
      }
      reactions: {
        Row: {
          activity_event_id: string
          created_at: string
          emoji: string
          id: string
          user_id: string
        }
        Insert: {
          activity_event_id: string
          created_at?: string
          emoji: string
          id?: string
          user_id: string
        }
        Update: {
          activity_event_id?: string
          created_at?: string
          emoji?: string
          id?: string
          user_id?: string
        }
        Relationships: []
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
          content_version: number
          cycle_days: number
          days_per_week: number
          description: string | null
          environment: string | null
          estimated_minutes_max: number | null
          estimated_minutes_min: number | null
          frequency_max: number | null
          frequency_min: number | null
          goal: string | null
          goal_key: string | null
          focus_key: Database["public"]["Enums"]["program_focus"]
          id: string
          is_default: boolean
          level: string | null
          level_max: number | null
          level_min: number | null
          name: string
          optional_equipment: string[]
          required_equipment: string[]
          slug: string | null
          user_id: string | null
        }
        Insert: {
          content_version?: number
          cycle_days?: number
          days_per_week: number
          description?: string | null
          environment?: string | null
          estimated_minutes_max?: number | null
          estimated_minutes_min?: number | null
          frequency_max?: number | null
          frequency_min?: number | null
          goal?: string | null
          goal_key?: string | null
          focus_key?: Database["public"]["Enums"]["program_focus"]
          id?: string
          is_default?: boolean
          level?: string | null
          level_max?: number | null
          level_min?: number | null
          name: string
          optional_equipment?: string[]
          required_equipment?: string[]
          slug?: string | null
          user_id?: string | null
        }
        Update: {
          content_version?: number
          cycle_days?: number
          days_per_week?: number
          description?: string | null
          environment?: string | null
          estimated_minutes_max?: number | null
          estimated_minutes_min?: number | null
          frequency_max?: number | null
          frequency_min?: number | null
          goal?: string | null
          goal_key?: string | null
          focus_key?: Database["public"]["Enums"]["program_focus"]
          id?: string
          is_default?: boolean
          level?: string | null
          level_max?: number | null
          level_min?: number | null
          name?: string
          optional_equipment?: string[]
          required_equipment?: string[]
          slug?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      session_exercises: {
        Row: {
          exercise_id: string
          id: string
          notes: string | null
          position: number
          session_id: string
          skipped: boolean
          slot_id: string | null
          superset_group: number | null
        }
        Insert: {
          exercise_id: string
          id?: string
          notes?: string | null
          position: number
          session_id: string
          skipped?: boolean
          slot_id?: string | null
          superset_group?: number | null
        }
        Update: {
          exercise_id?: string
          id?: string
          notes?: string | null
          position?: number
          session_id?: string
          skipped?: boolean
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
          is_historical: boolean
          notes: string | null
          program_day_id: string | null
          recorded_duration_seconds: number | null
          started_at: string
          user_id: string
        }
        Insert: {
          date?: string
          finished_at?: string | null
          id?: string
          is_historical?: boolean
          notes?: string | null
          program_day_id?: string | null
          recorded_duration_seconds?: number | null
          started_at?: string
          user_id: string
        }
        Update: {
          date?: string
          finished_at?: string | null
          id?: string
          is_historical?: boolean
          notes?: string | null
          program_day_id?: string | null
          recorded_duration_seconds?: number | null
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
      team_profiles: {
        Row: {
          avatar: string
          display_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar: string
          display_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar?: string
          display_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      nudges: {
        Row: {
          created_at: string
          from_user_id: string
          id: string
          pod_id: string
          sent_on: string
          to_user_id: string
        }
        Insert: {
          created_at?: string
          from_user_id: string
          id?: string
          pod_id: string
          sent_on?: string
          to_user_id: string
        }
        Update: {
          created_at?: string
          from_user_id?: string
          id?: string
          pod_id?: string
          sent_on?: string
          to_user_id?: string
        }
        Relationships: []
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
          display_name: string | null
          training_priority: Database["public"]["Enums"]["training_priority"]
          training_focus: Database["public"]["Enums"]["program_focus"]
          unit_system: Database["public"]["Enums"]["unit_system"]
          updated_at: string
          user_id: string
          weekly_goal: number
        }
        Insert: {
          available_equipment?: string[]
          available_plates?: number[]
          bar_weight?: number
          created_at?: string
          default_rest_seconds?: number
          display_name?: string | null
          training_priority?: Database["public"]["Enums"]["training_priority"]
          training_focus?: Database["public"]["Enums"]["program_focus"]
          unit_system?: Database["public"]["Enums"]["unit_system"]
          updated_at?: string
          user_id: string
          weekly_goal?: number
        }
        Update: {
          available_equipment?: string[]
          available_plates?: number[]
          bar_weight?: number
          created_at?: string
          default_rest_seconds?: number
          display_name?: string | null
          training_priority?: Database["public"]["Enums"]["training_priority"]
          training_focus?: Database["public"]["Enums"]["program_focus"]
          unit_system?: Database["public"]["Enums"]["unit_system"]
          updated_at?: string
          user_id?: string
          weekly_goal?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_pod: {
        Args: { p_avatar: string; p_confirmed: boolean; p_display_name: string; p_name: string }
        Returns: { invite_code: string; pod_id: string }[]
      }
      emit_workout_activity: { Args: { p_session_id: string }; Returns: undefined }
      get_pod_members: {
        Args: { p_pod_id: string }
        Returns: {
          avatar: string
          can_nudge: boolean
          display_name: string
          joined_at: string
          last_workout: string | null
          latest_event_id: string | null
          member_id: string
          my_reaction: string | null
          reaction_count: number
          streak_weeks: number
          weekly_done: number
          weekly_goal: number
        }[]
      }
      join_pod_by_invite: {
        Args: { p_avatar: string; p_confirmed: boolean; p_display_name: string; p_invite_code: string }
        Returns: string
      }
      previous_session_sets: {
        Args: { p_exercise: string; p_session: string; p_slot: string }
        Returns: {
          added_weight: number
          duration_seconds: number
          reps: number
          set_index: number
          weight: number
        }[]
      }
      previous_session_sets_batch: {
        Args: { p_session: string }
        Returns: {
          added_weight: number
          duration_seconds: number
          reps: number
          session_exercise_id: string
          set_index: number
          weight: number
        }[]
      }
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
      remove_pod_member: { Args: { p_pod_id: string; p_user_id: string }; Returns: undefined }
      rename_pod: { Args: { p_name: string; p_pod_id: string }; Returns: undefined }
      send_pod_nudge: { Args: { p_pod_id: string; p_to_user_id: string }; Returns: undefined }
      start_or_resume_session: {
        Args: {
          p_date?: string | null
          p_is_historical?: boolean
          p_program_day_id?: string | null
          p_recorded_duration_seconds?: number | null
          p_started_at?: string | null
        }
        Returns: { created: boolean; session_id: string }[]
      }
      sync_workout_activity_day: {
        Args: { p_previous_day: string; p_session_id: string }
        Returns: undefined
      }
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
      program_focus: "balanced" | "lower_body"
      training_priority: "general_fitness" | "strength" | "muscle_gain" | "fat_loss"
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
