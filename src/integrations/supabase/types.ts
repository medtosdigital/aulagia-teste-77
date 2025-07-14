export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      atividades: {
        Row: {
          conteudo: string
          created_at: string
          data_criacao: string
          disciplina: string | null
          id: string
          serie: string | null
          template_usado: string | null
          tipo_material: string
          titulo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          conteudo: string
          created_at?: string
          data_criacao?: string
          disciplina?: string | null
          id?: string
          serie?: string | null
          template_usado?: string | null
          tipo_material?: string
          titulo: string
          updated_at?: string
          user_id: string
        }
        Update: {
          conteudo?: string
          created_at?: string
          data_criacao?: string
          disciplina?: string | null
          id?: string
          serie?: string | null
          template_usado?: string | null
          tipo_material?: string
          titulo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      avaliacoes: {
        Row: {
          conteudo: string
          created_at: string
          data_criacao: string
          disciplina: string | null
          id: string
          serie: string | null
          template_usado: string | null
          tipo_material: string
          titulo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          conteudo: string
          created_at?: string
          data_criacao?: string
          disciplina?: string | null
          id?: string
          serie?: string | null
          template_usado?: string | null
          tipo_material?: string
          titulo: string
          updated_at?: string
          user_id: string
        }
        Update: {
          conteudo?: string
          created_at?: string
          data_criacao?: string
          disciplina?: string | null
          id?: string
          serie?: string | null
          template_usado?: string | null
          tipo_material?: string
          titulo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          classroom: string | null
          created_at: string
          description: string | null
          end_date: string
          end_time: string
          event_type: string
          grade: string | null
          id: string
          material_ids: string | null
          recurrence: Json | null
          schedule_type: string
          start_date: string
          start_time: string
          subject: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          classroom?: string | null
          created_at?: string
          description?: string | null
          end_date: string
          end_time: string
          event_type?: string
          grade?: string | null
          id?: string
          material_ids?: string | null
          recurrence?: Json | null
          schedule_type?: string
          start_date: string
          start_time: string
          subject?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          classroom?: string | null
          created_at?: string
          description?: string | null
          end_date?: string
          end_time?: string
          event_type?: string
          grade?: string | null
          id?: string
          material_ids?: string | null
          recurrence?: Json | null
          schedule_type?: string
          start_date?: string
          start_time?: string
          subject?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      grupos_escolares: {
        Row: {
          created_at: string
          id: string
          nome_grupo: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome_grupo: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          nome_grupo?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      invites: {
        Row: {
          email: string
          id: string
          invited_at: string | null
          plan: string | null
          status: string | null
        }
        Insert: {
          email: string
          id?: string
          invited_at?: string | null
          plan?: string | null
          status?: string | null
        }
        Update: {
          email?: string
          id?: string
          invited_at?: string | null
          plan?: string | null
          status?: string | null
        }
        Relationships: []
      }
      membros_grupo_escolar: {
        Row: {
          aceito_em: string | null
          convite_enviado_em: string | null
          created_at: string
          grupo_id: string
          id: string
          limite_materiais: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          aceito_em?: string | null
          convite_enviado_em?: string | null
          created_at?: string
          grupo_id: string
          id?: string
          limite_materiais?: number
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          aceito_em?: string | null
          convite_enviado_em?: string | null
          created_at?: string
          grupo_id?: string
          id?: string
          limite_materiais?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "membros_grupo_escolar_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos_escolares"
            referencedColumns: ["id"]
          },
        ]
      }
      perfis: {
        Row: {
          anos_serie: string[] | null
          celular: string | null
          created_at: string | null
          disciplinas: string[] | null
          escola: string | null
          etapas_ensino: string[] | null
          id: string
          nome_preferido: string | null
          preferencia_bncc: boolean | null
          tipo_material_favorito: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          anos_serie?: string[] | null
          celular?: string | null
          created_at?: string | null
          disciplinas?: string[] | null
          escola?: string | null
          etapas_ensino?: string[] | null
          id?: string
          nome_preferido?: string | null
          preferencia_bncc?: boolean | null
          tipo_material_favorito?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          anos_serie?: string[] | null
          celular?: string | null
          created_at?: string | null
          disciplinas?: string[] | null
          escola?: string | null
          etapas_ensino?: string[] | null
          id?: string
          nome_preferido?: string | null
          preferencia_bncc?: boolean | null
          tipo_material_favorito?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      planos_de_aula: {
        Row: {
          avaliacoes: number | null
          conteudo: string
          created_at: string
          data_criacao: string
          dias_semana: string[] | null
          disciplina: string | null
          id: string
          meses: Json | null
          observacoes: string | null
          periodo_fim: string | null
          periodo_inicio: string | null
          semanas: Json | null
          serie: string | null
          template_usado: string | null
          tipo_material: string
          titulo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avaliacoes?: number | null
          conteudo: string
          created_at?: string
          data_criacao?: string
          dias_semana?: string[] | null
          disciplina?: string | null
          id?: string
          meses?: Json | null
          observacoes?: string | null
          periodo_fim?: string | null
          periodo_inicio?: string | null
          semanas?: Json | null
          serie?: string | null
          template_usado?: string | null
          tipo_material?: string
          titulo: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avaliacoes?: number | null
          conteudo?: string
          created_at?: string
          data_criacao?: string
          dias_semana?: string[] | null
          disciplina?: string | null
          id?: string
          meses?: Json | null
          observacoes?: string | null
          periodo_fim?: string | null
          periodo_inicio?: string | null
          semanas?: Json | null
          serie?: string | null
          template_usado?: string | null
          tipo_material?: string
          titulo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      planos_usuarios: {
        Row: {
          created_at: string
          data_expiracao: string | null
          data_inicio: string
          id: string
          plano_ativo: Database["public"]["Enums"]["tipo_plano"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data_expiracao?: string | null
          data_inicio?: string
          id?: string
          plano_ativo?: Database["public"]["Enums"]["tipo_plano"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data_expiracao?: string | null
          data_inicio?: string
          id?: string
          plano_ativo?: Database["public"]["Enums"]["tipo_plano"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      slides: {
        Row: {
          conteudo: string
          created_at: string
          data_criacao: string
          disciplina: string | null
          id: string
          serie: string | null
          template_usado: string | null
          tipo_material: string
          titulo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          conteudo: string
          created_at?: string
          data_criacao?: string
          disciplina?: string | null
          id?: string
          serie?: string | null
          template_usado?: string | null
          tipo_material?: string
          titulo: string
          updated_at?: string
          user_id: string
        }
        Update: {
          conteudo?: string
          created_at?: string
          data_criacao?: string
          disciplina?: string | null
          id?: string
          serie?: string | null
          template_usado?: string | null
          tipo_material?: string
          titulo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_activities: {
        Row: {
          created_at: string
          description: string
          grade: string | null
          id: string
          material_id: string | null
          material_type: string | null
          subject: string | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description: string
          grade?: string | null
          id?: string
          material_id?: string | null
          material_type?: string | null
          subject?: string | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          grade?: string | null
          id?: string
          material_id?: string | null
          material_type?: string | null
          subject?: string | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      uso_mensal_materiais: {
        Row: {
          ano: number
          created_at: string
          id: string
          materiais_criados: number
          mes: number
          updated_at: string
          user_id: string
        }
        Insert: {
          ano: number
          created_at?: string
          id?: string
          materiais_criados?: number
          mes: number
          updated_at?: string
          user_id: string
        }
        Update: {
          ano?: number
          created_at?: string
          id?: string
          materiais_criados?: number
          mes?: number
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
      can_create_material: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      get_plan_limits: {
        Args: { plan_type: Database["public"]["Enums"]["tipo_plano"] }
        Returns: number
      }
      get_user_material_limit: {
        Args: { p_user_id: string }
        Returns: number
      }
      increment_material_usage: {
        Args: { p_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      tipo_plano: "gratuito" | "professor" | "grupo_escolar"
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
  public: {
    Enums: {
      tipo_plano: ["gratuito", "professor", "grupo_escolar"],
    },
  },
} as const
